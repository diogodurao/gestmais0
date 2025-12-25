"use server"

import { revalidatePath } from "next/cache"
import { paymentService, type PaymentStatus, type PaymentData } from "@/services/payment.service"

/**
 * ============================================================================
 * RESIDENT QUOTA PAYMENTS (Server Actions)
 * ============================================================================
 * These actions handle the storage/retrieval of which residents have paid their
 * monthly quotas.
 * 
 * NOT RELATED TO STRIPE.
 */
export type { PaymentStatus, PaymentData }

export async function getPaymentMap(buildingId: string, year: number): Promise<{ gridData: PaymentData[], monthlyQuota: number }> {
    return await paymentService.getPaymentMap(buildingId, year)
}

export async function updatePaymentStatus(
    apartmentId: number,
    month: number,
    year: number,
    status: PaymentStatus,
    amount?: number
) {
    const result = await paymentService.updatePaymentStatus(apartmentId, month, year, status, amount)
    revalidatePath("/dashboard/payments")
    return result
}

export async function bulkUpdatePayments(
    apartmentId: number,
    year: number,
    startMonth: number,
    endMonth: number,
    status: PaymentStatus
) {
    const monthsToUpdate = Array.from({ length: endMonth - startMonth + 1 }, (_, i) => startMonth + i)

    if (monthsToUpdate.length === 0) return true

    for (const month of monthsToUpdate) {
        await paymentService.updatePaymentStatus(apartmentId, month, year, status)
    }

    revalidatePath("/dashboard/payments")
    return true
}