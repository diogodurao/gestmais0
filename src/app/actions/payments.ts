"use server"

import { db } from "@/db"
import { payments, apartments, user, building } from "@/db/schema"
import { eq, and, asc } from "drizzle-orm"
import { revalidatePath } from "next/cache"

/**
 * ============================================================================
 * RESIDENT QUOTA PAYMENTS (Server Actions)
 * ============================================================================
 * These actions handle the storage/retrieval of which residents have paid their
 * monthly quotas.
 * 
 * NOT RELATED TO STRIPE.
 */
export type PaymentStatus = 'paid' | 'pending' | 'late'

export interface PaymentData {
    apartmentId: number
    unit: string
    residentName?: string | null
    payments: Record<number, { status: string; amount: number }>
    totalPaid: number
    balance: number
}

export async function getPaymentMap(buildingId: string, year: number): Promise<{ gridData: PaymentData[], monthlyQuota: number }> {
    if (!buildingId) return { gridData: [], monthlyQuota: 0 }

    const buildingInfo = await db.select({
        monthlyQuota: building.monthlyQuota,
    })
        .from(building)
        .where(eq(building.id, buildingId))
        .limit(1)

    const monthlyQuota = buildingInfo[0]?.monthlyQuota || 0

    const buildingApartments = await db.select({
        id: apartments.id,
        unit: apartments.unit,
        residentName: user.name,
    })
        .from(apartments)
        .leftJoin(user, eq(apartments.residentId, user.id))
        .where(eq(apartments.buildingId, buildingId))
        .orderBy(asc(apartments.unit))

    const sortedApartments = buildingApartments

    const rawPayments = await db.select({
        apartmentId: payments.apartmentId,
        month: payments.month,
        status: payments.status,
        amount: payments.amount,
    })
        .from(payments)
        .innerJoin(apartments, eq(payments.apartmentId, apartments.id))
        .where(and(eq(apartments.buildingId, buildingId), eq(payments.year, year)))

    const paymentsByApartment = new Map<number, Record<number, { status: string; amount: number }>>()
    for (const p of rawPayments) {
        if (!paymentsByApartment.has(p.apartmentId)) {
            paymentsByApartment.set(p.apartmentId, {})
        }
        paymentsByApartment.get(p.apartmentId)![p.month] = { status: p.status, amount: p.amount }
    }

    // Build grid data
    const gridData: PaymentData[] = sortedApartments.map(apt => {
        const aptPayments = paymentsByApartment.get(apt.id) || {}
        let totalPaid = 0
        let totalOwed = 0

        // Calculate total paid and balance for the year so far
        const currentMonth = new Date().getMonth() + 1 // 1-12

        for (let m = 1; m <= 12; m++) {
            const p = aptPayments[m]
            if (p?.status === 'paid') {
                totalPaid += p.amount
            }
            
            // If it's the current month or earlier, they should have paid.
            if (m <= currentMonth) {
                totalOwed += monthlyQuota
            }
        }

        return {
            apartmentId: apt.id,
            unit: apt.unit,
            residentName: apt.residentName,
            payments: aptPayments,
            totalPaid,
            balance: Math.max(0, totalOwed - totalPaid)
        }
    })

    return { gridData, monthlyQuota }
}

export async function updatePaymentStatus(
    apartmentId: number,
    month: number,
    year: number,
    status: PaymentStatus,
    amount?: number
) {
    const existing = await db.select().from(payments).where(and(
        eq(payments.apartmentId, apartmentId),
        eq(payments.month, month),
        eq(payments.year, year)
    )).limit(1)

    // If amount is not provided, we might need to fetch the building quota
    let finalAmount = amount
    if (finalAmount === undefined) {
        if (status === 'paid') {
            const apt = await db.select({ buildingId: apartments.buildingId })
                .from(apartments)
                .where(eq(apartments.id, apartmentId))
                .limit(1)
            
            if (apt.length > 0) {
                const b = await db.select({ monthlyQuota: building.monthlyQuota })
                    .from(building)
                    .where(eq(building.id, apt[0].buildingId))
                    .limit(1)
                finalAmount = b[0]?.monthlyQuota || 0
            } else {
                finalAmount = 0
            }
        } else {
            finalAmount = 0
        }
    }

    if (existing.length > 0) {
        await db.update(payments)
            .set({ status, amount: finalAmount ?? 0, updatedAt: new Date() })
            .where(eq(payments.id, existing[0].id))
    } else {
        await db.insert(payments).values({ 
            apartmentId, 
            month, 
            year, 
            status, 
            amount: finalAmount ?? 0
        })
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