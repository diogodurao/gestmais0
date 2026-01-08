"use server"

import { requireSession } from "@/lib/session"
import { paymentService, PaymentStatusSummary } from "@/services/payment.service"

export type { PaymentStatusSummary }

export async function getResidentPaymentStatus(targetUserId?: string) {
    const session = await requireSession()
    const idToCheck = targetUserId || session.user.id

    if (targetUserId && targetUserId !== session.user.id && session.user.role !== "manager") {
        throw new Error("Não autorizado")
    }

    return await paymentService.getResidentPaymentStatus(idToCheck)
}

export async function getApartmentPaymentStatus(apartmentId: number) {
    const session = await requireSession()

    if (session.user.role !== "manager") {
        throw new Error("Apenas gestores podem ver detalhes de outros apartamentos")
    }

    return await paymentService.getApartmentPaymentStatus(apartmentId)
}

export async function getBuildingPaymentStatus(buildingId: string) {
    const session = await requireSession()

    if (session.user.role !== "manager") {
        throw new Error("Apenas gestores podem ver estado do condomínio")
    }

    return await paymentService.getBuildingPaymentStatus(buildingId)
}