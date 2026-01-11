import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { getPaymentMap } from "@/components/dashboard/payments-quotas/actions"
import { PaymentGrid } from "@/components/dashboard/payments-quotas/PaymentGrid"
import { ErrorBoundary } from "@/components/ErrorBoundary"
import { getOrCreateManagerBuilding, getBuilding } from "@/components/dashboard/settings/actions"
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
    const building = await getOrCreateManagerBuilding()
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
            <ErrorBoundary fallback={
                <div className="p-8 text-center">
                    <p className="text-rose-600">Erro ao carregar grelha de pagamentos</p>
                </div>
            }>
                <PaymentGrid
                    data={gridData}
                    monthlyQuota={monthlyQuota}
                    buildingId={buildingId}
                    year={currentYear}
                />
            </ErrorBoundary>
        </div>
    )
}