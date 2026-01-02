import { cn } from "@/lib/utils"
import { CalendarEvent } from "@/lib/types"

interface CalendarDayProps {
    day: number | null
    month: number
    year: number
    events: CalendarEvent[]
    isToday: boolean
    readOnly?: boolean
    onDayClick: (day: number) => void
    onEventClick: (e: React.MouseEvent, event: CalendarEvent) => void
}

export function CalendarDay({
    day,
    events,
    isToday,
    readOnly,
    onDayClick,
    onEventClick
}: CalendarDayProps) {
    if (!day) {
        return <div className="min-h-[80px] p-1 border-b border-r border-slate-100 bg-slate-50/50" />
    }

    return (
        <div
            onClick={() => onDayClick(day)}
            className={cn(
                "min-h-[80px] p-1 border-b border-r border-slate-100",
                "cursor-pointer hover:bg-slate-50",
                readOnly && "cursor-default"
            )}
        >
            <span className={cn(
                "inline-flex items-center justify-center w-6 h-6 text-body font-medium",
                isToday && "bg-blue-600 text-white rounded-full"
            )}>
                {day}
            </span>
            <div className="mt-1 space-y-0.5">
                {events.slice(0, 3).map(event => (
                    <div
                        key={event.id}
                        onClick={(e) => onEventClick(e, event)}
                        className="text-micro px-1 py-0.5 bg-blue-100 text-blue-700 truncate rounded cursor-pointer hover:bg-blue-200"
                    >
                        {event.title}
                    </div>
                ))}
                {events.length > 3 && (
                    <div className="text-micro text-slate-400 px-1">
                        +{events.length - 3} mais
                    </div>
                )}
            </div>
        </div>
    )
}
