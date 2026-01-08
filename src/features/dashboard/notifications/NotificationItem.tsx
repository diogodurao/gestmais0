"use client"

import { useRouter } from "next/navigation"
import { X } from "lucide-react"
import { Notification } from "@/lib/types"
import { NOTIFICATION_ICONS } from "@/lib/constants/ui"
import { markNotificationAsRead, deleteNotification } from "@/app/actions/notification"
import { formatDistanceToNow } from "@/lib/format"
import { cn } from "@/lib/utils"

interface Props {
    notification: Notification
    onAction?: () => void
    showDismiss?: boolean
}

export function NotificationItem({ notification, onAction, showDismiss = true }: Props) {
    const router = useRouter()

    const handleClick = async () => {
        if (!notification.isRead) {
            await markNotificationAsRead(notification.id)
        }

        if (notification.link) {
            router.push(notification.link)
        }

        onAction?.()
    }

    const handleDismiss = async (e: React.MouseEvent) => {
        e.stopPropagation()
        await deleteNotification(notification.id)
        onAction?.()
    }

    return (
        <div
            onClick={handleClick}
            className={cn(
                "flex items-start gap-3 p-3 cursor-pointer transition-colors",
                notification.isRead
                    ? "bg-white hover:bg-slate-50"
                    : "bg-blue-50 hover:bg-blue-100"
            )}
        >
            {/* Icon */}
            <span className="text-lg">
                {NOTIFICATION_ICONS[notification.type]}
            </span>

            {/* Content */}
            <div className="flex-1 min-w-0">
                <p className={cn(
                    "text-body",
                    notification.isRead ? "text-slate-700" : "text-slate-900 font-medium"
                )}>
                    {notification.title}
                </p>
                {notification.message && (
                    <p className="text-label text-slate-500 truncate">
                        {notification.message}
                    </p>
                )}
                <p className="text-label text-slate-400 mt-1">
                    {formatDistanceToNow(notification.createdAt)}
                </p>
            </div>

            {/* Unread indicator */}
            {!notification.isRead && (
                <div className="w-2 h-2 rounded-full bg-blue-500 mt-2" />
            )}

            {/* Dismiss button */}
            {showDismiss && (
                <button
                    onClick={handleDismiss}
                    className="p-1 hover:bg-slate-200 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                >
                    <X className="w-4 h-4 text-slate-400" />
                </button>
            )}
        </div>
    )
}