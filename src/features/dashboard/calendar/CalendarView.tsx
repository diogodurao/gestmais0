"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/Card"
import { EventModal } from "@/features/dashboard/calendar/EventModal"
import { CalendarEvent } from "@/lib/types"
import { cn } from "@/lib/utils"
import { useCalendar } from "@/features/dashboard/calendar/hooks/useCalendar"
import { CalendarHeader } from "@/features/dashboard/calendar/components/CalendarHeader"
import { CalendarDay } from "@/features/dashboard/calendar/components/CalendarDay"

interface Props {
    buildingId: string
    initialEvents: CalendarEvent[]
    initialYear: number
    initialMonth: number
    readOnly?: boolean
}

const WEEKDAYS = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"]
const MONTHS = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"]

export function CalendarView({ buildingId, initialEvents, initialYear, initialMonth, readOnly }: Props) {
    const {
        year,
        month,
        navigate,
        eventsByDate,
        isPending,
        days,
        refresh
    } = useCalendar(buildingId, initialEvents, initialYear, initialMonth)

    const [modalOpen, setModalOpen] = useState(false)
    const [selectedDate, setSelectedDate] = useState<string | null>(null)
    const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)

    const handleDayClick = (day: number) => {
        if (readOnly) return
        const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
        setSelectedDate(dateStr)
        setSelectedEvent(null)
        setModalOpen(true)
    }

    const handleEventClick = (e: React.MouseEvent, event: CalendarEvent) => {
        e.stopPropagation()
        setSelectedEvent(event)
        setSelectedDate(event.startDate)
        setModalOpen(true)
    }

    const handleModalClose = () => {
        setModalOpen(false)
        setSelectedEvent(null)
        setSelectedDate(null)
        refresh()
    }

    const today = new Date()
    const isToday = (day: number) =>
        day === today.getDate() && month === today.getMonth() + 1 && year === today.getFullYear()

    const getEventsForDay = (day: number) => {
        if (!day) return []
        const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
        return eventsByDate.get(dateStr) || []
    }

    return (
        <Card>
            <CalendarHeader
                monthName={MONTHS[month - 1]}
                year={year}
                onNavigate={navigate}
                onAddEvent={() => { setSelectedDate(null); setSelectedEvent(null); setModalOpen(true) }}
                isPending={isPending}
                readOnly={readOnly}
            />
            <CardContent className="p-0">
                <div className="grid grid-cols-7 border-b border-slate-200">
                    {WEEKDAYS.map(d => (
                        <div key={d} className="p-2 text-center text-label font-bold text-slate-500 uppercase bg-slate-50">
                            {d}
                        </div>
                    ))}
                </div>
                <div className={cn("grid grid-cols-7", isPending && "opacity-50")}>
                    {days.map((day, idx) => (
                        <CalendarDay
                            key={idx}
                            day={day}
                            month={month}
                            year={year}
                            events={getEventsForDay(day || 0)}
                            isToday={!!day && isToday(day)}
                            readOnly={readOnly}
                            onDayClick={handleDayClick}
                            onEventClick={handleEventClick}
                        />
                    ))}
                </div>
            </CardContent>

            <EventModal
                isOpen={modalOpen}
                onClose={handleModalClose}
                buildingId={buildingId}
                initialDate={selectedDate}
                event={selectedEvent}
                readOnly={readOnly}
            />
        </Card>
    )
}