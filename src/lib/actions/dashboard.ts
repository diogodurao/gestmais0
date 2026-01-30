"use server"

import { getResidentApartment, getManagerBuildings, getBuilding, getBuildingApartments, getResidentBuildingDetails } from "@/lib/actions/building"
import { isProfileComplete, isBuildingComplete, isUnitsComplete } from "@/lib/validations"
import { isManager, isResident, isProfessional } from "@/lib/permissions"
import { getProfessionalBuildingId } from "@/lib/auth-helpers"
import { professionalService } from "@/services/professional.service"
import { db } from "@/db"
import { building } from "@/db/schema"
import { eq } from "drizzle-orm"
import type { SessionUser, DashboardInitialData, ManagedBuilding, ProfessionalPermissions } from "@/lib/types"

export async function getDashboardContext(session: { user: SessionUser } | null): Promise<DashboardInitialData> {

    // Default empty state
    let setupComplete = false
    let managerBuildings: ManagedBuilding[] = []
    let activeBuilding: ManagedBuilding | null = null // explicit null for JSON serialization
    let residentApartment: Awaited<ReturnType<typeof getResidentApartment>> | null = null
    let professionalPermissions: ProfessionalPermissions | null = null

    if (session?.user) {
        const sessionUser = session.user

        if (isResident(sessionUser)) {
            // Residents need: buildingId + claimed apartment + IBAN
            const hasBuildingId = !!session.user.buildingId
            const hasIban = !!session.user.iban

            // Parallel fetch: apartment and building details are independent
            if (hasBuildingId) {
                const [apartment, details] = await Promise.all([
                    hasIban ? getResidentApartment() : Promise.resolve(null),
                    getResidentBuildingDetails(session.user.buildingId!)
                ])

                if (hasIban) {
                    setupComplete = !!apartment
                    residentApartment = apartment
                } else {
                    setupComplete = false
                }

                if (details?.building) {
                    const b = details.building
                    activeBuilding = {
                        building: {
                            id: b.id,
                            name: b.name,
                            code: b.code,
                            subscriptionStatus: b.subscriptionStatus,
                            subscriptionPastDueAt: b.subscriptionPastDueAt
                        },
                        isOwner: false
                    }
                }
            } else {
                setupComplete = false
            }
        } else if (isProfessional(sessionUser)) {
            // Professionals: linked via buildingProfessionals
            const buildingId = await getProfessionalBuildingId(session.user.id)

            if (buildingId) {
                const [buildingData, permissions] = await Promise.all([
                    db.query.building.findFirst({
                        where: eq(building.id, buildingId),
                        columns: { id: true, name: true, code: true, subscriptionStatus: true, subscriptionPastDueAt: true }
                    }),
                    professionalService.getProfessionalPermissions(session.user.id, buildingId),
                ])

                if (buildingData) {
                    activeBuilding = {
                        building: {
                            id: buildingData.id,
                            name: buildingData.name,
                            code: buildingData.code,
                            subscriptionStatus: buildingData.subscriptionStatus,
                            subscriptionPastDueAt: buildingData.subscriptionPastDueAt
                        },
                        isOwner: false
                    }
                }

                if (permissions) {
                    professionalPermissions = permissions
                }

                setupComplete = true // No onboarding needed
            }
        } else if (isManager(sessionUser)) {
            // Fetch their buildings for the selector
            const buildings = await getManagerBuildings()
            managerBuildings = buildings.map(b => ({
                building: {
                    id: b.building.id,
                    name: b.building.name,
                    code: b.building.code,
                    subscriptionStatus: b.building.subscriptionStatus,
                    subscriptionPastDueAt: b.building.subscriptionPastDueAt
                },
                isOwner: b.isOwner
            }))

            // Manager setup complete if: profile complete + building complete + units complete
            const profileDone = isProfileComplete(session.user)
            let buildingDone = false
            let unitsDone = false

            const activeBuildingId = session.user.activeBuildingId || (buildings.length > 0 ? buildings[0].building.id : null)

            if (activeBuildingId) {
                // Parallel fetch: building data and apartments are independent
                const [activeBuildingData, apartments] = await Promise.all([
                    getBuilding(activeBuildingId),
                    getBuildingApartments(activeBuildingId)
                ])

                if (activeBuildingData) {
                    buildingDone = isBuildingComplete(activeBuildingData)
                    unitsDone = isUnitsComplete(
                        activeBuildingData.totalApartments,
                        apartments
                    )

                    const found = managerBuildings.find(b => b.building.id === activeBuildingId)
                    if (found) {
                        activeBuilding = found
                    }
                }
            }

            setupComplete = profileDone && buildingDone && unitsDone
        }
    }

    return {
        session: session?.user as unknown as SessionUser || null,
        managerBuildings,
        activeBuilding: activeBuilding || null, // Ensure null if undefined
        residentApartment,
        setupComplete,
        professionalPermissions,
    }
}
