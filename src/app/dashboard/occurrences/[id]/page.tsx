import { requireSession } from "@/lib/session"
import { notFound } from "next/navigation"
import { getOccurrence, getOccurrenceComments, getOccurrenceAttachments } from "@/components/dashboard/occurrences/actions"
import { OccurrenceStatus } from "@/lib/types"
import { OccurrenceDetail } from "@/components/dashboard/occurrences/OccurrenceDetail"

export const dynamic = 'force-dynamic'

interface Props {
    params: Promise<{ id: string }>
}

export default async function OccurrenceDetailPage({ params }: Props) {
    const { id } = await params
    const session = await requireSession()

    const occurrence = await getOccurrence(Number(id))
    if (!occurrence) {
        notFound()
    }

    const comments = await getOccurrenceComments(Number(id))
    const attachments = await getOccurrenceAttachments(Number(id))

    const isManager = session.user.role === 'manager'
    const isOwner = occurrence.createdBy === session.user.id
    const canEdit = isOwner && occurrence.status === 'open'
    const canChangeStatus = isManager

    return (
        <div className="p-4 md:p-6">
            <OccurrenceDetail
                occurrence={{
                    ...occurrence,
                    status: occurrence.status as OccurrenceStatus
                }}
                comments={comments}
                attachments={attachments}
                canEdit={canEdit}
                canChangeStatus={canChangeStatus}
                currentUserId={session.user.id}
                currentUserName={session.user.name || "Utilizador"}
                buildingId={occurrence.buildingId}
            />
        </div>
    )
}