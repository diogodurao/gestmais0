import { OccurrenceStatus } from "@/lib/types"
import { OCCURRENCE_STATUS_CONFIG } from "@/lib/constants"
import { cn } from "@/lib/utils"

interface Props {
    status: OccurrenceStatus
    className?: string
}

export function StatusBadge({ status, className }: Props) {
    const config = OCCURRENCE_STATUS_CONFIG[status]

    return (
        <span className={cn(
            "inline-flex items-center px-2 py-0.5 rounded text-label font-medium",
            config.color,
            className
        )}>
            {config.label}
        </span>
    )
}