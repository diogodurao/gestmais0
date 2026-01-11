"use client"

import { useState, useEffect } from "react"
import { Bell } from "lucide-react"
import { NotificationDropdown } from "./NotificationDropdown"
import { getUnreadCount } from "@/app/actions/notification"
import { cn } from "@/lib/utils"

export function NotificationBell() {
    const [isOpen, setIsOpen] = useState(false)
    const [unreadCount, setUnreadCount] = useState(0)

    useEffect(() => {
        const fetchCount = async () => {
            const count = await getUnreadCount()
            setUnreadCount(count)
        }

        fetchCount()
    }, [])

    const displayCount = unreadCount > 99 ? "99+" : unreadCount

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "relative p-2 rounded-lg transition-colors",
                    isOpen ? "bg-gray-100" : "hover:bg-gray-100"
                )}
            >
                <Bell className="w-5 h-5 text-gray-600" />

                {/* Badge */}
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-4 h-4 flex items-center justify-center px-1 text-label font-semibold text-white bg-error rounded-full">
                        {displayCount}
                    </span>
                )}
            </button>

            <NotificationDropdown
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                onCountChange={setUnreadCount}
            />
        </div>
    )
}