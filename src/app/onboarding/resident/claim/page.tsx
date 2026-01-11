import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { getUnclaimedApartments, getResidentBuildingDetails } from "@/components/dashboard/settings/actions"
import { ClaimStepClient } from "./ClaimStepClient"

export default async function ClaimStepPage() {
    const session = await auth.api.getSession({
        headers: await headers()
    })

    if (!session) {
        return redirect("/sign-in")
    }

    if (!session.user.buildingId) {
        return redirect("/onboarding/resident/join")
    }

    const unclaimed = await getUnclaimedApartments(session.user.buildingId)
    const buildingDetails = await getResidentBuildingDetails(session.user.buildingId)
    const buildingName = buildingDetails?.building?.name || "Edifício Desconhecido"

    return (
        <ClaimStepClient
            buildingName={buildingName}
            unclaimedApartments={unclaimed}
        />
    )
}
