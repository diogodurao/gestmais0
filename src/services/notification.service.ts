import { db } from "@/db"
import { notifications, user } from "@/db/schema"
import { eq, and, desc, lt, count, or } from "drizzle-orm"
import { NotificationType, Notification } from "@/lib/types"

export interface CreateNotificationInput {
    buildingId: string
    userId: string
    type: NotificationType
    title: string
    message?: string
    link?: string
}

export interface CreateBulkNotificationInput {
    buildingId: string
    userIds: string[]
    type: NotificationType
    title: string
    message?: string
    link?: string
}

export class NotificationService {
    // Get user's notifications (recent, limited)
    async getUserNotifications(userId: string, limit: number = 10): Promise<Notification[]> {
        const results = await db
            .select()
            .from(notifications)
            .where(eq(notifications.userId, userId))
            .orderBy(desc(notifications.createdAt))
            .limit(limit)

        return results as unknown as Notification[]
    }

    // Get unread count
    async getUnreadCount(userId: string): Promise<number> {
        const [result] = await db
            .select({ count: count() })
            .from(notifications)
            .where(and(
                eq(notifications.userId, userId),
                eq(notifications.isRead, false)
            ))

        return result.count
    }

    // Create single notification
    async create(input: CreateNotificationInput) {
        const [created] = await db
            .insert(notifications)
            .values({
                buildingId: input.buildingId,
                userId: input.userId,
                type: input.type,
                title: input.title,
                message: input.message || null,
                link: input.link || null,
            })
            .returning()

        return created
    }

    // Create notification for multiple users
    async createBulk(input: CreateBulkNotificationInput) {
        if (input.userIds.length === 0) return []

        const values = input.userIds.map(userId => ({
            buildingId: input.buildingId,
            userId,
            type: input.type,
            title: input.title,
            message: input.message || null,
            link: input.link || null,
        }))

        return await db
            .insert(notifications)
            .values(values)
            .returning()
    }

    // Mark single notification as read
    async markAsRead(notificationId: number, userId: string) {
        const [updated] = await db
            .update(notifications)
            .set({
                isRead: true,
                readAt: new Date(),
            })
            .where(and(
                eq(notifications.id, notificationId),
                eq(notifications.userId, userId)
            ))
            .returning()

        return updated
    }

    // Mark all notifications as read
    async markAllAsRead(userId: string) {
        await db
            .update(notifications)
            .set({
                isRead: true,
                readAt: new Date(),
            })
            .where(and(
                eq(notifications.userId, userId),
                eq(notifications.isRead, false)
            ))

        return true
    }

    // Delete single notification
    async delete(notificationId: number, userId: string) {
        await db
            .delete(notifications)
            .where(and(
                eq(notifications.id, notificationId),
                eq(notifications.userId, userId)
            ))

        return true
    }

    // Cleanup old notifications
    // - Read notifications older than 7 days
    // - Unread notifications older than 30 days
    async cleanupOld() {
        const now = new Date()
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

        // Delete read notifications older than 7 days
        await db
            .delete(notifications)
            .where(and(
                eq(notifications.isRead, true),
                lt(notifications.readAt, sevenDaysAgo)
            ))

        // Delete unread notifications older than 30 days
        await db
            .delete(notifications)
            .where(and(
                eq(notifications.isRead, false),
                lt(notifications.createdAt, thirtyDaysAgo)
            ))

        return true
    }

    // Get all building residents (for bulk notifications)
    async getBuildingResidentIds(buildingId: string): Promise<string[]> {
        const residents = await db
            .select({ id: user.id })
            .from(user)
            .where(eq(user.buildingId, buildingId))

        return residents.map(r => r.id)
    }
}

export const notificationService = new NotificationService()