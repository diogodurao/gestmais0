"use client"

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../ui/Card"
import { Badge } from "../ui/Badge"
import { Calendar } from "lucide-react"

// Types
export interface Event {
  id: number
  title: string
  date: string
  time: string
}

interface UpcomingEventsPanelProps {
  events: Event[]
  onEventClick?: (event: Event) => void
}

export function UpcomingEventsPanel({ events, onEventClick }: UpcomingEventsPanelProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-1.5">
          <div className="w-8 h-8 rounded-lg bg-[#E8F0EA] flex items-center justify-center">
            <Calendar className="w-4 h-4 text-[#6A9B72]" />
          </div>
          <div>
            <CardTitle>Próximos Eventos</CardTitle>
            <CardDescription>Agenda do condomínio</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-1.5">
          {events.map((event) => (
            <div
              key={event.id}
              className={`flex items-center justify-between p-1.5 rounded-lg bg-[#F8F9FA] border border-[#E9ECEF] ${onEventClick ? "cursor-pointer hover:border-[#DEE2E6] transition-colors" : ""
                }`}
              onClick={onEventClick ? () => onEventClick(event) : undefined}
            >
              <div>
                <p className="text-[11px] font-medium text-[#495057]">{event.title}</p>
                <p className="text-[10px] text-[#8E9AAF]">{event.date} às {event.time}</p>
              </div>
              <Badge variant="default" size="sm">Agendado</Badge>
            </div>
          ))}

          {events.length === 0 && (
            <p className="text-[10px] text-[#ADB5BD] text-center py-2">
              Nenhum evento agendado
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
