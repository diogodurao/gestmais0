"use client"

import { useEffect, useState, useTransition } from "react"
import { Check } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { NotificationItem } from "./NotificationItem"
import { Notification } from "@/lib/types"
import { getNotifications, markAllNotificationsAsRead } from "@/lib/actions/notification"

interface Props {
    isOpen: boolean
    onClose: () => void
    onCountChange?: (count: number) => void
}

export function NotificationDropdown({ isOpen, onClose, onCountChange }: Props) {
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [isPending, startTransition] = useTransition()

    const fetchNotifications = () => {
        startTransition(async () => {
            const data = await getNotifications(10)
            setNotifications(data)
            const unreadCount = data.filter(n => !n.isRead).length
            onCountChange?.(unreadCount)
        })
    }

    useEffect(() => {
        if (isOpen) {
            fetchNotifications()
        }
    }, [isOpen])

    const handleMarkAllRead = async () => {
        await markAllNotificationsAsRead()
        fetchNotifications()
    }

    const handleAction = () => {
        fetchNotifications()
        onClose()
    }

    if (!isOpen) return null

    const unreadCount = notifications.filter(n => !n.isRead).length

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 z-40"
                onClick={onClose}
            />

            {/* Dropdown */}
            <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-lg shadow-md border border-gray-200 z-50 overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-3 border-b border-gray-200">
                    <h3 className="text-body font-semibold text-gray-700">
                        Notificações
                    </h3>
                    {unreadCount > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleMarkAllRead}
                            className="text-label"
                        >
                            <Check className="w-4 h-4 mr-1" />
                            Marcar todas
                        </Button>
                    )}
                </div>

                {/* List */}
                <div className="max-h-96 overflow-y-auto divide-y divide-gray-100">
                    {notifications.length === 0 ? (
                        <p className="text-body text-gray-500 text-center py-8">
                            Sem notificações
                        </p>
                    ) : (
                        notifications.map(notification => (
                            <NotificationItem
                                key={notification.id}
                                notification={notification}
                                onAction={handleAction}
                                showDismiss={false}
                            />
                        ))
                    )}
                </div>
            </div>
        </>
    )
}