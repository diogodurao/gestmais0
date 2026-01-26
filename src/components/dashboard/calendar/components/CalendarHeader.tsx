import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { IconButton } from "@/components/ui/Icon-Button"
import { CardHeader } from "@/components/ui/Card"

interface CalendarHeaderProps {
    monthName: string
    year: number
    onNavigate: (delta: number) => void
    onGoToToday: () => void
    isPending: boolean
}

export function CalendarHeader({
    monthName,
    year,
    onNavigate,
    onGoToToday,
    isPending
}: CalendarHeaderProps) {
    return (
        <CardHeader>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                    <IconButton
                        size="sm"
                        variant="default"
                        icon={<ChevronLeft className="h-3 w-3" />}
                        label="Mês anterior"
                        onClick={() => onNavigate(-1)}
                        disabled={isPending}
                    />
                    <IconButton
                        size="sm"
                        variant="default"
                        icon={<ChevronRight className="h-3 w-3" />}
                        label="Próximo mês"
                        onClick={() => onNavigate(1)}
                        disabled={isPending}
                    />
                    <span className="text-base font-medium text-gray-600 ml-1">
                        {monthName} {year}
                    </span>
                </div>
                <Button variant="outline" size="sm" onClick={onGoToToday} disabled={isPending}>
                    <CalendarIcon className="h-3 w-3" />
                    <span className="hidden sm:inline ml-1">Hoje</span>
                </Button>
            </div>
        </CardHeader>
    )
}
