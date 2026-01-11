import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { getOrCreateManagerBuilding, getBuildingApartments } from "@/components/dashboard/settings/actions"
import { isProfileComplete, isBuildingComplete } from "@/lib/validations"
import { ClaimStepClient } from "./ClaimStepClient"

export default async function ClaimStepPage() {
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

    // Check if units are created
    if (apartmentsData.length === 0) {
        return redirect("/onboarding/manager/units")
    }

    const simpleApartments = apartmentsData.map(a => ({
        id: a.apartment.id,
        unit: a.apartment.unit,
        permillage: a.apartment.permillage || 0
    }))

    // Find if manager already claimed one
    const managerApt = apartmentsData.find(a => a.resident?.id === session.user.id)
    const currentManagerUnitId = managerApt ? managerApt.apartment.id : null

    return (
        <ClaimStepClient
            apartments={simpleApartments}
            userId={session.user.id}
            currentManagerUnitId={currentManagerUnitId}
        />
    )
}
