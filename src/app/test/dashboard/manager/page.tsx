"use client"

import { useState } from "react"
import { Button } from "../../components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../../components/ui/card"
import { Badge } from "../../components/ui/badge"
import { Input } from "../../components/ui/input"
import { Avatar } from "../../components/ui/avatar"
import { IconButton } from "../../components/ui/icon-button"
import { Modal } from "../../components/ui/modal"
import { Sheet } from "../../components/ui/sheet"
import { FormField } from "../../components/ui/form-field"
import { Dropdown, DropdownItem, DropdownDivider } from "../../components/ui/dropdown"
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../../components/ui/table"
import { StatCard } from "../../components/ui/stat-card"
import { Alert } from "../../components/ui/alert"
import { ToastProvider, useToast } from "../../components/ui/toast"
import { Progress } from "../../components/ui/progress"
import { List, ListItem, ClickableListItem, ListHeader } from "../../components/ui/list"
import { StatusIndicator } from "../../components/ui/status-indicator"
import { InfoRow } from "../../components/ui/info-row"
import { cn } from "@/lib/utils"
import {
  Plus, Filter, MoreVertical, Menu, X,
  Users, DollarSign, TrendingUp, Calendar,
  Eye, Edit, Trash2, Download, ChevronRight,
  Home, FileText, CreditCard, MessageSquare, Settings,
  Building2, Copy, RefreshCw, CheckCircle2, Bell,
  Mail, Phone, UserMinus, UserCog, AlertCircle, Clock,
} from "lucide-react"

// =============================================================================
// NAVIGATION
// =============================================================================
const navigation = [
  { name: "Resumo", icon: Home, href: "/test/dashboard/manager", active: true },
  { name: "Pagamentos", icon: CreditCard, href: "/test/quotas" },
  { name: "Residentes", icon: Users, href: "/test/residents" },
  { name: "Documentos", icon: FileText, href: "/test/documents" },
  { name: "Mensagens", icon: MessageSquare, href: "/test/discussions" },
  { name: "Definições", icon: Settings, href: "/test/settings" },
]

// =============================================================================
// MOCK DATA
// =============================================================================
const recentPayments = [
  { id: 1, resident: "Maria Silva", unit: "1º Esq", amount: "85.00", status: "paid", date: "5 Jan" },
  { id: 2, resident: "João Santos", unit: "1º Dir", amount: "85.00", status: "pending", date: "4 Jan" },
  { id: 3, resident: "Ana Costa", unit: "2º Esq", amount: "85.00", status: "paid", date: "3 Jan" },
  { id: 4, resident: "Pedro Lima", unit: "2º Dir", amount: "85.00", status: "late", date: "2 Jan" },
]

const residents = [
  { id: 1, name: "Maria Silva", email: "maria@email.com", phone: "+351 912 345 678", unit: "1º Esq", status: "active" as const },
  { id: 2, name: "João Santos", email: "joao@email.com", unit: "1º Dir", status: "active" as const },
  { id: 3, name: "Ana Costa", email: "ana@email.com", phone: "+351 923 456 789", unit: "2º Esq", status: "pending" as const },
  { id: 4, name: "Pedro Lima", email: "pedro@email.com", unit: "2º Dir", status: "inactive" as const },
]

const systemStatus = {
  payments: "ok" as const,
  documents: "ok" as const,
  notifications: "warning" as const,
  subscription: "active" as const,
}

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
          <span className="text-[11px] font-semibold text-[#495057]">Gestor</span>
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
        {!collapsed && <span className="text-[11px] font-semibold text-[#495057]">Gestor</span>}
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
        <Badge variant="info" size="sm">Gestor</Badge>
        <span className="text-[12px] font-medium text-[#495057]">Painel de Controlo</span>
      </div>
      <div className="flex items-center gap-1.5">
        <a href="/test/dashboard/resident" className="text-[9px] text-[#8E9AAF] hover:text-[#6A9B72]">
          Ver como Residente →
        </a>
        <Avatar size="sm" fallback="AD" alt="Admin" />
      </div>
    </header>
  )
}

// =============================================================================
// MANAGER-SPECIFIC PANELS (Composed from UI components)
// =============================================================================

// System Status Panel
function SystemStatusPanel() {
  const statusConfig = {
    ok: { label: "Operacional", variant: "success" as const },
    warning: { label: "Atenção", variant: "warning" as const },
    error: { label: "Erro", variant: "error" as const },
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-1.5">
          <div className="w-8 h-8 rounded-lg bg-[#E8F0EA] flex items-center justify-center">
            <CheckCircle2 className="w-4 h-4 text-[#6A9B72]" />
          </div>
          <div>
            <CardTitle>Estado do Sistema</CardTitle>
            <CardDescription>Monitorização de serviços</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <List variant="divided">
          <ListItem
            title="Pagamentos"
            description="Processamento"
            leading={<CreditCard className="w-4 h-4 text-[#8E9AAF]" />}
            trailing={<StatusIndicator status={systemStatus.payments} label={statusConfig[systemStatus.payments].label} showDot />}
          />
          <ListItem
            title="Documentos"
            description="Armazenamento"
            leading={<FileText className="w-4 h-4 text-[#8E9AAF]" />}
            trailing={<StatusIndicator status={systemStatus.documents} label={statusConfig[systemStatus.documents].label} showDot />}
          />
          <ListItem
            title="Notificações"
            description="Envio de alertas"
            leading={<Bell className="w-4 h-4 text-[#8E9AAF]" />}
            trailing={<StatusIndicator status={systemStatus.notifications} label={statusConfig[systemStatus.notifications].label} showDot />}
          />
        </List>
      </CardContent>
    </Card>
  )
}

// Invite Code Panel
function InviteCodePanel() {
  const { addToast } = useToast()

  const handleCopy = () => {
    navigator.clipboard.writeText("ABC123")
    addToast({ variant: "success", title: "Código copiado!" })
  }

  const handleRefresh = () => {
    addToast({ variant: "info", title: "Código atualizado", description: "Novo código gerado" })
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-1.5">
          <div className="w-8 h-8 rounded-lg bg-[#E8F0EA] flex items-center justify-center">
            <Building2 className="w-4 h-4 text-[#6A9B72]" />
          </div>
          <div className="flex-1">
            <CardTitle>Código de Convite</CardTitle>
            <CardDescription>Edifício Flores</CardDescription>
          </div>
          <Badge variant="success">3/10 usos</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-lg bg-[#F8F9FA] border-2 border-dashed border-[#E9ECEF] p-2 text-center">
          <p className="text-[9px] font-medium text-[#8E9AAF] uppercase tracking-wide mb-1">Partilhe este código</p>
          <p className="text-[20px] font-bold font-mono text-[#343A40] tracking-[0.3em]">ABC123</p>
          <p className="text-[9px] text-[#ADB5BD] mt-1 flex items-center justify-center gap-1">
            <Clock className="w-3 h-3" />
            Expira em 7 dias
          </p>
        </div>
        <div className="flex gap-1.5 mt-2">
          <Button variant="outline" className="flex-1" onClick={handleCopy}>
            <Copy className="w-3 h-3 mr-1" />
            Copiar
          </Button>
          <Button variant="outline" onClick={handleRefresh}>
            <RefreshCw className="w-3 h-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

// Resident Actions Menu
function ResidentActionsMenu({ resident, onAction }: {
  resident: typeof residents[0]
  onAction: (action: string) => void
}) {
  return (
    <Dropdown
      trigger={
        <button className="p-1 rounded hover:bg-[#F1F3F5] text-[#8E9AAF] transition-colors">
          <MoreVertical className="w-4 h-4" />
        </button>
      }
      align="right"
    >
      <DropdownItem onClick={() => onAction("view")}>
        <Eye className="w-3 h-3 mr-1.5" />
        Ver Perfil
      </DropdownItem>
      <DropdownItem onClick={() => onAction("message")}>
        <Mail className="w-3 h-3 mr-1.5" />
        Enviar Mensagem
      </DropdownItem>
      {resident.phone && (
        <DropdownItem onClick={() => onAction("call")}>
          <Phone className="w-3 h-3 mr-1.5" />
          Ligar
        </DropdownItem>
      )}
      <DropdownDivider />
      <DropdownItem onClick={() => onAction("manage")}>
        <UserCog className="w-3 h-3 mr-1.5" />
        Gerir Permissões
      </DropdownItem>
      <DropdownItem onClick={() => onAction("remove")} className="text-[#B86B73] hover:bg-[#F9ECEE]">
        <UserMinus className="w-3 h-3 mr-1.5" />
        Remover
      </DropdownItem>
    </Dropdown>
  )
}

// Residents Panel
function ResidentsPanel() {
  const { addToast } = useToast()
  const [selectedResident, setSelectedResident] = useState<typeof residents[0] | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)

  const handleAction = (action: string, resident: typeof residents[0]) => {
    if (action === "view") {
      setSelectedResident(resident)
      setSheetOpen(true)
    } else {
      addToast({ variant: "info", title: action, description: `${resident.name} (${resident.unit})` })
    }
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <div className="w-8 h-8 rounded-lg bg-[#E8F0EA] flex items-center justify-center">
                <Users className="w-4 h-4 text-[#6A9B72]" />
              </div>
              <div>
                <CardTitle>Residentes</CardTitle>
                <CardDescription>{residents.length} registados</CardDescription>
              </div>
            </div>
            <Badge>{residents.filter(r => r.status === "active").length} ativos</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <List variant="card">
            {residents.map((resident) => (
              <ListItem
                key={resident.id}
                title={resident.name}
                description={resident.unit}
                leading={
                  <Avatar
                    fallback={resident.name.charAt(0)}
                    status={resident.status === "active" ? "online" : "offline"}
                    size="sm"
                  />
                }
                trailing={
                  <div className="flex items-center gap-1">
                    <Badge
                      size="sm"
                      variant={
                        resident.status === "active" ? "success" :
                        resident.status === "pending" ? "warning" : "default"
                      }
                    >
                      {resident.status === "active" ? "Ativo" :
                       resident.status === "pending" ? "Pendente" : "Inativo"}
                    </Badge>
                    <ResidentActionsMenu resident={resident} onAction={(action) => handleAction(action, resident)} />
                  </div>
                }
              />
            ))}
          </List>
        </CardContent>
      </Card>

      {/* Resident Detail Sheet */}
      <Sheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        title="Detalhes do Residente"
        description={selectedResident ? `${selectedResident.name} - ${selectedResident.unit}` : ""}
        footer={
          <div className="flex gap-1.5">
            <Button variant="outline" className="flex-1" onClick={() => setSheetOpen(false)}>Fechar</Button>
            <Button className="flex-1"><Mail className="w-3 h-3 mr-1" />Mensagem</Button>
          </div>
        }
      >
        {selectedResident && (
          <div className="space-y-2">
            <div className="rounded-lg bg-[#F8F9FA] border border-[#E9ECEF] p-1.5 space-y-1">
              <InfoRow label="Email" value={selectedResident.email} />
              <InfoRow label="Telefone" value={selectedResident.phone || "Não definido"} />
              <InfoRow label="Fração" value={selectedResident.unit} />
              <InfoRow
                label="Estado"
                value={
                  <Badge size="sm" variant={selectedResident.status === "active" ? "success" : "warning"}>
                    {selectedResident.status === "active" ? "Ativo" : "Pendente"}
                  </Badge>
                }
              />
            </div>
          </div>
        )}
      </Sheet>
    </>
  )
}

// =============================================================================
// MAIN DASHBOARD CONTENT
// =============================================================================
function ManagerDashboardContent() {
  const { addToast } = useToast()

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "paid": return <Badge variant="success">Pago</Badge>
      case "pending": return <Badge variant="warning">Pendente</Badge>
      case "late": return <Badge variant="error">Atrasado</Badge>
      default: return <Badge>{status}</Badge>
    }
  }

  return (
    <div className="flex-1 overflow-y-auto rounded-lg border border-[#E9ECEF] bg-white p-1.5">
      <Alert variant="info" className="mb-1.5" dismissible onDismiss={() => {}}>
        Próxima reunião de condomínio agendada para 15 de Janeiro às 19:00.
      </Alert>

      {/* Stats Grid */}
      <div className="mb-1.5 grid grid-cols-2 gap-1.5 lg:grid-cols-4">
        <StatCard label="Total Cobrado" value="€12,450" change={{ value: "8%", positive: true }} icon={<DollarSign className="h-4 w-4" />} />
        <StatCard label="Residentes" value="48" icon={<Users className="h-4 w-4" />} />
        <StatCard label="Pendentes" value="6" change={{ value: "2", positive: false }} icon={<TrendingUp className="h-4 w-4" />} />
        <StatCard label="Este Mês" value="€4,250" icon={<Calendar className="h-4 w-4" />} />
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-1.5 lg:grid-cols-3">
        {/* Left Column - Payments Table */}
        <div className="lg:col-span-2 space-y-1.5">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Pagamentos Recentes</CardTitle>
                <Button variant="ghost" size="sm">Ver todos <ChevronRight className="h-3 w-3" /></Button>
              </div>
            </CardHeader>
            {/* Desktop Table */}
            <div className="hidden sm:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Residente</TableHead>
                    <TableHead>Fração</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Data</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentPayments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          <Avatar size="sm" fallback={payment.resident.charAt(0)} />
                          <span>{payment.resident}</span>
                        </div>
                      </TableCell>
                      <TableCell>{payment.unit}</TableCell>
                      <TableCell>€{payment.amount}</TableCell>
                      <TableCell>{getStatusBadge(payment.status)}</TableCell>
                      <TableCell>{payment.date}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            {/* Mobile Cards */}
            <div className="sm:hidden p-1.5 space-y-1.5">
              {recentPayments.map((payment) => (
                <div key={payment.id} className="flex items-center justify-between rounded-md border border-[#F1F3F5] p-1.5">
                  <div className="flex items-center gap-1.5">
                    <Avatar size="sm" fallback={payment.resident.charAt(0)} />
                    <div>
                      <p className="text-[11px] font-medium text-[#495057]">{payment.resident}</p>
                      <p className="text-[10px] text-[#8E9AAF]">{payment.unit} • {payment.date}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[11px] font-medium text-[#495057]">€{payment.amount}</p>
                    {getStatusBadge(payment.status)}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Residents Panel */}
          <ResidentsPanel />
        </div>

        {/* Right Column - Panels */}
        <div className="space-y-1.5">
          <SystemStatusPanel />
          <InviteCodePanel />

          {/* Collection Progress */}
          <Card>
            <CardHeader>
              <CardTitle>Progresso de Cobrança</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1.5">
                <div>
                  <div className="mb-1 flex justify-between text-[10px]">
                    <span className="text-[#8E9AAF]">Janeiro 2025</span>
                    <span className="font-medium text-[#495057]">87%</span>
                  </div>
                  <Progress value={87} />
                </div>
                <div>
                  <div className="mb-1 flex justify-between text-[10px]">
                    <span className="text-[#8E9AAF]">Dezembro 2024</span>
                    <span className="font-medium text-[#495057]">94%</span>
                  </div>
                  <Progress value={94} />
                </div>
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
export default function ManagerDashboardPage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  return (
    <ToastProvider>
      <div className="flex h-full gap-1.5 bg-white">
        <MobileNav open={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />
        <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
        <div className="flex flex-1 flex-col gap-1.5">
          <Header onMenuClick={() => setMobileNavOpen(true)} />
          <ManagerDashboardContent />
        </div>
      </div>
    </ToastProvider>
  )
}
