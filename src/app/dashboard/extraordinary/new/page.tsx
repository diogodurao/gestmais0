/**
 * Create New Extraordinary Project Page
 * 
 * Route: /dashboard/extraordinary/new
 */

import { ExtraProjectCreate } from "@/features/dashboard/ExtraordinaryProjects/ExtraProjectCreate"
import { requireSession } from "@/lib/auth-helpers"
import { getBuildingApartments } from "@/app/actions/building"
import { redirect } from "next/navigation"

export const metadata = {
    title: "Novo Projeto Extraordinário | GestMais",
    description: "Criar novo projeto de quotas extraordinárias",
}

export default async function NewExtraordinaryProjectPage() {
    // Get session and active building
    const session = await requireSession()
    
    if (!session.user.activeBuildingId) {
        redirect("/dashboard")
    }

    const buildingId = session.user.activeBuildingId
    const apartmentRecords = await getBuildingApartments(buildingId)
    
    // Transform to the format expected by ExtraProjectCreate
    const formattedApartments = apartmentRecords.map(record => ({
        id: record.apartment.id,
        unit: record.apartment.unit,
        permillage: record.apartment.permillage,
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
