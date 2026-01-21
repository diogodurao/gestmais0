import { db } from "@/db"
import { building, user } from "@/db/schema"
import { eq } from "drizzle-orm"
import { stripe } from "@/lib/stripe"
import { getAppUrl } from "@/lib/utils"
import { revalidatePath } from "next/cache"
import { ActionResult, Ok, Err, ErrorCodes } from "@/lib/types"
import { createLogger } from "@/lib/logger"

const logger = createLogger('StripeService')

type SyncResult = {
    status: 'active' | 'incomplete'
    synced: boolean
    message?: string
}

export class StripeService {
    async syncSubscriptionStatus(
        buildingId: string,
        userId: string,
        stripeCustomerId: string | null
    ): Promise<ActionResult<SyncResult>> {
        const buildingRecord = await db.query.building.findFirst({
            where: eq(building.id, buildingId),
        })

        if (!buildingRecord) {
            return Err("Condomínio não encontrado", ErrorCodes.BUILDING_NOT_FOUND)
        }

        if (buildingRecord.managerId !== userId) {
            return Err("Não autorizado", ErrorCodes.UNAUTHORIZED)
        }

        if (buildingRecord.subscriptionStatus === 'active') {
            revalidatePath('/dashboard')
            return Ok({ status: 'active', synced: true })
        }

        if (!stripeCustomerId) {
            return Ok({
                status: 'incomplete',
                synced: false,
                message: 'No Stripe customer found. Please try the checkout again.'
            })
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
                        return Ok({ status: 'active', synced: true })
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
                    return Ok({ status: 'active', synced: true })
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
                    return Ok({ status: 'active', synced: true })
                }
            }

            return Ok({
                status: 'incomplete',
                synced: false,
                message: 'Payment received but subscription not yet active. Please wait a moment and retry.'
            })

        } catch (error) {
            logger.error("Failed to sync subscription status", { method: 'syncSubscriptionStatus', buildingId }, error)
            const message = error instanceof Error ? error.message : 'Failed to verify subscription'
            return Err(message, ErrorCodes.SUBSCRIPTION_NOT_FOUND)
        }
    }

    async createCheckoutSession(
        buildingId: string,
        userContext: {
            id: string
            email: string
            name: string
            stripeCustomerId: string | null
        }
    ): Promise<ActionResult<string>> {
        const { id: userId, email, name, stripeCustomerId: initialStripeCustomerId } = userContext

        const buildingRecord = await db.query.building.findFirst({
            where: eq(building.id, buildingId),
        })

        if (!buildingRecord) {
            return Err("Condomínio não encontrado", ErrorCodes.BUILDING_NOT_FOUND)
        }

        if (buildingRecord.managerId !== userId) {
            return Err("Não autorizado", ErrorCodes.UNAUTHORIZED)
        }

        const quantity = buildingRecord.totalApartments && buildingRecord.totalApartments > 0
            ? buildingRecord.totalApartments
            : 1

        let stripeCustomerId = initialStripeCustomerId

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
        }

        const createSession = async (cid: string) => {
            validateEnv()
            const appUrl = getAppUrl()
            logger.info("Creating checkout session", { method: 'createSession', customerId: cid })
            return await stripe.checkout.sessions.create({
                customer: cid,
                mode: 'subscription',
                payment_method_types: ['card'],
                line_items: [{ price: process.env.STRIPE_PRICE_ID, quantity }],
                success_url: `${appUrl}/dashboard?success=true`,
                cancel_url: `${appUrl}/dashboard/settings?canceled=true`,
                metadata: { buildingId, userId },
            })
        }

        try {
            if (!stripeCustomerId) {
                stripeCustomerId = await createCustomer()
            }

            let checkoutSession
            try {
                checkoutSession = await createSession(stripeCustomerId)
            } catch (error) {
                const stripeError = error as { code?: string }
                if (stripeError.code === 'resource_missing') {
                    logger.info("Customer not found in Stripe, creating new one", { method: 'createCheckoutSession' })
                    stripeCustomerId = await createCustomer()
                    checkoutSession = await createSession(stripeCustomerId)
                } else {
                    throw error
                }
            }

            if (!checkoutSession.url) {
                return Err("Falha ao criar sessão de checkout", ErrorCodes.CHECKOUT_FAILED)
            }

            return Ok(checkoutSession.url)

        } catch (error) {
            logger.error("Failed to create checkout session", { method: 'createCheckoutSession', buildingId, userId }, error)
            const message = error instanceof Error ? error.message : 'Failed to create checkout session'
            return Err(message, ErrorCodes.CHECKOUT_FAILED)
        }
    }

    async createBillingPortalSession(
        buildingId: string,
        userId: string,
        stripeCustomerId: string | null
    ): Promise<ActionResult<string>> {
        const buildingRecord = await db.query.building.findFirst({
            where: eq(building.id, buildingId),
        })

        if (!buildingRecord) {
            return Err("Condomínio não encontrado", ErrorCodes.BUILDING_NOT_FOUND)
        }

        if (buildingRecord.managerId !== userId) {
            return Err("Não autorizado", ErrorCodes.UNAUTHORIZED)
        }

        if (!stripeCustomerId) {
            return Err("Nenhum cliente Stripe encontrado", ErrorCodes.STRIPE_CUSTOMER_ERROR)
        }

        try {
            const appUrl = getAppUrl()
            const session = await stripe.billingPortal.sessions.create({
                customer: stripeCustomerId,
                return_url: `${appUrl}/dashboard/settings`,
            })

            return Ok(session.url)
        } catch (error) {
            logger.error("Failed to create billing portal session", { method: 'createBillingPortalSession', buildingId }, error)
            const message = error instanceof Error ? error.message : 'Failed to create billing portal session'
            return Err(message, ErrorCodes.CHECKOUT_FAILED)
        }
    }
}

export const stripeService = new StripeService()