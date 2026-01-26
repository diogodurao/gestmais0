import { cn } from "@/lib/utils"
import { CalendarEvent } from "@/lib/types"

interface CalendarDayProps {
    day: number | null
    isCurrentMonth: boolean
    events: CalendarEvent[]
    isToday: boolean
    isSelected: boolean
    onClick: () => void
}

function getEventDotClass(type: string) {
    switch (type) {
        case "meeting": return "bg-primary"
        case "maintenance": return "bg-warning"
        case "deadline": return "bg-error"
        default: return "bg-gray-500"
    }
}

export function CalendarDay({
    day,
    isCurrentMonth,
    events,
    isToday,
    isSelected,
    onClick
}: CalendarDayProps) {
    if (!day) {
        return <div className="min-h-[48px] sm:min-h-[64px]" />
    }

    return (
        <button
            onClick={onClick}
            className={cn(
                "relative flex flex-col items-center p-1 min-h-[48px] sm:min-h-[64px] rounded transition-colors",
                isCurrentMonth ? "hover:bg-gray-100" : "opacity-40",
                isSelected && "bg-primary-light hover:bg-primary-light",
                isToday && !isSelected && "ring-1 ring-primary"
            )}
        >
            <span className={cn(
                "text-body font-medium",
                isSelected ? "text-primary-dark" : isCurrentMonth ? "text-gray-600" : "text-gray-400",
                isToday && "font-bold"
            )}>
                {day}
            </span>
            {events.length > 0 && (
                <div className="flex gap-0.5 mt-0.5 flex-wrap justify-center">
                    {events.slice(0, 3).map((event, idx) => (
                        <span
                            key={idx}
                            className={cn("w-1.5 h-1.5 rounded-full", getEventDotClass(event.type))}
                        />
                    ))}
                </div>
            )}
        </button>
    )
}
