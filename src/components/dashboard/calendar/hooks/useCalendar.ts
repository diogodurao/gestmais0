import { useState, useTransition, useMemo } from "react"
import { getCalendarEvents } from "@/lib/actions/calendar"
import { CalendarEvent } from "@/lib/types"

interface CalendarDayInfo {
    day: number
    date: Date
    isCurrentMonth: boolean
    events: CalendarEvent[]
}

export function useCalendar(
    buildingId: string,
    initialEvents: CalendarEvent[],
    initialYear: number,
    initialMonth: number
) {
    const [year, setYear] = useState(initialYear)
    const [month, setMonth] = useState(initialMonth)
    const [events, setEvents] = useState<CalendarEvent[]>(initialEvents)
    const [isPending, startTransition] = useTransition()

    const eventsByDate = useMemo(() => {
        const map = new Map<string, CalendarEvent[]>()
        events.forEach(event => {
            const date = event.startDate
            if (!map.has(date)) {
                map.set(date, [])
            }
            map.get(date)!.push(event)
        })
        return map
    }, [events])

    const fetchEvents = (y: number, m: number) => {
        startTransition(async () => {
            const data = await getCalendarEvents(buildingId, y, m)
            setEvents(data)
        })
    }

    const navigate = (delta: number) => {
        let newMonth = month + delta
        let newYear = year

        if (newMonth > 12) { newMonth = 1; newYear++ }
        if (newMonth < 1) { newMonth = 12; newYear-- }

        setMonth(newMonth)
        setYear(newYear)
        fetchEvents(newYear, newMonth)
    }

    const goToToday = () => {
        const today = new Date()
        const newYear = today.getFullYear()
        const newMonth = today.getMonth() + 1

        setMonth(newMonth)
        setYear(newYear)
        fetchEvents(newYear, newMonth)
    }

    const getEventsForDate = (date: Date) => {
        const dateStr = date.toISOString().split("T")[0]
        return eventsByDate.get(dateStr) || []
    }

    const calendarDays = useMemo(() => {
        const result: CalendarDayInfo[] = []
        const daysInMonth = new Date(year, month, 0).getDate()
        const firstDay = new Date(year, month - 1, 1).getDay() // Sunday = 0
        const prevMonthDays = new Date(year, month - 1, 0).getDate()

        // Previous month days
        for (let i = firstDay - 1; i >= 0; i--) {
            const day = prevMonthDays - i
            const date = new Date(year, month - 2, day)
            result.push({
                day,
                date,
                isCurrentMonth: false,
                events: getEventsForDate(date)
            })
        }

        // Current month days
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month - 1, day)
            result.push({
                day,
                date,
                isCurrentMonth: true,
                events: getEventsForDate(date)
            })
        }

        // Next month days (fill to 42 cells for 6 rows)
        const remainingDays = 42 - result.length
        for (let day = 1; day <= remainingDays; day++) {
            const date = new Date(year, month, day)
            result.push({
                day,
                date,
                isCurrentMonth: false,
                events: getEventsForDate(date)
            })
        }

        return result
    }, [year, month, eventsByDate])

    return {
        year,
        month,
        navigate,
        goToToday,
        eventsByDate,
        isPending,
        calendarDays,
        refresh: () => fetchEvents(year, month)
    }
}
