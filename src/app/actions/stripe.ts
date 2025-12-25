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
    const session = await requireSession()

    return await stripeService.createCheckoutSession(
        buildingId,
        {
            id: session.user.id,
            email: session.user.email,
            name: session.user.name,
            stripeCustomerId: session.user.stripeCustomerId || null
        }
    )
}