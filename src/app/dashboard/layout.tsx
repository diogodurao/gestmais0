import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { Sidebar } from "@/components/layout/Sidebar"
import { DashboardHeader } from "@/components/layout/DashboardHeader"
import { getResidentApartment, getManagerBuildings, getBuilding } from "@/app/actions/building"
import { isProfileComplete, isBuildingComplete } from "@/lib/validations"

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth.api.getSession({
        headers: await headers()
    })

    // Compute setupComplete status
    let setupComplete = true
    let managerBuildings: { building: { id: string; name: string; code: string; subscriptionStatus?: string | null }; isOwner: boolean | null }[] = []

    if (session?.user) {
        if (session.user.role === "resident") {
            // Residents need: buildingId + claimed apartment + IBAN
            const hasBuildingId = !!session.user.buildingId
            const hasIban = !!session.user.iban
            if (hasBuildingId && hasIban) {
                const apartment = await getResidentApartment(session.user.id)
                setupComplete = !!apartment
            } else {
                setupComplete = false
            }
        } else if (session.user.role === "manager") {
            // Fetch their buildings for the selector
            const buildings = await getManagerBuildings(session.user.id)
            managerBuildings = buildings.map(b => ({
                building: {
                    id: b.building.id,
                    name: b.building.name,
                    code: b.building.code,
                    subscriptionStatus: b.building.subscriptionStatus
                },
                isOwner: b.isOwner
            }))

            // Manager setup complete if: profile complete + at least one building complete
            const profileDone = isProfileComplete(session.user)
            let buildingDone = false
            
            if (session.user.activeBuildingId) {
                const activeBuilding = await getBuilding(session.user.activeBuildingId)
                buildingDone = activeBuilding ? isBuildingComplete(activeBuilding) : false
            } else if (buildings.length > 0) {
                buildingDone = isBuildingComplete(buildings[0].building)
            }

            setupComplete = profileDone && buildingDone
        }
    }

    const activeBuilding = managerBuildings.find(b => b.building.id === session?.user.activeBuildingId)

    return (
        <div className="h-screen bg-slate-100 flex flex-col overflow-hidden">
            {/* Header */}
            <DashboardHeader
                userName={session?.user.name || "User"}
                userRole={session?.user.role || "resident"}
                managerId={session?.user.id || ""}
                activeBuilding={activeBuilding}
                managerBuildings={managerBuildings}
            />

            <div className="flex flex-1 overflow-hidden">
                {/* Sidebar */}
                <Sidebar
                    userRole={session?.user.role || "resident"}
                    setupComplete={setupComplete}
                    managerBuildings={managerBuildings}
                    activeBuildingId={session?.user.activeBuildingId || undefined}
                />

                {/* Main Content */}
                <main className="flex-1 bg-slate-200 p-px flex flex-col min-w-0 overflow-hidden relative">
                    <div className="flex-1 overflow-y-auto bg-slate-100 p-4 lg:p-6 flex flex-col">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
