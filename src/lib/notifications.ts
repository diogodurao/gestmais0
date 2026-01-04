import { createNotification, notifyBuildingResidents } from "@/app/actions/notification"


// --- Occurrence Notifications ---

export async function notifyOccurrenceCreated(
    buildingId: string,
    managerId: string,
    occurrenceTitle: string,
    occurrenceId: number
) {
    await createNotification({
        buildingId,
        userId: managerId,
        type: 'occurrence_created',
        title: 'Nova ocorrência reportada',
        message: occurrenceTitle,
        link: `/dashboard/occurrences/${occurrenceId}`,
    })
}

export async function notifyOccurrenceComment(
    buildingId: string,
    creatorId: string,
    commenterName: string,
    occurrenceTitle: string,
    occurrenceId: number
) {
    await createNotification({
        buildingId,
        userId: creatorId,
        type: 'occurrence_comment',
        title: `${commenterName} comentou`,
        message: occurrenceTitle,
        link: `/dashboard/occurrences/${occurrenceId}`,
    })
}

export async function notifyOccurrenceStatus(
    buildingId: string,
    creatorId: string,
    occurrenceTitle: string,
    newStatus: string,
    occurrenceId: number
) {
    const statusLabels: Record<string, string> = {
        in_progress: 'em progresso',
        resolved: 'resolvida',
    }

    await createNotification({
        buildingId,
        userId: creatorId,
        type: 'occurrence_status',
        title: `Ocorrência ${statusLabels[newStatus] || newStatus}`,
        message: occurrenceTitle,
        link: `/dashboard/occurrences/${occurrenceId}`,
    })
}

// --- Poll Notifications ---

export async function notifyPollCreated(
    buildingId: string,
    pollTitle: string,
    pollId: number,
    creatorId: string
) {
    await notifyBuildingResidents({
        buildingId,
        type: 'poll_created',
        title: 'Nova votação disponível',
        message: pollTitle,
        link: `/dashboard/polls/${pollId}`,
    }, creatorId)
}

export async function notifyPollClosed(
    buildingId: string,
    pollTitle: string,
    pollId: number
) {
    await notifyBuildingResidents({
        buildingId,
        type: 'poll_closed',
        title: 'Votação encerrada — resultados disponíveis',
        message: pollTitle,
        link: `/dashboard/polls/${pollId}`,
    })
}

// --- Discussion Notifications ---

export async function notifyDiscussionCreated(
    buildingId: string,
    discussionTitle: string,
    discussionId: number,
    creatorId: string
) {
    await notifyBuildingResidents({
        buildingId,
        type: 'discussion_created',
        title: 'Nova discussão',
        message: discussionTitle,
        link: `/dashboard/discussions/${discussionId}`,
    }, creatorId)
}

export async function notifyDiscussionComment(
    buildingId: string,
    creatorId: string,
    commenterName: string,
    discussionTitle: string,
    discussionId: number
) {
    await createNotification({
        buildingId,
        userId: creatorId,
        type: 'discussion_comment',
        title: `${commenterName} comentou`,
        message: discussionTitle,
        link: `/dashboard/discussions/${discussionId}`,
    })
}

// --- Evaluation Notifications ---

export async function notifyEvaluationOpen(buildingId: string) {
    await notifyBuildingResidents({
        buildingId,
        type: 'evaluation_open',
        title: 'Período de avaliação aberto',
        message: 'Submeta a sua avaliação mensal',
        link: '/dashboard/evaluations',
    })
}

// --- Calendar Notifications ---

export async function notifyUpcomingEvent(
    buildingId: string,
    eventTitle: string,
    eventDate: string
) {
    await notifyBuildingResidents({
        buildingId,
        type: 'calendar_event',
        title: 'Evento amanhã',
        message: eventTitle,
        link: '/dashboard/calendar',
    })
}