import { db } from "@/db"
import { apartments, user } from "@/db/schema"
import { eq } from "drizzle-orm"
import { ActionResult, Ok, Err, ErrorCodes } from "@/lib/types"

type User = typeof user.$inferSelect

export class ResidentService {
    async unclaimApartment(apartmentId: number): Promise<ActionResult<boolean>> {
        const existing = await db.select()
            .from(apartments)
            .where(eq(apartments.id, apartmentId))
            .limit(1)

        if (!existing.length) {
            return Err("Fração não encontrada", ErrorCodes.APARTMENT_NOT_FOUND)
        }

        await db.update(apartments)
            .set({ residentId: null })
            .where(eq(apartments.id, apartmentId))

        return Ok(true)
    }

    async getResidentProfile(userId: string): Promise<ActionResult<User>> {
        const result = await db.select()
            .from(user)
            .where(eq(user.id, userId))
            .limit(1)

        if (!result[0]) {
            return Err("Utilizador não encontrado", ErrorCodes.USER_NOT_FOUND)
        }

        return Ok(result[0])
    }
}

export const residentService = new ResidentService()