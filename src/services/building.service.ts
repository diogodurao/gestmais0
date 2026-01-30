import { db } from "@/db"
import { building, user, apartments, payments, managerBuildings } from "@/db/schema"
import { eq, and, isNull, asc, inArray } from "drizzle-orm"
import { customAlphabet } from "nanoid"
import { ActionResult, Ok, Err, ErrorCodes, ErrorCode, QuotaMode } from "@/lib/types"

type Building = typeof building.$inferSelect
type Apartment = typeof apartments.$inferSelect

type ApartmentWithResident = {
    apartment: Apartment
    resident: { id: string; name: string | null; email: string } | null
}

type BuildingWithManager = {
    building: Building
    manager: { name: string | null; email: string }
}

type ManagedBuilding = {
    building: Building
    isOwner: boolean | null
}

type ResidentWithApartment = {
    user: typeof user.$inferSelect
    apartment: Apartment | null
}

export class BuildingService {
    async getOrCreateManagerBuilding(userId: string): Promise<ActionResult<Building>> {
        const existingUser = await db.select().from(user).where(eq(user.id, userId)).limit(1)
        if (!existingUser.length) {
            return Err("Utilizador não encontrado", ErrorCodes.USER_NOT_FOUND)
        }

        const currentUser = existingUser[0]

        if (currentUser.activeBuildingId) {
            const existingBuilding = await db.select().from(building).where(eq(building.id, currentUser.activeBuildingId)).limit(1)
            if (existingBuilding.length) return Ok(existingBuilding[0])
        }

        const existingManagedBuildings = await db.select()
            .from(managerBuildings)
            .innerJoin(building, eq(managerBuildings.buildingId, building.id))
            .where(eq(managerBuildings.managerId, userId))
            .limit(1)

        if (existingManagedBuildings.length) {
            const firstBuilding = existingManagedBuildings[0].building
            await db.update(user).set({ activeBuildingId: firstBuilding.id }).where(eq(user.id, userId))
            return Ok(firstBuilding)
        }

        // Create new building with transaction
        const nanoidCode = customAlphabet('0123456789abcdefghijklmnopqrstuvwxyz', 6)
        const code = nanoidCode()

        const newBuilding = await db.transaction(async (tx) => {
            const [created] = await tx.insert(building).values({
                id: crypto.randomUUID(),
                name: `BUILDING_${code.toUpperCase()}`,
                nif: "N/A",
                code: code,
                managerId: userId,
                subscriptionStatus: 'incomplete',
            }).returning()

            await tx.insert(managerBuildings).values({
                managerId: userId,
                buildingId: created.id,
                isOwner: true,
            })

            await tx.update(user).set({ activeBuildingId: created.id }).where(eq(user.id, userId))

            return created
        })

        return Ok(newBuilding)
    }

    async createNewBuilding(userId: string, name: string, nif: string): Promise<ActionResult<Building>> {
        const nanoidCode = customAlphabet('0123456789abcdefghijklmnopqrstuvwxyz', 6)
        const code = nanoidCode()

        const newBuilding = await db.transaction(async (tx) => {
            const [created] = await tx.insert(building).values({
                id: crypto.randomUUID(),
                name: name || "New Building",
                nif: nif || "N/A",
                code: code,
                managerId: userId,
                subscriptionStatus: 'incomplete',
            }).returning()

            await tx.insert(managerBuildings).values({
                managerId: userId,
                buildingId: created.id,
                isOwner: true,
            })

            await tx.update(user).set({ activeBuildingId: created.id }).where(eq(user.id, userId))

            return created
        })

        return Ok(newBuilding)
    }

    async getManagerBuildings(userId: string): Promise<ActionResult<ManagedBuilding[]>> {
        const result = await db.select({
            building: building,
            isOwner: managerBuildings.isOwner,
        })
            .from(managerBuildings)
            .innerJoin(building, eq(managerBuildings.buildingId, building.id))
            .where(eq(managerBuildings.managerId, userId))

        return Ok(result)
    }

    async switchActiveBuilding(userId: string, buildingId: string): Promise<ActionResult<boolean>> {
        const access = await db.select().from(managerBuildings).where(and(
            eq(managerBuildings.managerId, userId),
            eq(managerBuildings.buildingId, buildingId)
        )).limit(1)

        if (!access.length) {
            return Err("Acesso não autorizado a este condomínio", ErrorCodes.BUILDING_ACCESS_DENIED)
        }

        await db.update(user).set({ activeBuildingId: buildingId }).where(eq(user.id, userId))
        return Ok(true)
    }

    // Resident Actions
    async joinBuilding(userId: string, code: string): Promise<ActionResult<Building>> {
        if (!code) {
            return Err("Código é obrigatório", ErrorCodes.VALIDATION_FAILED)
        }

        const normalizedCode = code.toLowerCase().trim()
        const foundBuilding = await db.select().from(building).where(eq(building.code, normalizedCode)).limit(1)

        if (!foundBuilding.length) {
            return Err("Código de condomínio inválido", ErrorCodes.INVALID_BUILDING_CODE)
        }

        const targetBuilding = foundBuilding[0]

        if (targetBuilding.subscriptionStatus !== 'active') {
            return Err("Este condomínio não está a aceitar residentes", ErrorCodes.BUILDING_INACTIVE)
        }

        await db.update(user).set({ buildingId: targetBuilding.id }).where(eq(user.id, userId))

        return Ok(targetBuilding)
    }

    async getResidentBuildingDetails(buildingId: string): Promise<ActionResult<BuildingWithManager>> {
        const result = await db.select({
            building: building,
            manager: { name: user.name, email: user.email }
        })
            .from(building)
            .innerJoin(user, eq(building.managerId, user.id))
            .where(eq(building.id, buildingId))
            .limit(1)

        if (!result[0]) {
            return Err("Condomínio não encontrado", ErrorCodes.BUILDING_NOT_FOUND)
        }

        return Ok(result[0])
    }

    async claimApartment(userId: string, apartmentId: number): Promise<ActionResult<Apartment>> {
        type TxResult = { data: Apartment } | { error: string; code: ErrorCode }

        const result: TxResult = await db.transaction(async (tx) => {
            await tx.update(apartments).set({ residentId: null }).where(eq(apartments.residentId, userId))

            const updateResult = await tx.update(apartments)
                .set({ residentId: userId })
                .where(and(eq(apartments.id, apartmentId), isNull(apartments.residentId)))
                .returning()

            if (updateResult.length === 0) {
                const exists = await tx.select().from(apartments).where(eq(apartments.id, apartmentId)).limit(1)
                if (!exists.length) {
                    return { error: "Fração não encontrada", code: ErrorCodes.APARTMENT_NOT_FOUND }
                }
                return { error: "Fração já está ocupada", code: ErrorCodes.APARTMENT_ALREADY_CLAIMED }
            }

            return { data: updateResult[0] }
        })

        if ('error' in result) {
            return Err(result.error, result.code)
        }

        return Ok(result.data)
    }

    async getResidentApartment(userId: string): Promise<ActionResult<Apartment | null>> {
        const result = await db.select().from(apartments).where(eq(apartments.residentId, userId)).limit(1)
        return Ok(result[0] || null)
    }

    async getUnclaimedApartments(buildingId: string): Promise<ActionResult<Apartment[]>> {
        const result = await db.select()
            .from(apartments)
            .where(and(eq(apartments.buildingId, buildingId), isNull(apartments.residentId)))
            .orderBy(asc(apartments.id))

        return Ok(result)
    }

    // Building Info
    async getBuildingResidents(buildingId: string): Promise<ActionResult<ResidentWithApartment[]>> {
        const result = await db.select({ user: user, apartment: apartments })
            .from(user)
            .leftJoin(apartments, eq(apartments.residentId, user.id))
            .where(and(eq(user.buildingId, buildingId), eq(user.role, 'resident')))

        return Ok(result)
    }

    async getBuilding(buildingId: string): Promise<ActionResult<Building>> {
        const result = await db.select().from(building).where(eq(building.id, buildingId)).limit(1)

        if (!result[0]) {
            return Err("Condomínio não encontrado", ErrorCodes.BUILDING_NOT_FOUND)
        }

        return Ok(result[0])
    }

    async getBuildingApartments(buildingId: string): Promise<ActionResult<ApartmentWithResident[]>> {
        const result = await db.select({
            apartment: apartments,
            resident: { id: user.id, name: user.name, email: user.email }
        })
            .from(apartments)
            .leftJoin(user, eq(apartments.residentId, user.id))
            .where(eq(apartments.buildingId, buildingId))
            .orderBy(asc(apartments.id))

        return Ok(result)
    }

    async updateBuilding(
        buildingId: string,
        data: {
            name?: string
            nif?: string
            iban?: string | null
            city?: string | null
            street?: string | null
            number?: string | null
            quotaMode?: QuotaMode
            monthlyQuota?: number
            totalApartments?: number
            paymentDueDay?: number | null
        }
    ): Promise<ActionResult<Building>> {
        const existing = await db.select().from(building).where(eq(building.id, buildingId)).limit(1)

        if (!existing.length) {
            return Err("Condomínio não encontrado", ErrorCodes.BUILDING_NOT_FOUND)
        }

        const [updated] = await db.update(building)
            .set({ ...data, updatedAt: new Date() })
            .where(eq(building.id, buildingId))
            .returning()

        return Ok(updated)
    }

    async completeBuildingSetup(buildingId: string): Promise<ActionResult<Building>> {
        const existing = await db.select().from(building).where(eq(building.id, buildingId)).limit(1)

        if (!existing.length) {
            return Err("Condomínio não encontrado", ErrorCodes.BUILDING_NOT_FOUND)
        }

        const [updated] = await db.update(building)
            .set({ setupComplete: true, updatedAt: new Date() })
            .where(eq(building.id, buildingId))
            .returning()

        return Ok(updated)
    }

    // Apartment CRUD
    async createApartment(
        buildingId: string,
        data: { unit: string; permillage?: number | null }
    ): Promise<ActionResult<Apartment>> {
        if (!buildingId || !data.unit) {
            return Err("Campos obrigatórios em falta", ErrorCodes.MISSING_REQUIRED_FIELDS)
        }

        const existing = await db.select().from(apartments).where(and(
            eq(apartments.buildingId, buildingId),
            eq(apartments.unit, data.unit)
        )).limit(1)

        if (existing.length) {
            return Err("Esta fração já existe", ErrorCodes.UNIT_ALREADY_EXISTS)
        }

        const [newApt] = await db.insert(apartments).values({
            buildingId,
            unit: data.unit,
            permillage: data.permillage,
        }).returning()

        return Ok(newApt)
    }

    async updateApartment(
        apartmentId: number,
        data: { unit?: string; permillage?: number | null }
    ): Promise<ActionResult<Apartment>> {
        const existing = await db.select().from(apartments).where(eq(apartments.id, apartmentId)).limit(1)

        if (!existing.length) {
            return Err("Fração não encontrada", ErrorCodes.APARTMENT_NOT_FOUND)
        }

        const [updated] = await db.update(apartments).set(data).where(eq(apartments.id, apartmentId)).returning()
        return Ok(updated)
    }

    async deleteApartment(apartmentId: number): Promise<ActionResult<boolean>> {
        const existing = await db.select().from(apartments).where(eq(apartments.id, apartmentId)).limit(1)

        if (!existing.length) {
            return Err("Fração não encontrada", ErrorCodes.APARTMENT_NOT_FOUND)
        }

        await db.transaction(async (tx) => {
            await tx.delete(payments).where(eq(payments.apartmentId, apartmentId))
            await tx.delete(apartments).where(eq(apartments.id, apartmentId))
        })

        return Ok(true)
    }

    async bulkDeleteApartments(apartmentIds: number[]): Promise<ActionResult<boolean>> {
        if (!apartmentIds.length) return Ok(true)

        await db.transaction(async (tx) => {
            await tx.delete(payments).where(inArray(payments.apartmentId, apartmentIds))
            await tx.delete(apartments).where(inArray(apartments.id, apartmentIds))
        })

        return Ok(true)
    }
}

export const buildingService = new BuildingService()