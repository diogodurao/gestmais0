// resident zone

import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { getPaymentMap } from "@/app/actions/payments"
import { PaymentGrid } from "@/features/dashboard/payments-quotas/PaymentGrid"
import { ErrorBoundary } from "@/components/ErrorBoundary"
import { getResidentApartment } from "@/app/actions/building"
import { Card, CardHeader, CardContent } from "@/components/ui/Card"

export const dynamic = 'force-dynamic'

export default async function MyPaymentsPage() {
    const session = await auth.api.getSession({
        headers: await headers()
    })

    if (!session || session.user.role !== 'resident') {
        return redirect("/dashboard")
    }

    // MANDATORY SETUP CHECK

    // MANDATORY SETUP CHECK
    const apartment = await getResidentApartment()
    if (!session.user.buildingId || !apartment || !session.user.iban) {
        return redirect("/dashboard")
    }

    const year = new Date().getFullYear()

    // Fetch payment map as usual
    const { gridData, monthlyQuota } = await getPaymentMap(session.user.buildingId, year)

    return (
        <div className="max-w-[1400px] mx-auto">
            <ErrorBoundary fallback={
                <div className="p-8 text-center">
                    <p className="text-rose-600">Erro ao carregar os seus pagamentos</p>
                </div>
            }>
                <PaymentGrid
                    data={gridData}
                    monthlyQuota={monthlyQuota}
                    buildingId={session.user.buildingId}
                    year={year}
                    readOnly={true}
                />
            </ErrorBoundary>
        </div>
    )
}
