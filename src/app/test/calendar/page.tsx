"use client"

import { useState } from "react"
import { Button } from "../components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../components/ui/card"
import { Badge } from "../components/ui/badge"
import { IconButton } from "../components/ui/icon-button"
import { Modal } from "../components/ui/modal"
import { Drawer } from "../components/ui/drawer"
import { FormField } from "../components/ui/form-field"
import { Input } from "../components/ui/input"
import { Textarea } from "../components/ui/textarea"
import { Select } from "../components/ui/select"
import { ToastProvider, useToast } from "../components/ui/toast"
import { cn } from "@/lib/utils"
import {
  Plus, ChevronLeft, ChevronRight, Calendar as CalendarIcon,
  Clock, MapPin, Users, MoreVertical, Edit, Trash2,
} from "lucide-react"

// Types
type EventType = "meeting" | "maintenance" | "deadline" | "general"

interface CalendarEvent {
  id: number
  title: string
  description: string
  date: string
  time: string
  type: EventType
  location?: string
  attendees?: number
}

// Mock data
const MONTHS_PT = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
]

const WEEKDAYS_PT = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"]

const mockEvents: CalendarEvent[] = [
  {
    id: 1,
    title: "Reunião de Condomínio",
    description: "Reunião mensal para discussão do orçamento e obras pendentes.",
    date: "2025-01-15",
    time: "19:00",
    type: "meeting",
    location: "Sala do Condomínio",
    attendees: 12,
  },
  {
    id: 2,
    title: "Manutenção Elevador",
    description: "Manutenção preventiva do elevador principal.",
    date: "2025-01-18",
    time: "10:00",
    type: "maintenance",
  },
  {
    id: 3,
    title: "Prazo Pagamento Quotas",
    description: "Data limite para pagamento das quotas de Janeiro.",
    date: "2025-01-20",
    time: "23:59",
    type: "deadline",
  },
  {
    id: 4,
    title: "Limpeza Garagem",
    description: "Limpeza geral da garagem comum.",
    date: "2025-01-22",
    time: "08:00",
    type: "maintenance",
  },
  {
    id: 5,
    title: "Assembleia Extraordinária",
    description: "Votação sobre a pintura exterior do edifício.",
    date: "2025-01-28",
    time: "20:00",
    type: "meeting",
    location: "Sala do Condomínio",
    attendees: 15,
  },
]

// Utilities
function getEventTypeStyles(type: EventType) {
  const styles = {
    meeting: { bg: "bg-[#E8F0EA]", text: "text-[#6A9B72]", border: "border-[#D4E5D7]", label: "Reunião" },
    maintenance: { bg: "bg-[#FBF6EC]", text: "text-[#B8963E]", border: "border-[#F0E4C8]", label: "Manutenção" },
    deadline: { bg: "bg-[#F9ECEE]", text: "text-[#B86B73]", border: "border-[#EFCDD1]", label: "Prazo" },
    general: { bg: "bg-[#E9ECF0]", text: "text-[#6C757D]", border: "border-[#DEE2E6]", label: "Geral" },
  }
  return styles[type]
}

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay()
}

function formatDate(dateStr: string) {
  const date = new Date(dateStr)
  return date.toLocaleDateString("pt-PT", { day: "numeric", month: "short" })
}

// Calendar Day Component
function CalendarDay({
  day,
  isToday,
  isSelected,
  isCurrentMonth,
  events,
  onClick,
}: {
  day: number
  isToday: boolean
  isSelected: boolean
  isCurrentMonth: boolean
  events: CalendarEvent[]
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "relative flex flex-col items-center p-1 min-h-[48px] sm:min-h-[64px] rounded transition-colors",
        isCurrentMonth ? "hover:bg-[#F8F9FA]" : "opacity-40",
        isSelected && "bg-[#E8F0EA] hover:bg-[#E8F0EA]",
        isToday && !isSelected && "ring-1 ring-[#8FB996]"
      )}
    >
      <span className={cn(
        "text-[11px] font-medium",
        isSelected ? "text-[#6A9B72]" : isCurrentMonth ? "text-[#495057]" : "text-[#ADB5BD]",
        isToday && "font-bold"
      )}>
        {day}
      </span>
      {events.length > 0 && (
        <div className="flex gap-0.5 mt-0.5 flex-wrap justify-center">
          {events.slice(0, 3).map((event, idx) => (
            <span
              key={idx}
              className={cn(
                "w-1.5 h-1.5 rounded-full",
                getEventTypeStyles(event.type).bg.replace("bg-", "bg-").replace("[#E8F0EA]", "[#8FB996]").replace("[#FBF6EC]", "[#B8963E]").replace("[#F9ECEE]", "[#B86B73]").replace("[#E9ECF0]", "[#6C757D]")
              )}
              style={{
                backgroundColor: event.type === "meeting" ? "#8FB996" :
                  event.type === "maintenance" ? "#B8963E" :
                    event.type === "deadline" ? "#B86B73" : "#6C757D"
              }}
            />
          ))}
        </div>
      )}
    </button>
  )
}

// Event Card Component
function EventCard({
  event,
  onEdit,
  onDelete,
}: {
  event: CalendarEvent
  onEdit: () => void
  onDelete: () => void
}) {
  const styles = getEventTypeStyles(event.type)

  return (
    <div className={cn(
      "rounded-lg border p-1.5 transition-colors hover:bg-[#F8F9FA]",
      styles.border
    )}>
      <div className="flex items-start justify-between gap-1.5">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1 mb-0.5">
            <Badge variant={
              event.type === "meeting" ? "success" :
                event.type === "maintenance" ? "warning" :
                  event.type === "deadline" ? "error" : "default"
            }>
              {styles.label}
            </Badge>
            <span className="text-[9px] text-[#8E9AAF]">{formatDate(event.date)}</span>
          </div>
          <h3 className="text-[11px] font-medium text-[#495057] truncate">{event.title}</h3>
          <p className="text-[10px] text-[#8E9AAF] line-clamp-2 mt-0.5">{event.description}</p>
        </div>
      </div>

      <div className="flex items-center justify-between mt-1.5 pt-1.5 border-t border-[#F1F3F5]">
        <div className="flex items-center gap-2 text-[9px] text-[#8E9AAF]">
          <span className="flex items-center gap-0.5">
            <Clock className="h-3 w-3" />
            {event.time}
          </span>
          {event.location && (
            <span className="flex items-center gap-0.5">
              <MapPin className="h-3 w-3" />
              {event.location}
            </span>
          )}
          {event.attendees && (
            <span className="flex items-center gap-0.5">
              <Users className="h-3 w-3" />
              {event.attendees}
            </span>
          )}
        </div>
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
            icon={<Trash2 className="h-3 w-3 text-[#B86B73]" />}
            label="Eliminar"
            onClick={onDelete}
          />
        </div>
      </div>
    </div>
  )
}

// Main Content
function CalendarContent() {
  const { addToast } = useToast()
  const [currentDate, setCurrentDate] = useState(new Date(2025, 0, 1))
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date(2025, 0, 15))
  const [events, setEvents] = useState(mockEvents)
  const [showEventModal, setShowEventModal] = useState(false)
  const [showMobileDrawer, setShowMobileDrawer] = useState(false)
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null)

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  const daysInMonth = getDaysInMonth(year, month)
  const firstDay = getFirstDayOfMonth(year, month)
  const today = new Date()

  // Get events for a specific date
  const getEventsForDate = (date: Date) => {
    const dateStr = date.toISOString().split("T")[0]
    return events.filter(e => e.date === dateStr)
  }

  // Get events for selected date
  const selectedDateEvents = selectedDate ? getEventsForDate(selectedDate) : []

  // Navigation
  const goToPrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1))
  }

  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1))
  }

  const goToToday = () => {
    setCurrentDate(new Date(today.getFullYear(), today.getMonth(), 1))
    setSelectedDate(today)
  }

  // Event handlers
  const handleCreateEvent = () => {
    if (window.innerWidth < 640) {
      setShowMobileDrawer(true)
    } else {
      setShowEventModal(true)
    }
  }

  const handleEditEvent = (event: CalendarEvent) => {
    setEditingEvent(event)
    if (window.innerWidth < 640) {
      setShowMobileDrawer(true)
    } else {
      setShowEventModal(true)
    }
  }

  const handleDeleteEvent = (eventId: number) => {
    setEvents(prev => prev.filter(e => e.id !== eventId))
    addToast({
      variant: "success",
      title: "Evento eliminado",
      description: "O evento foi removido da agenda.",
    })
  }

  const handleSaveEvent = () => {
    setShowEventModal(false)
    setShowMobileDrawer(false)
    setEditingEvent(null)
    addToast({
      variant: "success",
      title: editingEvent ? "Evento atualizado" : "Evento criado",
      description: editingEvent ? "As alterações foram guardadas." : "O novo evento foi adicionado à agenda.",
    })
  }

  // Build calendar grid
  const calendarDays = []
  const prevMonthDays = getDaysInMonth(year, month - 1)

  // Previous month days
  for (let i = firstDay - 1; i >= 0; i--) {
    const day = prevMonthDays - i
    const date = new Date(year, month - 1, day)
    calendarDays.push({
      day,
      date,
      isCurrentMonth: false,
      events: getEventsForDate(date),
    })
  }

  // Current month days
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day)
    calendarDays.push({
      day,
      date,
      isCurrentMonth: true,
      events: getEventsForDate(date),
    })
  }

  // Next month days
  const remainingDays = 42 - calendarDays.length
  for (let day = 1; day <= remainingDays; day++) {
    const date = new Date(year, month + 1, day)
    calendarDays.push({
      day,
      date,
      isCurrentMonth: false,
      events: getEventsForDate(date),
    })
  }

  // Event form
  const EventForm = () => (
    <div className="space-y-1.5">
      <FormField label="Título" required>
        <Input placeholder="Nome do evento" defaultValue={editingEvent?.title} />
      </FormField>
      <FormField label="Descrição">
        <Textarea placeholder="Descrição do evento..." defaultValue={editingEvent?.description} />
      </FormField>
      <div className="grid grid-cols-2 gap-1.5">
        <FormField label="Data" required>
          <Input type="date" defaultValue={editingEvent?.date || selectedDate?.toISOString().split("T")[0]} />
        </FormField>
        <FormField label="Hora" required>
          <Input type="time" defaultValue={editingEvent?.time} />
        </FormField>
      </div>
      <FormField label="Tipo" required>
        <Select defaultValue={editingEvent?.type || "general"}>
          <option value="meeting">Reunião</option>
          <option value="maintenance">Manutenção</option>
          <option value="deadline">Prazo</option>
          <option value="general">Geral</option>
        </Select>
      </FormField>
      <FormField label="Local">
        <Input placeholder="Localização (opcional)" defaultValue={editingEvent?.location} />
      </FormField>
    </div>
  )

  return (
    <div className="flex-1 overflow-y-auto p-1.5">
      {/* Header */}
      <div className="mb-1.5 flex flex-col gap-1.5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-[14px] font-semibold text-[#343A40]">Agenda</h1>
          <p className="text-[10px] text-[#8E9AAF]">Eventos e datas importantes do condomínio</p>
        </div>
        <Button size="sm" onClick={handleCreateEvent}>
          <Plus className="h-3 w-3" />
          <span className="hidden sm:inline ml-1">Novo Evento</span>
        </Button>
      </div>

      <div className="grid gap-1.5 lg:grid-cols-3">
        {/* Calendar */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <IconButton
                  size="sm"
                  variant="outline"
                  icon={<ChevronLeft className="h-3 w-3" />}
                  label="Mês anterior"
                  onClick={goToPrevMonth}
                />
                <IconButton
                  size="sm"
                  variant="outline"
                  icon={<ChevronRight className="h-3 w-3" />}
                  label="Próximo mês"
                  onClick={goToNextMonth}
                />
                <span className="text-[12px] font-medium text-[#495057] ml-1">
                  {MONTHS_PT[month]} {year}
                </span>
              </div>
              <Button variant="outline" size="sm" onClick={goToToday}>
                <CalendarIcon className="h-3 w-3" />
                <span className="hidden sm:inline ml-1">Hoje</span>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Weekday headers */}
            <div className="grid grid-cols-7 mb-1">
              {WEEKDAYS_PT.map((day) => (
                <div key={day} className="text-center text-[9px] font-medium text-[#8E9AAF] uppercase tracking-wide py-1">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-0.5">
              {calendarDays.map((dayInfo, idx) => {
                const isToday = dayInfo.isCurrentMonth &&
                  dayInfo.date.toDateString() === today.toDateString()
                const isSelected = selectedDate &&
                  dayInfo.date.toDateString() === selectedDate.toDateString()

                return (
                  <CalendarDay
                    key={idx}
                    day={dayInfo.day}
                    isToday={isToday}
                    isSelected={isSelected}
                    isCurrentMonth={dayInfo.isCurrentMonth}
                    events={dayInfo.events}
                    onClick={() => dayInfo.isCurrentMonth && setSelectedDate(dayInfo.date)}
                  />
                )
              })}
            </div>

            {/* Legend */}
            <div className="flex items-center justify-center gap-3 mt-1.5 pt-1.5 border-t border-[#F1F3F5]">
              <span className="flex items-center gap-1 text-[9px] text-[#8E9AAF]">
                <span className="w-2 h-2 rounded-full bg-[#8FB996]" /> Reunião
              </span>
              <span className="flex items-center gap-1 text-[9px] text-[#8E9AAF]">
                <span className="w-2 h-2 rounded-full bg-[#B8963E]" /> Manutenção
              </span>
              <span className="flex items-center gap-1 text-[9px] text-[#8E9AAF]">
                <span className="w-2 h-2 rounded-full bg-[#B86B73]" /> Prazo
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
              <div className="space-y-1.5">
                {selectedDateEvents.map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    onEdit={() => handleEditEvent(event)}
                    onDelete={() => handleDeleteEvent(event.id)}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <CalendarIcon className="h-8 w-8 text-[#DEE2E6] mb-1.5" />
                <p className="text-[11px] font-medium text-[#8E9AAF]">Sem eventos</p>
                <p className="text-[10px] text-[#ADB5BD]">
                  {selectedDate ? "Nenhum evento neste dia" : "Selecione um dia para ver eventos"}
                </p>
                <Button variant="outline" size="sm" className="mt-1.5" onClick={handleCreateEvent}>
                  <Plus className="h-3 w-3 mr-1" />
                  Criar evento
                </Button>
              </div>
            )}

            {/* Upcoming events (when no date selected) */}
            {!selectedDate && events.length > 0 && (
              <div className="space-y-1.5">
                {events.slice(0, 5).map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    onEdit={() => handleEditEvent(event)}
                    onDelete={() => handleDeleteEvent(event.id)}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Desktop Modal */}
      <Modal
        open={showEventModal}
        onClose={() => { setShowEventModal(false); setEditingEvent(null) }}
        title={editingEvent ? "Editar Evento" : "Novo Evento"}
        description={editingEvent ? "Altere os detalhes do evento." : "Adicione um novo evento à agenda."}
        footer={
          <div className="flex justify-end gap-1.5">
            <Button variant="outline" onClick={() => { setShowEventModal(false); setEditingEvent(null) }}>
              Cancelar
            </Button>
            <Button onClick={handleSaveEvent}>
              {editingEvent ? "Guardar" : "Criar Evento"}
            </Button>
          </div>
        }
      >
        <EventForm />
      </Modal>

      {/* Mobile Drawer */}
      <Drawer
        open={showMobileDrawer}
        onClose={() => { setShowMobileDrawer(false); setEditingEvent(null) }}
        title={editingEvent ? "Editar Evento" : "Novo Evento"}
        description={editingEvent ? "Altere os detalhes do evento." : "Adicione um novo evento à agenda."}
      >
        <EventForm />
        <div className="mt-4 flex gap-1.5">
          <Button variant="outline" className="flex-1" onClick={() => { setShowMobileDrawer(false); setEditingEvent(null) }}>
            Cancelar
          </Button>
          <Button className="flex-1" onClick={handleSaveEvent}>
            {editingEvent ? "Guardar" : "Criar Evento"}
          </Button>
        </div>
      </Drawer>
    </div>
  )
}

export default function CalendarPage() {
  return (
    <ToastProvider>
      <div className="h-full bg-white">
        <CalendarContent />
      </div>
    </ToastProvider>
  )
}
