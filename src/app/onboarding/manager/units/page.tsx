import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { getOrCreateManagerBuilding, getBuildingApartments } from "@/lib/actions/building"
import { isProfileComplete, isBuildingComplete } from "@/lib/validations"
import { UnitsStepClient } from "./UnitsStepClient"

export default async function UnitsStepPage() {
    const session = await auth.api.getSession({
        headers: await headers()
    })

    if (!session) {
        return redirect("/sign-in")
    }

    // Guards
    if (!isProfileComplete(session.user)) {
        return redirect("/onboarding/manager/personal")
    }

    const building = await getOrCreateManagerBuilding()

    if (!isBuildingComplete(building)) {
        return redirect("/onboarding/manager/building")
    }

    const apartmentsData = await getBuildingApartments(building.id)

    const simpleApartments = apartmentsData.map(a => ({
        id: a.apartment.id,
        unit: a.apartment.unit,
        permillage: a.apartment.permillage || 0
    }))

    return (
        <UnitsStepClient
            buildingId={building.id}
            apartments={simpleApartments}
            totalApartments={building.totalApartments || 0}
            userId={session.user.id}
        />
    )
}