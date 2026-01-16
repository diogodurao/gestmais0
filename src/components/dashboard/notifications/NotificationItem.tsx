"use client"

import { useRouter } from "next/navigation"
import { X } from "lucide-react"
import { Notification } from "@/lib/types"
import { NOTIFICATION_ICONS } from "@/lib/constants/ui"
import { markNotificationAsRead, deleteNotification } from "@/lib/actions/notification"
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
            className="flex items-start gap-1.5 px-2 py-1.5 cursor-pointer hover:bg-gray-50 transition-colors"
        >
            {/* Unread indicator */}
            <div className="w-1.5 h-1.5 mt-1 flex-shrink-0">
                {!notification.isRead && (
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                )}
            </div>

            {/* Icon */}
            <span className="text-label">
                {NOTIFICATION_ICONS[notification.type]}
            </span>

            {/* Content */}
            <div className="flex-1 min-w-0">
                <p className={cn(
                    "text-label leading-tight text-gray-700",
                    !notification.isRead && "font-medium"
                )}>
                    {notification.title}
                </p>
                {notification.message && (
                    <p className="text-xs text-gray-500 truncate">
                        {notification.message}
                    </p>
                )}
                <p className="text-xs text-gray-400">
                    {formatDistanceToNow(notification.createdAt)}
                </p>
            </div>

            {/* Dismiss button */}
            {showDismiss && (
                <button
                    onClick={handleDismiss}
                    className="p-0.5 hover:bg-gray-200 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                >
                    <X className="w-3 h-3 text-gray-400" />
                </button>
            )}
        </div>
    )
}