import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { getOrCreateManagerBuilding } from "@/app/actions/building"
import { isProfileComplete } from "@/lib/validations"
import { BuildingStepClient } from "./BuildingStepClient"

export default async function BuildingStepPage() {
    const session = await auth.api.getSession({
        headers: await headers()
    })

    if (!session) {
        return redirect("/sign-in")
    }

    // Guard: Ensure previous step is done
    if (!isProfileComplete(session.user)) {
        return redirect("/onboarding/manager/personal")
    }

    const building = await getOrCreateManagerBuilding()

    return (
        <BuildingStepClient building={building} />
    )
}
