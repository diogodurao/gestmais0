import { db } from "@/db"
import { calendarEvents } from "@/db/schema"
import { eq, and, gte, lte, asc } from "drizzle-orm"
import { ActionResult, Ok, Err, ErrorCodes, CalendarEvent, RecurrenceType } from "@/lib/types"
import { DEFAULT_RECURRENCE_COUNT } from "@/lib/constants/timing"

export interface CreateEventInput {
    buildingId: string
    title: string
    type: string
    description?: string
    startDate: string
    endDate?: string
    startTime?: string
    recurrence?: RecurrenceType
}

export interface UpdateEventInput {
    title?: string
    type?: string
    description?: string | null
    startDate?: string
    endDate?: string | null
    startTime?: string | null
}

export class CalendarService {
    async getEvents(buildingId: string, year: number, month: number): Promise<ActionResult<CalendarEvent[]>> {
        const startOfMonth = `${year}-${String(month).padStart(2, '0')}-01`
        const lastDay = new Date(year, month, 0).getDate()
        const endOfMonth = `${year}-${String(month).padStart(2, '0')}-${lastDay}`

        const events = await db
            .select()
            .from(calendarEvents)
            .where(and(
                eq(calendarEvents.buildingId, buildingId),
                gte(calendarEvents.startDate, startOfMonth),
                lte(calendarEvents.startDate, endOfMonth)
            ))
            .orderBy(asc(calendarEvents.startDate))

        return Ok(events)
    }

    async createEvent(input: CreateEventInput, userId: string): Promise<ActionResult<CalendarEvent[]>> {
        const events: typeof calendarEvents.$inferInsert[] = []
        const baseEvent = {
            buildingId: input.buildingId,
            title: input.title,
            type: input.type,
            description: input.description || null,
            startDate: input.startDate,
            endDate: input.endDate || null,
            startTime: input.startTime || null,
            createdBy: userId,
        }

        if (!input.recurrence || input.recurrence === "none") {
            events.push(baseEvent)
        } else {
            // Generate recurring occurrences
            for (let i = 0; i < DEFAULT_RECURRENCE_COUNT; i++) {
                const date = new Date(input.startDate)

                if (input.recurrence === "weekly") {
                    date.setDate(date.getDate() + (i * 7))
                } else if (input.recurrence === "biweekly") {
                    date.setDate(date.getDate() + (i * 14))
                } else if (input.recurrence === "monthly") {
                    date.setMonth(date.getMonth() + i)
                }

                events.push({
                    ...baseEvent,
                    startDate: date.toISOString().split('T')[0],
                })
            }
        }

        const inserted = await db.insert(calendarEvents).values(events).returning()
        return Ok(inserted)
    }

    async updateEvent(eventId: number, data: UpdateEventInput): Promise<ActionResult<CalendarEvent>> {
        const existing = await db.select()
            .from(calendarEvents)
            .where(eq(calendarEvents.id, eventId))
            .limit(1)

        if (!existing.length) {
            return Err("Evento não encontrado", ErrorCodes.EVENT_NOT_FOUND)
        }

        const [updated] = await db
            .update(calendarEvents)
            .set(data)
            .where(eq(calendarEvents.id, eventId))
            .returning()

        return Ok(updated)
    }

    async deleteEvent(eventId: number): Promise<ActionResult<boolean>> {
        const existing = await db.select()
            .from(calendarEvents)
            .where(eq(calendarEvents.id, eventId))
            .limit(1)

        if (!existing.length) {
            return Err("Evento não encontrado", ErrorCodes.EVENT_NOT_FOUND)
        }

        await db.delete(calendarEvents).where(eq(calendarEvents.id, eventId))
        return Ok(true)
    }

    async getEventById(eventId: number): Promise<ActionResult<CalendarEvent>> {
        const [event] = await db
            .select()
            .from(calendarEvents)
            .where(eq(calendarEvents.id, eventId))
            .limit(1)

        if (!event) {
            return Err("Evento não encontrado", ErrorCodes.EVENT_NOT_FOUND)
        }

        return Ok(event)
    }

    async getNextUpcomingEvent(buildingId: string): Promise<ActionResult<CalendarEvent | null>> {
        const today = new Date().toISOString().split('T')[0]
        const [event] = await db
            .select()
            .from(calendarEvents)
            .where(and(
                eq(calendarEvents.buildingId, buildingId),
                gte(calendarEvents.startDate, today)
            ))
            .orderBy(asc(calendarEvents.startDate))
            .limit(1)

        return Ok(event || null)
    }
}

export const calendarService = new CalendarService()
