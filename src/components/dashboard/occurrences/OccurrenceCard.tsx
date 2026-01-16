import { MessageSquare, ChevronRight, User } from "lucide-react"
import { Badge } from "@/components/ui/Badge"
import { Occurrence, OccurrencePriority } from "@/lib/types"
import { formatDistanceToNow } from "@/lib/format"
import { OCCURRENCE_STATUS_CONFIG, OCCURRENCE_PRIORITY_CONFIG } from "@/lib/constants/ui"
import { cn } from "@/lib/utils"

interface Props {
    occurrence: Occurrence
    onClick: () => void
}

export function OccurrenceCard({ occurrence, onClick }: Props) {
    const statusConfig = OCCURRENCE_STATUS_CONFIG[occurrence.status]
    const priorityConfig = OCCURRENCE_PRIORITY_CONFIG[occurrence.priority as OccurrencePriority] || OCCURRENCE_PRIORITY_CONFIG.medium

    return (
        <div
            onClick={onClick}
            className="rounded-lg border border-[#E9ECEF] bg-white p-1.5 transition-colors hover:bg-[#F8F9FA] hover:border-[#DEE2E6] cursor-pointer"
        >
            <div className="flex items-start justify-between gap-1.5 mb-1">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1 mb-0.5">
                        <Badge variant={statusConfig.variant}>{statusConfig.label}</Badge>
                        <span className={cn("px-1 py-0.5 rounded text-[8px] font-medium", priorityConfig.bg, priorityConfig.color)}>
                            {priorityConfig.label}
                        </span>
                    </div>
                    <h3 className="text-[11px] font-medium text-[#495057] truncate">{occurrence.title}</h3>
                </div>
                <ChevronRight className="h-4 w-4 text-[#DEE2E6] shrink-0" />
            </div>

            {occurrence.description && (
                <p className="text-[10px] text-[#8E9AAF] line-clamp-2 mb-1.5">{occurrence.description}</p>
            )}

            <div className="flex items-center justify-between text-[9px] text-[#ADB5BD]">
                <div className="flex items-center gap-0.5">
                    <User className="h-3 w-3" />
                    <span>{occurrence.creatorName}</span>
                </div>
                <div className="flex items-center gap-2">
                    {(occurrence.commentCount ?? 0) > 0 && (
                        <span className="flex items-center gap-0.5">
                            <MessageSquare className="h-3 w-3" />
                            {occurrence.commentCount}
                        </span>
                    )}
                    <span>{formatDistanceToNow(occurrence.createdAt)}</span>
                </div>
            </div>
        </div>
    )
}