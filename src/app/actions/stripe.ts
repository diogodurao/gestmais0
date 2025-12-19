"use server"

import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { db } from "@/db"
import { building, user } from "@/db/schema"
import { eq } from "drizzle-orm"
import { stripe } from "@/lib/stripe"
import { revalidatePath } from "next/cache"

/**
 * Syncs the subscription status from Stripe for a building.
 * More aggressive searching to handle webhook delays.
 */
export async function syncSubscriptionStatus(buildingId: string) {
    console.log("[syncSubscriptionStatus] Starting for building:", buildingId)
    
    const session = await auth.api.getSession({
        headers: await headers()
    })

    if (!session || !session.user) {
        console.log("[syncSubscriptionStatus] No session")
        throw new Error("Unauthorized")
    }

    const buildingRecord = await db.query.building.findFirst({
        where: eq(building.id, buildingId),
    })

    if (!buildingRecord) {
        console.log("[syncSubscriptionStatus] Building not found")
        throw new Error("Building not found")
    }
    
    if (buildingRecord.managerId !== session.user.id) {
        console.log("[syncSubscriptionStatus] Not the manager")
        throw new Error("Unauthorized")
    }

    console.log("[syncSubscriptionStatus] Current status:", buildingRecord.subscriptionStatus)

    // If already active, just return
    if (buildingRecord.subscriptionStatus === 'active') {
        console.log("[syncSubscriptionStatus] Already active")
        revalidatePath('/dashboard')
        return { status: 'active', synced: true }
    }

    const customerId = session.user.stripeCustomerId
    console.log("[syncSubscriptionStatus] Customer ID:", customerId)

    if (!customerId) {
        return { 
            status: 'incomplete', 
            synced: false, 
            message: 'No Stripe customer found. Please try the checkout again.' 
        }
    }

    try {
        // Strategy 1: Check all recent checkout sessions for this customer
        console.log("[syncSubscriptionStatus] Checking checkout sessions...")
        const checkoutSessions = await stripe.checkout.sessions.list({
            customer: customerId,
            limit: 10,
        })

        console.log("[syncSubscriptionStatus] Found", checkoutSessions.data.length, "checkout sessions")

        for (const cs of checkoutSessions.data) {
            console.log("[syncSubscriptionStatus] Session:", cs.id, "status:", cs.status, "payment_status:", cs.payment_status, "metadata:", cs.metadata)
            
            // Check if this session is complete and has a subscription
            if (cs.payment_status === 'paid' && cs.subscription) {
                const subId = typeof cs.subscription === 'string' 
                    ? cs.subscription 
                    : cs.subscription.id

                console.log("[syncSubscriptionStatus] Found paid session with subscription:", subId)

                // Verify the subscription is active
                const subscription = await stripe.subscriptions.retrieve(subId)
                console.log("[syncSubscriptionStatus] Subscription status:", subscription.status)

                if (subscription.status === 'active') {
                    // Check if metadata matches OR if it's the only building
                    const shouldActivate = cs.metadata?.buildingId === buildingId

                    if (!shouldActivate) {
                        // Check if user has only one building
                        const userBuildings = await db.query.building.findMany({
                            where: eq(building.managerId, session.user.id),
                        })
                        
                        if (userBuildings.length === 1) {
                            console.log("[syncSubscriptionStatus] Single building, activating anyway")
                        } else {
                            console.log("[syncSubscriptionStatus] Multiple buildings, metadata doesn't match, skipping")
                            continue
                        }
                    }

                    // Activate!
                    console.log("[syncSubscriptionStatus] Activating building!")
                    await db.update(building)
                        .set({
                            subscriptionStatus: 'active',
                            stripeSubscriptionId: subId,
                        })
                        .where(eq(building.id, buildingId))
                    
                    revalidatePath('/dashboard')
                    revalidatePath('/dashboard/settings')
                    return { status: 'active', synced: true }
                }
            }
        }

        // Strategy 2: Check active subscriptions directly
        console.log("[syncSubscriptionStatus] Checking active subscriptions...")
        const subscriptions = await stripe.subscriptions.list({
            customer: customerId,
            status: 'active',
            limit: 10,
        })

        console.log("[syncSubscriptionStatus] Found", subscriptions.data.length, "active subscriptions")

        if (subscriptions.data.length > 0) {
            // If there's any active subscription and user has only one building, activate it
            const userBuildings = await db.query.building.findMany({
                where: eq(building.managerId, session.user.id),
            })

            if (userBuildings.length === 1 || subscriptions.data.length === 1) {
                const sub = subscriptions.data[0]
                console.log("[syncSubscriptionStatus] Activating with subscription:", sub.id)
                
                await db.update(building)
                    .set({
                        subscriptionStatus: 'active',
                        stripeSubscriptionId: sub.id,
                    })
                    .where(eq(building.id, buildingId))
                
                revalidatePath('/dashboard')
                revalidatePath('/dashboard/settings')
                return { status: 'active', synced: true }
            }
        }

        // Strategy 3: Check if there's any subscription at all (including trialing, past_due, etc.)
        console.log("[syncSubscriptionStatus] Checking all subscriptions...")
        const allSubs = await stripe.subscriptions.list({
            customer: customerId,
            limit: 10,
        })

        console.log("[syncSubscriptionStatus] Found", allSubs.data.length, "total subscriptions")
        
        for (const sub of allSubs.data) {
            console.log("[syncSubscriptionStatus] Sub:", sub.id, "status:", sub.status)
            
            if (sub.status === 'active' || sub.status === 'trialing') {
                console.log("[syncSubscriptionStatus] Found usable subscription, activating!")
                
                await db.update(building)
                    .set({
                        subscriptionStatus: 'active',
                        stripeSubscriptionId: sub.id,
                    })
                    .where(eq(building.id, buildingId))
                
                revalidatePath('/dashboard')
                revalidatePath('/dashboard/settings')
                return { status: 'active', synced: true }
            }
        }

        console.log("[syncSubscriptionStatus] No active subscription found")
        return { 
            status: 'incomplete', 
            synced: false, 
            message: 'Payment received but subscription not yet active. Please wait a moment and retry.' 
        }

    } catch (error: any) {
        console.error("[syncSubscriptionStatus] Error:", error)
        return { 
            status: 'incomplete', 
            synced: false, 
            message: error.message || 'Failed to verify subscription' 
        }
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
        : 1

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
            cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings?canceled=true`,
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
                cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings?canceled=true`,
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