import { requireSession } from "@/lib/auth-helpers"
import { redirect } from "next/navigation"
import { getPolls, getUserVote } from "@/app/actions/polls"
import { ROUTES } from "@/lib/routes"
import { PollsList } from "@/features/dashboard/polls/PollsList"

export const dynamic = 'force-dynamic'

export default async function PollsPage() {
    const session = await requireSession()
    const isManager = session.user.role === 'manager'

    const buildingId = isManager
        ? session.user.activeBuildingId
        : session.user.buildingId

    if (!buildingId) {
        redirect(ROUTES.DASHBOARD.HOME)
    }

    const polls = await getPolls(buildingId)

    // Get user's votes to show "voted" badge
    const userVotedPollIds: number[] = []
    for (const poll of polls) {
        const vote = await getUserVote(poll.id)
        if (vote) userVotedPollIds.push(poll.id)
    }

    return (
        <div className="p-4 md:p-6">
            <PollsList
                buildingId={buildingId}
                initialPolls={polls}
                userVotedPollIds={userVotedPollIds}
                isManager={isManager}
            />
        </div>
    )
}