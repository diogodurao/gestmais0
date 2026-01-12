"use client"

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../ui/card"
import { List, ListItem } from "../ui/list"
import { Badge } from "../ui/badge"
import { Bell, AlertCircle, FileText } from "lucide-react"

// Types
export type NotificationType = "warning" | "info" | "default"

export interface Notification {
  id: number
  title: string
  description: string
  type: NotificationType
  time: string
}

interface NotificationsPanelProps {
  notifications: Notification[]
  onNotificationClick?: (notification: Notification) => void
}

export function NotificationsPanel({ notifications, onNotificationClick }: NotificationsPanelProps) {
  const getTypeIcon = (type: NotificationType) => {
    switch (type) {
      case "warning":
        return <AlertCircle className="w-4 h-4 text-[#B8963E]" />
      case "info":
        return <Bell className="w-4 h-4 text-[#5B8FB9]" />
      default:
        return <FileText className="w-4 h-4 text-[#8E9AAF]" />
    }
  }

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
          <Badge>{notifications.length}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <List variant="divided">
          {notifications.map((notif) => (
            <ListItem
              key={notif.id}
              title={notif.title}
              description={notif.description}
              leading={getTypeIcon(notif.type)}
              trailing={<span className="text-[9px] text-[#ADB5BD]">{notif.time}</span>}
              onClick={onNotificationClick ? () => onNotificationClick(notif) : undefined}
              className={onNotificationClick ? "cursor-pointer hover:bg-[#F8F9FA]" : undefined}
            />
          ))}
        </List>
      </CardContent>
    </Card>
  )
}
