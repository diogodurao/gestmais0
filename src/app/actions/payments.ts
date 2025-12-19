"use server"

import { db } from "@/db"
import { payments, apartments } from "@/db/schema"
import { eq, and } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { getApartmentDisplayName, sortApartments } from "@/lib/utils"

export type PaymentStatus = 'paid' | 'pending' | 'late'

export interface PaymentData {
    apartmentId: number
    unit: string
    payments: Record<number, string>
}

export async function getPaymentMap(buildingId: string, year: number): Promise<PaymentData[]> {
    if (!buildingId) return []

    const buildingApartments = await db.select()
        .from(apartments)
        .where(eq(apartments.buildingId, buildingId))

    // Use centralized sorting
    const sortedApartments = sortApartments(buildingApartments)

    const rawPayments = await db.select({
        apartmentId: payments.apartmentId,
        month: payments.month,
        status: payments.status,
    })
        .from(payments)
        .innerJoin(apartments, eq(payments.apartmentId, apartments.id))
        .where(and(eq(apartments.buildingId, buildingId), eq(payments.year, year)))

    const paymentsByApartment = new Map<number, Record<number, string>>()
    for (const p of rawPayments) {
        if (!paymentsByApartment.has(p.apartmentId)) {
            paymentsByApartment.set(p.apartmentId, {})
        }
        paymentsByApartment.get(p.apartmentId)![p.month] = p.status
    }

    // Use centralized display name function
    const gridData: PaymentData[] = sortedApartments.map(apt => ({
        apartmentId: apt.id,
        unit: getApartmentDisplayName(apt),
        payments: paymentsByApartment.get(apt.id) || {}
    }))

    return gridData
}

export async function updatePaymentStatus(
    apartmentId: number,
    month: number,
    year: number,
    status: PaymentStatus,
    amount: number = 0
) {
    const existing = await db.select().from(payments).where(and(
        eq(payments.apartmentId, apartmentId),
        eq(payments.month, month),
        eq(payments.year, year)
    )).limit(1)

    if (existing.length > 0) {
        await db.update(payments)
            .set({ status, amount, updatedAt: new Date() })
            .where(eq(payments.id, existing[0].id))
    } else {
        await db.insert(payments).values({ apartmentId, month, year, status, amount })
    }

    revalidatePath("/dashboard/payments")
    return true
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
        await updatePaymentStatus(apartmentId, month, year, status)
    }

    revalidatePath("/dashboard/payments")
    return true
}