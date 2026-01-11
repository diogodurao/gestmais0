import { ChevronLeft, ChevronRight, Plus } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { CardHeader, CardTitle } from "@/components/ui/Card"

interface CalendarHeaderProps {
    monthName: string
    year: number
    onNavigate: (delta: number) => void
    onAddEvent: () => void
    isPending: boolean
    readOnly?: boolean
}

export function CalendarHeader({
    monthName,
    year,
    onNavigate,
    onAddEvent,
    isPending,
    readOnly
}: CalendarHeaderProps) {
    return (
        <CardHeader>
            <div className="flex items-center justify-between w-full">
                <CardTitle>Agenda do Edifício</CardTitle>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => onNavigate(-1)} disabled={isPending}>
                        <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <span className="text-body font-bold min-w-[140px] text-center">
                        {monthName} {year}
                    </span>
                    <Button variant="outline" size="sm" onClick={() => onNavigate(1)} disabled={isPending}>
                        <ChevronRight className="w-4 h-4" />
                    </Button>
                    {!readOnly && (
                        <Button size="sm" onClick={onAddEvent}>
                            <Plus className="w-4 h-4 mr-1" /> Evento
                        </Button>
                    )}
                </div>
            </div>
        </CardHeader>
    )
}
