import { requireSession } from "@/lib/session"
import { notFound } from "next/navigation"
import { getDiscussion, getDiscussionComments } from "@/components/dashboard/discussions/actions"
import { DiscussionDetail } from "@/components/dashboard/discussions/DiscussionDetail"

export const dynamic = 'force-dynamic'

interface Props {
    params: Promise<{ id: string }>
}

export default async function DiscussionDetailPage({ params }: Props) {
    const { id } = await params
    const session = await requireSession()

    const discussion = await getDiscussion(Number(id))
    if (!discussion) {
        notFound()
    }

    const comments = await getDiscussionComments(Number(id))
    const isManager = session.user.role === 'manager'

    return (
        <div className="p-4 md:p-6">
            <DiscussionDetail
                discussion={discussion}
                comments={comments}
                isManager={isManager}
                currentUserId={session.user.id}
                currentUserName={session.user.name || "Utilizador"}
                buildingId={discussion.buildingId}
            />
        </div>
    )
}