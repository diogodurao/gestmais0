import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { getBuilding, getBuildingApartments } from "@/app/actions/building"
import { BuildingSettingsForm } from "@/features/dashboard/BuildingSettingsForm"
import { ApartmentManager } from "@/features/dashboard/ApartmentManager"
import { NewBuildingForm } from "@/features/dashboard/NewBuildingForm"

export const dynamic = 'force-dynamic'

export default async function SettingsPage({
    searchParams
}: {
    searchParams: Promise<{ new?: string }>
}) {
    const session = await auth.api.getSession({
        headers: await headers()
    })

    if (!session || session.user.role !== 'manager') {
        return redirect("/dashboard")
    }

    const params = await searchParams
    const isCreatingNew = params.new === "1"

    // Show "New Building" form if ?new=1
    if (isCreatingNew) {
        return (
            <div className="space-y-8 max-w-4xl">
                <div>
                    <h1 className="text-2xl font-bold">Create New Building</h1>
                    <p className="text-gray-500 text-sm mt-1">Add a new building to your management portfolio</p>
                </div>
                <NewBuildingForm />
            </div>
        )
    }

    // Use activeBuildingId for managers (multi-building support)
    const buildingId = session.user.activeBuildingId
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
