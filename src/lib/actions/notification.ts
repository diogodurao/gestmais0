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

// Get building residents for notification selector
export async function getBuildingResidentsForSelector(buildingId: string) {
    const session = await requireSession()

    // Manager only
    if (session.user.role !== 'manager') {
        return []
    }

    const { getResidentEmails } = await import("@/lib/actions/email-notifications")
    const residents = await getResidentEmails(buildingId)

    return residents.map(r => ({
        id: r.userId,
        name: r.name,
    }))
}

// --- Domain-Specific Notification Helpers ---

// --- Occurrence Notifications ---

export async function notifyUrgentOccurrenceWithEmail(
    buildingId: string,
    buildingName: string,
    occurrenceTitle: string,
    occurrenceDescription: string | null,
    creatorName: string,
    occurrenceId: number,
    excludeUserId?: string
) {
    const { getUrgentOccurrenceEmailTemplate } = await import("@/lib/email")
    const { sendBulkEmails, getResidentEmails, getManagerEmail } = await import("@/lib/actions/email-notifications")
    const { db } = await import("@/db")
    const { building } = await import("@/db/schema")
    const { eq } = await import("drizzle-orm")

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://gestmais.pt'
    const link = `${baseUrl}/dashboard/occurrences?id=${occurrenceId}`

    // Create in-app notification for all building residents
    await notifyBuildingResidents({
        buildingId,
        type: 'occurrence_created',
        title: '⚠️ Ocorrência Urgente',
        message: occurrenceTitle,
        link: `/dashboard/occurrences?id=${occurrenceId}`,
    }, excludeUserId)

    // Get building manager
    const [buildingData] = await db
        .select({ managerId: building.managerId })
        .from(building)
        .where(eq(building.id, buildingId))
        .limit(1)

    // Collect all email recipients (residents + manager)
    const residents = await getResidentEmails(buildingId)
    const manager = buildingData?.managerId ? await getManagerEmail(buildingData.managerId) : null

    // Build unique recipients list
    const recipientMap = new Map<string, { email: string; name: string }>()
    for (const r of residents) {
        if (r.userId !== excludeUserId) {
            recipientMap.set(r.userId, { email: r.email, name: r.name })
        }
    }
    if (manager && manager.userId !== excludeUserId) {
        recipientMap.set(manager.userId, { email: manager.email, name: manager.name })
    }

    const recipients = Array.from(recipientMap.values())

    if (recipients.length === 0) return

    // Send bulk email
    const template = getUrgentOccurrenceEmailTemplate(
        buildingName,
        occurrenceTitle,
        occurrenceDescription,
        creatorName,
        link
    )

    await sendBulkEmails({
        recipients,
        subject: `Ocorrência Urgente - ${buildingName}`,
        template,
    })
}

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

// --- Payment Notifications ---

export async function notifyPaymentOverdueWithEmail(
    buildingId: string,
    _apartmentId: number,
    residentId: string,
    residentName: string,
    residentEmail: string,
    amount: number,
    overdueMonths: number
) {
    const { sendEmail } = await import("@/lib/email")
    const { getPaymentOverdueEmailTemplate } = await import("@/lib/email")

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://gestmais.pt'
    const link = `${baseUrl}/dashboard/my-payments`

    // Create in-app notification
    await createNotification({
        buildingId,
        userId: residentId,
        type: 'payment_overdue',
        title: 'Pagamento em atraso',
        message: `Tem ${overdueMonths} ${overdueMonths === 1 ? 'mês' : 'meses'} de quota em atraso`,
        link: '/dashboard/my-payments',
    })

    // Send email
    const template = getPaymentOverdueEmailTemplate(
        residentName,
        amount,
        overdueMonths,
        link
    )

    await sendEmail({
        to: residentEmail,
        subject: 'Pagamento em atraso - GestMais',
        text: template.text,
        html: template.html,
    })
}

// --- Extraordinary Payment Notifications ---

export async function notifyExtraordinaryPaymentOverdueWithEmail(
    buildingId: string,
    residentId: string,
    residentName: string,
    residentEmail: string,
    projectName: string,
    amount: number,
    overdueInstallments: number
) {
    const { sendEmail } = await import("@/lib/email")
    const { getExtraordinaryPaymentOverdueEmailTemplate } = await import("@/lib/email")

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://gestmais.pt'
    const link = `${baseUrl}/dashboard/my-payments`

    // Create in-app notification
    await createNotification({
        buildingId,
        userId: residentId,
        type: 'payment_overdue',
        title: 'Pagamento extraordinário em atraso',
        message: `Tem ${overdueInstallments} ${overdueInstallments === 1 ? 'prestação' : 'prestações'} em atraso do projeto "${projectName}"`,
        link: '/dashboard/my-payments',
    })

    // Send email
    const template = getExtraordinaryPaymentOverdueEmailTemplate(
        residentName,
        projectName,
        amount,
        overdueInstallments,
        link
    )

    await sendEmail({
        to: residentEmail,
        subject: 'Pagamento extraordinário em atraso - GestMais',
        text: template.text,
        html: template.html,
    })
}

// --- Calendar Notifications ---

export async function notifyUpcomingEvent(
    buildingId: string,
    eventTitle: string,
    _eventDate: string
) {
    await notifyBuildingResidents({
        buildingId,
        type: 'calendar_event',
        title: 'Evento amanhã',
        message: eventTitle,
        link: '/dashboard/calendar',
    })
}

// --- Subscription Payment Notifications ---

export async function notifySubscriptionPaymentFailed(
    buildingId: string,
    managerId: string,
    managerEmail: string,
    managerName: string,
    buildingName: string
) {
    const { sendEmail } = await import("@/lib/email")
    const { getSubscriptionPaymentFailedEmailTemplate } = await import("@/lib/email")

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://gestmais.pt'
    const updatePaymentLink = `${baseUrl}/dashboard/settings?tab=billing`

    // Create in-app notification
    await createNotification({
        buildingId,
        userId: managerId,
        type: 'subscription_payment_failed',
        title: 'Pagamento da subscrição falhou',
        message: 'Atualize o método de pagamento para evitar suspensão',
        link: '/dashboard/settings?tab=billing',
    })

    // Send email
    const template = getSubscriptionPaymentFailedEmailTemplate(
        managerName,
        buildingName,
        updatePaymentLink
    )

    await sendEmail({
        to: managerEmail,
        subject: 'Pagamento da subscrição falhou - GestMais',
        text: template.text,
        html: template.html,
    })
}