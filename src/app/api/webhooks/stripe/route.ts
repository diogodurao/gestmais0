export const dynamic = "force-dynamic";

import { headers } from "next/headers";
import { stripe } from "@/lib/stripe";
import { db } from "@/db";
import { building, user } from "@/db/schema";
import { eq } from "drizzle-orm";
import Stripe from "stripe";
import * as Sentry from "@sentry/nextjs";
import { notifySubscriptionPaymentFailed } from "@/lib/actions/notification";

type SubscriptionStatus = 'incomplete' | 'active' | 'canceled' | 'past_due' | 'unpaid'

function mapStripeStatus(status: string): SubscriptionStatus {
    switch (status) {
        case 'active':
        case 'trialing':
            return 'active'
        case 'past_due':
            return 'past_due'
        case 'canceled':
            return 'canceled'
        case 'unpaid':
            return 'unpaid'
        default:
            return 'incomplete'
    }
}

export async function POST(req: Request) {
    const body = await req.text();
    const signature = (await headers()).get("Stripe-Signature") as string;

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET as string
        );
    } catch (error) {
        Sentry.captureException(error, { tags: { context: "stripe_webhook_signature" } });
        const errMsg = error instanceof Error ? error.message : "Unknown error"
        return new Response(`Webhook Error: ${errMsg}`, { status: 400 });
    }

    // Handle checkout.session.completed
    if (event.type === "checkout.session.completed") {
        const session = event.data.object as Stripe.Checkout.Session;
        const subscriptionId = session.subscription as string;
        const buildingId = session.metadata?.buildingId;

        if (!buildingId) {
            Sentry.captureMessage("Stripe webhook: Building ID missing in metadata", {
                level: "error",
                tags: { event: "checkout.session.completed" }
            });
            return new Response("Building ID missing in metadata", { status: 400 });
        }

        // Fetch subscription to get current_period_end
        let currentPeriodEnd: Date | null = null;
        try {
            const subscription = await stripe.subscriptions.retrieve(subscriptionId);
            const periodEnd = (subscription as unknown as { current_period_end?: number }).current_period_end;
            if (periodEnd) {
                currentPeriodEnd = new Date(periodEnd * 1000);
            }
        } catch (e) {
            Sentry.captureException(e, { tags: { context: "stripe_fetch_subscription" } });
        }

        // Update Building Status
        await db.update(building)
            .set({
                subscriptionStatus: 'active',
                stripeSubscriptionId: subscriptionId,
                stripePriceId: session.metadata?.priceId,
                subscriptionCurrentPeriodEnd: currentPeriodEnd,
                subscriptionPastDueAt: null,
            })
            .where(eq(building.id, buildingId));
    }

    // Handle customer.subscription.updated
    if (event.type === "customer.subscription.updated") {
        const subscription = event.data.object as Stripe.Subscription;

        const buildingRecord = await db.query.building.findFirst({
            where: eq(building.stripeSubscriptionId, subscription.id)
        });

        if (buildingRecord) {
            const newStatus = mapStripeStatus(subscription.status);
            const periodEnd = (subscription as unknown as { current_period_end?: number }).current_period_end;
            const currentPeriodEnd = periodEnd ? new Date(periodEnd * 1000) : null;

            // Determine if entering or leaving past_due state
            let subscriptionPastDueAt: Date | null = buildingRecord.subscriptionPastDueAt;

            if (newStatus === 'past_due' && buildingRecord.subscriptionStatus !== 'past_due') {
                subscriptionPastDueAt = new Date();
            } else if (newStatus === 'active' && buildingRecord.subscriptionStatus === 'past_due') {
                subscriptionPastDueAt = null;
            }

            await db.update(building)
                .set({
                    subscriptionStatus: newStatus,
                    subscriptionCurrentPeriodEnd: currentPeriodEnd,
                    subscriptionPastDueAt: subscriptionPastDueAt,
                })
                .where(eq(building.id, buildingRecord.id));
        }
    }

    // Handle customer.subscription.deleted
    if (event.type === "customer.subscription.deleted") {
        const subscription = event.data.object as Stripe.Subscription;

        // Find building with this subscription
        const buildingRecord = await db.query.building.findFirst({
            where: eq(building.stripeSubscriptionId, subscription.id)
        });

        if (buildingRecord) {
            await db.update(building)
                .set({ subscriptionStatus: 'canceled' })
                .where(eq(building.id, buildingRecord.id));
        }
    }

    // Handle invoice.payment_succeeded
    if (event.type === "invoice.payment_succeeded") {
        const invoice = event.data.object as Stripe.Invoice & { subscription?: string | Stripe.Subscription | null };
        const subscriptionId = typeof invoice.subscription === 'string'
            ? invoice.subscription
            : (invoice.subscription as Stripe.Subscription)?.id;

        if (subscriptionId) {
            const buildingRecord = await db.query.building.findFirst({
                where: eq(building.stripeSubscriptionId, subscriptionId)
            });

            if (buildingRecord && buildingRecord.subscriptionStatus !== 'active') {
                await db.update(building)
                    .set({
                        subscriptionStatus: 'active',
                        subscriptionPastDueAt: null, // Clear on successful payment
                    })
                    .where(eq(building.id, buildingRecord.id));
            }
        }
    }

    // Handle invoice.payment_failed
    if (event.type === "invoice.payment_failed") {
        const invoice = event.data.object as Stripe.Invoice & { subscription?: string | Stripe.Subscription | null };
        const subscriptionId = typeof invoice.subscription === 'string'
            ? invoice.subscription
            : (invoice.subscription as Stripe.Subscription)?.id;

        if (subscriptionId) {
            const buildingRecord = await db.query.building.findFirst({
                where: eq(building.stripeSubscriptionId, subscriptionId)
            });

            if (buildingRecord) {
                // Get manager info
                const manager = await db.query.user.findFirst({
                    where: eq(user.id, buildingRecord.managerId)
                });

                if (manager) {
                    try {
                        await notifySubscriptionPaymentFailed(
                            buildingRecord.id,
                            manager.id,
                            manager.email,
                            manager.name,
                            buildingRecord.name
                        );
                    } catch (e) {
                        Sentry.captureException(e, {
                            tags: { context: "stripe_payment_failed_notification" },
                            extra: { buildingId: buildingRecord.id, managerId: manager.id }
                        });
                    }
                }
            }
        }
    }

    return new Response(null, { status: 200 });
}
