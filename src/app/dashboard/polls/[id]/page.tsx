import { requireSession } from "@/lib/session"
import { notFound } from "next/navigation"
import { getPoll, getPollVotes, getPollResults, getUserVote } from "@/app/actions/polls"
import { PollDetail } from "@/features/dashboard/polls/PollDetail"

export const dynamic = 'force-dynamic'

interface Props {
    params: Promise<{ id: string }>
}

export default async function PollDetailPage({ params }: Props) {
    const { id } = await params
    const session = await requireSession()

    const poll = await getPoll(Number(id))
    if (!poll) {
        notFound()
    }

    const isManager = session.user.role === 'manager'
    const votes = await getPollVotes(Number(id))
    const results = await getPollResults(Number(id))
    const userVote = await getUserVote(Number(id))

    return (
        <div className="p-4 md:p-6">
            <PollDetail
                poll={poll}
                votes={votes}
                results={results}
                userVote={userVote}
                isManager={isManager}
                buildingId={poll.buildingId}
            />
        </div>
    )
}