import Link from "next/link"
import { MessageCircle, Pin, Lock } from "lucide-react"
import { Card } from "@/components/ui/Card"
import { Discussion } from "@/lib/types"
import { formatDistanceToNow } from "@/lib/format"
import { cn } from "@/lib/utils"

interface Props {
    discussion: Discussion
}

export function DiscussionCard({ discussion }: Props) {
    return (
        <Link href={`/dashboard/discussions/${discussion.id}`}>
            <Card className={cn(
                "p-4 hover:shadow-md transition-shadow cursor-pointer",
                discussion.isPinned && "border-l-4 border-l-blue-500"
            )}>
                <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                        {discussion.isPinned && (
                            <Pin className="w-4 h-4 text-info" />
                        )}
                        {discussion.isClosed && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-label font-medium bg-gray-100 text-gray-600">
                                <Lock className="w-3 h-3" />
                                Encerrada
                            </span>
                        )}
                    </div>
                    <span className="text-label text-gray-400">
                        {formatDistanceToNow(discussion.lastActivityAt)}
                    </span>
                </div>

                <h3 className="text-body font-bold text-gray-900 mb-1">
                    {discussion.title}
                </h3>

                {discussion.content && (
                    <p className="text-body text-gray-600 line-clamp-2 mb-3">
                        {discussion.content}
                    </p>
                )}

                <div className="flex items-center justify-between text-label text-gray-500">
                    <div className="flex items-center gap-1">
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>{discussion.commentCount || 0} comentários</span>
                    </div>
                    <span>{discussion.creatorName}</span>
                </div>
            </Card>
        </Link>
    )
}