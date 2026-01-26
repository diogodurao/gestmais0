"use client"

import { MessageCircle, Pin, Lock, ChevronRight } from "lucide-react"
import { Avatar } from "@/components/ui/Avatar"
import { Discussion } from "@/lib/types"
import { formatDistanceToNow } from "@/lib/format"
import { cn } from "@/lib/utils"

interface Props {
    discussion: Discussion
    onClick: () => void
}

export function DiscussionCard({ discussion, onClick }: Props) {
    return (
        <div
            onClick={onClick}
            className={cn(
                "rounded-lg border border-gray-200 bg-white p-1.5 transition-colors hover:bg-gray-100 hover:border-gray-300 cursor-pointer",
                discussion.isPinned && "border-primary-light bg-primary-light"
            )}
        >
            <div className="flex items-start gap-1.5">
                <Avatar size="sm" fallback={discussion.creatorName?.charAt(0) || "?"} alt={discussion.creatorName || ""} />
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1 mb-0.5 flex-wrap">
                        {discussion.isPinned && (
                            <Pin className="h-3 w-3 text-primary" />
                        )}
                        {discussion.isClosed && (
                            <span className="inline-flex items-center gap-0.5 px-1 py-0.5 rounded text-micro font-medium bg-gray-100 text-gray-500">
                                <Lock className="w-2.5 h-2.5" />
                                Encerrada
                            </span>
                        )}
                        <span className="text-xs text-secondary">
                            {discussion.creatorName}
                        </span>
                        <span className="text-xs text-gray-400">•</span>
                        <span className="text-xs text-gray-400">{formatDistanceToNow(discussion.lastActivityAt)}</span>
                    </div>

                    <h3 className="text-body font-medium text-gray-600 line-clamp-1 mb-0.5">{discussion.title}</h3>

                    {discussion.content && (
                        <p className="text-label text-secondary line-clamp-2">{discussion.content}</p>
                    )}

                    <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-400">
                        <span className="flex items-center gap-0.5">
                            <MessageCircle className="h-3 w-3" />
                            {discussion.commentCount || 0}
                        </span>
                    </div>
                </div>
                <ChevronRight className="h-4 w-4 text-gray-300 shrink-0" />
            </div>
        </div>
    )
}