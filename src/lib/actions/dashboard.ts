"use server"

import { getResidentApartment, getManagerBuildings, getBuilding, getBuildingApartments, getResidentBuildingDetails } from "@/lib/actions/building"
import { isProfileComplete, isBuildingComplete, isUnitsComplete } from "@/lib/validations"
import { isManager, isResident } from "@/lib/permissions"
import type { SessionUser, DashboardInitialData, ManagedBuilding } from "@/lib/types"

export async function getDashboardContext(session: { user: SessionUser } | null): Promise<DashboardInitialData> {

    // Default empty state
    let setupComplete = false
    let managerBuildings: ManagedBuilding[] = []
    let activeBuilding: ManagedBuilding | null = null // explicit null for JSON serialization
    let residentApartment: Awaited<ReturnType<typeof getResidentApartment>> | null = null

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
                            subscriptionStatus: b.subscriptionStatus
                        },
                        isOwner: false
                    }
                }
            } else {
                setupComplete = false
            }
        } else if (isManager(sessionUser)) {
            // Fetch their buildings for the selector
            const buildings = await getManagerBuildings()
            managerBuildings = buildings.map(b => ({
                building: {
                    id: b.building.id,
                    name: b.building.name,
                    code: b.building.code,
                    subscriptionStatus: b.building.subscriptionStatus
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
        setupComplete
    }
}
