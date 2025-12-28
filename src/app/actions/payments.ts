"use server"

import { revalidatePath } from "next/cache"
import { paymentService, type PaymentData } from "@/services/payment.service"
import { type PaymentStatus, ActionResult } from "@/lib/types"
import { ROUTES } from "@/lib/routes"

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

export type { PaymentStatus, PaymentData }

export async function getPaymentMap(buildingId: string, year: number): Promise<{ gridData: PaymentData[], monthlyQuota: number }> {
    const session = await requireSession()

    // Check if user is manager or resident of this building
    if (session.user.role === 'manager') {
        const { requireBuildingAccess } = await import("@/lib/auth-helpers")
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

        await paymentService.updatePaymentStatus(apartmentId, month, year, status, amount)
        revalidatePath(ROUTES.DASHBOARD.PAYMENTS)
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

        for (const month of monthsToUpdate) {
            await paymentService.updatePaymentStatus(apartmentId, month, year, status)
        }

        revalidatePath(ROUTES.DASHBOARD.PAYMENTS)
        return { success: true, data: true }
    } catch {
        return { success: false, error: "Failed to bulk update payments" }
    }
}