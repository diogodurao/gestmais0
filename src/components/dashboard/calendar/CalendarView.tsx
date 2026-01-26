"use client"

import { useState, useTransition } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Badge } from "@/components/ui/Badge"
import { IconButton } from "@/components/ui/Icon-Button"
import { EventModal } from "@/components/dashboard/calendar/EventModal"
import { CalendarEvent } from "@/lib/types"
import { cn } from "@/lib/utils"
import { useCalendar } from "@/components/dashboard/calendar/hooks/useCalendar"
import { CalendarHeader } from "@/components/dashboard/calendar/components/CalendarHeader"
import { CalendarDay } from "@/components/dashboard/calendar/components/CalendarDay"
import { deleteCalendarEvent } from "@/lib/actions/calendar"
import { Plus, Clock, Edit, Trash2, Calendar as CalendarIcon } from "lucide-react"

interface Props {
    buildingId: string
    initialEvents: CalendarEvent[]
    initialYear: number
    initialMonth: number
    readOnly?: boolean
    isManager?: boolean
}

const WEEKDAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"]
const MONTHS = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"]

function getEventTypeStyles(type: string) {
    const styles: Record<string, { border: string; label: string; variant: "success" | "warning" | "error" | "default" }> = {
        meeting: { border: "border-primary-light", label: "Reunião", variant: "success" },
        maintenance: { border: "border-warning-light", label: "Manutenção", variant: "warning" },
        deadline: { border: "border-error-light", label: "Prazo", variant: "error" },
        general: { border: "border-gray-300", label: "Geral", variant: "default" },
    }
    return styles[type] || styles.general
}

function formatDate(dateStr: string) {
    const date = new Date(dateStr)
    return date.toLocaleDateString("pt-PT", { day: "numeric", month: "short" })
}

function EventCard({
    event,
    onEdit,
    onDelete,
    readOnly
}: {
    event: CalendarEvent
    onEdit: () => void
    onDelete: () => void
    readOnly?: boolean
}) {
    const styles = getEventTypeStyles(event.type)

    return (
        <div className={cn(
            "rounded-lg border p-1.5 transition-colors hover:bg-gray-100",
            styles.border
        )}>
            <div className="flex items-start justify-between gap-1.5">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1 mb-0.5">
                        <Badge variant={styles.variant}>
                            {styles.label}
                        </Badge>
                        <span className="text-xs text-secondary">{formatDate(event.startDate)}</span>
                    </div>
                    <h3 className="text-body font-medium text-gray-600 truncate">{event.title}</h3>
                    {event.description && (
                        <p className="text-label text-secondary line-clamp-2 mt-0.5">{event.description}</p>
                    )}
                </div>
            </div>

            <div className="flex items-center justify-between mt-1.5 pt-1.5 border-t border-gray-200">
                <div className="flex items-center gap-2 text-xs text-secondary">
                    {event.startTime && (
                        <span className="flex items-center gap-0.5">
                            <Clock className="h-3 w-3" />
                            {event.startTime}
                        </span>
                    )}
                </div>
                {!readOnly && (
                    <div className="flex items-center gap-0.5">
                        <IconButton
                            size="sm"
                            variant="ghost"
                            icon={<Edit className="h-3 w-3" />}
                            label="Editar"
                            onClick={onEdit}
                        />
                        <IconButton
                            size="sm"
                            variant="ghost"
                            icon={<Trash2 className="h-3 w-3 text-error" />}
                            label="Eliminar"
                            onClick={onDelete}
                        />
                    </div>
                )}
            </div>
        </div>
    )
}

export function CalendarView({ buildingId, initialEvents, initialYear, initialMonth, readOnly, isManager }: Props) {
    const {
        year,
        month,
        navigate,
        goToToday,
        eventsByDate,
        isPending,
        calendarDays,
        refresh
    } = useCalendar(buildingId, initialEvents, initialYear, initialMonth)

    const [modalOpen, setModalOpen] = useState(false)
    const [selectedDate, setSelectedDate] = useState<Date | null>(new Date())
    const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
    const [isDeleting, startDeleteTransition] = useTransition()

    const today = new Date()

    const handleDayClick = (dayInfo: { day: number; date: Date; isCurrentMonth: boolean }) => {
        if (!dayInfo.isCurrentMonth) return
        setSelectedDate(dayInfo.date)
    }

    const handleCreateEvent = () => {
        setSelectedEvent(null)
        setModalOpen(true)
    }

    const handleEditEvent = (event: CalendarEvent) => {
        setSelectedEvent(event)
        setModalOpen(true)
    }

    const handleDeleteEvent = (event: CalendarEvent) => {
        startDeleteTransition(async () => {
            await deleteCalendarEvent(event.id)
            refresh()
        })
    }

    const handleModalClose = () => {
        setModalOpen(false)
        setSelectedEvent(null)
        refresh()
    }

    const getEventsForDate = (date: Date) => {
        const dateStr = date.toISOString().split("T")[0]
        return eventsByDate.get(dateStr) || []
    }

    const selectedDateEvents = selectedDate ? getEventsForDate(selectedDate) : []

    return (
        <>
            {/* Page Header */}
            <div className="mb-1.5 flex flex-col gap-1.5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-base font-semibold text-gray-800">Agenda</h1>
                    <p className="text-label text-secondary">Eventos e datas importantes do condomínio</p>
                </div>
                {!readOnly && (
                    <Button size="sm" onClick={handleCreateEvent}>
                        <Plus className="h-3 w-3" />
                        <span className="hidden sm:inline ml-1">Novo Evento</span>
                    </Button>
                )}
            </div>

            <div className="grid gap-1.5 lg:grid-cols-3">
                {/* Calendar */}
                <Card className="lg:col-span-2">
                    <CalendarHeader
                        monthName={MONTHS[month - 1]}
                        year={year}
                        onNavigate={navigate}
                        onGoToToday={goToToday}
                        isPending={isPending}
                    />
                    <CardContent>
                        {/* Weekday headers */}
                        <div className="grid grid-cols-7 mb-1">
                            {WEEKDAYS.map((day) => (
                                <div key={day} className="text-center text-xs font-medium text-secondary uppercase tracking-wide py-1">
                                    {day}
                                </div>
                            ))}
                        </div>

                        {/* Calendar grid */}
                        <div className={cn("grid grid-cols-7 gap-0.5", isPending && "opacity-50")}>
                            {calendarDays.map((dayInfo, idx) => {
                                const isToday = dayInfo.isCurrentMonth &&
                                    dayInfo.date.toDateString() === today.toDateString()
                                const isSelected = selectedDate &&
                                    dayInfo.date.toDateString() === selectedDate.toDateString()

                                return (
                                    <CalendarDay
                                        key={idx}
                                        day={dayInfo.day}
                                        isCurrentMonth={dayInfo.isCurrentMonth}
                                        events={dayInfo.events}
                                        isToday={isToday}
                                        isSelected={!!isSelected}
                                        onClick={() => handleDayClick(dayInfo)}
                                    />
                                )
                            })}
                        </div>

                        {/* Legend */}
                        <div className="flex items-center justify-center gap-3 mt-1.5 pt-1.5 border-t border-gray-200">
                            <span className="flex items-center gap-1 text-xs text-secondary">
                                <span className="w-2 h-2 rounded-full bg-primary" /> Reunião
                            </span>
                            <span className="flex items-center gap-1 text-xs text-secondary">
                                <span className="w-2 h-2 rounded-full bg-warning" /> Manutenção
                            </span>
                            <span className="flex items-center gap-1 text-xs text-secondary">
                                <span className="w-2 h-2 rounded-full bg-error" /> Prazo
                            </span>
                        </div>
                    </CardContent>
                </Card>

                {/* Events Panel */}
                <Card>
                    <CardHeader>
                        <CardTitle>
                            {selectedDate ? (
                                <>Eventos - {selectedDate.toLocaleDateString("pt-PT", { day: "numeric", month: "long" })}</>
                            ) : (
                                <>Próximos Eventos</>
                            )}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {selectedDateEvents.length > 0 ? (
                            <div className={cn("space-y-1.5", isDeleting && "opacity-50 pointer-events-none")}>
                                {selectedDateEvents.map((event) => (
                                    <EventCard
                                        key={event.id}
                                        event={event}
                                        onEdit={() => handleEditEvent(event)}
                                        onDelete={() => handleDeleteEvent(event)}
                                        readOnly={readOnly}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-6 text-center">
                                <CalendarIcon className="h-8 w-8 text-gray-300 mb-1.5" />
                                <p className="text-body font-medium text-secondary">Sem eventos</p>
                                <p className="text-label text-gray-400">
                                    {selectedDate ? "Nenhum evento neste dia" : "Selecione um dia para ver eventos"}
                                </p>
                                {!readOnly && (
                                    <Button variant="outline" size="sm" className="mt-1.5" onClick={handleCreateEvent}>
                                        <Plus className="h-3 w-3 mr-1" />
                                        Criar evento
                                    </Button>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            <EventModal
                isOpen={modalOpen}
                onClose={handleModalClose}
                buildingId={buildingId}
                initialDate={selectedDate?.toISOString().split("T")[0] || null}
                event={selectedEvent}
                readOnly={readOnly}
                isManager={isManager}
            />
        </>
    )
}