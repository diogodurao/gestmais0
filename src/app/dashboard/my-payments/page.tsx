// resident zone

import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { getPaymentMap } from "@/app/actions/payments"
import { PaymentGrid } from "@/features/dashboard/PaymentGrid"
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
    const apartment = await getResidentApartment(session.user.id)
    if (!session.user.buildingId || !apartment || !session.user.iban) {
        return redirect("/dashboard")
    }

    const year = new Date().getFullYear()

    // Fetch payment map as usual
    const { gridData, monthlyQuota } = await getPaymentMap(session.user.buildingId, year)

    return (
        <div className="max-w-[1400px] mx-auto">
            <PaymentGrid
                data={gridData}
                monthlyQuota={monthlyQuota}
                buildingId={session.user.buildingId}
                year={year}
                readOnly={true}
            />
        </div>
    )
}
