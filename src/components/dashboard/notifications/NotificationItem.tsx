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
            className={cn(
                "flex items-start gap-3 p-3 cursor-pointer transition-colors",
                notification.isRead
                    ? "bg-white hover:bg-gray-50"
                    : "bg-info-light hover:bg-secondary-light"
            )}
        >
            {/* Icon */}
            <span className="text-heading">
                {NOTIFICATION_ICONS[notification.type]}
            </span>

            {/* Content */}
            <div className="flex-1 min-w-0">
                <p className={cn(
                    "text-body",
                    notification.isRead ? "text-gray-700" : "text-gray-900 font-medium"
                )}>
                    {notification.title}
                </p>
                {notification.message && (
                    <p className="text-label text-gray-500 truncate">
                        {notification.message}
                    </p>
                )}
                <p className="text-label text-gray-400 mt-1">
                    {formatDistanceToNow(notification.createdAt)}
                </p>
            </div>

            {/* Unread indicator */}
            {!notification.isRead && (
                <div className="w-2 h-2 rounded-full bg-primary mt-2" />
            )}

            {/* Dismiss button */}
            {showDismiss && (
                <button
                    onClick={handleDismiss}
                    className="p-1 hover:bg-gray-200 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                >
                    <X className="w-4 h-4 text-gray-400" />
                </button>
            )}
        </div>
    )
}