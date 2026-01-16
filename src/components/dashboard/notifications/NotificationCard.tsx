import { Bell } from "lucide-react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { NotificationItem } from "./NotificationItem"
import { Notification } from "@/lib/types"

interface Props {
    notifications: Notification[]
}

export function NotificationCard({ notifications }: Props) {
    const unreadCount = notifications.filter(n => !n.isRead).length

    return (
        <Card>
            <CardHeader className="pb-1">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                        <Bell className="w-3.5 h-3.5 text-gray-500" />
                        <CardTitle>Notificações</CardTitle>
                    </div>
                    {unreadCount > 0 ? (
                        <Badge variant="warning">{unreadCount} novas</Badge>
                    ) : (
                        <Badge>{notifications.length}</Badge>
                    )}
                </div>
            </CardHeader>
            <CardContent className="p-0">
                {notifications.length === 0 ? (
                    <p className="text-label text-gray-500 text-center py-4">
                        Sem notificações
                    </p>
                ) : (
                    <div className="divide-y divide-gray-100 max-h-52 overflow-y-auto">
                        {notifications.map(notification => (
                            <NotificationItem
                                key={notification.id}
                                notification={notification}
                                showDismiss={false}
                            />
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}