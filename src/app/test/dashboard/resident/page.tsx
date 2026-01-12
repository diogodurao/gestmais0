"use client"

import { useState } from "react"
import { Button } from "../../components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../../components/ui/card"
import { Badge } from "../../components/ui/badge"
import { Avatar } from "../../components/ui/avatar"
import { Sheet } from "../../components/ui/sheet"
import { StatCard } from "../../components/ui/stat-card"
import { Alert } from "../../components/ui/alert"
import { ToastProvider, useToast } from "../../components/ui/toast"
import { Progress } from "../../components/ui/progress"
import { List, ListItem, ClickableListItem } from "../../components/ui/list"
import { InfoRow } from "../../components/ui/info-row"
import { cn } from "@/lib/utils"
import {
  Menu, X, ChevronRight,
  Home, FileText, CreditCard, MessageSquare, Settings,
  Building2, Calendar, Bell, CheckCircle2, Clock,
  AlertCircle, Download, Eye, Vote, ClipboardList,
} from "lucide-react"

// =============================================================================
// NAVIGATION (Resident-specific)
// =============================================================================
const navigation = [
  { name: "Resumo", icon: Home, href: "/test/dashboard/resident", active: true },
  { name: "Meus Pagamentos", icon: CreditCard, href: "/test/quotas" },
  { name: "Documentos", icon: FileText, href: "/test/documents" },
  { name: "Ocorrências", icon: AlertCircle, href: "/test/occurrences" },
  { name: "Votações", icon: Vote, href: "/test/polls" },
  { name: "Definições", icon: Settings, href: "/test/settings" },
]

// =============================================================================
// MOCK DATA
// =============================================================================
const myPayments = [
  { id: 1, month: "Janeiro 2025", amount: "85.00", status: "pending", dueDate: "15 Jan" },
  { id: 2, month: "Dezembro 2024", amount: "85.00", status: "paid", paidDate: "10 Dez" },
  { id: 3, month: "Novembro 2024", amount: "85.00", status: "paid", paidDate: "8 Nov" },
  { id: 4, month: "Outubro 2024", amount: "85.00", status: "paid", paidDate: "5 Out" },
]

const myUnit = {
  building: "Edifício Flores",
  address: "Rua das Flores, 123 - Lisboa",
  unit: "2º Esq",
  permillage: 166.67,
  monthlyQuota: 85.00,
}

const notifications = [
  { id: 1, title: "Quota de Janeiro pendente", description: "Prazo até 15 de Janeiro", type: "warning", time: "Há 2 horas" },
  { id: 2, title: "Nova votação disponível", description: "Renovação do elevador", type: "info", time: "Há 1 dia" },
  { id: 3, title: "Documento publicado", description: "Ata da reunião de Dezembro", type: "default", time: "Há 3 dias" },
]

const upcomingEvents = [
  { id: 1, title: "Reunião de Condomínio", date: "15 Jan", time: "19:00" },
  { id: 2, title: "Manutenção do Elevador", date: "18 Jan", time: "09:00" },
]

// =============================================================================
// SHARED COMPONENTS
// =============================================================================
function MobileNav({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <div className="fixed inset-0 bg-black/20" onClick={onClose} />
      <div className="fixed inset-y-0 left-0 w-64 bg-[#F8F8F6] border-r border-[#E9ECEF] p-1.5">
        <div className="flex h-10 items-center justify-between px-1.5">
          <span className="text-[11px] font-semibold text-[#495057]">Residente</span>
          <button onClick={onClose} className="flex h-7 w-7 items-center justify-center rounded text-[#6C757D] hover:bg-[#E9ECEF]">
            <X className="h-4 w-4" />
          </button>
        </div>
        <nav className="mt-1.5 space-y-0.5">
          {navigation.map((item) => (
            <a
              key={item.name}
              href={item.href}
              onClick={onClose}
              className={cn(
                "flex items-center gap-2 rounded px-1.5 py-1.5 text-[10px] transition-colors",
                item.active ? "bg-[#E8F0EA] font-medium text-[#6A9B72]" : "text-[#6C757D] hover:bg-[#E9ECEF]"
              )}
            >
              <item.icon className="h-3.5 w-3.5 flex-shrink-0" />
              {item.name}
            </a>
          ))}
        </nav>
      </div>
    </div>
  )
}

function Sidebar({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  return (
    <aside className={cn(
      "hidden lg:flex flex-col rounded-lg border border-[#E9ECEF] bg-[#F8F8F6] transition-all duration-200",
      collapsed ? "w-12" : "w-48"
    )}>
      <div className="flex h-10 items-center justify-between px-1.5">
        {!collapsed && <span className="text-[11px] font-semibold text-[#495057]">Residente</span>}
        <button onClick={onToggle} className="flex h-7 w-7 items-center justify-center rounded text-[#6C757D] hover:bg-[#E9ECEF]">
          <Menu className="h-4 w-4" />
        </button>
      </div>
      <nav className="flex-1 px-1.5 py-1.5">
        {navigation.map((item) => (
          <a
            key={item.name}
            href={item.href}
            className={cn(
              "flex items-center gap-2 rounded px-1.5 py-1.5 text-[10px] transition-colors",
              item.active ? "bg-[#E8F0EA] font-medium text-[#6A9B72]" : "text-[#6C757D] hover:bg-[#E9ECEF]"
            )}
            title={collapsed ? item.name : undefined}
          >
            <item.icon className="h-3.5 w-3.5 flex-shrink-0" />
            {!collapsed && item.name}
          </a>
        ))}
      </nav>
    </aside>
  )
}

function Header({ onMenuClick }: { onMenuClick: () => void }) {
  return (
    <header className="flex h-10 items-center justify-between rounded-lg border border-[#E9ECEF] bg-[#F8F8F6] px-1.5">
      <div className="flex items-center gap-1.5">
        <button onClick={onMenuClick} className="flex h-7 w-7 items-center justify-center rounded text-[#6C757D] hover:bg-[#E9ECEF] lg:hidden">
          <Menu className="h-4 w-4" />
        </button>
        <Badge variant="default" size="sm">Residente</Badge>
        <span className="text-[12px] font-medium text-[#495057]">A Minha Área</span>
      </div>
      <div className="flex items-center gap-1.5">
        <a href="/test/dashboard/manager" className="text-[9px] text-[#8E9AAF] hover:text-[#6A9B72]">
          Ver como Gestor →
        </a>
        <Avatar size="sm" fallback="MS" alt="Maria Silva" />
      </div>
    </header>
  )
}

// =============================================================================
// RESIDENT-SPECIFIC PANELS
// =============================================================================

// My Unit Panel
function MyUnitPanel() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-1.5">
          <div className="w-8 h-8 rounded-lg bg-[#E8F0EA] flex items-center justify-center">
            <Building2 className="w-4 h-4 text-[#6A9B72]" />
          </div>
          <div>
            <CardTitle>A Minha Fração</CardTitle>
            <CardDescription>{myUnit.building}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-lg bg-[#F8F9FA] border border-[#E9ECEF] p-1.5 space-y-1">
          <InfoRow label="Fração" value={<span className="font-mono font-bold text-[#343A40]">{myUnit.unit}</span>} />
          <InfoRow label="Permilagem" value={<span className="font-mono">{myUnit.permillage.toFixed(2)}‰</span>} />
          <InfoRow label="Quota Mensal" value={<span className="font-mono text-[#6A9B72]">€{myUnit.monthlyQuota.toFixed(2)}</span>} />
          <InfoRow label="Morada" value={<span className="text-[10px]">{myUnit.address}</span>} />
        </div>
      </CardContent>
    </Card>
  )
}

// My Payments Panel
function MyPaymentsPanel() {
  const { addToast } = useToast()
  const [selectedPayment, setSelectedPayment] = useState<typeof myPayments[0] | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)

  const pendingPayments = myPayments.filter(p => p.status === "pending")
  const totalPending = pendingPayments.reduce((sum, p) => sum + parseFloat(p.amount), 0)

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "paid": return <Badge variant="success" size="sm">Pago</Badge>
      case "pending": return <Badge variant="warning" size="sm">Pendente</Badge>
      case "late": return <Badge variant="error" size="sm">Atrasado</Badge>
      default: return <Badge size="sm">{status}</Badge>
    }
  }

  const handlePaymentClick = (payment: typeof myPayments[0]) => {
    setSelectedPayment(payment)
    setSheetOpen(true)
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <div className="w-8 h-8 rounded-lg bg-[#E8F0EA] flex items-center justify-center">
                <CreditCard className="w-4 h-4 text-[#6A9B72]" />
              </div>
              <div>
                <CardTitle>Os Meus Pagamentos</CardTitle>
                <CardDescription>Histórico de quotas</CardDescription>
              </div>
            </div>
            {totalPending > 0 && (
              <Badge variant="warning">€{totalPending.toFixed(2)} pendente</Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <List variant="card">
            {myPayments.map((payment) => (
              <ClickableListItem
                key={payment.id}
                title={payment.month}
                description={payment.status === "paid" ? `Pago em ${payment.paidDate}` : `Prazo: ${payment.dueDate}`}
                leading={
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center",
                    payment.status === "paid" ? "bg-[#E8F0EA]" : "bg-[#FFF3E0]"
                  )}>
                    {payment.status === "paid" ? (
                      <CheckCircle2 className="w-4 h-4 text-[#6A9B72]" />
                    ) : (
                      <Clock className="w-4 h-4 text-[#B8963E]" />
                    )}
                  </div>
                }
                trailing={
                  <div className="text-right">
                    <p className="text-[11px] font-mono font-medium text-[#343A40]">€{payment.amount}</p>
                    {getStatusBadge(payment.status)}
                  </div>
                }
                onClick={() => handlePaymentClick(payment)}
              />
            ))}
          </List>
          <Button variant="outline" className="w-full mt-1.5">
            Ver Histórico Completo <ChevronRight className="w-3 h-3 ml-1" />
          </Button>
        </CardContent>
      </Card>

      {/* Payment Detail Sheet */}
      <Sheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        title="Detalhes do Pagamento"
        description={selectedPayment?.month || ""}
        footer={
          selectedPayment?.status === "pending" ? (
            <Button className="w-full" onClick={() => {
              setSheetOpen(false)
              addToast({ variant: "success", title: "Comprovativo enviado", description: "Aguarde validação" })
            }}>
              <Download className="w-3 h-3 mr-1" />
              Enviar Comprovativo
            </Button>
          ) : (
            <Button variant="outline" className="w-full" onClick={() => setSheetOpen(false)}>
              <Download className="w-3 h-3 mr-1" />
              Descarregar Recibo
            </Button>
          )
        }
      >
        {selectedPayment && (
          <div className="space-y-2">
            <div className="rounded-lg bg-[#F8F9FA] border border-[#E9ECEF] p-1.5 space-y-1">
              <InfoRow label="Mês" value={selectedPayment.month} />
              <InfoRow label="Valor" value={<span className="font-mono font-bold">€{selectedPayment.amount}</span>} />
              <InfoRow label="Estado" value={getStatusBadge(selectedPayment.status)} />
              {selectedPayment.status === "paid" ? (
                <InfoRow label="Data de Pagamento" value={selectedPayment.paidDate} />
              ) : (
                <InfoRow label="Prazo" value={selectedPayment.dueDate} />
              )}
            </div>

            {selectedPayment.status === "pending" && (
              <Alert variant="warning">
                <Clock className="w-3 h-3" />
                Pagamento pendente. Prazo até {selectedPayment.dueDate}.
              </Alert>
            )}
          </div>
        )}
      </Sheet>
    </>
  )
}

// Notifications Panel
function NotificationsPanel() {
  const getTypeIcon = (type: string) => {
    switch (type) {
      case "warning": return <AlertCircle className="w-4 h-4 text-[#B8963E]" />
      case "info": return <Bell className="w-4 h-4 text-[#5B8FB9]" />
      default: return <FileText className="w-4 h-4 text-[#8E9AAF]" />
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
            />
          ))}
        </List>
      </CardContent>
    </Card>
  )
}

// Upcoming Events Panel
function UpcomingEventsPanel() {
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
          {upcomingEvents.map((event) => (
            <div key={event.id} className="flex items-center justify-between p-1.5 rounded-lg bg-[#F8F9FA] border border-[#E9ECEF]">
              <div>
                <p className="text-[11px] font-medium text-[#495057]">{event.title}</p>
                <p className="text-[10px] text-[#8E9AAF]">{event.date} às {event.time}</p>
              </div>
              <Badge variant="default" size="sm">Agendado</Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

// =============================================================================
// MAIN DASHBOARD CONTENT
// =============================================================================
function ResidentDashboardContent() {
  const pendingPayments = myPayments.filter(p => p.status === "pending")
  const totalPending = pendingPayments.reduce((sum, p) => sum + parseFloat(p.amount), 0)
  const paidThisYear = myPayments.filter(p => p.status === "paid").length

  return (
    <div className="flex-1 overflow-y-auto rounded-lg border border-[#E9ECEF] bg-white p-1.5">
      {/* Pending Payment Alert */}
      {totalPending > 0 && (
        <Alert variant="warning" className="mb-1.5">
          <Clock className="w-3 h-3" />
          Tem €{totalPending.toFixed(2)} em pagamentos pendentes. Prazo até 15 de Janeiro.
        </Alert>
      )}

      {/* Stats Grid */}
      <div className="mb-1.5 grid grid-cols-2 gap-1.5 lg:grid-cols-4">
        <StatCard
          label="Quota Mensal"
          value={`€${myUnit.monthlyQuota}`}
          icon={<CreditCard className="h-4 w-4" />}
        />
        <StatCard
          label="Em Dívida"
          value={`€${totalPending.toFixed(0)}`}
          change={totalPending > 0 ? { value: "pendente", positive: false } : undefined}
          icon={<AlertCircle className="h-4 w-4" />}
        />
        <StatCard
          label="Pagos (2024)"
          value={`${paidThisYear}`}
          icon={<CheckCircle2 className="h-4 w-4" />}
        />
        <StatCard
          label="Próximo Evento"
          value="15 Jan"
          icon={<Calendar className="h-4 w-4" />}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-1.5 lg:grid-cols-3">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-1.5">
          <MyPaymentsPanel />
          <NotificationsPanel />
        </div>

        {/* Right Column */}
        <div className="space-y-1.5">
          <MyUnitPanel />
          <UpcomingEventsPanel />

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Ações Rápidas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-1.5">
                <Button variant="outline" className="flex-col h-auto py-2">
                  <AlertCircle className="w-4 h-4 mb-1" />
                  <span className="text-[9px]">Reportar Ocorrência</span>
                </Button>
                <Button variant="outline" className="flex-col h-auto py-2">
                  <FileText className="w-4 h-4 mb-1" />
                  <span className="text-[9px]">Ver Documentos</span>
                </Button>
                <Button variant="outline" className="flex-col h-auto py-2">
                  <Vote className="w-4 h-4 mb-1" />
                  <span className="text-[9px]">Votações Ativas</span>
                </Button>
                <Button variant="outline" className="flex-col h-auto py-2">
                  <MessageSquare className="w-4 h-4 mb-1" />
                  <span className="text-[9px]">Discussões</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

// =============================================================================
// PAGE EXPORT
// =============================================================================
export default function ResidentDashboardPage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  return (
    <ToastProvider>
      <div className="flex h-full gap-1.5 bg-white">
        <MobileNav open={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />
        <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
        <div className="flex flex-1 flex-col gap-1.5">
          <Header onMenuClick={() => setMobileNavOpen(true)} />
          <ResidentDashboardContent />
        </div>
      </div>
    </ToastProvider>
  )
}
