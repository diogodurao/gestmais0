import { Suspense } from "react"
import { requireSession } from "@/lib/auth-helpers"
import { redirect } from "next/navigation"
import { getUserVote } from "@/lib/actions/polls"
import { ROUTES } from "@/lib/routes"
import { PollsList } from "@/components/dashboard/polls/PollsList"
import { getCachedPolls } from "@/lib/cache/dashboard.cache"

export default async function PollsPage() {
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
            <Suspense fallback={<PollsListSkeleton />}>
                <PollsContent
                    buildingId={buildingId}
                    userId={session.user.id}
                    isManager={isManager}
                />
            </Suspense>
        </div>
    )
}

async function PollsContent({
    buildingId,
    userId,
    isManager,
}: {
    buildingId: string
    userId: string
    isManager: boolean
}) {
    const polls = await getCachedPolls(buildingId)

    // Get user's votes to show "voted" badge (user-specific, not cached)
    // Parallel fetch instead of sequential loop
    const votes = await Promise.all(polls.map(poll => getUserVote(poll.id)))
    const userVotedPollIds = polls
        .filter((_, index) => votes[index])
        .map(poll => poll.id)

    return (
        <PollsList
            buildingId={buildingId}
            initialPolls={polls}
            userVotedPollIds={userVotedPollIds}
            isManager={isManager}
        />
    )
}

function PollsListSkeleton() {
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