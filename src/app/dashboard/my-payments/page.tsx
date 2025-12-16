// resident zone

import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { getPaymentMap } from "@/app/actions/payments"
import { PaymentGrid } from "@/features/dashboard/PaymentGrid"
import { Card, CardHeader, CardContent } from "@/components/ui/Card"

export const dynamic = 'force-dynamic'

export default async function MyPaymentsPage() {
    const session = await auth.api.getSession({
        headers: await headers()
    })

    if (!session || session.user.role !== 'resident') {
        return redirect("/dashboard")
    }

    if (!session.user.buildingId) {
        return redirect("/dashboard")
    }

    const year = new Date().getFullYear()

    // Fetch payment map as usual, the grid handles highlighting/matching if we wanted, 
    // but for now we see ALL apartments to know who paid.
    // Use readOnly=true
    const data = await getPaymentMap(session.user.buildingId, year)

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <h1 className="text-2xl font-bold">Building Payments</h1>
                    <p className="text-gray-500">View payment status for all apartments.</p>
                </CardHeader>
                <CardContent>
                    <PaymentGrid
                        data={data}
                        buildingId={session.user.buildingId}
                        year={year}
                        readOnly={true}
                    />
                </CardContent>
            </Card>
        </div>
    )
}
