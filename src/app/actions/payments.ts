"use server"

import { db } from "@/db"
import { payments, apartments, building } from "@/db/schema"
import { eq, and } from "drizzle-orm"
import { revalidatePath } from "next/cache"

export type PaymentStatus = 'paid' | 'pending' | 'late'

export interface PaymentData {
    apartmentId: number
    unit: string
    payments: Record<number, string> // month (1-12) -> status
}

export async function getPaymentMap(buildingId: string, year: number) {
    if (!buildingId) return []

    // 1. Get all apartments for the building
    const buildingApartments = await db.select().from(apartments).where(eq(apartments.buildingId, buildingId)).orderBy(apartments.unit)

    // 2. Get all payments for these apartments for the given year
    // Note: Drizzle doesn't support 'IN' easily with composed queries sometimes, so we might loop or do a join
    // Let's rely on a join if possible, or just fetch all payments for the building's apartments
    // For MVP, fetching all payments for the building/year is fine

    // Get raw payments
    const rawPayments = await db.select({
        apartmentId: payments.apartmentId,
        month: payments.month,
        status: payments.status,
    })
        .from(payments)
        .innerJoin(apartments, eq(payments.apartmentId, apartments.id))
        .where(and(
            eq(apartments.buildingId, buildingId),
            eq(payments.year, year)
        ))

    // 3. Transform into a Grid Friendly Structure
    const gridData: PaymentData[] = buildingApartments.map(apt => {
        const aptPayments: Record<number, string> = {}
        // Initialize all months as 'pending' or 'unpaid' effectively (empty in our record)
        // Or we can pre-fill. Let's send what we have.

        rawPayments.filter(p => p.apartmentId === apt.id).forEach(p => {
            aptPayments[p.month] = p.status
        })

        return {
            apartmentId: apt.id,
            unit: apt.unit,
            payments: aptPayments
        }
    })

    return gridData
}

export async function updatePaymentStatus(apartmentId: number, month: number, year: number, status: PaymentStatus, amount: number = 0) {
    // Check if exists
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
        await db.insert(payments).values({
            apartmentId,
            month,
            year,
            status,
            amount: amount, // For MVP we default to 0 or manual input
        })
    }

    revalidatePath("/dashboard/payments")
}
