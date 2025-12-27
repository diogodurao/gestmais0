"use server"

import { db } from "@/db"
import { user } from "@/db/schema"
import { eq } from "drizzle-orm"
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