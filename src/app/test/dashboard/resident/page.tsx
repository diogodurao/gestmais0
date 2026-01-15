"use client"

import { useState } from "react"
import { Button } from "../../components/ui/Button"
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/Card"
import { Badge } from "../../components/ui/Badge"
import { Avatar } from "../../components/ui/Avatar"
import { StatCard } from "../../components/ui/Stat-Card"
import { Alert } from "../../components/ui/Alert"
import { ToastProvider, useToast } from "../../components/ui/Toast"
import { cn } from "@/lib/utils"

// Import Panels (composed components)
import {
  MyUnitPanel,
  MyPaymentsPanel,
  NotificationsPanel,
  UpcomingEventsPanel,
  type UnitData,
  type Payment,
  type Notification,
  type Event,
} from "../../components/panels"

import {
  Menu, X,
  Home, FileText, CreditCard, MessageSquare, Settings,
  Calendar, Clock,
  AlertCircle, Vote,
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
// MOCK DATA (In real app, this would come from server/API)
// =============================================================================
const myUnitData: UnitData = {
  building: "Edifício Flores",
  address: "Rua das Flores, 123 - Lisboa",
  unit: "2º Esq",
  permillage: 166.67,
  monthlyQuota: 85.00,
}

const myPaymentsData: Payment[] = [
  { id: 1, month: "Janeiro 2025", amount: "85.00", status: "pending", dueDate: "15 Jan" },
  { id: 2, month: "Dezembro 2024", amount: "85.00", status: "paid", paidDate: "10 Dez" },
  { id: 3, month: "Novembro 2024", amount: "85.00", status: "paid", paidDate: "8 Nov" },
  { id: 4, month: "Outubro 2024", amount: "85.00", status: "paid", paidDate: "5 Out" },
]

const notificationsData: Notification[] = [
  { id: 1, title: "Quota de Janeiro pendente", description: "Prazo até 15 de Janeiro", type: "warning", time: "Há 2 horas" },
  { id: 2, title: "Nova votação disponível", description: "Renovação do elevador", type: "info", time: "Há 1 dia" },
  { id: 3, title: "Documento publicado", description: "Ata da reunião de Dezembro", type: "default", time: "Há 3 dias" },
]

const upcomingEventsData: Event[] = [
  { id: 1, title: "Reunião de Condomínio", date: "15 Jan", time: "19:00" },
  { id: 2, title: "Manutenção do Elevador", date: "18 Jan", time: "09:00" },
]

// =============================================================================
// LAYOUT COMPONENTS
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
// MAIN DASHBOARD CONTENT
// =============================================================================
function ResidentDashboardContent() {
  const { addToast } = useToast()

  const pendingPayments = myPaymentsData.filter(p => p.status === "pending")
  const totalPending = pendingPayments.reduce((sum, p) => sum + parseFloat(p.amount), 0)
  const paidThisYear = myPaymentsData.filter(p => p.status === "paid").length

  // Panel event handlers
  const handlePaymentAction = (action: string, payment: Payment) => {
    if (action === "submit") {
      addToast({ variant: "success", title: "Comprovativo enviado", description: "Aguarde validação" })
    } else if (action === "download") {
      addToast({ variant: "info", title: "Download iniciado", description: payment.month })
    }
  }

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
          value={`€${myUnitData.monthlyQuota}`}
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
          icon={<CreditCard className="h-4 w-4" />}
        />
        <StatCard
          label="Próximo Evento"
          value="15 Jan"
          icon={<Calendar className="h-4 w-4" />}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-1.5 lg:grid-cols-3">
        {/* Left Column - Payments & Notifications Panels */}
        <div className="lg:col-span-2 space-y-1.5">
          <MyPaymentsPanel
            payments={myPaymentsData}
            onAction={handlePaymentAction}
          />
          <NotificationsPanel notifications={notificationsData} />
        </div>

        {/* Right Column - Unit & Events Panels */}
        <div className="space-y-1.5">
          <MyUnitPanel data={myUnitData} />
          <UpcomingEventsPanel events={upcomingEventsData} />

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
