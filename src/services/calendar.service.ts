import { db } from "@/db"
import { calendarEvents } from "@/db/schema"
import { eq, and, gte, lte, asc } from "drizzle-orm"

export interface CreateEventInput {
    buildingId: string
    title: string
    type: string
    description?: string
    startDate: string
    endDate?: string
    startTime?: string
    recurrence?: "none" | "weekly" | "biweekly" | "monthly"
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
    async getEvents(buildingId: string, year: number, month: number) {
        const startOfMonth = `${year}-${String(month).padStart(2, '0')}-01`
        // Calculate last day of month to avoid invalid dates (e.g. Feb 31)
        const lastDay = new Date(year, month, 0).getDate()
        const endOfMonth = `${year}-${String(month).padStart(2, '0')}-${lastDay}`

        return await db
            .select()
            .from(calendarEvents)
            .where(and(
                eq(calendarEvents.buildingId, buildingId),
                gte(calendarEvents.startDate, startOfMonth),
                lte(calendarEvents.startDate, endOfMonth)
            ))
            .orderBy(asc(calendarEvents.startDate))
    }

    async createEvent(input: CreateEventInput, userId: string) {
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
            // Generate 4 occurrences
            for (let i = 0; i < 4; i++) {
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
        return inserted
    }

    async updateEvent(eventId: number, data: UpdateEventInput) {
        const [updated] = await db
            .update(calendarEvents)
            .set(data)
            .where(eq(calendarEvents.id, eventId))
            .returning()
        return updated
    }

    async deleteEvent(eventId: number) {
        await db.delete(calendarEvents).where(eq(calendarEvents.id, eventId))
        return true
    }

    async getEventById(eventId: number) {
        const [event] = await db
            .select()
            .from(calendarEvents)
            .where(eq(calendarEvents.id, eventId))
            .limit(1)
        return event || null
    }

    async getNextUpcomingEvent(buildingId: string) {
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
        return event || null
    }
}

export const calendarService = new CalendarService()