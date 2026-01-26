"use server"

import { updateTag } from "next/cache"
import { after } from "next/server"
import { requireSession, requireBuildingAccess } from "@/lib/auth-helpers"
import { calendarService, CreateEventInput, UpdateEventInput } from "@/services/calendar.service"
import { createCalendarEventSchema, updateCalendarEventSchema } from "@/lib/zod-schemas"
import { ActionResult, NotificationOptions } from "@/lib/types"
import { notifyBuildingResidents, createNotification } from "@/lib/actions/notification"
import { getResidentEmails, sendBulkEmails } from "@/lib/actions/email-notifications"
import { getCalendarEventEmailTemplate, sendEmail } from "@/lib/email"
import { db } from "@/db"
import { building } from "@/db/schema"
import { eq } from "drizzle-orm"

export async function getCalendarEvents(buildingId: string, year: number, month: number) {
    const session = await requireSession()

    // Manager or resident of building
    if (session.user.role === 'manager') {
        await requireBuildingAccess(buildingId)
    } else if (session.user.buildingId !== buildingId) {
        throw new Error("Unauthorized")
    }

    const result = await calendarService.getEvents(buildingId, year, month)
    if (!result.success) throw new Error(result.error)
    return result.data
}

interface CreateCalendarEventWithNotificationsInput extends CreateEventInput {
    notificationOptions?: NotificationOptions
}

export async function createCalendarEvent(input: CreateCalendarEventWithNotificationsInput): Promise<ActionResult<{ count: number }>> {
    const { session } = await requireBuildingAccess(input.buildingId)

    const validated = createCalendarEventSchema.safeParse(input)
    if (!validated.success) {
        return { success: false, error: validated.error.issues[0].message }
    }

    const result = await calendarService.createEvent(validated.data, session.user.id)
    if (!result.success) return result

    updateTag(`calendar-${input.buildingId}`)

    // Handle notifications after response (non-blocking)
    const eventTitle = validated.data.title
    const eventDate = validated.data.startDate
    const eventTime = validated.data.startTime || null
    const eventDescription = validated.data.description || null
    const notificationOptions = input.notificationOptions

    after(async () => {
        try {
            // Default behavior: send app notification to all
            if (!notificationOptions) {
                await notifyBuildingResidents({
                    buildingId: input.buildingId,
                    type: 'calendar_event',
                    title: 'Novo evento',
                    message: eventTitle,
                    link: '/dashboard/calendar',
                }, session.user.id)
                return
            }

            // Custom notification handling
            const { sendAppNotification, sendEmail: shouldSendEmail, recipients } = notificationOptions

            // Get building name for email
            let buildingName = ''
            if (shouldSendEmail) {
                const [buildingData] = await db
                    .select({ name: building.name })
                    .from(building)
                    .where(eq(building.id, input.buildingId))
                    .limit(1)
                buildingName = buildingData?.name || ''
            }

            // Get recipient user IDs
            const userIds = recipients === 'all'
                ? undefined
                : recipients

            // Send app notifications
            if (sendAppNotification) {
                if (recipients === 'all') {
                    await notifyBuildingResidents({
                        buildingId: input.buildingId,
                        type: 'calendar_event',
                        title: 'Novo evento',
                        message: eventTitle,
                        link: '/dashboard/calendar',
                    }, session.user.id)
                } else if (userIds && userIds.length > 0) {
                    // Send to specific users
                    await Promise.all(
                        userIds.map(userId =>
                            createNotification({
                                buildingId: input.buildingId,
                                userId,
                                type: 'calendar_event',
                                title: 'Novo evento',
                                message: eventTitle,
                                link: '/dashboard/calendar',
                            })
                        )
                    )
                }
            }

            // Send emails
            if (shouldSendEmail) {
                const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://gestmais.pt'
                const link = `${baseUrl}/dashboard/calendar`
                const template = getCalendarEventEmailTemplate(
                    buildingName,
                    eventTitle,
                    eventDate,
                    eventTime,
                    eventDescription,
                    link
                )

                const emailRecipients = await getResidentEmails(input.buildingId, userIds)
                // Filter out the creator
                const filteredRecipients = emailRecipients.filter(r => r.userId !== session.user.id)

                if (filteredRecipients.length > 0) {
                    await sendBulkEmails({
                        recipients: filteredRecipients.map(r => ({ email: r.email, name: r.name })),
                        subject: `📅 ${eventTitle} - ${buildingName}`,
                        template,
                    })
                }
            }
        } catch (error) {
            console.error("Failed to send event notifications:", error)
        }
    })

    return { success: true, data: { count: result.data.length } }
}

export async function updateCalendarEvent(
    eventId: number,
    data: UpdateEventInput
): Promise<ActionResult<void>> {
    await requireSession()

    const eventResult = await calendarService.getEventById(eventId)
    if (!eventResult.success) return { success: false, error: eventResult.error }
    const event = eventResult.data

    await requireBuildingAccess(event.buildingId)

    const validated = updateCalendarEventSchema.safeParse(data)
    if (!validated.success) {
        return { success: false, error: validated.error.issues[0].message }
    }

    const result = await calendarService.updateEvent(eventId, validated.data)
    if (!result.success) return { success: false, error: result.error }

    updateTag(`calendar-${event.buildingId}`)
    return { success: true, data: undefined }
}

export async function deleteCalendarEvent(eventId: number): Promise<ActionResult<void>> {
    await requireSession()

    const eventResult = await calendarService.getEventById(eventId)
    if (!eventResult.success) return { success: false, error: eventResult.error }
    const event = eventResult.data

    await requireBuildingAccess(event.buildingId)

    const result = await calendarService.deleteEvent(eventId)
    if (!result.success) return { success: false, error: result.error }

    updateTag(`calendar-${event.buildingId}`)
    return { success: true, data: undefined }
}

export async function getNextUpcomingEvent(buildingId: string) {
    const session = await requireSession()

    if (session.user.role === 'manager') {
        await requireBuildingAccess(buildingId)
    } else if (session.user.buildingId !== buildingId) {
        throw new Error("Unauthorized")
    }

    const result = await calendarService.getNextUpcomingEvent(buildingId)
    if (!result.success) throw new Error(result.error)
    return result.data
}