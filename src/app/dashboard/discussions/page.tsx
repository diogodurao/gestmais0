import { requireSession } from "@/lib/auth-helpers"
import { redirect } from "next/navigation"
import { getDiscussions } from "@/app/actions/discussions"
import { ROUTES } from "@/lib/routes"
import { DiscussionsList } from "@/features/dashboard/discussions/DiscussionsList"

export const dynamic = 'force-dynamic'

export default async function DiscussionsPage() {
    const session = await requireSession()
    const isManager = session.user.role === 'manager'

    const buildingId = isManager
        ? session.user.activeBuildingId
        : session.user.buildingId

    if (!buildingId) {
        redirect(ROUTES.DASHBOARD.HOME)
    }

    const discussions = await getDiscussions(buildingId)

    return (
        <div className="p-4 md:p-6">
            <DiscussionsList
                buildingId={buildingId}
                initialDiscussions={discussions}
            />
        </div>
    )
}