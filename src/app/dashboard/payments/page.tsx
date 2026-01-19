import { Suspense } from "react"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { PaymentGrid } from "@/components/dashboard/payments-quotas/PaymentGrid"
import { ErrorBoundary } from "@/components/ErrorBoundary"
import { getOrCreateManagerBuilding } from "@/lib/actions/building"
import { isProfileComplete, isBuildingComplete } from "@/lib/validations"
import { getCachedPaymentMap } from "@/lib/cache/dashboard.cache"

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

    return (
        <div className="max-w-350 mx-auto h-full">
            <ErrorBoundary fallback={
                <div className="p-8 text-center">
                    <p className="text-rose-600">Erro ao carregar grelha de pagamentos</p>
                </div>
            }>
                <Suspense fallback={<PaymentGridSkeleton />}>
                    <PaymentsContent
                        buildingId={buildingId}
                        year={currentYear}
                    />
                </Suspense>
            </ErrorBoundary>
        </div>
    )
}

async function PaymentsContent({
    buildingId,
    year,
}: {
    buildingId: string
    year: number
}) {
    const { gridData, monthlyQuota } = await getCachedPaymentMap(buildingId, year)

    return (
        <PaymentGrid
            data={gridData}
            monthlyQuota={monthlyQuota}
            buildingId={buildingId}
            year={year}
        />
    )
}

function PaymentGridSkeleton() {
    return (
        <div className="p-4 space-y-4">
            <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
            <div className="overflow-x-auto">
                <div className="min-w-[800px]">
                    <div className="grid grid-cols-13 gap-1">
                        {Array.from({ length: 13 }).map((_, i) => (
                            <div key={i} className="h-10 bg-gray-100 rounded animate-pulse" />
                        ))}
                    </div>
                    {Array.from({ length: 5 }).map((_, row) => (
                        <div key={row} className="grid grid-cols-13 gap-1 mt-1">
                            {Array.from({ length: 13 }).map((_, col) => (
                                <div key={col} className="h-10 bg-gray-50 rounded animate-pulse" />
                            ))}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}