import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { getBuildingApartments, getOrCreateManagerBuilding } from "@/app/actions/building"
import { BuildingSettingsForm } from "@/features/dashboard/BuildingSettingsForm"
import { ApartmentManager } from "@/features/dashboard/ApartmentManager"
import { BuildingSwitcher } from "@/features/dashboard/BuildingSwitcher"

export const dynamic = 'force-dynamic'

export default async function SettingsPage() {
    const session = await auth.api.getSession({
        headers: await headers()
    })

    if (!session || session.user.role !== 'manager') {
        return redirect("/dashboard")
    }

    const { activeBuilding, buildings } = await getOrCreateManagerBuilding(session.user.id, session.user.nif || "")
    const buildingId = activeBuilding?.id
    if (!buildingId || !activeBuilding) {
        return redirect("/dashboard")
    }

    const apartmentsData = await getBuildingApartments(buildingId)

    return (
        <div className="space-y-8 max-w-4xl">
            <div>
                <h1 className="text-2xl font-bold">Settings</h1>
                <p className="text-gray-500 text-sm mt-1">Manage your building configuration</p>
            </div>

            <BuildingSwitcher
                buildings={buildings}
                activeBuildingId={buildingId}
                managerId={session.user.id}
                managerNif={session.user.nif || ""}
            />

            <BuildingSettingsForm building={activeBuilding} />

            <ApartmentManager
                apartments={apartmentsData}
                buildingId={buildingId}
            />
        </div>
    )
}
