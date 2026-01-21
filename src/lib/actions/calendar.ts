"use server"

import { updateTag } from "next/cache"
import { after } from "next/server"
import { requireSession, requireBuildingAccess } from "@/lib/auth-helpers"
import { calendarService, CreateEventInput, UpdateEventInput } from "@/services/calendar.service"
import { createCalendarEventSchema, updateCalendarEventSchema } from "@/lib/zod-schemas"
import { ActionResult } from "@/lib/types"
import { notifyUpcomingEvent } from "@/lib/actions/notification"

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

export async function createCalendarEvent(input: CreateEventInput): Promise<ActionResult<{ count: number }>> {
    const { session } = await requireBuildingAccess(input.buildingId)

    const validated = createCalendarEventSchema.safeParse(input)
    if (!validated.success) {
        return { success: false, error: validated.error.issues[0].message }
    }

    const result = await calendarService.createEvent(validated.data, session.user.id)
    if (!result.success) return result

    updateTag(`calendar-${input.buildingId}`)

    // Notify residents after response (non-blocking)
    const eventTitle = validated.data.title
    const eventDate = validated.data.startDate
    after(async () => {
        await notifyUpcomingEvent(
            input.buildingId,
            eventTitle,
            eventDate
        )
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