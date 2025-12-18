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

// Helper to compute unit display name from floor + identifier + type
function getUnitDisplayName(floor: string, identifier: string, unitType: string): string {
    let floorLabel: string
    if (floor === "0") floorLabel = "R/C"
    else if (floor === "-1") floorLabel = "Cave"
    else if (floor === "-2") floorLabel = "-2"
    else floorLabel = `${floor}º`
    
    // If it's an apartment, just show floor + id (e.g., "1º Esq")
    // If it's a shop, cave, etc., prefix it (e.g., "Shop A")
    if (unitType === 'apartment') {
        return `${floorLabel} ${identifier}`
    }

    // Capitalize type (shop -> Shop)
    const displayType = unitType.charAt(0).toUpperCase() + unitType.slice(1)
    return `${displayType} ${identifier}`
}

export async function getPaymentMap(buildingId: string, year: number) {
    if (!buildingId) return []

    // 1. Get all apartments for the building
    const buildingApartments = await db.select()
        .from(apartments)
        .where(eq(apartments.buildingId, buildingId))

    // Sort in memory for precise hierarchy
    const typePriority: Record<string, number> = {
        cave: 1,
        shop: 2,
        garage: 3,
        storage: 4,
        apartment: 5
    }

    buildingApartments.sort((a, b) => {
        const floorA = parseInt(a.floor)
        const floorB = parseInt(b.floor)
        
        // 1. Sort by floor
        if (!isNaN(floorA) && !isNaN(floorB)) {
            if (floorA !== floorB) return floorA - floorB
        } else if (a.floor !== b.floor) {
            return a.floor.localeCompare(b.floor)
        }
        
        // 2. Sort by unit type (Caves/Shops first)
        const priorityA = typePriority[a.unitType] || 99
        const priorityB = typePriority[b.unitType] || 99
        if (priorityA !== priorityB) return priorityA - priorityB

        // 3. Sort by identifier
        return a.identifier.localeCompare(b.identifier, undefined, { numeric: true })
    })

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
        unit: getUnitDisplayName(apt.floor, apt.identifier, apt.unitType),
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
    return true
}

export async function bulkUpdatePayments(
    apartmentId: number,
    year: number,
    startMonth: number,
    endMonth: number,
    status: PaymentStatus
) {
    const monthsToUpdate = []
    for (let m = startMonth; m <= endMonth; m++) {
        monthsToUpdate.push(m)
    }

    if (monthsToUpdate.length === 0) return true

    for (const month of monthsToUpdate) {
        // Check if exists
        const existing = await db.select().from(payments).where(and(
            eq(payments.apartmentId, apartmentId),
            eq(payments.month, month),
            eq(payments.year, year)
        )).limit(1)

        if (existing.length > 0) {
            await db.update(payments)
                .set({ status, updatedAt: new Date() })
                .where(eq(payments.id, existing[0].id))
        } else {
            await db.insert(payments).values({
                apartmentId,
                month,
                year,
                status,
                amount: 0,
            })
        }
    }

    revalidatePath("/dashboard/payments")
    return true
}
