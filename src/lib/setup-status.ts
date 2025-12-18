import { getBuilding, getBuildingApartments, getResidentApartment } from "@/app/actions/building"

export async function checkSetupStatus(user: any) {
    if (!user) return { isComplete: false }

    const personalInfoComplete = Boolean(
        user.name && 
        user.nif && 
        user.iban
    )

    if (user.role === "resident") {
        const hasBuilding = !!user.buildingId
        const apartment = hasBuilding ? await getResidentApartment(user.id) : null
        const selfClaimed = !!apartment

        return {
            isComplete: personalInfoComplete && hasBuilding && selfClaimed,
            personalInfoComplete,
            hasBuilding,
            selfClaimed,
            apartment
        }
    }

    if (user.role === "manager") {
        const activeBuildingId = user.activeBuildingId
        if (!activeBuildingId) return { isComplete: false }

        const building = await getBuilding(activeBuildingId)
        
        const personalInfoComplete = Boolean(
            user.name && 
            user.nif && 
            user.iban
        )

        const isValidIban = (iban?: string | null) => {
            if (!iban) return false
            const normalized = iban.replace(/\s+/g, "")
            return /^[A-Za-z0-9]{25}$/.test(normalized)
        }

        const buildingComplete = Boolean(
            building?.name &&
            building?.nif &&
            building?.city &&
            building?.street &&
            building?.number &&
            building?.totalApartments &&
            building?.monthlyQuota !== null &&
            building?.monthlyQuota > 0 &&
            isValidIban(building?.iban) &&
            building?.name !== "My Condominium" &&
            building?.nif !== "N/A"
        )

        const apartmentsData = await getBuildingApartments(activeBuildingId)
        const unitsCreated = building?.totalApartments ? apartmentsData.length >= building.totalApartments : false
        
        const userApartment = await getResidentApartment(user.id)
        const selfClaimed = Boolean(userApartment)

        return {
            isComplete: personalInfoComplete && buildingComplete && unitsCreated && selfClaimed,
            personalInfoComplete,
            buildingComplete,
            unitsCreated,
            selfClaimed,
            building,
            apartmentsCount: apartmentsData.length
        }
    }

    return { isComplete: true }
}

