"use server"

import { revalidatePath } from "next/cache"
import { requireSession } from "@/lib/session"
import { notificationService, CreateNotificationInput, CreateBulkNotificationInput } from "@/services/notification.service"
import { sendPushNotification } from "@/app/actions/push-notifications"

// Get user's notifications
export async function getNotifications(limit: number = 10) {
    const session = await requireSession()
    return await notificationService.getUserNotifications(session.user.id, limit)
}

// Get unread count
export async function getUnreadCount() {
    const session = await requireSession()
    return await notificationService.getUnreadCount(session.user.id)
}

// Mark single notification as read
export async function markNotificationAsRead(notificationId: number) {
    const session = await requireSession()
    await notificationService.markAsRead(notificationId, session.user.id)
    revalidatePath("/dashboard")
    return { success: true }
}

// Mark all as read
export async function markAllNotificationsAsRead() {
    const session = await requireSession()
    await notificationService.markAllAsRead(session.user.id)
    revalidatePath("/dashboard")
    return { success: true }
}

// Delete notification
export async function deleteNotification(notificationId: number) {
    const session = await requireSession()
    await notificationService.delete(notificationId, session.user.id)
    revalidatePath("/dashboard")
    return { success: true }
}

// --- Helper functions to create notifications from other features ---

// Notify single user
export async function createNotification(input: CreateNotificationInput) {
    // Send push (fire and forget to not block)
    sendPushNotification(
        input.userId,
        input.title,
        input.message || '',
        input.link || '/'
    ).catch(e => console.error("Push error:", e))

    return await notificationService.create(input)
}

// Notify all building residents
export async function notifyBuildingResidents(
    input: Omit<CreateBulkNotificationInput, 'userIds'>,
    excludeUserId?: string // Optionally exclude the creator
) {
    const userIds = await notificationService.getBuildingResidentIds(input.buildingId)
    const filteredUserIds = excludeUserId
        ? userIds.filter(id => id !== excludeUserId)
        : userIds

    // Send push to all (fire and forget)
    filteredUserIds.forEach(userId => {
        sendPushNotification(
            userId,
            input.title,
            input.message || '',
            input.link || '/'
        ).catch(e => console.error("Push error:", e))
    })

    return await notificationService.createBulk({
        ...input,
        userIds: filteredUserIds,
    })
}

// Cleanup old notifications (call from cron job or scheduled task)
export async function cleanupOldNotifications() {
    return await notificationService.cleanupOld()
}