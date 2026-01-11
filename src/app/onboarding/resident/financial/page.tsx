import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { getResidentApartment } from "@/components/dashboard/settings/actions"
import { FinancialStepClient } from "./FinancialStepClient"
import { getApartmentDisplayName } from "@/lib/utils"

export default async function FinancialStepPage() {
    const session = await auth.api.getSession({
        headers: await headers()
    })

    if (!session) {
        return redirect("/sign-in")
    }

    if (!session.user.buildingId) {
        return redirect("/onboarding/resident/join")
    }

    const apartment = await getResidentApartment()
    if (!apartment) {
        return redirect("/onboarding/resident/claim")
    }

    const unitName = getApartmentDisplayName(apartment)

    return (
        <FinancialStepClient
            userId={session.user.id}
            initialIban={session.user.iban || ""}
            apartmentUnit={unitName}
        />
    )
}
