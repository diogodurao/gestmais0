// manager zone

import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { getPaymentMap } from "@/app/actions/payments"
import { PaymentGrid } from "@/features/dashboard/PaymentGrid"
import { getOrCreateManagerBuilding } from "@/app/actions/building"

export const dynamic = 'force-dynamic'

export default async function PaymentsPage() {
    const session = await auth.api.getSession({
        headers: await headers()
    })

    if (!session || session.user.role !== 'manager') {
        return redirect("/dashboard")
    }

    // Ensure building exists for manager context
    let buildingId = session.user.buildingId

    // Always resolve the active building for the manager
    try {
        const { activeBuilding } = await getOrCreateManagerBuilding(session.user.id, session.user.nif || "")
        buildingId = activeBuilding.id
    } catch (e) {
        console.error("Critical error loading building", e)
        return <div>Error loading building ecosystem.</div>
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
