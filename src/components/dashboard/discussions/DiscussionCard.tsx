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
                "rounded-lg border border-[#E9ECEF] bg-white p-1.5 transition-colors hover:bg-[#F8F9FA] hover:border-[#DEE2E6] cursor-pointer",
                discussion.isPinned && "border-[#D4E5D7] bg-[#F8FAF8]"
            )}
        >
            <div className="flex items-start gap-1.5">
                <Avatar size="sm" fallback={discussion.creatorName?.charAt(0) || "?"} alt={discussion.creatorName || ""} />
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1 mb-0.5 flex-wrap">
                        {discussion.isPinned && (
                            <Pin className="h-3 w-3 text-[#8FB996]" />
                        )}
                        {discussion.isClosed && (
                            <span className="inline-flex items-center gap-0.5 px-1 py-0.5 rounded text-[8px] font-medium bg-[#F1F3F5] text-[#6C757D]">
                                <Lock className="w-2.5 h-2.5" />
                                Encerrada
                            </span>
                        )}
                        <span className="text-[9px] text-[#8E9AAF]">
                            {discussion.creatorName}
                        </span>
                        <span className="text-[9px] text-[#ADB5BD]">•</span>
                        <span className="text-[9px] text-[#ADB5BD]">{formatDistanceToNow(discussion.lastActivityAt)}</span>
                    </div>

                    <h3 className="text-[11px] font-medium text-[#495057] line-clamp-1 mb-0.5">{discussion.title}</h3>

                    {discussion.content && (
                        <p className="text-[10px] text-[#8E9AAF] line-clamp-2">{discussion.content}</p>
                    )}

                    <div className="flex items-center gap-3 mt-1.5 text-[9px] text-[#ADB5BD]">
                        <span className="flex items-center gap-0.5">
                            <MessageCircle className="h-3 w-3" />
                            {discussion.commentCount || 0}
                        </span>
                    </div>
                </div>
                <ChevronRight className="h-4 w-4 text-[#DEE2E6] shrink-0" />
            </div>
        </div>
    )
}