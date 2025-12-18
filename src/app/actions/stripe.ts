"use server"

import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { db } from "@/db"
import { building, user, apartments } from "@/db/schema"
import { eq, count } from "drizzle-orm"
import { stripe } from "@/lib/stripe"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"

/**
 * Syncs the subscription status from Stripe for a building.
 * Useful when webhook fails or to verify payment status.
 */
export async function syncSubscriptionStatus(buildingId: string) {
    const session = await auth.api.getSession({
        headers: await headers()
    })

    if (!session || !session.user) {
        throw new Error("Unauthorized")
    }

    const buildingRecord = await db.query.building.findFirst({
        where: eq(building.id, buildingId),
    })

    if (!buildingRecord) throw new Error("Building not found")
    if (buildingRecord.managerId !== session.user.id) throw new Error("Unauthorized")

    // If no subscription ID stored, check Stripe for any active subscriptions
    if (!buildingRecord.stripeSubscriptionId) {
        // Try to find subscription by customer and metadata
        const customerId = session.user.stripeCustomerId
        if (customerId) {
            const subscriptions = await stripe.subscriptions.list({
                customer: customerId,
                status: 'active',
                limit: 10,
            })

            // Find subscription with matching building metadata
            for (const sub of subscriptions.data) {
                // Check if any of the checkout sessions for this subscription has our buildingId
                const sessions = await stripe.checkout.sessions.list({
                    subscription: sub.id,
                    limit: 1,
                })

                if (sessions.data[0]?.metadata?.buildingId === buildingId) {
                    await db.update(building)
                        .set({
                            subscriptionStatus: 'active',
                            stripeSubscriptionId: sub.id,
                        })
                        .where(eq(building.id, buildingId))
                    
                    revalidatePath('/dashboard/settings')
                    return { status: 'active', synced: true }
                }
            }
        }
        
        return { status: 'incomplete', synced: false, message: 'No active subscription found' }
    }

    // Verify existing subscription status
    try {
        const subscription = await stripe.subscriptions.retrieve(buildingRecord.stripeSubscriptionId)
        const newStatus = subscription.status === 'active' ? 'active' : 
                          subscription.status === 'canceled' ? 'canceled' : 'incomplete'

        if (buildingRecord.subscriptionStatus !== newStatus) {
            await db.update(building)
                .set({ subscriptionStatus: newStatus })
                .where(eq(building.id, buildingId))
        }

        revalidatePath('/dashboard/settings')
        return { status: newStatus, synced: true }
    } catch (error: any) {
        console.error("Failed to sync subscription:", error)
        return { status: buildingRecord.subscriptionStatus, synced: false, message: error.message }
    }
}

export async function createCheckoutSession(buildingId: string) {
    const session = await auth.api.getSession({
        headers: await headers()
    })

    if (!session || !session.user) {
        throw new Error("Unauthorized")
    }

    const userId = session.user.id

    // 1. Get Building and Unit Count
    const buildingRecord = await db.query.building.findFirst({
        where: eq(building.id, buildingId),
    })

    if (!buildingRecord) throw new Error("Building not found")

    // Check permissions (must be manager)
    if (buildingRecord.managerId !== userId) throw new Error("Unauthorized")

    // Use 'totalApartments' from settings as the source of truth for billing capacity
    const quantity = buildingRecord.totalApartments && buildingRecord.totalApartments > 0
        ? buildingRecord.totalApartments
        : 1; // Fallback to 1 if not set (shouldn't happen if validated in settings)

    // 2. Get or Create Stripe Customer
    let stripeCustomerId = session.user.stripeCustomerId
    let checkoutSession;

    const createCustomer = async () => {
        const customer = await stripe.customers.create({
            email: session.user.email,
            name: session.user.name,
            metadata: {
                userId: userId,
            }
        })
        const cid = customer.id
        // Save to User
        await db.update(user)
            .set({ stripeCustomerId: cid })
            .where(eq(user.id, userId))
        return cid
    }

    try {
        if (!stripeCustomerId) {
            stripeCustomerId = await createCustomer()
        }

        checkoutSession = await stripe.checkout.sessions.create({
            customer: stripeCustomerId,
            mode: 'subscription',
            payment_method_types: ['card'],
            line_items: [
                {
                    price: process.env.STRIPE_PRICE_ID,
                    quantity: quantity,
                },
            ],
            success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?success=true`,
            cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings/payments?canceled=true`,
            metadata: {
                buildingId: buildingId,
                userId: userId,
            },
        })
    } catch (error: any) {
        if (error.code === 'resource_missing' && stripeCustomerId) {
            console.log("Stripe Customer missing, recreating...")
            stripeCustomerId = await createCustomer()
            checkoutSession = await stripe.checkout.sessions.create({
                customer: stripeCustomerId,
                mode: 'subscription',
                payment_method_types: ['card'],
                line_items: [
                    {
                        price: process.env.STRIPE_PRICE_ID,
                        quantity: quantity,
                    },
                ],
                success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?success=true`,
                cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings/payments?canceled=true`,
                metadata: {
                    buildingId: buildingId,
                    userId: userId,
                },
            })
        } else {
            throw error
        }
    }

    if (!checkoutSession.url) {
        throw new Error("Failed to create checkout session")
    }

    return checkoutSession.url
}
