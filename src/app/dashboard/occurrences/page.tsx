import { requireSession } from "@/lib/session"
import { redirect } from "next/navigation"
import { getOccurrences } from "@/app/actions/occurrences"
import { ROUTES } from "@/lib/routes"
import { OccurrencesList } from "@/features/dashboard/occurrences/OccurrencesList"

export const dynamic = 'force-dynamic'

export default async function OccurrencesPage() {
    const session = await requireSession()
    const isManager = session.user.role === 'manager'

    const buildingId = isManager
        ? session.user.activeBuildingId
        : session.user.buildingId

    if (!buildingId) {
        redirect(ROUTES.DASHBOARD.HOME)
    }

    const occurrences = await getOccurrences(buildingId)

    return (
        <div className="p-4 md:p-6">
            <OccurrencesList
                buildingId={buildingId}
                initialOccurrences={occurrences.map(o => ({ ...o, status: o.status as any }))}
            />
        </div>
    )
}