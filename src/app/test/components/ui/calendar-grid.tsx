"use client"

import { forwardRef, type HTMLAttributes } from "react"
import { cn } from "@/lib/utils"

interface CalendarEvent {
  id: number | string
  title: string
  date: string
  type?: string
}

interface CalendarGridProps extends HTMLAttributes<HTMLDivElement> {
  year: number
  month: number
  events?: CalendarEvent[]
  onDayClick?: (date: Date) => void
  onEventClick?: (event: CalendarEvent) => void
  selectedDate?: Date
  weekdayLabels?: string[]
}

const WEEKDAYS_PT = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"]

const eventTypeColors: Record<string, string> = {
  meeting: "bg-[#8FB996]",
  maintenance: "bg-[#B8963E]",
  deadline: "bg-[#B86B73]",
  general: "bg-[#6C757D]",
  default: "bg-[#8FB996]",
}

function getDaysInMonth(year: number, month: number): Date[] {
  const days: Date[] = []
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)

  // Add days from previous month to fill the first week
  const startDayOfWeek = firstDay.getDay()
  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    const date = new Date(year, month, -i)
    days.push(date)
  }

  // Add all days in current month
  for (let i = 1; i <= lastDay.getDate(); i++) {
    days.push(new Date(year, month, i))
  }

  // Add days from next month to fill the last week
  const endDayOfWeek = lastDay.getDay()
  for (let i = 1; i < 7 - endDayOfWeek; i++) {
    days.push(new Date(year, month + 1, i))
  }

  return days
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

function isToday(date: Date): boolean {
  return isSameDay(date, new Date())
}

export const CalendarGrid = forwardRef<HTMLDivElement, CalendarGridProps>(
  ({
    className,
    year,
    month,
    events = [],
    onDayClick,
    onEventClick,
    selectedDate,
    weekdayLabels = WEEKDAYS_PT,
    ...props
  }, ref) => {
    const days = getDaysInMonth(year, month)

    const getEventsForDay = (date: Date) => {
      const dateStr = date.toISOString().split("T")[0]
      return events.filter((e) => e.date === dateStr)
    }

    return (
      <div ref={ref} className={cn("", className)} {...props}>
        {/* Weekday Headers */}
        <div className="grid grid-cols-7 mb-1">
          {weekdayLabels.map((day) => (
            <div
              key={day}
              className="text-center text-[9px] font-medium text-[#8E9AAF] uppercase tracking-wide py-1"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7 gap-px bg-[#E9ECEF] border border-[#E9ECEF] rounded-lg overflow-hidden">
          {days.map((date, idx) => {
            const isCurrentMonth = date.getMonth() === month
            const dayEvents = getEventsForDay(date)
            const isSelected = selectedDate && isSameDay(date, selectedDate)
            const isTodayDate = isToday(date)

            return (
              <button
                key={idx}
                type="button"
                onClick={() => onDayClick?.(date)}
                className={cn(
                  "min-h-[60px] sm:min-h-[80px] p-0.5 bg-white text-left transition-colors",
                  "hover:bg-[#F8F9FA]",
                  !isCurrentMonth && "bg-[#FAFBFC]",
                  isSelected && "ring-2 ring-[#8FB996] ring-inset"
                )}
              >
                <div className="flex flex-col h-full">
                  <span
                    className={cn(
                      "text-[10px] font-medium w-5 h-5 flex items-center justify-center rounded-full",
                      !isCurrentMonth && "text-[#ADB5BD]",
                      isCurrentMonth && "text-[#495057]",
                      isTodayDate && "bg-[#8FB996] text-white"
                    )}
                  >
                    {date.getDate()}
                  </span>

                  {/* Events */}
                  <div className="flex gap-0.5 mt-0.5 flex-wrap justify-center">
                    {dayEvents.slice(0, 3).map((event) => (
                      <button
                        key={event.id}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          onEventClick?.(event)
                        }}
                        className={cn(
                          "w-1.5 h-1.5 rounded-full transition-transform hover:scale-125",
                          eventTypeColors[event.type || "default"]
                        )}
                        title={event.title}
                      />
                    ))}
                    {dayEvents.length > 3 && (
                      <span className="text-[8px] text-[#8E9AAF]">+{dayEvents.length - 3}</span>
                    )}
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </div>
    )
  }
)

CalendarGrid.displayName = "CalendarGrid"

// Calendar Legend
export function CalendarLegend({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center justify-center gap-3 flex-wrap", className)}>
      <span className="flex items-center gap-1 text-[9px] text-[#8E9AAF]">
        <span className="w-2 h-2 bg-[#8FB996] rounded-full" /> Reunião
      </span>
      <span className="flex items-center gap-1 text-[9px] text-[#8E9AAF]">
        <span className="w-2 h-2 bg-[#B8963E] rounded-full" /> Manutenção
      </span>
      <span className="flex items-center gap-1 text-[9px] text-[#8E9AAF]">
        <span className="w-2 h-2 bg-[#B86B73] rounded-full" /> Prazo
      </span>
      <span className="flex items-center gap-1 text-[9px] text-[#8E9AAF]">
        <span className="w-2 h-2 bg-[#6C757D] rounded-full" /> Geral
      </span>
    </div>
  )
}
