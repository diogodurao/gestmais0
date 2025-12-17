import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { getBuilding, getBuildingApartments } from "@/app/actions/building"
import { BuildingSettingsForm } from "@/features/dashboard/BuildingSettingsForm"
import { ApartmentManager } from "@/features/dashboard/ApartmentManager"

export const dynamic = 'force-dynamic'

export default async function SettingsPage() {
    const session = await auth.api.getSession({
        headers: await headers()
    })

    if (!session || session.user.role !== 'manager') {
        return redirect("/dashboard")
    }

    const buildingId = session.user.buildingId
    if (!buildingId) {
        return redirect("/dashboard")
    }

    const building = await getBuilding(buildingId)
    if (!building) {
        return redirect("/dashboard")
    }

    const apartmentsData = await getBuildingApartments(buildingId)

    return (
        <div className="space-y-8 max-w-4xl">
            <div>
                <h1 className="text-2xl font-bold">Settings</h1>
                <p className="text-gray-500 text-sm mt-1">Manage your building configuration</p>
            </div>

            <BuildingSettingsForm building={building} />

            <ApartmentManager
                apartments={apartmentsData}
                buildingId={buildingId}
            />
        </div>
    )
}
