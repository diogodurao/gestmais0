"use server"

import { db } from "@/db"
import { payments, apartments, building } from "@/db/schema"
import { eq, and, asc } from "drizzle-orm"
import { revalidatePath } from "next/cache"

export type PaymentStatus = 'paid' | 'pending' | 'late'

export interface PaymentData {
    apartmentId: number
    unit: string // Computed display name: "R/C A", "1º esq", etc.
    payments: Record<number, string> // month (1-12) -> status
}

// Helper to compute unit display name from floor + identifier
function getUnitDisplayName(floor: string, identifier: string): string {
    let floorLabel: string
    if (floor === "0") floorLabel = "R/C"
    else if (floor === "-1") floorLabel = "Cave"
    else if (floor === "-2") floorLabel = "-2"
    else floorLabel = `${floor}º`
    
    return `${floorLabel} ${identifier}`
}

export async function getPaymentMap(buildingId: string, year: number) {
    if (!buildingId) return []

    // 1. Get all apartments for the building, ordered by floor then identifier
    const buildingApartments = await db.select()
        .from(apartments)
        .where(eq(apartments.buildingId, buildingId))
        .orderBy(asc(apartments.floor), asc(apartments.identifier))

    // 2. Get all payments for these apartments for the given year
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

    // 3. Index payments by apartmentId for O(1) lookup
    const paymentsByApartment = new Map<number, Record<number, string>>()
    for (const p of rawPayments) {
        if (!paymentsByApartment.has(p.apartmentId)) {
            paymentsByApartment.set(p.apartmentId, {})
        }
        paymentsByApartment.get(p.apartmentId)![p.month] = p.status
    }

    // 4. Build grid data with computed unit display name
    const gridData: PaymentData[] = buildingApartments.map(apt => ({
        apartmentId: apt.id,
        unit: getUnitDisplayName(apt.floor, apt.identifier),
        payments: paymentsByApartment.get(apt.id) || {}
    }))

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
            amount: amount,
        })
    }

    revalidatePath("/dashboard/payments")
}
