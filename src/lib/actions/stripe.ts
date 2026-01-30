"use server"

import { requireBuildingOwnerAccess } from "@/lib/auth-helpers"
import { stripeService } from "@/services/stripe.service"

type SyncResult = {
    status: 'active' | 'incomplete'
    synced: boolean
    message?: string
}

export async function syncSubscriptionStatus(buildingId: string): Promise<SyncResult> {
    // Only building owners can manage subscriptions
    const { session } = await requireBuildingOwnerAccess(buildingId)

    const result = await stripeService.syncSubscriptionStatus(
        buildingId,
        session.user.id,
        session.user.stripeCustomerId || null
    )

    if (!result.success) {
        return { status: 'incomplete', synced: false, message: result.error }
    }

    return result.data
}

export async function createCheckoutSession(buildingId: string): Promise<{ success: true; url: string } | { success: false; error: string }> {
    // Only building owners can manage subscriptions
    const { session } = await requireBuildingOwnerAccess(buildingId)

    const result = await stripeService.createCheckoutSession(
        buildingId,
        {
            id: session.user.id,
            email: session.user.email,
            name: session.user.name,
            stripeCustomerId: session.user.stripeCustomerId || null
        }
    )

    if (!result.success) {
        console.error("[createCheckoutSession] Error:", result.error)
        return { success: false, error: result.error }
    }

    return { success: true, url: result.data }
}

export async function createBillingPortalSession(buildingId: string): Promise<{ success: true; url: string } | { success: false; error: string }> {
    // Only building owners can manage subscriptions
    const { session } = await requireBuildingOwnerAccess(buildingId)

    const result = await stripeService.createBillingPortalSession(
        buildingId,
        session.user.id,
        session.user.stripeCustomerId || null
    )

    if (!result.success) {
        console.error("[createBillingPortalSession] Error:", result.error)
        return { success: false, error: result.error }
    }

    return { success: true, url: result.data }
}