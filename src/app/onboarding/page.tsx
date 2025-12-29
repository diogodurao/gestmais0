import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getOrCreateManagerBuilding, getBuildingApartments, getResidentApartment } from "@/app/actions/building";
import { isProfileComplete, isBuildingComplete, isUnitsComplete } from "@/lib/validations";
import { isManager, isResident } from "@/lib/permissions";
import type { SessionUser } from "@/lib/types";

export default async function OnboardingPage() {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session) {
        return redirect("/sign-in");
    }

    const sessionUser = session.user as unknown as SessionUser

    if (isManager(sessionUser)) {
        let profileDone = false
        let buildingDone = false
        let unitsDone = false

        try {
            const building = await getOrCreateManagerBuilding();
            const apartmentsData = await getBuildingApartments(building.id);

            profileDone = isProfileComplete(session.user)
            buildingDone = isBuildingComplete(building)
            unitsDone = isUnitsComplete(building.totalApartments, apartmentsData)
        } catch (e) {
            console.error("Failed to load building for onboarding", e);
            // If fetching fails, we can't reliably determine status. 
            // Fallback to dashboard which might show error or empty state
            return redirect("/dashboard");
        }

        if (profileDone && buildingDone && unitsDone) {
            return redirect("/dashboard");
        }

        if (!profileDone) return redirect("/onboarding/manager/personal");
        if (!buildingDone) return redirect("/onboarding/manager/building");
        return redirect("/onboarding/manager/units");
    }

    if (isResident(sessionUser)) {
        const hasBuildingId = !!session.user.buildingId
        const hasIban = !!session.user.iban
        let hasApartment = false

        try {
            const residentApartment = await getResidentApartment()
            hasApartment = !!residentApartment
        } catch (e) {
            console.error("Failed to check resident apartment", e)
        }

        if (hasBuildingId && hasApartment && hasIban) {
            return redirect("/dashboard");
        }

        if (!hasBuildingId) return redirect("/onboarding/resident/join");
        if (!hasApartment) return redirect("/onboarding/resident/claim");
        return redirect("/onboarding/resident/financial");
    }

    return redirect("/dashboard");
}
