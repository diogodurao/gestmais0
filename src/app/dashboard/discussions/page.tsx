import { Suspense } from "react"
import { requireSession } from "@/lib/auth-helpers"
import { redirect } from "next/navigation"
import { ROUTES } from "@/lib/routes"
import { DiscussionsList } from "@/components/dashboard/discussions/DiscussionsList"
import { getCachedDiscussions } from "@/lib/cache/dashboard.cache"

export default async function DiscussionsPage() {
    const session = await requireSession()
    const isManager = session.user.role === 'manager'

    const buildingId = isManager
        ? session.user.activeBuildingId
        : session.user.buildingId

    if (!buildingId) {
        redirect(ROUTES.DASHBOARD.HOME)
    }

    return (
        <div className="p-4 md:p-6">
            <Suspense fallback={<DiscussionsListSkeleton />}>
                <DiscussionsContent
                    buildingId={buildingId}
                    currentUserId={session.user.id}
                    currentUserName={session.user.name}
                    isManager={isManager}
                />
            </Suspense>
        </div>
    )
}

async function DiscussionsContent({
    buildingId,
    currentUserId,
    currentUserName,
    isManager,
}: {
    buildingId: string
    currentUserId: string
    currentUserName: string
    isManager: boolean
}) {
    const discussions = await getCachedDiscussions(buildingId)

    return (
        <DiscussionsList
            buildingId={buildingId}
            initialDiscussions={discussions}
            currentUserId={currentUserId}
            currentUserName={currentUserName}
            isManager={isManager}
        />
    )
}

function DiscussionsListSkeleton() {
    return (
        <div className="space-y-4">
            <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[1, 2, 3, 4].map(i => (
                    <div key={i} className="h-20 bg-gray-100 rounded-lg animate-pulse" />
                ))}
            </div>
            <div className="space-y-3">
                {[1, 2, 3].map(i => (
                    <div key={i} className="h-24 bg-gray-100 rounded-lg animate-pulse" />
                ))}
            </div>
        </div>
    )
}