import Link from "next/link"
import { Users } from "lucide-react"
import { Card } from "@/components/ui/Card"
import { PollStatusBadge } from "./PollStatusBadge"
import { Poll } from "@/lib/types"
import { POLL_TYPE_CONFIG, WEIGHT_MODE_CONFIG } from "@/lib/constants"
import { formatDistanceToNow } from "@/lib/format"

interface Props {
    poll: Poll
    hasVoted?: boolean
}

export function PollCard({ poll, hasVoted }: Props) {
    return (
        <Link href={`/dashboard/polls/${poll.id}`}>
            <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer">
                <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                        <PollStatusBadge status={poll.status} />
                        {hasVoted && (
                            <span className="text-label text-blue-600 font-medium">
                                ✓ Votou
                            </span>
                        )}
                    </div>
                    <span className="text-label text-slate-400">
                        {formatDistanceToNow(poll.createdAt)}
                    </span>
                </div>

                <h3 className="text-body font-bold text-slate-900 mb-1">
                    {poll.title}
                </h3>

                {poll.description && (
                    <p className="text-body text-slate-600 line-clamp-2 mb-3">
                        {poll.description}
                    </p>
                )}

                <div className="flex items-center justify-between text-label text-slate-500">
                    <div className="flex items-center gap-3">
                        <span>{POLL_TYPE_CONFIG[poll.type].label}</span>
                        <span>•</span>
                        <span>{WEIGHT_MODE_CONFIG[poll.weightMode].label}</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5" />
                        <span>{poll.voteCount || 0} votos</span>
                    </div>
                </div>
            </Card>
        </Link>
    )
}