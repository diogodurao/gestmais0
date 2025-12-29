import { db } from "@/db"
import { building, user } from "@/db/schema"
import { eq } from "drizzle-orm"
import { stripe } from "@/lib/stripe"
import { revalidatePath } from "next/cache"
import type Stripe from 'stripe'

export class StripeService {
    async syncSubscriptionStatus(buildingId: string, userId: string, stripeCustomerId: string | null) {
        const buildingRecord = await db.query.building.findFirst({
            where: eq(building.id, buildingId),
        })

        if (!buildingRecord) throw new Error("Building not found")
        if (buildingRecord.managerId !== userId) throw new Error("Unauthorized")

        if (buildingRecord.subscriptionStatus === 'active') {
            revalidatePath('/dashboard')
            return { status: 'active', synced: true }
        }

        if (!stripeCustomerId) {
            return { status: 'incomplete', synced: false, message: 'No Stripe customer found. Please try the checkout again.' }
        }

        try {
            // Check checkout sessions
            const checkoutSessions = await stripe.checkout.sessions.list({ customer: stripeCustomerId, limit: 10 })

            for (const cs of checkoutSessions.data) {
                if (cs.payment_status === 'paid' && cs.subscription) {
                    const subId = typeof cs.subscription === 'string' ? cs.subscription : cs.subscription.id
                    const subscription = await stripe.subscriptions.retrieve(subId)

                    if (subscription.status === 'active') {
                        const shouldActivate = cs.metadata?.buildingId === buildingId

                        if (!shouldActivate) {
                            const userBuildings = await db.query.building.findMany({
                                where: eq(building.managerId, userId),
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
            const subscriptions = await stripe.subscriptions.list({ customer: stripeCustomerId, status: 'active', limit: 10 })

            if (subscriptions.data.length > 0) {
                const userBuildings = await db.query.building.findMany({
                    where: eq(building.managerId, userId),
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
            const allSubs = await stripe.subscriptions.list({ customer: stripeCustomerId, limit: 10 })

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

        } catch (error) {
            console.error("[syncSubscriptionStatus] Error:", error)
            const message = error instanceof Error ? error.message : 'Failed to verify subscription'
            return { status: 'incomplete', synced: false, message }
        }
    }

    async createCheckoutSession(
        buildingId: string,
        userContext: {
            id: string,
            email: string,
            name: string,
            stripeCustomerId: string | null
        }
    ) {
        const { id: userId, email, name, stripeCustomerId: initialStripeCustomerId } = userContext

        const buildingRecord = await db.query.building.findFirst({
            where: eq(building.id, buildingId),
        })

        if (!buildingRecord) throw new Error("Building not found")
        if (buildingRecord.managerId !== userId) throw new Error("Unauthorized")

        const quantity = buildingRecord.totalApartments && buildingRecord.totalApartments > 0
            ? buildingRecord.totalApartments
            : 1

        let stripeCustomerId = initialStripeCustomerId
        let checkoutSession

        const createCustomer = async () => {
            const customer = await stripe.customers.create({
                email: email,
                name: name,
                metadata: { userId },
            })
            await db.update(user).set({ stripeCustomerId: customer.id }).where(eq(user.id, userId))
            return customer.id
        }

        const validateEnv = () => {
            if (!process.env.STRIPE_PRICE_ID || process.env.STRIPE_PRICE_ID === "undefined") {
                throw new Error("STRIPE_PRICE_ID is missing or invalid in environment variables")
            }
            if (!process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_APP_URL === "undefined") {
                throw new Error("NEXT_PUBLIC_APP_URL is missing or invalid in environment variables")
            }
        }

        const createSession = async (cid: string) => {
            validateEnv()
            console.log(`[StripeService] Creating session for Customer: ${cid}, Price: ${process.env.STRIPE_PRICE_ID?.substring(0, 8)}...`)
            return await stripe.checkout.sessions.create({
                customer: cid,
                mode: 'subscription',
                payment_method_types: ['card'],
                line_items: [{ price: process.env.STRIPE_PRICE_ID, quantity }],
                success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?success=true`,
                cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings?canceled=true`,
                metadata: { buildingId, userId },
            })
        }

        try {
            if (!stripeCustomerId) {
                stripeCustomerId = await createCustomer()
            }

            try {
                checkoutSession = await createSession(stripeCustomerId)
            } catch (error) {
                // Safely check for Stripe error code
                const stripeError = error as { code?: string }
                if (stripeError.code === 'resource_missing') {
                    console.log("[StripeService] Customer not found in Stripe, creating new one...")
                    stripeCustomerId = await createCustomer()
                    checkoutSession = await createSession(stripeCustomerId)
                } else {
                    throw error
                }
            }
        } catch (error) {
            console.error("[createCheckoutSession] Fatal Error:", error)
            throw error
        }

        if (!checkoutSession.url) throw new Error("Failed to create checkout session")

        return checkoutSession.url
    }
}

export const stripeService = new StripeService()
