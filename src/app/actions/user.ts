"use server"

import { db } from "@/db"
import { user } from "@/db/schema"
import { eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { requireSession } from "@/lib/auth-helpers"

export async function updateUserProfile(data: {
    name?: string
    nif?: string
    iban?: string
}) {
    const session = await requireSession()

    await db.update(user)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(user.id, session.user.id))

    revalidatePath("/dashboard/settings")
    return { success: true }
}