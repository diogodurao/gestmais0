"use server"

import { revalidatePath } from "next/cache"
import { requireSession, requireBuildingAccess } from "@/lib/session"
import { calendarService, CreateEventInput, UpdateEventInput } from "@/services/calendar.service"
import { createCalendarEventSchema, updateCalendarEventSchema } from "@/lib/zod-schemas"
import { ActionResult } from "@/lib/types"
import { ROUTES } from "@/lib/routes"
import { notifyUpcomingEvent } from "@/lib/notifications"

export async function getCalendarEvents(buildingId: string, year: number, month: number) {
    const session = await requireSession()

    // Manager or resident of building
    if (session.user.role === 'manager') {
        await requireBuildingAccess(buildingId)
    } else if (session.user.buildingId !== buildingId) {
        throw new Error("Unauthorized")
    }

    return await calendarService.getEvents(buildingId, year, month)
}

export async function createCalendarEvent(input: CreateEventInput): Promise<ActionResult<{ count: number }>> {
    const { session } = await requireBuildingAccess(input.buildingId)

    const validated = createCalendarEventSchema.safeParse(input)
    if (!validated.success) {
        return { success: false, error: validated.error.issues[0].message }
    }

    try {
        const events = await calendarService.createEvent(validated.data, session.user.id)

        // Notify residents
        await notifyUpcomingEvent(
            input.buildingId,
            validated.data.title,
            validated.data.startDate
        )

        revalidatePath(ROUTES.DASHBOARD.CALENDAR)
        return { success: true, data: { count: events.length } }
    } catch {
        return { success: false, error: "Erro ao criar evento" }
    }
}

export async function updateCalendarEvent(
    eventId: number,
    data: UpdateEventInput
): Promise<ActionResult<void>> {
    await requireSession()

    const event = await calendarService.getEventById(eventId)
    if (!event) return { success: false, error: "Evento não encontrado" }

    await requireBuildingAccess(event.buildingId)

    const validated = updateCalendarEventSchema.safeParse(data)
    if (!validated.success) {
        return { success: false, error: validated.error.issues[0].message }
    }

    try {
        await calendarService.updateEvent(eventId, validated.data)
        revalidatePath(ROUTES.DASHBOARD.CALENDAR)
        return { success: true, data: undefined }
    } catch {
        return { success: false, error: "Erro ao atualizar evento" }
    }
}

export async function deleteCalendarEvent(eventId: number): Promise<ActionResult<void>> {
    await requireSession()

    const event = await calendarService.getEventById(eventId)
    if (!event) return { success: false, error: "Evento não encontrado" }

    await requireBuildingAccess(event.buildingId)

    try {
        await calendarService.deleteEvent(eventId)
        revalidatePath(ROUTES.DASHBOARD.CALENDAR)
        return { success: true, data: undefined }
    } catch {
        return { success: false, error: "Erro ao eliminar evento" }
    }
}