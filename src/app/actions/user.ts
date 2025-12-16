"use server"

import { db } from "@/db"
import { user } from "@/db/schema"
import { eq } from "drizzle-orm"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"

export async function updateResidentProfile(userId: string, data: { nif?: string; iban?: string }) {
    // Security check: ensure the caller is updating their own profile
    const session = await auth.api.getSession({
        headers: await headers()
    })

    if (!session || session.user.id !== userId) {
        throw new Error("Unauthorized")
    }

    await db.update(user)
        .set({
            ...(data.nif ? { nif: data.nif } : {}),
            ...(data.iban ? { iban: data.iban } : {}),
        })
        .where(eq(user.id, userId))

    return { success: true }
}
