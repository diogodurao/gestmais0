import Link from "next/link"
import { MessageCircle } from "lucide-react"
import { Card } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { Occurrence } from "@/lib/types"
import { formatDistanceToNow } from "@/lib/format"
import { OCCURRENCE_STATUS_CONFIG } from "@/lib/constants/ui"

interface Props {
    occurrence: Occurrence
}

export function OccurrenceCard({ occurrence }: Props) {
    return (
        <Link href={`/dashboard/occurrences/${occurrence.id}`}>
            <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer">
                <div className="flex items-start justify-between mb-2">
                    <Badge status={occurrence.status} config={OCCURRENCE_STATUS_CONFIG} />
                    <span className="text-label text-gray-400">
                        {formatDistanceToNow(occurrence.createdAt)}
                    </span>
                </div>

                <h3 className="text-body font-bold text-gray-900 mb-1">
                    {occurrence.title}
                </h3>

                {occurrence.description && (
                    <p className="text-body text-gray-600 line-clamp-2 mb-3">
                        {occurrence.description}
                    </p>
                )}

                <div className="flex items-center justify-between text-label text-gray-500">
                    <div className="flex items-center gap-1">
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>{occurrence.commentCount || 0} comentários</span>
                    </div>
                    <span>{occurrence.creatorName}</span>
                </div>
            </Card>
        </Link>
    )
}