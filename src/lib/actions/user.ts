"use server"

import { db } from "@/db"
import { user, residentIbans, apartments } from "@/db/schema"
import { eq, and } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { requireSession } from "@/lib/auth-helpers"

import { z } from "zod"

const updateUserSchema = z.object({
    name: z.string().min(2).optional(),
    nif: z.string().regex(/^\d{9}$/, "Invalid NIF format").optional(),
    iban: z.string().min(15).optional(), // Basic length check for now
})

import { ActionResult } from "@/lib/types"
import { ROUTES } from "@/lib/routes"

export async function updateUserProfile(data: {
    name?: string
    nif?: string
    iban?: string
}): Promise<ActionResult<void>> {
    const session = await requireSession()

    try {
        // Validate inputs
        const validated = updateUserSchema.safeParse(data)
        if (!validated.success) {
            const errorMsg = validated.error.issues?.[0]?.message || "Validation failed"
            return { success: false, error: errorMsg }
        }

        await db.update(user)
            .set({ ...validated.data, updatedAt: new Date() })
            .where(eq(user.id, session.user.id))

        revalidatePath(ROUTES.DASHBOARD.SETTINGS)
        return { success: true, data: undefined }
    } catch (error) {
        console.error("Error updating profile:", error)
        return { success: false, error: "Failed to update profile" }
    }
}

// Additional IBANs management

export async function getAdditionalIbans(): Promise<ActionResult<{ id: number; iban: string }[]>> {
    const session = await requireSession()

    try {
        // Get the user's apartment
        const [apartment] = await db
            .select({ id: apartments.id })
            .from(apartments)
            .where(eq(apartments.residentId, session.user.id))
            .limit(1)

        if (!apartment) {
            return { success: true, data: [] }
        }

        // Get additional IBANs for this apartment
        const ibans = await db
            .select({ id: residentIbans.id, iban: residentIbans.iban })
            .from(residentIbans)
            .where(eq(residentIbans.apartmentId, apartment.id))

        return { success: true, data: ibans }
    } catch (error) {
        console.error("Error fetching additional IBANs:", error)
        return { success: false, error: "Failed to fetch additional IBANs" }
    }
}

const addIbanSchema = z.object({
    iban: z.string().min(15).max(34),
})

export async function addAdditionalIban(iban: string): Promise<ActionResult<{ id: number; iban: string }>> {
    const session = await requireSession()

    try {
        const validated = addIbanSchema.safeParse({ iban })
        if (!validated.success) {
            return { success: false, error: "IBAN inválido" }
        }

        const normalizedIban = iban.replace(/\s+/g, '').toUpperCase()

        // Get the user's apartment
        const [apartment] = await db
            .select({ id: apartments.id })
            .from(apartments)
            .where(eq(apartments.residentId, session.user.id))
            .limit(1)

        if (!apartment) {
            return { success: false, error: "Não está associado a nenhuma fração" }
        }

        // Check if IBAN already exists for this apartment
        const [existing] = await db
            .select({ id: residentIbans.id })
            .from(residentIbans)
            .where(and(
                eq(residentIbans.apartmentId, apartment.id),
                eq(residentIbans.iban, normalizedIban)
            ))
            .limit(1)

        if (existing) {
            return { success: false, error: "Este IBAN já está registado" }
        }

        // Insert the new IBAN
        const [inserted] = await db
            .insert(residentIbans)
            .values({
                apartmentId: apartment.id,
                iban: normalizedIban,
            })
            .returning({ id: residentIbans.id, iban: residentIbans.iban })

        revalidatePath(ROUTES.DASHBOARD.SETTINGS)
        return { success: true, data: inserted }
    } catch (error) {
        console.error("Error adding additional IBAN:", error)
        return { success: false, error: "Failed to add IBAN" }
    }
}

export async function removeAdditionalIban(ibanId: number): Promise<ActionResult<void>> {
    const session = await requireSession()

    try {
        // Get the user's apartment to verify ownership
        const [apartment] = await db
            .select({ id: apartments.id })
            .from(apartments)
            .where(eq(apartments.residentId, session.user.id))
            .limit(1)

        if (!apartment) {
            return { success: false, error: "Não está associado a nenhuma fração" }
        }

        // Delete the IBAN only if it belongs to this user's apartment
        await db
            .delete(residentIbans)
            .where(and(
                eq(residentIbans.id, ibanId),
                eq(residentIbans.apartmentId, apartment.id)
            ))

        revalidatePath(ROUTES.DASHBOARD.SETTINGS)
        return { success: true, data: undefined }
    } catch (error) {
        console.error("Error removing additional IBAN:", error)
        return { success: false, error: "Failed to remove IBAN" }
    }
}