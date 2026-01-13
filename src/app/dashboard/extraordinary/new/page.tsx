/**
 * Create New Extraordinary Project Page
 * 
 * Route: /dashboard/extraordinary/new
 */

import { ExtraProjectCreate } from "@/components/dashboard/extraordinary-projects/ExtraProjectCreate"
import { requireSession } from "@/lib/auth-helpers"
import { getBuildingApartments } from "@/lib/actions/building"
import { redirect } from "next/navigation"

export const metadata = {
    title: "Novo Projeto Extraordinário | GestMais",
    description: "Criar novo projeto de quotas extraordinárias",
}

export default async function NewExtraordinaryProjectPage() {
    const session = await requireSession()

    // Only managers can create projects
    if (session.user.role !== 'manager') {
        redirect("/dashboard/extraordinary")
    }

    if (!session.user.activeBuildingId) {
        redirect("/dashboard")
    }

    const buildingId = session.user.activeBuildingId
    const apartmentRecords = await getBuildingApartments(buildingId)

    const formattedApartments = apartmentRecords.map(record => ({
        id: record.apartment.id,
        unit: record.apartment.unit,
        permillage: record.apartment.permillage || 0,
        residentName: record.resident?.name || null
    }))

    return (
        <div className="p-4 md:p-6">
            <ExtraProjectCreate
                buildingId={buildingId}
                apartments={formattedApartments}
            />
        </div>
    )
}