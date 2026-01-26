import { Users, ChevronRight, Calendar } from "lucide-react"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { Poll, PollStatus } from "@/lib/types"
import { POLL_STATUS_CONFIG, POLL_TYPE_CONFIG, WEIGHT_MODE_CONFIG } from "@/lib/constants/ui"
import { formatDistanceToNow } from "@/lib/format"

interface Props {
    poll: Poll
    hasVoted?: boolean
    onClick: () => void
}

export function PollCard({ poll, hasVoted, onClick }: Props) {
    const statusConfig = POLL_STATUS_CONFIG[poll.status as PollStatus]

    return (
        <Card
            className="cursor-pointer hover:border-gray-300 transition-colors"
            onClick={onClick}
        >
            <CardHeader>
                <div className="flex items-start justify-between gap-1.5">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1 mb-0.5">
                            <Badge variant={statusConfig.variant}>{statusConfig.label}</Badge>
                            {hasVoted && <Badge variant="success">Votou</Badge>}
                        </div>
                        <CardTitle className="truncate">{poll.title}</CardTitle>
                    </div>
                    <ChevronRight className="h-4 w-4 text-gray-300 shrink-0" />
                </div>
            </CardHeader>
            <CardContent>
                {poll.description && (
                    <p className="text-label text-secondary line-clamp-2 mb-1.5">{poll.description}</p>
                )}
                <div className="flex items-center gap-2 text-xs text-gray-400">
                    <span>{POLL_TYPE_CONFIG[poll.type].label}</span>
                    <span>•</span>
                    <span>{WEIGHT_MODE_CONFIG[poll.weightMode].label}</span>
                </div>
            </CardContent>
            <CardFooter>
                <div className="flex items-center justify-between w-full text-xs text-secondary">
                    <span className="flex items-center gap-0.5">
                        <Users className="h-3 w-3" />
                        {poll.voteCount || 0} votos
                    </span>
                    <span className="flex items-center gap-0.5">
                        <Calendar className="h-3 w-3" />
                        {formatDistanceToNow(poll.createdAt)}
                    </span>
                </div>
            </CardFooter>
        </Card>
    )
}