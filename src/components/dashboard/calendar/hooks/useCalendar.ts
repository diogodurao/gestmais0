import { useState, useTransition, useMemo } from "react"
import { getCalendarEvents } from "@/lib/actions/calendar"
import { CalendarEvent } from "@/lib/types"

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

    const getDaysInMonth = () => {
        const firstDay = new Date(year, month - 1, 1)
        const lastDay = new Date(year, month, 0)
        const daysInMonth = lastDay.getDate()

        // Monday = 0, Sunday = 6
        let startDay = firstDay.getDay() - 1
        if (startDay < 0) startDay = 6

        const days: (number | null)[] = []
        for (let i = 0; i < startDay; i++) days.push(null)
        for (let i = 1; i <= daysInMonth; i++) days.push(i)

        return days
    }

    return {
        year,
        month,
        navigate,
        eventsByDate,
        isPending,
        days: getDaysInMonth(),
        refresh: () => fetchEvents(year, month)
    }
}
