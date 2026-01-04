import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card"
import { NotificationItem } from "./NotificationItem"
import { Notification } from "@/lib/types"

interface Props {
    notifications: Notification[]
}

export function NotificationCard({ notifications }: Props) {
    const displayNotifications = notifications.slice(0, 5)

    return (
        <Card>
            <CardHeader>
                <CardTitle>Atividade Recente</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
                {displayNotifications.length === 0 ? (
                    <p className="text-body text-slate-500 text-center py-6">
                        Sem atividade recente
                    </p>
                ) : (
                    <div className="divide-y divide-slate-100">
                        {displayNotifications.map(notification => (
                            <NotificationItem
                                key={notification.id}
                                notification={notification}
                            />
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}