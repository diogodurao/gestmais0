"use client"

import { useState } from "react"
import { Button } from "../components/ui/Button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "../components/ui/Card"
import { Badge } from "../components/ui/Badge"
import { Avatar } from "../components/ui/Avatar"
import { IconButton } from "../components/ui/Icon-Button"
import { Input } from "../components/ui/Input"
import { Modal } from "../components/ui/Modal"
import { Sheet } from "../components/ui/Sheet"
import { FormField } from "../components/ui/Form-Field"
import { Select } from "../components/ui/Select"
import { Dropdown, DropdownItem, DropdownDivider } from "../components/ui/Dropdown"
import { StatCard } from "../components/ui/Stat-Card"
import { EmptyState } from "../components/ui/Empty-State"
import { Progress } from "../components/ui/Progress"
import { Divider } from "../components/ui/Divider"
import { ToastProvider, useToast } from "../components/ui/Toast"
import { cn } from "@/lib/utils"
import {
  Plus, Search, Filter, Users, User, Mail, Phone,
  Home, MoreVertical, Edit, Trash2, Eye, Send,
  UserPlus, UserMinus, CheckCircle, XCircle, Clock,
  DollarSign, TrendingUp, TrendingDown, Key,
} from "lucide-react"

// Types
type ResidentStatus = "active" | "pending" | "inactive"
type ResidentRole = "owner" | "tenant" | "representative"

interface Resident {
  id: number
  name: string
  email: string
  phone: string
  unit: string
  floor: number
  role: ResidentRole
  status: ResidentStatus
  joinedAt: string
  paymentStatus: "up_to_date" | "pending" | "overdue"
  totalPaid: number
  balance: number
}

// Mock data
const mockResidents: Resident[] = [
  {
    id: 1,
    name: "Maria Silva",
    email: "maria.silva@email.com",
    phone: "+351 912 345 678",
    unit: "1A",
    floor: 1,
    role: "owner",
    status: "active",
    joinedAt: "2023-01-15",
    paymentStatus: "up_to_date",
    totalPaid: 102000,
    balance: 0,
  },
  {
    id: 2,
    name: "João Santos",
    email: "joao.santos@email.com",
    phone: "+351 923 456 789",
    unit: "1B",
    floor: 1,
    role: "tenant",
    status: "active",
    joinedAt: "2023-06-01",
    paymentStatus: "pending",
    totalPaid: 85000,
    balance: 8500,
  },
  {
    id: 3,
    name: "Ana Costa",
    email: "ana.costa@email.com",
    phone: "+351 934 567 890",
    unit: "2A",
    floor: 2,
    role: "owner",
    status: "active",
    joinedAt: "2022-03-10",
    paymentStatus: "up_to_date",
    totalPaid: 170000,
    balance: 0,
  },
  {
    id: 4,
    name: "Pedro Lima",
    email: "pedro.lima@email.com",
    phone: "+351 945 678 901",
    unit: "2B",
    floor: 2,
    role: "owner",
    status: "active",
    joinedAt: "2024-01-20",
    paymentStatus: "overdue",
    totalPaid: 51000,
    balance: 25500,
  },
  {
    id: 5,
    name: "Bruno Ferreira",
    email: "bruno.ferreira@email.com",
    phone: "+351 956 789 012",
    unit: "3A",
    floor: 3,
    role: "owner",
    status: "pending",
    joinedAt: "2025-01-05",
    paymentStatus: "pending",
    totalPaid: 0,
    balance: 0,
  },
  {
    id: 6,
    name: "Clara Reis",
    email: "clara.reis@email.com",
    phone: "+351 967 890 123",
    unit: "3B",
    floor: 3,
    role: "representative",
    status: "active",
    joinedAt: "2023-09-15",
    paymentStatus: "up_to_date",
    totalPaid: 136000,
    balance: 0,
  },
]

// Utilities
function getStatusConfig(status: ResidentStatus) {
  const config = {
    active: { label: "Ativo", variant: "success" as const, icon: CheckCircle },
    pending: { label: "Pendente", variant: "warning" as const, icon: Clock },
    inactive: { label: "Inativo", variant: "default" as const, icon: XCircle },
  }
  return config[status]
}

function getRoleConfig(role: ResidentRole) {
  const config = {
    owner: { label: "Proprietário", color: "text-[#6A9B72]", bg: "bg-[#E8F0EA]" },
    tenant: { label: "Inquilino", color: "text-[#6C757D]", bg: "bg-[#F1F3F5]" },
    representative: { label: "Representante", color: "text-[#B8963E]", bg: "bg-[#FBF6EC]" },
  }
  return config[role]
}

function getPaymentStatusConfig(status: Resident["paymentStatus"]) {
  const config = {
    up_to_date: { label: "Em dia", color: "text-[#6A9B72]", icon: CheckCircle },
    pending: { label: "Pendente", color: "text-[#B8963E]", icon: Clock },
    overdue: { label: "Em atraso", color: "text-[#B86B73]", icon: XCircle },
  }
  return config[status]
}

function formatCurrency(cents: number): string {
  return `€${(cents / 100).toFixed(0)}`
}

function formatDate(dateStr: string) {
  const date = new Date(dateStr)
  return date.toLocaleDateString("pt-PT", { day: "numeric", month: "short", year: "numeric" })
}

// Resident Card
function ResidentCard({
  resident,
  onClick,
}: {
  resident: Resident
  onClick: () => void
}) {
  const statusConfig = getStatusConfig(resident.status)
  const roleConfig = getRoleConfig(resident.role)
  const paymentConfig = getPaymentStatusConfig(resident.paymentStatus)
  const PaymentIcon = paymentConfig.icon

  return (
    <div
      onClick={onClick}
      className="rounded-lg border border-[#E9ECEF] bg-white p-1.5 transition-colors hover:bg-[#F8F9FA] hover:border-[#DEE2E6] cursor-pointer"
    >
      <div className="flex items-start gap-1.5">
        <Avatar fallback={resident.name.charAt(0)} alt={resident.name} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1 mb-0.5 flex-wrap">
            <Badge variant={statusConfig.variant}>{statusConfig.label}</Badge>
            <span className={cn("px-1 py-0.5 rounded text-[8px] font-medium", roleConfig.bg, roleConfig.color)}>
              {roleConfig.label}
            </span>
          </div>
          <h3 className="text-[11px] font-medium text-[#495057] truncate">{resident.name}</h3>
          <div className="flex items-center gap-2 text-[9px] text-[#8E9AAF] mt-0.5">
            <span className="flex items-center gap-0.5">
              <Home className="h-3 w-3" />
              {resident.unit}
            </span>
            <span className="flex items-center gap-0.5">
              <Mail className="h-3 w-3" />
              {resident.email}
            </span>
          </div>
        </div>
        <div className="text-right shrink-0">
          <p className={cn("text-[10px] font-medium flex items-center gap-0.5 justify-end", paymentConfig.color)}>
            <PaymentIcon className="h-3 w-3" />
            {paymentConfig.label}
          </p>
          {resident.balance > 0 && (
            <p className="text-[9px] text-[#B86B73]">Dívida: {formatCurrency(resident.balance)}</p>
          )}
        </div>
      </div>
    </div>
  )
}

// Resident Detail Sheet
function ResidentDetail({
  resident,
  open,
  onClose,
  onAction,
}: {
  resident: Resident | null
  open: boolean
  onClose: () => void
  onAction: (action: string) => void
}) {
  if (!resident) return null

  const statusConfig = getStatusConfig(resident.status)
  const roleConfig = getRoleConfig(resident.role)
  const paymentConfig = getPaymentStatusConfig(resident.paymentStatus)
  const PaymentIcon = paymentConfig.icon

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title={resident.name}
      description={`${roleConfig.label} - ${resident.unit}`}
    >
      <div className="space-y-1.5">
        {/* Avatar & Status */}
        <div className="flex items-center gap-1.5">
          <Avatar size="lg" fallback={resident.name.charAt(0)} alt={resident.name} />
          <div>
            <p className="text-[12px] font-medium text-[#495057]">{resident.name}</p>
            <div className="flex items-center gap-1 mt-0.5">
              <Badge variant={statusConfig.variant}>{statusConfig.label}</Badge>
              <span className={cn("px-1 py-0.5 rounded text-[8px] font-medium", roleConfig.bg, roleConfig.color)}>
                {roleConfig.label}
              </span>
            </div>
          </div>
        </div>

        <Divider />

        {/* Contact Info */}
        <div>
          <p className="text-[9px] font-medium text-[#8E9AAF] uppercase tracking-wide mb-1">Contacto</p>
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-[10px]">
              <Mail className="h-3 w-3 text-[#8E9AAF]" />
              <span className="text-[#495057]">{resident.email}</span>
            </div>
            <div className="flex items-center gap-1.5 text-[10px]">
              <Phone className="h-3 w-3 text-[#8E9AAF]" />
              <span className="text-[#495057]">{resident.phone}</span>
            </div>
            <div className="flex items-center gap-1.5 text-[10px]">
              <Home className="h-3 w-3 text-[#8E9AAF]" />
              <span className="text-[#495057]">Fração {resident.unit} - {resident.floor}º andar</span>
            </div>
          </div>
        </div>

        <Divider />

        {/* Payment Status */}
        <div>
          <p className="text-[9px] font-medium text-[#8E9AAF] uppercase tracking-wide mb-1">Pagamentos</p>
          <div className="rounded-lg bg-[#F8F9FA] border border-[#E9ECEF] p-1.5">
            <div className="flex items-center justify-between mb-1">
              <span className={cn("text-[10px] font-medium flex items-center gap-0.5", paymentConfig.color)}>
                <PaymentIcon className="h-3 w-3" />
                {paymentConfig.label}
              </span>
              <span className="text-[10px] text-[#495057]">Total: {formatCurrency(resident.totalPaid)}</span>
            </div>
            {resident.balance > 0 && (
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-[#8E9AAF]">Dívida</span>
                <span className="font-medium text-[#B86B73]">{formatCurrency(resident.balance)}</span>
              </div>
            )}
          </div>
        </div>

        <Divider />

        {/* Additional Info */}
        <div className="grid grid-cols-2 gap-1.5 text-[10px]">
          <div>
            <span className="text-[#8E9AAF]">Membro desde</span>
            <p className="font-medium text-[#495057]">{formatDate(resident.joinedAt)}</p>
          </div>
          <div>
            <span className="text-[#8E9AAF]">ID do Residente</span>
            <p className="font-medium text-[#495057]">#{resident.id}</p>
          </div>
        </div>

        <Divider />

        {/* Actions */}
        <div className="space-y-1">
          <Button variant="outline" size="sm" className="w-full" onClick={() => onAction("email")}>
            <Mail className="h-3 w-3 mr-1" /> Enviar Email
          </Button>
          <Button variant="outline" size="sm" className="w-full" onClick={() => onAction("edit")}>
            <Edit className="h-3 w-3 mr-1" /> Editar Informações
          </Button>
          {resident.status === "pending" && (
            <Button size="sm" className="w-full" onClick={() => onAction("approve")}>
              <CheckCircle className="h-3 w-3 mr-1" /> Aprovar Registo
            </Button>
          )}
          {resident.status === "active" && (
            <Button variant="outline" size="sm" className="w-full text-[#B86B73]" onClick={() => onAction("deactivate")}>
              <UserMinus className="h-3 w-3 mr-1" /> Desativar
            </Button>
          )}
        </div>
      </div>
    </Sheet>
  )
}

// Main Content
function ResidentsContent() {
  const { addToast } = useToast()
  const [residents, setResidents] = useState(mockResidents)
  const [selectedResident, setSelectedResident] = useState<Resident | null>(null)
  const [showDetailSheet, setShowDetailSheet] = useState(false)
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState<ResidentStatus | "all">("all")

  // Stats
  const activeCount = residents.filter(r => r.status === "active").length
  const pendingCount = residents.filter(r => r.status === "pending").length
  const upToDateCount = residents.filter(r => r.paymentStatus === "up_to_date").length
  const totalDebt = residents.reduce((sum, r) => sum + r.balance, 0)

  // Filter residents
  const filteredResidents = residents.filter((r) => {
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      if (!r.name.toLowerCase().includes(term) && !r.email.toLowerCase().includes(term) && !r.unit.toLowerCase().includes(term)) {
        return false
      }
    }
    if (filterStatus !== "all" && r.status !== filterStatus) {
      return false
    }
    return true
  })

  // Handlers
  const handleViewResident = (resident: Resident) => {
    setSelectedResident(resident)
    setShowDetailSheet(true)
  }

  const handleResidentAction = (action: string) => {
    if (!selectedResident) return

    switch (action) {
      case "email":
        addToast({
          variant: "info",
          title: "Compor email",
          description: `Abrindo email para ${selectedResident.email}...`,
        })
        break
      case "edit":
        addToast({
          variant: "info",
          title: "Editar residente",
          description: "Funcionalidade em desenvolvimento.",
        })
        break
      case "approve":
        setResidents(prev => prev.map(r =>
          r.id === selectedResident.id ? { ...r, status: "active" as const } : r
        ))
        setSelectedResident(prev => prev ? { ...prev, status: "active" as const } : null)
        addToast({
          variant: "success",
          title: "Residente aprovado",
          description: `${selectedResident.name} foi aprovado com sucesso.`,
        })
        break
      case "deactivate":
        setResidents(prev => prev.map(r =>
          r.id === selectedResident.id ? { ...r, status: "inactive" as const } : r
        ))
        setSelectedResident(prev => prev ? { ...prev, status: "inactive" as const } : null)
        addToast({
          variant: "success",
          title: "Residente desativado",
          description: `${selectedResident.name} foi desativado.`,
        })
        break
    }
  }

  const handleInvite = () => {
    setShowInviteModal(false)
    addToast({
      variant: "success",
      title: "Convite enviado",
      description: "O convite foi enviado por email.",
    })
  }

  return (
    <div className="flex-1 overflow-y-auto p-1.5">
      {/* Header */}
      <div className="mb-1.5 flex flex-col gap-1.5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-[14px] font-semibold text-[#343A40]">Residentes</h1>
          <p className="text-[10px] text-[#8E9AAF]">Gestão de condóminos e moradores</p>
        </div>
        <Button size="sm" onClick={() => setShowInviteModal(true)}>
          <UserPlus className="h-3 w-3" />
          <span className="hidden sm:inline ml-1">Convidar</span>
        </Button>
      </div>

      {/* Stats */}
      <div className="mb-1.5 grid grid-cols-2 gap-1.5 lg:grid-cols-4">
        <StatCard
          label="Total Residentes"
          value={residents.length.toString()}
          icon={<Users className="h-4 w-4" />}
        />
        <StatCard
          label="Ativos"
          value={activeCount.toString()}
          change={{ value: `${pendingCount} pendentes`, positive: pendingCount === 0 }}
          icon={<CheckCircle className="h-4 w-4" />}
        />
        <StatCard
          label="Pagamentos em Dia"
          value={upToDateCount.toString()}
          change={{ value: `${Math.round((upToDateCount / activeCount) * 100)}%`, positive: true }}
          icon={<DollarSign className="h-4 w-4" />}
        />
        <StatCard
          label="Total em Dívida"
          value={formatCurrency(totalDebt)}
          change={totalDebt > 0 ? { value: "atenção", positive: false } : undefined}
          icon={<TrendingDown className="h-4 w-4" />}
        />
      </div>

      {/* Toolbar */}
      <Card className="mb-1.5">
        <CardContent className="flex flex-wrap items-center gap-1.5">
          <div className="relative flex-1 min-w-[150px]">
            <Search className="absolute left-1.5 top-1/2 -translate-y-1/2 h-3 w-3 text-[#8E9AAF]" />
            <Input
              type="text"
              placeholder="Pesquisar residentes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-6"
            />
          </div>
          <div className="flex gap-1">
            <Button
              variant={filterStatus === "all" ? "primary" : "outline"}
              size="sm"
              onClick={() => setFilterStatus("all")}
            >
              Todos
            </Button>
            <Button
              variant={filterStatus === "active" ? "primary" : "outline"}
              size="sm"
              onClick={() => setFilterStatus("active")}
            >
              Ativos
            </Button>
            <Button
              variant={filterStatus === "pending" ? "primary" : "outline"}
              size="sm"
              onClick={() => setFilterStatus("pending")}
            >
              Pendentes
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Residents List */}
      {filteredResidents.length === 0 ? (
        <Card>
          <EmptyState
            title="Sem residentes"
            description={searchTerm || filterStatus !== "all"
              ? "Nenhum residente corresponde aos filtros."
              : "Não há residentes registados."
            }
            action={
              <Button size="sm" onClick={() => setShowInviteModal(true)}>
                <UserPlus className="h-3 w-3 mr-1" />
                Convidar Residente
              </Button>
            }
          />
        </Card>
      ) : (
        <div className="space-y-1.5">
          {filteredResidents.map((resident) => (
            <ResidentCard
              key={resident.id}
              resident={resident}
              onClick={() => handleViewResident(resident)}
            />
          ))}
        </div>
      )}

      {/* Detail Sheet */}
      <ResidentDetail
        resident={selectedResident}
        open={showDetailSheet}
        onClose={() => { setShowDetailSheet(false); setSelectedResident(null) }}
        onAction={handleResidentAction}
      />

      {/* Invite Modal */}
      <Modal
        open={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        title="Convidar Residente"
        description="Envie um convite para um novo residente se juntar ao condomínio."
        footer={
          <div className="flex justify-end gap-1.5">
            <Button variant="outline" onClick={() => setShowInviteModal(false)}>
              Cancelar
            </Button>
            <Button onClick={handleInvite}>
              <Send className="h-3 w-3 mr-1" />
              Enviar Convite
            </Button>
          </div>
        }
      >
        <div className="space-y-1.5">
          <FormField label="Email" required>
            <Input type="email" placeholder="email@exemplo.com" />
          </FormField>
          <FormField label="Fração" required>
            <Select>
              <option value="">Selecionar fração</option>
              <option value="1A">1A - 1º Andar</option>
              <option value="1B">1B - 1º Andar</option>
              <option value="2A">2A - 2º Andar</option>
              <option value="2B">2B - 2º Andar</option>
              <option value="3A">3A - 3º Andar</option>
              <option value="3B">3B - 3º Andar</option>
            </Select>
          </FormField>
          <FormField label="Tipo" required>
            <Select>
              <option value="owner">Proprietário</option>
              <option value="tenant">Inquilino</option>
              <option value="representative">Representante</option>
            </Select>
          </FormField>
        </div>
      </Modal>
    </div>
  )
}

export default function ResidentsPage() {
  return (
    <ToastProvider>
      <div className="h-full bg-white">
        <ResidentsContent />
      </div>
    </ToastProvider>
  )
}
