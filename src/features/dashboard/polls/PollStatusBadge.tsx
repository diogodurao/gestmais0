import { PollStatus } from "@/lib/types"
import { POLL_STATUS_CONFIG } from "@/lib/constants"
import { cn } from "@/lib/utils"

interface Props {
    status: PollStatus
    className?: string
}

export function PollStatusBadge({ status, className }: Props) {
    const config = POLL_STATUS_CONFIG[status]

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