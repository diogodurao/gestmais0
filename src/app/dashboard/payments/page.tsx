import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { getPaymentMap } from "@/app/actions/payments"
import { PaymentGrid } from "@/features/dashboard/PaymentGrid"
import { getOrCreateManagerBuilding, getBuilding } from "@/app/actions/building"
import { isProfileComplete, isBuildingComplete } from "@/lib/validations"

export const dynamic = 'force-dynamic'

export default async function PaymentsPage() {
    const session = await auth.api.getSession({
        headers: await headers()
    })

    if (!session || session.user.role !== 'manager') {
        return redirect("/dashboard")
    }

    // MANDATORY SETUP CHECK
    const profileDone = isProfileComplete(session.user)
    const building = await getOrCreateManagerBuilding(session.user.id)
    const buildingDone = isBuildingComplete(building)

    if (!profileDone || !buildingDone) {
        return redirect("/dashboard")
    }

    // FIX: For managers, use activeBuildingId (not buildingId which is for residents)
    const buildingId = session.user.activeBuildingId || building.id

    const currentYear = new Date().getFullYear()
    const { gridData, monthlyQuota } = await getPaymentMap(buildingId, currentYear)

    return (
        <div className="max-w-[1400px] mx-auto h-full">
            <PaymentGrid
                data={gridData}
                monthlyQuota={monthlyQuota}
                buildingId={buildingId}
                year={currentYear}
            />
        </div>
    )
}