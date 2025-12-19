"use server"

import { db } from "@/db"
import { building, user } from "@/db/schema"
import { eq } from "drizzle-orm"
import { stripe } from "@/lib/stripe"
import { revalidatePath } from "next/cache"
import { requireSession } from "@/lib/auth-helpers"

export async function syncSubscriptionStatus(buildingId: string) {
    const session = await requireSession()

    const buildingRecord = await db.query.building.findFirst({
        where: eq(building.id, buildingId),
    })

    if (!buildingRecord) throw new Error("Building not found")
    if (buildingRecord.managerId !== session.user.id) throw new Error("Unauthorized")

    if (buildingRecord.subscriptionStatus === 'active') {
        revalidatePath('/dashboard')
        return { status: 'active', synced: true }
    }

    const customerId = session.user.stripeCustomerId

    if (!customerId) {
        return { status: 'incomplete', synced: false, message: 'No Stripe customer found. Please try the checkout again.' }
    }

    try {
        // Check checkout sessions
        const checkoutSessions = await stripe.checkout.sessions.list({ customer: customerId, limit: 10 })

        for (const cs of checkoutSessions.data) {
            if (cs.payment_status === 'paid' && cs.subscription) {
                const subId = typeof cs.subscription === 'string' ? cs.subscription : cs.subscription.id
                const subscription = await stripe.subscriptions.retrieve(subId)

                if (subscription.status === 'active') {
                    const shouldActivate = cs.metadata?.buildingId === buildingId

                    if (!shouldActivate) {
                        const userBuildings = await db.query.building.findMany({
                            where: eq(building.managerId, session.user.id),
                        })
                        if (userBuildings.length !== 1) continue
                    }

                    await db.update(building)
                        .set({ subscriptionStatus: 'active', stripeSubscriptionId: subId })
                        .where(eq(building.id, buildingId))

                    revalidatePath('/dashboard')
                    revalidatePath('/dashboard/settings')
                    return { status: 'active', synced: true }
                }
            }
        }

        // Check active subscriptions
        const subscriptions = await stripe.subscriptions.list({ customer: customerId, status: 'active', limit: 10 })

        if (subscriptions.data.length > 0) {
            const userBuildings = await db.query.building.findMany({
                where: eq(building.managerId, session.user.id),
            })

            if (userBuildings.length === 1 || subscriptions.data.length === 1) {
                const sub = subscriptions.data[0]
                await db.update(building)
                    .set({ subscriptionStatus: 'active', stripeSubscriptionId: sub.id })
                    .where(eq(building.id, buildingId))

                revalidatePath('/dashboard')
                revalidatePath('/dashboard/settings')
                return { status: 'active', synced: true }
            }
        }

        // Check all subscriptions
        const allSubs = await stripe.subscriptions.list({ customer: customerId, limit: 10 })

        for (const sub of allSubs.data) {
            if (sub.status === 'active' || sub.status === 'trialing') {
                await db.update(building)
                    .set({ subscriptionStatus: 'active', stripeSubscriptionId: sub.id })
                    .where(eq(building.id, buildingId))

                revalidatePath('/dashboard')
                revalidatePath('/dashboard/settings')
                return { status: 'active', synced: true }
            }
        }

        return { status: 'incomplete', synced: false, message: 'Payment received but subscription not yet active. Please wait a moment and retry.' }

    } catch (error: any) {
        console.error("[syncSubscriptionStatus] Error:", error)
        return { status: 'incomplete', synced: false, message: error.message || 'Failed to verify subscription' }
    }
}

export async function createCheckoutSession(buildingId: string) {
    const session = await requireSession()
    const userId = session.user.id

    const buildingRecord = await db.query.building.findFirst({
        where: eq(building.id, buildingId),
    })

    if (!buildingRecord) throw new Error("Building not found")
    if (buildingRecord.managerId !== userId) throw new Error("Unauthorized")

    const quantity = buildingRecord.totalApartments && buildingRecord.totalApartments > 0
        ? buildingRecord.totalApartments
        : 1

    let stripeCustomerId = session.user.stripeCustomerId
    let checkoutSession

    const createCustomer = async () => {
        const customer = await stripe.customers.create({
            email: session.user.email,
            name: session.user.name,
            metadata: { userId },
        })
        await db.update(user).set({ stripeCustomerId: customer.id }).where(eq(user.id, userId))
        return customer.id
    }

    try {
        if (!stripeCustomerId) {
            stripeCustomerId = await createCustomer()
        }

        checkoutSession = await stripe.checkout.sessions.create({
            customer: stripeCustomerId,
            mode: 'subscription',
            payment_method_types: ['card'],
            line_items: [{ price: process.env.STRIPE_PRICE_ID, quantity }],
            success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?success=true`,
            cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings?canceled=true`,
            metadata: { buildingId, userId },
        })
    } catch (error: any) {
        if (error.code === 'resource_missing' && stripeCustomerId) {
            stripeCustomerId = await createCustomer()
            checkoutSession = await stripe.checkout.sessions.create({
                customer: stripeCustomerId,
                mode: 'subscription',
                payment_method_types: ['card'],
                line_items: [{ price: process.env.STRIPE_PRICE_ID, quantity }],
                success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?success=true`,
                cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings?canceled=true`,
                metadata: { buildingId, userId },
            })
        } else {
            throw error
        }
    }

    if (!checkoutSession.url) throw new Error("Failed to create checkout session")

    return checkoutSession.url
}