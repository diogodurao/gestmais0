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

function getEventDotColor(type: string) {
    switch (type) {
        case "meeting": return "#8FB996"
        case "maintenance": return "#B8963E"
        case "deadline": return "#B86B73"
        default: return "#6C757D"
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
                            className="w-1.5 h-1.5 rounded-full"
                            style={{ backgroundColor: getEventDotColor(event.type) }}
                        />
                    ))}
                </div>
            )}
        </button>
    )
}
