"use client"

import { useState } from "react"
import { Button } from "../components/ui/Button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "../components/ui/Card"
import { Badge } from "../components/ui/Badge"
import { Avatar } from "../components/ui/Avatar"
import { StatCard } from "../components/ui/Stat-Card"
import { Progress } from "../components/ui/Progress"
import { Alert } from "../components/ui/Alert"
import { Divider } from "../components/ui/Divider"
import { List, ListItem } from "../components/ui/List"
import { ToastProvider, useToast } from "../components/ui/Toast"
import { cn } from "@/lib/utils"
import {
  DollarSign, Users, Building, Calendar, Bell,
  TrendingUp, TrendingDown, ChevronRight, Copy,
  MessageSquare, Vote, FileText, AlertTriangle,
  CheckCircle, Clock, Star, Eye, RefreshCw,
} from "lucide-react"

// Types
interface Notification {
  id: number
  type: "payment" | "occurrence" | "poll" | "event" | "system"
  title: string
  description: string
  time: string
  read: boolean
}

interface PaymentSummary {
  month: string
  collected: number
  expected: number
  percentage: number
}

interface RecentActivity {
  id: number
  type: "payment" | "occurrence" | "poll" | "discussion"
  title: string
  user: string
  time: string
}

// Mock data
const mockNotifications: Notification[] = [
  { id: 1, type: "payment", title: "Pagamento recebido", description: "Maria Silva pagou a quota de Janeiro", time: "Há 2 min", read: false },
  { id: 2, type: "occurrence", title: "Nova ocorrência", description: "Problema reportado no elevador", time: "Há 15 min", read: false },
  { id: 3, type: "poll", title: "Votação terminada", description: "Pintura exterior - resultado disponível", time: "Há 1 hora", read: true },
  { id: 4, type: "event", title: "Lembrete", description: "Reunião de condomínio amanhã às 19h", time: "Há 3 horas", read: true },
]

const mockPayments: PaymentSummary[] = [
  { month: "Janeiro", collected: 425000, expected: 510000, percentage: 83 },
  { month: "Dezembro", collected: 489000, expected: 510000, percentage: 96 },
  { month: "Novembro", collected: 459000, expected: 510000, percentage: 90 },
]

const mockActivities: RecentActivity[] = [
  { id: 1, type: "payment", title: "Quota paga", user: "Maria Silva - 1A", time: "Há 2 min" },
  { id: 2, type: "occurrence", title: "Ocorrência criada", user: "João Santos - 1B", time: "Há 15 min" },
  { id: 3, type: "discussion", title: "Comentário adicionado", user: "Ana Costa - 2A", time: "Há 30 min" },
  { id: 4, type: "poll", title: "Voto registado", user: "Pedro Lima - 2B", time: "Há 1 hora" },
]

// Utility
function formatCurrency(cents: number): string {
  return `€${(cents / 100).toFixed(0)}`
}

// Notification Icon
function NotificationIcon({ type }: { type: Notification["type"] }) {
  const iconMap = {
    payment: <DollarSign className="h-3 w-3 text-[#6A9B72]" />,
    occurrence: <AlertTriangle className="h-3 w-3 text-[#B8963E]" />,
    poll: <Vote className="h-3 w-3 text-[#6C757D]" />,
    event: <Calendar className="h-3 w-3 text-[#6C757D]" />,
    system: <Bell className="h-3 w-3 text-[#6C757D]" />,
  }
  return iconMap[type]
}

// Activity Icon
function ActivityIcon({ type }: { type: RecentActivity["type"] }) {
  const iconMap = {
    payment: <DollarSign className="h-3 w-3" />,
    occurrence: <AlertTriangle className="h-3 w-3" />,
    poll: <Vote className="h-3 w-3" />,
    discussion: <MessageSquare className="h-3 w-3" />,
  }
  return iconMap[type]
}

// Quick Action Card
function QuickActionCard({
  icon,
  label,
  count,
  href,
}: {
  icon: React.ReactNode
  label: string
  count?: number
  href: string
}) {
  return (
    <a
      href={href}
      className="flex items-center gap-1.5 rounded-lg border border-[#E9ECEF] bg-white p-1.5 transition-colors hover:bg-[#F8F9FA] hover:border-[#DEE2E6]"
    >
      <div className="flex h-8 w-8 items-center justify-center rounded bg-[#F8F9FA] text-[#6C757D]">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-medium text-[#495057] truncate">{label}</p>
        {count !== undefined && (
          <p className="text-[9px] text-[#8E9AAF]">{count} pendentes</p>
        )}
      </div>
      <ChevronRight className="h-3 w-3 text-[#DEE2E6]" />
    </a>
  )
}

// Main Content
function OverviewContent() {
  const { addToast } = useToast()
  const [inviteCode] = useState("COND-2025-XY7K")

  const copyInviteCode = () => {
    navigator.clipboard.writeText(inviteCode)
    addToast({
      variant: "success",
      title: "Código copiado",
      description: "O código de convite foi copiado para a área de transferência.",
    })
  }

  // Calculate overall stats
  const totalUnits = 6
  const occupiedUnits = 5
  const occupancyRate = Math.round((occupiedUnits / totalUnits) * 100)
  const totalCollected = 425000
  const totalExpected = 510000
  const collectionRate = Math.round((totalCollected / totalExpected) * 100)
  const pendingOccurrences = 3
  const activePolls = 2

  return (
    <div className="flex-1 overflow-y-auto p-1.5">
      {/* Header */}
      <div className="mb-1.5">
        <h1 className="text-[14px] font-semibold text-[#343A40]">Painel de Controlo</h1>
        <p className="text-[10px] text-[#8E9AAF]">Bem-vindo de volta. Aqui está o resumo do seu condomínio.</p>
      </div>

      {/* Alert */}
      <Alert variant="info" className="mb-1.5" dismissible onDismiss={() => {}}>
        Próxima reunião de condomínio agendada para 15 de Janeiro às 19h00.
      </Alert>

      {/* Stats Grid */}
      <div className="mb-1.5 grid grid-cols-2 gap-1.5 lg:grid-cols-4">
        <StatCard
          label="Total Cobrado"
          value={formatCurrency(totalCollected)}
          change={{ value: `${collectionRate}%`, positive: true }}
          icon={<DollarSign className="h-4 w-4" />}
        />
        <StatCard
          label="Frações"
          value={`${occupiedUnits}/${totalUnits}`}
          change={{ value: `${occupancyRate}% ocupadas`, positive: true }}
          icon={<Building className="h-4 w-4" />}
        />
        <StatCard
          label="Ocorrências"
          value={pendingOccurrences.toString()}
          change={{ value: "pendentes", positive: false }}
          icon={<AlertTriangle className="h-4 w-4" />}
        />
        <StatCard
          label="Votações"
          value={activePolls.toString()}
          change={{ value: "ativas", positive: true }}
          icon={<Vote className="h-4 w-4" />}
        />
      </div>

      {/* Main Grid */}
      <div className="grid gap-1.5 lg:grid-cols-3">
        {/* Left Column - 2 cols */}
        <div className="lg:col-span-2 space-y-1.5">
          {/* Payment Status */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Estado dos Pagamentos</CardTitle>
                <Button variant="ghost" size="sm">
                  Ver todos <ChevronRight className="h-3 w-3" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-1.5">
                {mockPayments.map((payment, idx) => (
                  <div key={idx}>
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-[10px] text-[#8E9AAF]">{payment.month}</span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-medium text-[#495057]">
                          {formatCurrency(payment.collected)} / {formatCurrency(payment.expected)}
                        </span>
                        <Badge variant={payment.percentage >= 90 ? "success" : payment.percentage >= 70 ? "warning" : "error"}>
                          {payment.percentage}%
                        </Badge>
                      </div>
                    </div>
                    <Progress value={payment.percentage} />
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <div className="flex items-center justify-between w-full text-[10px]">
                <span className="text-[#8E9AAF]">Média de cobrança: <span className="font-medium text-[#495057]">90%</span></span>
                <span className="text-[#6A9B72]">
                  <TrendingUp className="h-3 w-3 inline mr-0.5" />
                  +5% vs. mês anterior
                </span>
              </div>
            </CardFooter>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Ações Rápidas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4">
                <QuickActionCard
                  icon={<DollarSign className="h-4 w-4" />}
                  label="Quotas"
                  count={2}
                  href="/test/quotas"
                />
                <QuickActionCard
                  icon={<AlertTriangle className="h-4 w-4" />}
                  label="Ocorrências"
                  count={3}
                  href="/test/occurrences"
                />
                <QuickActionCard
                  icon={<Vote className="h-4 w-4" />}
                  label="Votações"
                  count={2}
                  href="/test/polls"
                />
                <QuickActionCard
                  icon={<Calendar className="h-4 w-4" />}
                  label="Agenda"
                  href="/test/calendar"
                />
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Atividade Recente</CardTitle>
                <Button variant="ghost" size="sm">
                  <RefreshCw className="h-3 w-3" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-[#F1F3F5]">
                {mockActivities.map((activity) => (
                  <div key={activity.id} className="flex items-center gap-1.5 p-1.5">
                    <div className="flex h-6 w-6 items-center justify-center rounded bg-[#F8F9FA] text-[#8E9AAF]">
                      <ActivityIcon type={activity.type} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-medium text-[#495057] truncate">{activity.title}</p>
                      <p className="text-[9px] text-[#8E9AAF] truncate">{activity.user}</p>
                    </div>
                    <span className="text-[9px] text-[#ADB5BD] shrink-0">{activity.time}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-1.5">
          {/* Building Info */}
          <Card>
            <CardHeader>
              <CardTitle>Informação do Edifício</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5">
                  <Building className="h-4 w-4 text-[#8E9AAF]" />
                  <div>
                    <p className="text-[11px] font-medium text-[#495057]">Edifício Exemplo</p>
                    <p className="text-[9px] text-[#8E9AAF]">Rua Principal, 123</p>
                  </div>
                </div>

                <Divider />

                <div className="space-y-1">
                  <div className="flex justify-between text-[10px]">
                    <span className="text-[#8E9AAF]">Frações</span>
                    <span className="font-medium text-[#495057]">{totalUnits}</span>
                  </div>
                  <div className="flex justify-between text-[10px]">
                    <span className="text-[#8E9AAF]">Ocupadas</span>
                    <span className="font-medium text-[#495057]">{occupiedUnits}</span>
                  </div>
                  <div className="flex justify-between text-[10px]">
                    <span className="text-[#8E9AAF]">Quota Mensal</span>
                    <span className="font-medium text-[#495057]">€85,00</span>
                  </div>
                </div>

                <Divider />

                {/* Invite Code */}
                <div>
                  <p className="text-[9px] font-medium text-[#8E9AAF] uppercase tracking-wide mb-1">
                    Código de Convite
                  </p>
                  <div className="flex items-center gap-1.5">
                    <code className="flex-1 rounded bg-[#F8F9FA] px-1.5 py-1 text-[11px] font-mono text-[#495057] border border-[#E9ECEF]">
                      {inviteCode}
                    </code>
                    <Button variant="outline" size="sm" onClick={copyInviteCode}>
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Notificações</CardTitle>
                <Badge variant="info">{mockNotifications.filter(n => !n.read).length}</Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-[#F1F3F5]">
                {mockNotifications.slice(0, 4).map((notification) => (
                  <div
                    key={notification.id}
                    className={cn(
                      "flex items-start gap-1.5 p-1.5 transition-colors hover:bg-[#F8F9FA]",
                      !notification.read && "bg-[#F8F9FA]"
                    )}
                  >
                    <div className="flex h-6 w-6 items-center justify-center rounded bg-white border border-[#E9ECEF]">
                      <NotificationIcon type={notification.type} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={cn(
                        "text-[10px] truncate",
                        !notification.read ? "font-medium text-[#495057]" : "text-[#6C757D]"
                      )}>
                        {notification.title}
                      </p>
                      <p className="text-[9px] text-[#8E9AAF] truncate">{notification.description}</p>
                    </div>
                    <span className="text-[8px] text-[#ADB5BD] shrink-0">{notification.time}</span>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="ghost" size="sm" className="w-full">
                Ver todas as notificações
              </Button>
            </CardFooter>
          </Card>

          {/* Monthly Evaluation Widget */}
          <Card>
            <CardHeader>
              <CardTitle>Avaliação Mensal</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="flex items-center justify-center gap-0.5 mb-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={cn(
                        "h-4 w-4",
                        star <= 4 ? "fill-[#B8963E] text-[#B8963E]" : "text-[#DEE2E6]"
                      )}
                    />
                  ))}
                </div>
                <p className="text-[12px] font-semibold text-[#495057]">4.2</p>
                <p className="text-[9px] text-[#8E9AAF]">Média de Janeiro</p>
              </div>

              <Divider className="my-1.5" />

              <div className="space-y-1">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-[#8E9AAF]">Respostas</span>
                  <span className="font-medium text-[#495057]">4/6</span>
                </div>
                <Progress value={67} size="sm" />
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" size="sm" className="w-full">
                Ver detalhes
              </Button>
            </CardFooter>
          </Card>

          {/* System Status */}
          <Card>
            <CardHeader>
              <CardTitle>Estado do Sistema</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1 text-[10px] text-[#8E9AAF]">
                    <CheckCircle className="h-3 w-3 text-[#6A9B72]" />
                    Sincronização
                  </span>
                  <Badge variant="success">Ativo</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1 text-[10px] text-[#8E9AAF]">
                    <Clock className="h-3 w-3 text-[#8E9AAF]" />
                    Última atualização
                  </span>
                  <span className="text-[10px] text-[#495057]">Há 2 min</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default function OverviewPage() {
  return (
    <ToastProvider>
      <div className="h-full bg-white">
        <OverviewContent />
      </div>
    </ToastProvider>
  )
}
