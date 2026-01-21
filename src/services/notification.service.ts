import { db } from "@/db"
import { notifications, user } from "@/db/schema"
import { eq, and, desc, lt, count } from "drizzle-orm"
import { NotificationType, ActionResult, Ok } from "@/lib/types"
import {
    NOTIFICATION_READ_RETENTION_DAYS,
    NOTIFICATION_UNREAD_RETENTION_DAYS
} from "@/lib/constants/timing"

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

type NotificationRow = typeof notifications.$inferSelect

export class NotificationService {
    async getUserNotifications(userId: string, limit: number = 10): Promise<ActionResult<NotificationRow[]>> {
        const results = await db
            .select()
            .from(notifications)
            .where(eq(notifications.userId, userId))
            .orderBy(desc(notifications.createdAt))
            .limit(limit)

        return Ok(results)
    }

    async getUnreadCount(userId: string): Promise<ActionResult<number>> {
        const [result] = await db
            .select({ count: count() })
            .from(notifications)
            .where(and(
                eq(notifications.userId, userId),
                eq(notifications.isRead, false)
            ))

        return Ok(result.count)
    }

    async create(input: CreateNotificationInput): Promise<ActionResult<NotificationRow>> {
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

        return Ok(created)
    }

    async createBulk(input: CreateBulkNotificationInput): Promise<ActionResult<NotificationRow[]>> {
        if (input.userIds.length === 0) return Ok([])

        const values = input.userIds.map(userId => ({
            buildingId: input.buildingId,
            userId,
            type: input.type,
            title: input.title,
            message: input.message || null,
            link: input.link || null,
        }))

        const results = await db
            .insert(notifications)
            .values(values)
            .returning()

        return Ok(results)
    }

    async markAsRead(notificationId: number, userId: string): Promise<ActionResult<NotificationRow | null>> {
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

        return Ok(updated || null)
    }

    async markAllAsRead(userId: string): Promise<ActionResult<boolean>> {
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

        return Ok(true)
    }

    async delete(notificationId: number, userId: string): Promise<ActionResult<boolean>> {
        await db
            .delete(notifications)
            .where(and(
                eq(notifications.id, notificationId),
                eq(notifications.userId, userId)
            ))

        return Ok(true)
    }

    /**
     * Cleanup old notifications based on retention policy:
     * - Read notifications older than NOTIFICATION_READ_RETENTION_DAYS days
     * - Unread notifications older than NOTIFICATION_UNREAD_RETENTION_DAYS days
     */
    async cleanupOld(): Promise<ActionResult<boolean>> {
        const now = new Date()
        const readRetentionDate = new Date(
            now.getTime() - NOTIFICATION_READ_RETENTION_DAYS * 24 * 60 * 60 * 1000
        )
        const unreadRetentionDate = new Date(
            now.getTime() - NOTIFICATION_UNREAD_RETENTION_DAYS * 24 * 60 * 60 * 1000
        )

        // Delete read notifications older than retention period
        await db
            .delete(notifications)
            .where(and(
                eq(notifications.isRead, true),
                lt(notifications.readAt, readRetentionDate)
            ))

        // Delete unread notifications older than retention period
        await db
            .delete(notifications)
            .where(and(
                eq(notifications.isRead, false),
                lt(notifications.createdAt, unreadRetentionDate)
            ))

        return Ok(true)
    }

    async getBuildingResidentIds(buildingId: string): Promise<ActionResult<string[]>> {
        const residents = await db
            .select({ id: user.id })
            .from(user)
            .where(eq(user.buildingId, buildingId))

        return Ok(residents.map(r => r.id))
    }
}

export const notificationService = new NotificationService()
