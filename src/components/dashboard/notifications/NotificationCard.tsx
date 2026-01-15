import { Bell } from "lucide-react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { NotificationItem } from "./NotificationItem"
import { Notification } from "@/lib/types"

interface Props {
    notifications: Notification[]
}

export function NotificationCard({ notifications }: Props) {
    const displayNotifications = notifications.slice(0, 5)
    const unreadCount = displayNotifications.filter(n => !n.isRead).length

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                        <div className="w-8 h-8 rounded-lg bg-[#E8F0EA] flex items-center justify-center">
                            <Bell className="w-4 h-4 text-[#6A9B72]" />
                        </div>
                        <div>
                            <CardTitle>Notificações</CardTitle>
                            <CardDescription>Atualizações recentes</CardDescription>
                        </div>
                    </div>
                    {unreadCount > 0 ? (
                        <Badge variant="warning">{unreadCount} novas</Badge>
                    ) : (
                        <Badge>{displayNotifications.length}</Badge>
                    )}
                </div>
            </CardHeader>
            <CardContent className="p-0">
                {displayNotifications.length === 0 ? (
                    <p className="text-[10px] text-[#8E9AAF] text-center py-6">
                        Sem notificações
                    </p>
                ) : (
                    <div className="divide-y divide-[#F1F3F5]">
                        {displayNotifications.map(notification => (
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