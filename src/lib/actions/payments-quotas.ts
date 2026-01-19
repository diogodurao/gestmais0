"use server"

import { updateTag } from "next/cache"
import { paymentService } from "@/services/payment.service"
import { type PaymentStatus, type PaymentData, ActionResult } from "@/lib/types"
import { db } from "@/db"
import { apartments } from "@/db/schema"
import { eq } from "drizzle-orm"

/**
 * ============================================================================
 * RESIDENT QUOTA PAYMENTS (Server Actions)
 * ============================================================================
 * These actions handle the storage/retrieval of which residents have paid their
 * monthly quotas.
 *
 * NOT RELATED TO STRIPE.
 */
import { requireBuildingAccess, requireApartmentAccess, requireSession } from "@/lib/auth-helpers"
import { updatePaymentStatusSchema, bulkUpdatePaymentsSchema } from "@/lib/zod-schemas"

async function getApartmentBuildingId(apartmentId: number): Promise<string | null> {
    const [apt] = await db
        .select({ buildingId: apartments.buildingId })
        .from(apartments)
        .where(eq(apartments.id, apartmentId))
        .limit(1)
    return apt?.buildingId || null
}

export type { PaymentStatus, PaymentData }

export async function getPaymentMap(buildingId: string, year: number): Promise<{ gridData: PaymentData[], monthlyQuota: number }> {
    const session = await requireSession()

    // Check if user is manager or resident of this building
    if (session.user.role === 'manager') {
        await requireBuildingAccess(buildingId)
    } else if (session.user.role === 'resident') {
        if (session.user.buildingId !== buildingId) {
            throw new Error("Unauthorized: You are not a resident of this building")
        }
    } else {
        throw new Error("Unauthorized")
    }

    return await paymentService.getPaymentMap(buildingId, year)
}

export async function updatePaymentStatus(
    apartmentId: number,
    month: number,
    year: number,
    status: PaymentStatus,
    amount?: number
): Promise<ActionResult<undefined>> {
    await requireApartmentAccess(apartmentId)

    try {
        // Validate inputs
        const validated = updatePaymentStatusSchema.safeParse({
            apartmentId,
            month,
            year,
            status,
            amount
        })

        if (!validated.success) return { success: false, error: validated.error.issues[0].message }

        // Get buildingId for cache invalidation
        const buildingId = await getApartmentBuildingId(apartmentId)

        await paymentService.updatePaymentStatus(apartmentId, month, year, status, amount)

        if (buildingId) {
            updateTag(`payments-${buildingId}`)
            updateTag(`payments-${buildingId}-${year}`)
        }
        return { success: true, data: undefined }
    } catch {
        return { success: false, error: "Failed to update payment status" }
    }
}

export async function bulkUpdatePayments(
    apartmentId: number,
    year: number,
    startMonth: number,
    endMonth: number,
    status: PaymentStatus
): Promise<ActionResult<boolean>> {
    await requireApartmentAccess(apartmentId)

    try {
        const validated = bulkUpdatePaymentsSchema.safeParse({
            apartmentId,
            year,
            startMonth,
            endMonth,
            status
        })

        if (!validated.success) return { success: false, error: validated.error.issues[0].message }

        const monthsToUpdate = Array.from({ length: endMonth - startMonth + 1 }, (_, i) => startMonth + i)

        if (monthsToUpdate.length === 0) return { success: true, data: true }

        // Get buildingId for cache invalidation
        const buildingId = await getApartmentBuildingId(apartmentId)

        for (const month of monthsToUpdate) {
            await paymentService.updatePaymentStatus(apartmentId, month, year, status)
        }

        if (buildingId) {
            updateTag(`payments-${buildingId}`)
            updateTag(`payments-${buildingId}-${year}`)
        }
        return { success: true, data: true }
    } catch {
        return { success: false, error: "Failed to bulk update payments" }
    }
}