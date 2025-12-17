import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { Sidebar } from "@/components/layout/Sidebar"
import { getResidentApartment, getManagerBuildings } from "@/app/actions/building"

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
    let managerBuildings: { building: { id: string; name: string; code: string }; isOwner: boolean | null }[] = []

    if (session?.user) {
        if (session.user.role === "resident") {
            // Residents need: buildingId + claimed apartment
            const hasBuildingId = !!session.user.buildingId
            if (hasBuildingId) {
                const apartment = await getResidentApartment(session.user.id)
                setupComplete = !!apartment
            } else {
                setupComplete = false
            }
        } else if (session.user.role === "manager") {
            // Managers are always setup complete
            setupComplete = true
            // Fetch their buildings for the selector
            const buildings = await getManagerBuildings(session.user.id)
            managerBuildings = buildings.map(b => ({
                building: { id: b.building.id, name: b.building.name, code: b.building.code },
                isOwner: b.isOwner
            }))
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Sidebar */}
            <Sidebar 
                userRole={session?.user.role || "resident"} 
                setupComplete={setupComplete}
                managerBuildings={managerBuildings}
                activeBuildingId={session?.user.activeBuildingId || undefined}
            />

            {/* Main Content */}
            <main className="flex-1 min-w-0">
                <div className="p-4 lg:p-8 max-w-7xl mx-auto mt-14 lg:mt-0">
                    {children}
                </div>
            </main>
        </div>
    );
}
