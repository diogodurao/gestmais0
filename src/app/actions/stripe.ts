"use server"

import { requireSession } from "@/lib/auth-helpers"
import { stripeService } from "@/services/stripe.service"

export async function syncSubscriptionStatus(buildingId: string) {
    const session = await requireSession()

    return await stripeService.syncSubscriptionStatus(
        buildingId,
        session.user.id,
        session.user.stripeCustomerId || null
    )
}

export async function createCheckoutSession(buildingId: string) {
    try {
        const session = await requireSession()

        const url = await stripeService.createCheckoutSession(
            buildingId,
            {
                id: session.user.id,
                email: session.user.email,
                name: session.user.name,
                stripeCustomerId: session.user.stripeCustomerId || null
            }
        )
        return { success: true, url }
    } catch (error) {
        console.error("[createCheckoutSession] Error:", error)
        return {
            success: false,
            error: error instanceof Error ? error.message : "Ocorreu um erro ao criar a sessão de pagamento"
        }
    }
}