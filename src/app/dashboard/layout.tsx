import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { Sidebar } from "@/components/layout/Sidebar"
import { getResidentApartment } from "@/app/actions/building"

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth.api.getSession({
        headers: await headers()
    })

    let disableNavigation = false
    let lockedReason = ""

    if (session?.user.role === 'resident') {
        if (!session.user.buildingId) {
            disableNavigation = true
            lockedReason = "Join your building to unlock features"
        } else {
            const apartment = await getResidentApartment(session.user.id)
            if (!apartment) {
                disableNavigation = true
                lockedReason = "Claim your unit to unlock features"
            } else if (session.user.profileComplete === false) {
                disableNavigation = true
                lockedReason = "Complete your profile to unlock features"
            }
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Sidebar */}
            <Sidebar
                userRole={session?.user.role || "resident"}
                disableNavigation={disableNavigation}
                lockedReason={lockedReason}
            />

            {/* Main Content */}
            <main className="flex-1 min-w-0"> {/* min-w-0 prevents flex overflow issues */}
                <div className="p-4 lg:p-8 max-w-7xl mx-auto mt-14 lg:mt-0">
                    {children}
                </div>
            </main>
        </div>
    );
}
