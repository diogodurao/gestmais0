"use client"

import { useState } from "react"
import { Button } from "../components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "../components/ui/card"
import { Badge } from "../components/ui/badge"
import { Input } from "../components/ui/input"
import { IconButton } from "../components/ui/icon-button"
import { StatCard } from "../components/ui/stat-card"
import { Progress } from "../components/ui/progress"
import { Modal } from "../components/ui/modal"
import { Sheet } from "../components/ui/sheet"
import { Dropdown, DropdownItem, DropdownDivider } from "../components/ui/dropdown"
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../components/ui/table"
import { List, ListItem } from "../components/ui/list"
import { ToastProvider, useToast } from "../components/ui/toast"
import { EmptyState } from "../components/ui/empty-state"
import { Divider } from "../components/ui/divider"
import { FormField } from "../components/ui/form-field"
import { Select } from "../components/ui/select"
import { cn } from "@/lib/utils"
import {
  Plus, DollarSign, TrendingUp, Calendar, Layers,
  Check, X, RotateCcw, Filter, ChevronRight,
  MoreVertical, ChevronDown, ChevronUp, User, Building,
  Download, FileText, Edit, Trash2, Eye, ArrowLeft,
} from "lucide-react"

// Types
type PaymentStatus = "paid" | "pending" | "late"
type ToolMode = "markPaid" | "markPending" | "toggle" | null

interface Installment {
  id: number
  month: number
  year: number
  expectedAmount: number
  paidAmount: number
  status: PaymentStatus
}

interface ApartmentPayment {
  apartmentId: number
  unit: string
  residentName: string | null
  permillage: number
  totalShare: number
  installments: Installment[]
  totalPaid: number
  balance: number
  status: "complete" | "partial" | "pending"
}

interface Project {
  id: number
  name: string
  description: string
  totalBudget: number
  numInstallments: number
  startMonth: number
  startYear: number
  createdAt: string
}

// Mock data
const MONTHS = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"]

const mockProjects: Project[] = [
  {
    id: 1,
    name: "Impermeabilização Terraço",
    description: "Reparação e impermeabilização do terraço principal",
    totalBudget: 1500000, // 15,000€
    numInstallments: 6,
    startMonth: 1,
    startYear: 2025,
    createdAt: "2024-12-15",
  },
  {
    id: 2,
    name: "Fundo de Reserva 2025",
    description: "Contribuição anual para o fundo de reserva do condomínio",
    totalBudget: 600000, // 6,000€
    numInstallments: 12,
    startMonth: 1,
    startYear: 2025,
    createdAt: "2024-12-01",
  },
  {
    id: 3,
    name: "Pintura Exterior",
    description: "Pintura completa da fachada do edifício",
    totalBudget: 800000, // 8,000€
    numInstallments: 4,
    startMonth: 3,
    startYear: 2025,
    createdAt: "2025-01-10",
  },
]

const mockPayments: ApartmentPayment[] = [
  {
    apartmentId: 1,
    unit: "1A",
    residentName: "Maria Silva",
    permillage: 166.67,
    totalShare: 250000,
    installments: [
      { id: 1, month: 1, year: 2025, expectedAmount: 41667, paidAmount: 41667, status: "paid" },
      { id: 2, month: 2, year: 2025, expectedAmount: 41667, paidAmount: 41667, status: "paid" },
      { id: 3, month: 3, year: 2025, expectedAmount: 41667, paidAmount: 41667, status: "paid" },
      { id: 4, month: 4, year: 2025, expectedAmount: 41667, paidAmount: 0, status: "pending" },
      { id: 5, month: 5, year: 2025, expectedAmount: 41667, paidAmount: 0, status: "pending" },
      { id: 6, month: 6, year: 2025, expectedAmount: 41665, paidAmount: 0, status: "pending" },
    ],
    totalPaid: 125001,
    balance: 124999,
    status: "partial",
  },
  {
    apartmentId: 2,
    unit: "1B",
    residentName: "João Santos",
    permillage: 166.67,
    totalShare: 250000,
    installments: [
      { id: 7, month: 1, year: 2025, expectedAmount: 41667, paidAmount: 41667, status: "paid" },
      { id: 8, month: 2, year: 2025, expectedAmount: 41667, paidAmount: 0, status: "late" },
      { id: 9, month: 3, year: 2025, expectedAmount: 41667, paidAmount: 0, status: "late" },
      { id: 10, month: 4, year: 2025, expectedAmount: 41667, paidAmount: 0, status: "pending" },
      { id: 11, month: 5, year: 2025, expectedAmount: 41667, paidAmount: 0, status: "pending" },
      { id: 12, month: 6, year: 2025, expectedAmount: 41665, paidAmount: 0, status: "pending" },
    ],
    totalPaid: 41667,
    balance: 208333,
    status: "partial",
  },
  {
    apartmentId: 3,
    unit: "2A",
    residentName: "Ana Costa",
    permillage: 166.67,
    totalShare: 250000,
    installments: [
      { id: 13, month: 1, year: 2025, expectedAmount: 41667, paidAmount: 41667, status: "paid" },
      { id: 14, month: 2, year: 2025, expectedAmount: 41667, paidAmount: 41667, status: "paid" },
      { id: 15, month: 3, year: 2025, expectedAmount: 41667, paidAmount: 41667, status: "paid" },
      { id: 16, month: 4, year: 2025, expectedAmount: 41667, paidAmount: 41667, status: "paid" },
      { id: 17, month: 5, year: 2025, expectedAmount: 41667, paidAmount: 41667, status: "paid" },
      { id: 18, month: 6, year: 2025, expectedAmount: 41665, paidAmount: 41665, status: "paid" },
    ],
    totalPaid: 250000,
    balance: 0,
    status: "complete",
  },
  {
    apartmentId: 4,
    unit: "2B",
    residentName: "Pedro Lima",
    permillage: 166.67,
    totalShare: 250000,
    installments: [
      { id: 19, month: 1, year: 2025, expectedAmount: 41667, paidAmount: 0, status: "late" },
      { id: 20, month: 2, year: 2025, expectedAmount: 41667, paidAmount: 0, status: "late" },
      { id: 21, month: 3, year: 2025, expectedAmount: 41667, paidAmount: 0, status: "late" },
      { id: 22, month: 4, year: 2025, expectedAmount: 41667, paidAmount: 0, status: "pending" },
      { id: 23, month: 5, year: 2025, expectedAmount: 41667, paidAmount: 0, status: "pending" },
      { id: 24, month: 6, year: 2025, expectedAmount: 41665, paidAmount: 0, status: "pending" },
    ],
    totalPaid: 0,
    balance: 250000,
    status: "pending",
  },
  {
    apartmentId: 5,
    unit: "3A",
    residentName: null,
    permillage: 166.66,
    totalShare: 249990,
    installments: [
      { id: 25, month: 1, year: 2025, expectedAmount: 41665, paidAmount: 0, status: "pending" },
      { id: 26, month: 2, year: 2025, expectedAmount: 41665, paidAmount: 0, status: "pending" },
      { id: 27, month: 3, year: 2025, expectedAmount: 41665, paidAmount: 0, status: "pending" },
      { id: 28, month: 4, year: 2025, expectedAmount: 41665, paidAmount: 0, status: "pending" },
      { id: 29, month: 5, year: 2025, expectedAmount: 41665, paidAmount: 0, status: "pending" },
      { id: 30, month: 6, year: 2025, expectedAmount: 41665, paidAmount: 0, status: "pending" },
    ],
    totalPaid: 0,
    balance: 249990,
    status: "pending",
  },
  {
    apartmentId: 6,
    unit: "3B",
    residentName: "Clara Reis",
    permillage: 166.66,
    totalShare: 249990,
    installments: [
      { id: 31, month: 1, year: 2025, expectedAmount: 41665, paidAmount: 41665, status: "paid" },
      { id: 32, month: 2, year: 2025, expectedAmount: 41665, paidAmount: 41665, status: "paid" },
      { id: 33, month: 3, year: 2025, expectedAmount: 41665, paidAmount: 41665, status: "paid" },
      { id: 34, month: 4, year: 2025, expectedAmount: 41665, paidAmount: 0, status: "pending" },
      { id: 35, month: 5, year: 2025, expectedAmount: 41665, paidAmount: 0, status: "pending" },
      { id: 36, month: 6, year: 2025, expectedAmount: 41665, paidAmount: 0, status: "pending" },
    ],
    totalPaid: 124995,
    balance: 124995,
    status: "partial",
  },
]

// Utility
function formatCurrency(cents: number): string {
  return `€${(cents / 100).toFixed(2).replace(".", ",")}`
}

function formatCurrencyShort(cents: number): string {
  return `€${(cents / 100).toFixed(0)}`
}

function getMonthName(month: number, short = false): string {
  const names = short ? MONTHS : ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"]
  return names[month - 1] || ""
}

// Budget Progress Component
function BudgetProgress({
  totalCollected,
  totalBudget,
  progressPercent,
}: {
  totalCollected: number
  totalBudget: number
  progressPercent: number
}) {
  return (
    <Card className="mb-1.5">
      <CardContent>
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] font-medium text-[#8E9AAF]">Progresso do Orçamento</span>
          <span className="text-[11px] font-semibold text-[#343A40]">{progressPercent}%</span>
        </div>
        <Progress value={progressPercent} className="mb-1" />
        <div className="flex justify-between text-[9px] text-[#8E9AAF]">
          <span>Cobrado: <span className="font-medium text-[#6A9B72]">{formatCurrency(totalCollected)}</span></span>
          <span>Total: <span className="font-medium text-[#495057]">{formatCurrency(totalBudget)}</span></span>
        </div>
      </CardContent>
    </Card>
  )
}

// Tool Button Component
function ToolButton({
  icon,
  label,
  active,
  onClick,
  variant = "default",
}: {
  icon: React.ReactNode
  label: string
  active: boolean
  onClick: () => void
  variant?: "default" | "success" | "warning" | "error"
}) {
  const variantStyles = {
    default: active ? "bg-[#E9ECF0] text-[#495057]" : "text-[#8E9AAF]",
    success: active ? "bg-[#E8F0EA] text-[#6A9B72]" : "text-[#8E9AAF]",
    warning: active ? "bg-[#FBF6EC] text-[#B8963E]" : "text-[#8E9AAF]",
    error: active ? "bg-[#F9ECEE] text-[#B86B73]" : "text-[#8E9AAF]",
  }

  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-1 rounded px-1.5 py-1 text-[10px] font-medium transition-colors",
        "hover:bg-[#F8F9FA]",
        variantStyles[variant]
      )}
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
    </button>
  )
}

// Mobile Card for Apartment
function MobileApartmentCard({
  apartment,
  project,
  toolMode,
  onCellClick,
}: {
  apartment: ApartmentPayment
  project: Project
  toolMode: ToolMode
  onCellClick: (paymentId: number, currentStatus: PaymentStatus, expectedAmount: number) => void
}) {
  const [isExpanded, setIsExpanded] = useState(false)
  const hasDebt = apartment.balance > 0
  const progressPercent = apartment.totalShare > 0
    ? Math.round((apartment.totalPaid / apartment.totalShare) * 100)
    : 0

  return (
    <div className={cn(
      "rounded-lg border bg-white overflow-hidden",
      hasDebt ? "border-[#EFCDD1]" : "border-[#E9ECEF]"
    )}>
      <div
        className="p-1.5 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between gap-1.5">
          <div className="flex items-center gap-1.5 min-w-0 flex-1">
            <div className={cn(
              "shrink-0 w-8 h-8 flex items-center justify-center font-medium text-[11px] rounded border",
              apartment.status === "complete"
                ? "bg-[#E8F0EA] text-[#6A9B72] border-[#D4E5D7]"
                : apartment.status === "partial"
                  ? "bg-[#FBF6EC] text-[#B8963E] border-[#F0E4C8]"
                  : "bg-[#F9ECEE] text-[#B86B73] border-[#EFCDD1]"
            )}>
              {apartment.unit}
            </div>
            <div className="min-w-0 flex-1">
              {apartment.residentName ? (
                <span className="text-[11px] font-medium text-[#495057] truncate block flex items-center gap-1">
                  <User className="w-3 h-3 text-[#8E9AAF] shrink-0" />
                  {apartment.residentName}
                </span>
              ) : (
                <span className="text-[10px] text-[#8E9AAF] italic">Sem residente</span>
              )}
              <div className="text-[9px] text-[#8E9AAF] mt-0.5">
                {formatCurrencyShort(apartment.totalPaid)} de {formatCurrencyShort(apartment.totalShare)}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <Badge variant={
              apartment.status === "complete" ? "success" :
                apartment.status === "partial" ? "warning" : "error"
            }>
              {apartment.status === "complete" ? "Pago" :
                apartment.status === "partial" ? "Parcial" : "Pendente"}
            </Badge>
            {isExpanded ? (
              <ChevronUp className="w-3 h-3 text-[#8E9AAF]" />
            ) : (
              <ChevronDown className="w-3 h-3 text-[#8E9AAF]" />
            )}
          </div>
        </div>

        <div className="mt-1.5">
          <Progress value={progressPercent} size="sm" />
        </div>
      </div>

      {isExpanded && (
        <div className="border-t border-[#F1F3F5] bg-[#F8F9FA] p-1.5">
          <div className="text-[9px] font-medium text-[#8E9AAF] uppercase tracking-wide mb-1.5">
            Prestações
          </div>

          <div className="grid grid-cols-3 gap-1">
            {apartment.installments.map((inst, idx) => {
              const isInteractive = !!toolMode

              return (
                <button
                  key={inst.id}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    if (isInteractive) onCellClick(inst.id, inst.status, inst.expectedAmount)
                  }}
                  disabled={!isInteractive}
                  className={cn(
                    "p-1.5 text-center transition-all border rounded",
                    inst.status === "paid" && "bg-[#E8F0EA] border-[#D4E5D7]",
                    inst.status === "late" && "bg-[#F9ECEE] border-[#EFCDD1]",
                    inst.status === "pending" && "bg-white border-[#E9ECEF]",
                    isInteractive && "cursor-pointer active:scale-95",
                    !isInteractive && "cursor-default"
                  )}
                >
                  <div className="text-[8px] font-medium text-[#8E9AAF]">
                    P{idx + 1}
                  </div>
                  <div className="text-[9px] text-[#ADB5BD]">
                    {getMonthName(inst.month, true)}/{String(inst.year).slice(-2)}
                  </div>
                  <div className={cn(
                    "text-[10px] font-bold mt-0.5",
                    inst.status === "paid" && "text-[#6A9B72]",
                    inst.status === "late" && "text-[#B86B73]",
                    inst.status === "pending" && "text-[#8E9AAF]"
                  )}>
                    {inst.status === "paid" ? "✓" : inst.status === "late" ? "!" : "—"}
                  </div>
                </button>
              )
            })}
          </div>

          <div className="flex items-center justify-between mt-1.5 pt-1.5 border-t border-[#E9ECEF]">
            <span className="text-[9px] text-[#8E9AAF]">
              Quota: {apartment.permillage.toFixed(2)}‰
            </span>
            <span className={cn(
              "text-[9px] font-medium",
              apartment.balance > 0 ? "text-[#B86B73]" : "text-[#6A9B72]"
            )}>
              {apartment.balance > 0 ? `Dívida: ${formatCurrencyShort(apartment.balance)}` : "Em dia"}
            </span>
          </div>

          {toolMode && (
            <div className="mt-1.5 text-center text-[9px] text-[#8FB996] animate-pulse">
              Toque numa prestação para alterar
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// Projects List View
function ProjectsList({
  projects,
  onSelectProject,
}: {
  projects: Project[]
  onSelectProject: (project: Project) => void
}) {
  const { addToast } = useToast()
  const [showCreateModal, setShowCreateModal] = useState(false)

  return (
    <div className="flex-1 overflow-y-auto p-1.5">
      <div className="mb-1.5 flex items-center justify-between">
        <div>
          <h1 className="text-[14px] font-semibold text-[#343A40]">Quotas Extraordinárias</h1>
          <p className="text-[10px] text-[#8E9AAF]">Gestão de projetos e obras especiais</p>
        </div>
        <Button size="sm" onClick={() => setShowCreateModal(true)}>
          <Plus className="h-3 w-3" />
          <span className="hidden sm:inline ml-1">Novo Projeto</span>
        </Button>
      </div>

      {/* Stats */}
      <div className="mb-1.5 grid grid-cols-2 gap-1.5 lg:grid-cols-4">
        <StatCard
          label="Total Projetos"
          value={projects.length.toString()}
          icon={<Layers className="h-4 w-4" />}
        />
        <StatCard
          label="Orçamento Total"
          value={formatCurrencyShort(projects.reduce((sum, p) => sum + p.totalBudget, 0))}
          icon={<DollarSign className="h-4 w-4" />}
        />
        <StatCard
          label="Cobrado"
          value="€18.750"
          change={{ value: "45%", positive: true }}
          icon={<TrendingUp className="h-4 w-4" />}
        />
        <StatCard
          label="Em Curso"
          value={projects.length.toString()}
          icon={<Calendar className="h-4 w-4" />}
        />
      </div>

      {/* Projects List */}
      {projects.length === 0 ? (
        <Card>
          <EmptyState
            title="Sem projetos extraordinários"
            description="Crie o primeiro projeto para começar a gerir quotas extraordinárias."
            action={
              <Button size="sm" onClick={() => setShowCreateModal(true)}>
                <Plus className="h-3 w-3 mr-1" />
                Criar Projeto
              </Button>
            }
          />
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Projetos Ativos</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-[#F1F3F5]">
              {projects.map((project) => (
                <div
                  key={project.id}
                  onClick={() => onSelectProject(project)}
                  className="flex items-center justify-between p-1.5 hover:bg-[#F8F9FA] transition-colors cursor-pointer group"
                >
                  <div className="min-w-0 flex-1">
                    <h3 className="text-[11px] font-medium text-[#495057] truncate">
                      {project.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] text-[#8E9AAF] font-mono">
                        {formatCurrency(project.totalBudget)}
                      </span>
                      <span className="text-[10px] text-[#DEE2E6]">•</span>
                      <span className="text-[10px] text-[#8E9AAF]">
                        {project.numInstallments} prestações
                      </span>
                      <span className="text-[10px] text-[#DEE2E6]">•</span>
                      <span className="text-[10px] text-[#8E9AAF]">
                        {getMonthName(project.startMonth, true)}/{project.startYear}
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#DEE2E6] group-hover:text-[#8E9AAF] transition-colors shrink-0" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Create Project Modal */}
      <Modal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Novo Projeto Extraordinário"
        description="Crie um novo projeto para gerir quotas extraordinárias."
        footer={
          <div className="flex justify-end gap-1.5">
            <Button variant="outline" onClick={() => setShowCreateModal(false)}>
              Cancelar
            </Button>
            <Button onClick={() => {
              setShowCreateModal(false)
              addToast({ variant: "success", title: "Projeto criado", description: "O projeto foi criado com sucesso." })
            }}>
              Criar Projeto
            </Button>
          </div>
        }
      >
        <div className="space-y-1.5">
          <FormField label="Nome do Projeto" required>
            <Input placeholder="Ex: Reparação do Telhado" />
          </FormField>
          <FormField label="Descrição">
            <Input placeholder="Descrição breve do projeto" />
          </FormField>
          <div className="grid grid-cols-2 gap-1.5">
            <FormField label="Orçamento Total" required>
              <Input type="number" placeholder="15000" />
            </FormField>
            <FormField label="N.º Prestações" required>
              <Select>
                <option value="1">1 prestação</option>
                <option value="2">2 prestações</option>
                <option value="3">3 prestações</option>
                <option value="4">4 prestações</option>
                <option value="6">6 prestações</option>
                <option value="12">12 prestações</option>
              </Select>
            </FormField>
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            <FormField label="Mês de Início" required>
              <Select>
                {MONTHS.map((m, idx) => (
                  <option key={idx} value={idx + 1}>{m}</option>
                ))}
              </Select>
            </FormField>
            <FormField label="Ano" required>
              <Select>
                <option value="2025">2025</option>
                <option value="2026">2026</option>
              </Select>
            </FormField>
          </div>
        </div>
      </Modal>
    </div>
  )
}

// Project Detail View
function ProjectDetail({
  project,
  payments,
  onBack,
}: {
  project: Project
  payments: ApartmentPayment[]
  onBack: () => void
}) {
  const { addToast } = useToast()
  const [data, setData] = useState(payments)
  const [toolMode, setToolMode] = useState<ToolMode>(null)
  const [filterStatus, setFilterStatus] = useState<"all" | "complete" | "pending">("all")

  // Calculate totals
  const totalCollected = data.reduce((sum, p) => sum + p.totalPaid, 0)
  const progressPercent = project.totalBudget > 0
    ? Math.round((totalCollected / project.totalBudget) * 100)
    : 0

  // Filter payments
  const filteredPayments = filterStatus === "all"
    ? data
    : data.filter((p) => {
      if (filterStatus === "complete") return p.status === "complete"
      if (filterStatus === "pending") return p.status === "pending" || p.status === "partial"
      return true
    })

  // Handle cell click
  const handleCellClick = (paymentId: number, currentStatus: PaymentStatus, expectedAmount: number) => {
    if (!toolMode) return

    let newStatus: PaymentStatus
    let newPaidAmount: number

    if (toolMode === "markPaid") {
      newStatus = "paid"
      newPaidAmount = expectedAmount
    } else if (toolMode === "markPending") {
      newStatus = "pending"
      newPaidAmount = 0
    } else {
      // toggle
      if (currentStatus === "paid") {
        newStatus = "pending"
        newPaidAmount = 0
      } else {
        newStatus = "paid"
        newPaidAmount = expectedAmount
      }
    }

    setData((prev) =>
      prev.map((apt) => ({
        ...apt,
        installments: apt.installments.map((inst) =>
          inst.id === paymentId
            ? { ...inst, status: newStatus, paidAmount: newPaidAmount }
            : inst
        ),
        totalPaid: apt.installments.reduce((sum, inst) => {
          if (inst.id === paymentId) return sum + newPaidAmount
          return sum + inst.paidAmount
        }, 0),
      }))
    )

    addToast({
      variant: "success",
      title: "Pagamento atualizado",
      description: `Prestação marcada como ${newStatus === "paid" ? "paga" : "pendente"}.`,
    })
  }

  const handleToolClick = (tool: ToolMode) => {
    setToolMode((prev) => (prev === tool ? null : tool))
  }

  return (
    <div className="flex-1 overflow-y-auto p-1.5">
      {/* Header */}
      <div className="mb-1.5 flex items-center gap-1.5">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="h-3 w-3" />
        </Button>
        <div className="flex-1">
          <h1 className="text-[14px] font-semibold text-[#343A40]">{project.name}</h1>
          <p className="text-[10px] text-[#8E9AAF]">{project.description}</p>
        </div>
        <Dropdown
          trigger={
            <IconButton variant="outline" icon={<MoreVertical className="h-3 w-3" />} label="Opções" />
          }
          align="right"
        >
          <DropdownItem onClick={() => addToast({ variant: "info", title: "Editar", description: "Abrindo editor..." })}>
            <Edit className="mr-1.5 h-3 w-3" /> Editar Projeto
          </DropdownItem>
          <DropdownItem onClick={() => addToast({ variant: "info", title: "Exportar", description: "Exportando PDF..." })}>
            <FileText className="mr-1.5 h-3 w-3" /> Exportar PDF
          </DropdownItem>
          <DropdownItem onClick={() => addToast({ variant: "info", title: "Exportar", description: "Exportando Excel..." })}>
            <Download className="mr-1.5 h-3 w-3" /> Exportar Excel
          </DropdownItem>
          <DropdownDivider />
          <DropdownItem onClick={() => {}} destructive>
            <Trash2 className="mr-1.5 h-3 w-3" /> Eliminar Projeto
          </DropdownItem>
        </Dropdown>
      </div>

      {/* Stats */}
      <div className="mb-1.5 grid grid-cols-2 gap-1.5 lg:grid-cols-4">
        <StatCard
          label="Orçamento"
          value={formatCurrencyShort(project.totalBudget)}
          icon={<DollarSign className="h-4 w-4" />}
        />
        <StatCard
          label="Cobrado"
          value={formatCurrencyShort(totalCollected)}
          change={{ value: `${progressPercent}%`, positive: true }}
          icon={<TrendingUp className="h-4 w-4" />}
        />
        <StatCard
          label="Prestações"
          value={project.numInstallments.toString()}
          icon={<Calendar className="h-4 w-4" />}
        />
        <StatCard
          label="Frações"
          value={data.length.toString()}
          icon={<Building className="h-4 w-4" />}
        />
      </div>

      {/* Budget Progress */}
      <BudgetProgress
        totalCollected={totalCollected}
        totalBudget={project.totalBudget}
        progressPercent={progressPercent}
      />

      {/* Toolbar */}
      <Card className="mb-1.5">
        <CardContent className="flex flex-wrap items-center justify-between gap-1.5">
          {/* Tools */}
          <div className="flex items-center gap-1">
            <span className="text-[9px] font-medium text-[#8E9AAF] mr-1">FERRAMENTAS:</span>
            <ToolButton
              icon={<Check className="h-3 w-3" />}
              label="Pago"
              active={toolMode === "markPaid"}
              onClick={() => handleToolClick("markPaid")}
              variant="success"
            />
            <ToolButton
              icon={<RotateCcw className="h-3 w-3" />}
              label="Pendente"
              active={toolMode === "markPending"}
              onClick={() => handleToolClick("markPending")}
              variant="warning"
            />
            <ToolButton
              icon={<X className="h-3 w-3" />}
              label="Alternar"
              active={toolMode === "toggle"}
              onClick={() => handleToolClick("toggle")}
              variant="default"
            />
          </div>

          {/* Filter */}
          <Dropdown
            trigger={
              <Button variant="outline" size="sm">
                <Filter className="h-3 w-3" />
                <span className="hidden sm:inline ml-1">
                  {filterStatus === "all" ? "Todos" : filterStatus === "complete" ? "Pagos" : "Pendentes"}
                </span>
              </Button>
            }
          >
            <DropdownItem onClick={() => setFilterStatus("all")}>Todos</DropdownItem>
            <DropdownItem onClick={() => setFilterStatus("complete")}>Pagos</DropdownItem>
            <DropdownItem onClick={() => setFilterStatus("pending")}>Pendentes</DropdownItem>
          </Dropdown>
        </CardContent>
      </Card>

      {/* Edit mode indicator */}
      {toolMode && (
        <div className="mb-1.5 rounded-lg bg-[#E8F0EA] border border-[#D4E5D7] p-1.5 text-center">
          <span className="text-[10px] font-medium text-[#6A9B72]">
            Modo de edição ativo: clique nas células para{" "}
            {toolMode === "markPaid" ? "marcar como pago" : toolMode === "markPending" ? "marcar como pendente" : "alternar estado"}
          </span>
        </div>
      )}

      {/* Desktop Table */}
      <div className="hidden sm:block overflow-x-auto rounded-lg border border-[#E9ECEF] bg-white">
        <table className="w-full border-collapse text-[10px]">
          <thead>
            <tr className="bg-[#F8F9FA] border-b border-[#E9ECEF]">
              <th className="sticky left-0 z-10 bg-[#F8F9FA] px-1.5 py-1 text-center text-[9px] font-medium uppercase tracking-wide text-[#8E9AAF] w-12">
                Fração
              </th>
              <th className="px-1.5 py-1 text-left text-[9px] font-medium uppercase tracking-wide text-[#8E9AAF] w-28">
                Residente
              </th>
              <th className="px-1.5 py-1 text-right text-[9px] font-medium uppercase tracking-wide text-[#8E9AAF] w-14">
                ‰
              </th>
              <th className="px-1.5 py-1 text-right text-[9px] font-medium uppercase tracking-wide text-[#8E9AAF] w-20">
                Quota
              </th>
              {Array.from({ length: project.numInstallments }, (_, i) => {
                let month = project.startMonth + i
                let year = project.startYear
                while (month > 12) { month -= 12; year++ }
                return (
                  <th key={i} className="px-1.5 py-1 text-center text-[9px] font-medium uppercase tracking-wide text-[#8E9AAF] w-14">
                    <div>P{i + 1}</div>
                    <div className="text-[8px] font-normal text-[#ADB5BD]">
                      {getMonthName(month, true)}/{String(year).slice(-2)}
                    </div>
                  </th>
                )
              })}
              <th className="px-1.5 py-1 text-right text-[9px] font-medium uppercase tracking-wide text-[#8E9AAF] w-20">
                Pago
              </th>
              <th className="px-1.5 py-1 text-right text-[9px] font-medium uppercase tracking-wide text-[#8E9AAF] w-20">
                Dívida
              </th>
              <th className="px-1.5 py-1 text-center text-[9px] font-medium uppercase tracking-wide text-[#8E9AAF] w-16">
                Estado
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredPayments.map((apt, idx) => (
              <tr
                key={apt.apartmentId}
                className={cn(
                  "border-b border-[#F1F3F5] transition-colors hover:bg-[#F8F9FA]",
                  idx % 2 === 1 && "bg-[#FAFBFC]"
                )}
              >
                <td className="sticky left-0 z-10 bg-inherit px-1.5 py-1 text-center font-medium text-[#343A40]">
                  {apt.unit}
                </td>
                <td className="px-1.5 py-1 text-[#495057] truncate max-w-28">
                  {apt.residentName || <span className="text-[#ADB5BD] italic">Sem residente</span>}
                </td>
                <td className="px-1.5 py-1 text-right font-mono text-[#8E9AAF]">
                  {apt.permillage.toFixed(2)}
                </td>
                <td className="px-1.5 py-1 text-right font-mono text-[#495057]">
                  {formatCurrencyShort(apt.totalShare)}
                </td>
                {apt.installments.map((inst) => {
                  const isInteractive = !!toolMode

                  return (
                    <td key={inst.id} className="p-0.5">
                      <button
                        type="button"
                        disabled={!isInteractive}
                        onClick={() => isInteractive && handleCellClick(inst.id, inst.status, inst.expectedAmount)}
                        className={cn(
                          "w-full h-6 flex items-center justify-center rounded text-[9px] font-medium transition-all",
                          inst.status === "paid" && "bg-[#E8F0EA] text-[#6A9B72]",
                          inst.status === "late" && "bg-[#F9ECEE] text-[#B86B73]",
                          inst.status === "pending" && "text-[#ADB5BD]",
                          isInteractive && "cursor-crosshair hover:ring-1 hover:ring-[#8FB996]",
                          !isInteractive && "cursor-default"
                        )}
                      >
                        {inst.status === "paid" ? "✓" : inst.status === "late" ? "!" : "—"}
                      </button>
                    </td>
                  )
                })}
                <td className="px-1.5 py-1 text-right font-mono font-medium text-[#6A9B72]">
                  {formatCurrencyShort(apt.totalPaid)}
                </td>
                <td className={cn(
                  "px-1.5 py-1 text-right font-mono font-medium",
                  apt.balance > 0 ? "text-[#B86B73]" : "text-[#ADB5BD]"
                )}>
                  {formatCurrencyShort(apt.balance)}
                </td>
                <td className="px-1.5 py-1 text-center">
                  <Badge variant={
                    apt.status === "complete" ? "success" :
                      apt.status === "partial" ? "warning" : "error"
                  }>
                    {apt.status === "complete" ? "Pago" :
                      apt.status === "partial" ? "Parcial" : "Pendente"}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-[#F8F9FA] font-medium">
              <td className="sticky left-0 z-10 bg-[#F8F9FA] px-1.5 py-1 text-center">TOTAL</td>
              <td className="px-1.5 py-1">{data.length} Frações</td>
              <td className="px-1.5 py-1 text-right font-mono">{data.reduce((sum, p) => sum + p.permillage, 0).toFixed(2)}</td>
              <td className="px-1.5 py-1 text-right font-mono">{formatCurrencyShort(project.totalBudget)}</td>
              {Array.from({ length: project.numInstallments }, (_, i) => {
                const paidCount = data.filter((p) => p.installments[i]?.status === "paid").length
                const total = data.length
                return (
                  <td key={i} className="px-1.5 py-1 text-center">
                    <span className={cn(
                      "text-[9px] font-medium",
                      paidCount === total ? "text-[#6A9B72]" :
                        paidCount > 0 ? "text-[#B8963E]" : "text-[#ADB5BD]"
                    )}>
                      {paidCount}/{total}
                    </span>
                  </td>
                )
              })}
              <td className="px-1.5 py-1 text-right font-mono text-[#6A9B72]">{formatCurrencyShort(totalCollected)}</td>
              <td className="px-1.5 py-1 text-right font-mono text-[#B86B73]">{formatCurrencyShort(project.totalBudget - totalCollected)}</td>
              <td className="px-1.5 py-1 text-center text-[10px]">{progressPercent}%</td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="sm:hidden space-y-1.5">
        {filteredPayments.map((apt) => (
          <MobileApartmentCard
            key={apt.apartmentId}
            apartment={apt}
            project={project}
            toolMode={toolMode}
            onCellClick={handleCellClick}
          />
        ))}

        {/* Summary */}
        <div className="rounded-lg bg-[#F8F9FA] border border-[#E9ECEF] p-1.5">
          <div className="flex items-center justify-between text-[10px] font-medium uppercase tracking-wide">
            <span className="text-[#8E9AAF]">{filteredPayments.length} Frações</span>
            <span className="text-[#6A9B72]">{formatCurrencyShort(totalCollected)} Cobrado</span>
          </div>
        </div>
      </div>

      {/* Footer Legend */}
      <div className="mt-1.5 flex items-center justify-center gap-3 py-1.5 border-t border-[#F1F3F5]">
        <span className="flex items-center gap-1 text-[9px] text-[#8E9AAF]">
          <span className="w-2 h-2 bg-[#8FB996] rounded" /> Pago
        </span>
        <span className="flex items-center gap-1 text-[9px] text-[#8E9AAF]">
          <span className="w-2 h-2 bg-[#DEE2E6] rounded" /> Pendente
        </span>
        <span className="flex items-center gap-1 text-[9px] text-[#8E9AAF]">
          <span className="w-2 h-2 bg-[#D4848C] rounded" /> Em atraso
        </span>
      </div>
    </div>
  )
}

// Main Page
function ExtraordinaryQuotasContent() {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)

  if (selectedProject) {
    return (
      <ProjectDetail
        project={selectedProject}
        payments={mockPayments}
        onBack={() => setSelectedProject(null)}
      />
    )
  }

  return (
    <ProjectsList
      projects={mockProjects}
      onSelectProject={setSelectedProject}
    />
  )
}

export default function ExtraordinaryQuotasPage() {
  return (
    <ToastProvider>
      <div className="h-full bg-white">
        <ExtraordinaryQuotasContent />
      </div>
    </ToastProvider>
  )
}
