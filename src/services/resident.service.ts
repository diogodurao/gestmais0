import { db } from "@/db"
import { apartments, user } from "@/db/schema"
import { eq } from "drizzle-orm"

export class ResidentService {
    async unclaimApartment(apartmentId: number) {
        await db.update(apartments)
            .set({ residentId: null })
            .where(eq(apartments.id, apartmentId))
        return true
    }

    async getResidentProfile(userId: string) {
        const result = await db.select().from(user).where(eq(user.id, userId)).limit(1)
        return result[0] || null
    }
}

export const residentService = new ResidentService()
