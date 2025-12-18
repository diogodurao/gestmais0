import { headers } from "next/headers";
import { stripe } from "@/lib/stripe";
import { db } from "@/db";
import { building } from "@/db/schema";
import { eq } from "drizzle-orm";
import Stripe from "stripe";

export async function POST(req: Request) {
    const body = await req.text();
    const signature = (await headers()).get("Stripe-Signature") as string;

    console.log("[Stripe Webhook] Received event");

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET as string
        );
    } catch (error: any) {
        console.error("[Stripe Webhook] Signature verification failed:", error.message);
        return new Response(`Webhook Error: ${error.message}`, { status: 400 });
    }

    console.log("[Stripe Webhook] Event type:", event.type);

    const session = event.data.object as Stripe.Checkout.Session;

    if (event.type === "checkout.session.completed") {
        const subscriptionId = session.subscription as string;
        const buildingId = session.metadata?.buildingId;

        console.log("[Stripe Webhook] checkout.session.completed - buildingId:", buildingId, "subscriptionId:", subscriptionId);

        if (!buildingId) {
            console.error("[Stripe Webhook] Building ID missing in metadata");
            return new Response("Building ID missing in metadata", { status: 400 });
        }

        // Update Building Status
        const result = await db.update(building)
            .set({
                subscriptionStatus: 'active',
                stripeSubscriptionId: subscriptionId,
                stripePriceId: session.metadata?.priceId
            })
            .where(eq(building.id, buildingId));
        
        console.log("[Stripe Webhook] Building updated to active status");
    }

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

    // Handle invoice.payment_succeeded to keep status active?
    // Often not strictly needed if we trust the initial checkout, but good for renewals.
    if (event.type === "invoice.payment_succeeded") {
        const invoice = event.data.object as any;
        const subscriptionId = typeof invoice.subscription === 'string'
            ? invoice.subscription
            : invoice.subscription?.id;
        // Ensure it's active
        const buildingRecord = await db.query.building.findFirst({
            where: eq(building.stripeSubscriptionId, subscriptionId)
        });

        if (buildingRecord && buildingRecord.subscriptionStatus !== 'active') {
            await db.update(building)
                .set({ subscriptionStatus: 'active' })
                .where(eq(building.id, buildingRecord.id));
        }
    }


    return new Response(null, { status: 200 });
}
