// manager zone

import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { getPaymentMap } from "@/app/actions/payments"
import { PaymentGrid } from "@/features/dashboard/PaymentGrid"
import { getOrCreateManagerBuilding } from "@/app/actions/building"
import { checkSetupStatus } from "@/lib/setup-status"

export const dynamic = 'force-dynamic'

export default async function PaymentsPage() {
    const session = await auth.api.getSession({
        headers: await headers()
    })

    if (!session || session.user.role !== 'manager') {
        return redirect("/dashboard")
    }

    const setupStatus = await checkSetupStatus(session.user)
    if (!setupStatus.isComplete) {
        return redirect("/dashboard")
    }

    // Ensure building exists for manager context
    let buildingId = session.user.activeBuildingId || ""

    // Defensive: if for some reason buildingId is missing but they are manager (should stick from dashboard, but let's be safe)
    if (!buildingId) {
        try {
            const building = await getOrCreateManagerBuilding(session.user.id, session.user.nif || "")
            buildingId = building.id
        } catch (e) {
            console.error("Critical error loading building", e)
            return <div>Error loading building ecosystem.</div>
        }
    }

    const currentYear = new Date().getFullYear()
    const data = await getPaymentMap(buildingId, currentYear)

    return (
        <div className="max-w-5xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Payment Map</h1>
            <PaymentGrid
                data={data}
                buildingId={buildingId}
                year={currentYear}
            />
        </div>
    )
}
