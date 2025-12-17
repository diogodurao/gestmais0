"use server"

import { db } from "@/db"
import { user } from "@/db/schema"
import { eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"

export async function updateUserProfile(data: {
    name?: string
    nif?: string
    iban?: string
}) {
    const session = await auth.api.getSession({
        headers: await headers()
    })

    if (!session) {
        throw new Error("Unauthorized")
    }

    await db.update(user)
        .set({
            ...data,
            updatedAt: new Date()
        })
        .where(eq(user.id, session.user.id))

    revalidatePath("/dashboard/settings")
    return { success: true }
}

