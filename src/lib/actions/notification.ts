"use server"

import { revalidatePath } from "next/cache"
import { after } from "next/server"
import { requireSession } from "@/lib/auth-helpers"
import { notificationService, CreateNotificationInput, CreateBulkNotificationInput } from "@/services/notification.service"
import { sendPushNotification } from "@/lib/actions/push-notifications"

// Get user's notifications
export async function getNotifications(limit: number = 10) {
    const session = await requireSession()
    const result = await notificationService.getUserNotifications(session.user.id, limit)
    if (!result.success) throw new Error(result.error)
    return result.data
}

// Get unread count
export async function getUnreadCount() {
    const session = await requireSession()
    const result = await notificationService.getUnreadCount(session.user.id)
    if (!result.success) throw new Error(result.error)
    return result.data
}

// Mark single notification as read
export async function markNotificationAsRead(notificationId: number) {
    const session = await requireSession()
    const result = await notificationService.markAsRead(notificationId, session.user.id)
    if (!result.success) return { success: false, error: result.error }
    revalidatePath("/dashboard")
    return { success: true }
}

// Mark all as read
export async function markAllNotificationsAsRead() {
    const session = await requireSession()
    const result = await notificationService.markAllAsRead(session.user.id)
    if (!result.success) return { success: false, error: result.error }
    revalidatePath("/dashboard")
    return { success: true }
}

// Delete notification
export async function deleteNotification(notificationId: number) {
    const session = await requireSession()
    const result = await notificationService.delete(notificationId, session.user.id)
    if (!result.success) return { success: false, error: result.error }
    revalidatePath("/dashboard")
    return { success: true }
}

// --- Helper functions to create notifications from other features ---

// Notify single user
export async function createNotification(input: CreateNotificationInput) {
    const result = await notificationService.create(input)
    if (!result.success) return result

    // Send push notification after response (non-blocking)
    after(async () => {
        try {
            await sendPushNotification(
                input.userId,
                input.title,
                input.message || '',
                input.link || '/'
            )
        } catch (e) {
            console.error("Push error:", e)
        }
    })

    return result
}

// Notify all building residents
export async function notifyBuildingResidents(
    input: Omit<CreateBulkNotificationInput, 'userIds'>,
    excludeUserId?: string // Optionally exclude the creator
) {
    const userIdsResult = await notificationService.getBuildingResidentIds(input.buildingId)
    if (!userIdsResult.success) return userIdsResult

    const userIds = userIdsResult.data
    const filteredUserIds = excludeUserId
        ? userIds.filter(id => id !== excludeUserId)
        : userIds

    const result = await notificationService.createBulk({
        ...input,
        userIds: filteredUserIds,
    })

    if (!result.success) return result

    // Send push notifications after response (non-blocking)
    after(async () => {
        await Promise.all(
            filteredUserIds.map(userId =>
                sendPushNotification(
                    userId,
                    input.title,
                    input.message || '',
                    input.link || '/'
                ).catch(e => console.error("Push error:", e))
            )
        )
    })

    return result
}

// Cleanup old notifications (call from cron job or scheduled task)
export async function cleanupOldNotifications() {
    return await notificationService.cleanupOld()
}

// --- Domain-Specific Notification Helpers ---

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
        link: `/dashboard/occurrences?id=${occurrenceId}`,
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
        link: `/dashboard/occurrences?id=${occurrenceId}`,
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
        link: `/dashboard/occurrences?id=${occurrenceId}`,
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
        link: `/dashboard/polls?id=${pollId}`,
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
        link: `/dashboard/polls?id=${pollId}`,
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
        link: `/dashboard/discussions?id=${discussionId}`,
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
        link: `/dashboard/discussions?id=${discussionId}`,
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