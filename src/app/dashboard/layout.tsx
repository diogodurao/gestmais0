import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { Sidebar } from "@/components/layout/Sidebar"
import { DashboardHeader } from "@/components/layout/DashboardHeader"
import { SidebarProvider } from "@/components/layout/SidebarProvider"
import { getResidentApartment, getManagerBuildings, getBuilding, getBuildingApartments } from "@/app/actions/building"
import { isProfileComplete, isBuildingComplete, isUnitsComplete } from "@/lib/validations"
import { isManager, isResident } from "@/lib/permissions"
import type { SessionUser } from "@/lib/types"

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth.api.getSession({
        headers: await headers()
    })

    // Compute setupComplete status
    let setupComplete = false
    let managerBuildings: { building: { id: string; name: string; code: string; subscriptionStatus?: string | null }; isOwner: boolean | null }[] = []
    let activeBuilding: { building: { id: string; name: string; code: string; subscriptionStatus?: string | null }; isOwner: boolean | null } | undefined

    if (session?.user) {
        const sessionUser = session.user as SessionUser
        if (isResident(sessionUser)) {
            // Residents need: buildingId + claimed apartment + IBAN
            const hasBuildingId = !!session.user.buildingId
            const hasIban = !!session.user.iban
            if (hasBuildingId && hasIban) {
                const apartment = await getResidentApartment(session.user.id)
                setupComplete = !!apartment
            } else {
                setupComplete = false
            }

            // Fetch building for resident to show in header
            if (session.user.buildingId) {
                const b = await getBuilding(session.user.buildingId)
                if (b) {
                    activeBuilding = {
                        building: {
                            id: b.id,
                            name: b.name,
                            code: b.code,
                            subscriptionStatus: b.subscriptionStatus
                        },
                        isOwner: false
                    }
                }
            }
        } else if (isManager(sessionUser)) {
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

            // Manager setup complete if: profile complete + building complete + units complete
            const profileDone = isProfileComplete(session.user)
            let buildingDone = false
            let unitsDone = false
            
            const activeBuildingId = session.user.activeBuildingId || (buildings.length > 0 ? buildings[0].building.id : null)
            
            if (activeBuildingId) {
                const activeBuildingData = await getBuilding(activeBuildingId)
                if (activeBuildingData) {
                    buildingDone = isBuildingComplete(activeBuildingData)
                    const apartments = await getBuildingApartments(activeBuildingId)
                    unitsDone = isUnitsComplete(
                        activeBuildingData.totalApartments, 
                        apartments
                    )
                    
                    activeBuilding = managerBuildings.find(b => b.building.id === activeBuildingId)
                }
            }

            setupComplete = profileDone && buildingDone && unitsDone
        }
    }

    return (
        <SidebarProvider>
            <div className="h-screen bg-slate-100 flex flex-col overflow-hidden">
                {/* Header */}
                <DashboardHeader
                    userName={session?.user.name || "User"}
                    userRole={session?.user.role || "resident"}
                    managerId={session?.user.id || ""}
                    activeBuilding={activeBuilding}
                    managerBuildings={managerBuildings}
                    setupComplete={setupComplete}
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
        </SidebarProvider>
    );
}
