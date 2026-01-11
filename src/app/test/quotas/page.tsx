"use client"

import { useState } from "react"
import { Button } from "../components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../components/ui/card"
import { Badge } from "../components/ui/badge"
import { Input } from "../components/ui/input"
import { IconButton } from "../components/ui/icon-button"
import { StatCard } from "../components/ui/stat-card"
import { Progress } from "../components/ui/progress"
import { Dropdown, DropdownItem, DropdownDivider } from "../components/ui/dropdown"
import { ToastProvider, useToast } from "../components/ui/toast"
import { cn } from "@/lib/utils"
import {
  DollarSign, Users, TrendingDown, Calendar,
  Check, X, RotateCcw, Search, Filter,
  MoreVertical, ChevronDown, ChevronUp, User,
  Download, FileText,
} from "lucide-react"

// Types
type PaymentStatus = "paid" | "pending" | "late"
type ToolType = "markPaid" | "markPending" | "markLate" | null
type FilterMode = "all" | "paid" | "pending" | "late"

interface Payment {
  status: PaymentStatus
  amount: number
}

interface ApartmentData {
  id: number
  unit: string
  residentName: string | null
  payments: Record<number, Payment>
  totalPaid: number
  balance: number
}

// Mock data
const MONTHS = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"]
const MONTHLY_QUOTA = 8500 // in cents (85€)

const mockApartments: ApartmentData[] = [
  {
    id: 1,
    unit: "1A",
    residentName: "Maria Silva",
    payments: {
      1: { status: "paid", amount: 8500 },
      2: { status: "paid", amount: 8500 },
      3: { status: "paid", amount: 8500 },
      4: { status: "paid", amount: 8500 },
      5: { status: "paid", amount: 8500 },
      6: { status: "pending", amount: 0 },
    },
    totalPaid: 42500,
    balance: 0,
  },
  {
    id: 2,
    unit: "1B",
    residentName: "João Santos",
    payments: {
      1: { status: "paid", amount: 8500 },
      2: { status: "paid", amount: 8500 },
      3: { status: "late", amount: 0 },
      4: { status: "paid", amount: 8500 },
      5: { status: "pending", amount: 0 },
      6: { status: "pending", amount: 0 },
    },
    totalPaid: 25500,
    balance: 8500,
  },
  {
    id: 3,
    unit: "2A",
    residentName: "Ana Costa",
    payments: {
      1: { status: "paid", amount: 8500 },
      2: { status: "paid", amount: 8500 },
      3: { status: "paid", amount: 8500 },
      4: { status: "paid", amount: 8500 },
      5: { status: "paid", amount: 8500 },
      6: { status: "paid", amount: 8500 },
    },
    totalPaid: 51000,
    balance: 0,
  },
  {
    id: 4,
    unit: "2B",
    residentName: "Pedro Lima",
    payments: {
      1: { status: "paid", amount: 8500 },
      2: { status: "late", amount: 0 },
      3: { status: "late", amount: 0 },
      4: { status: "pending", amount: 0 },
      5: { status: "pending", amount: 0 },
      6: { status: "pending", amount: 0 },
    },
    totalPaid: 8500,
    balance: 17000,
  },
  {
    id: 5,
    unit: "3A",
    residentName: null,
    payments: {
      1: { status: "pending", amount: 0 },
      2: { status: "pending", amount: 0 },
      3: { status: "pending", amount: 0 },
      4: { status: "pending", amount: 0 },
      5: { status: "pending", amount: 0 },
      6: { status: "pending", amount: 0 },
    },
    totalPaid: 0,
    balance: 0,
  },
  {
    id: 6,
    unit: "3B",
    residentName: "Clara Reis",
    payments: {
      1: { status: "paid", amount: 8500 },
      2: { status: "paid", amount: 8500 },
      3: { status: "paid", amount: 8500 },
      4: { status: "paid", amount: 8500 },
      5: { status: "pending", amount: 0 },
      6: { status: "pending", amount: 0 },
    },
    totalPaid: 34000,
    balance: 0,
  },
]

// Utility
function formatCurrency(cents: number): string {
  return `€${(cents / 100).toFixed(0)}`
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

// Mobile Card Component
function MobileCard({
  apt,
  activeTool,
  onCellClick,
}: {
  apt: ApartmentData
  activeTool: ToolType
  onCellClick: (aptId: number, monthIdx: number) => void
}) {
  const [isExpanded, setIsExpanded] = useState(false)
  const hasDebt = apt.balance > 0
  const expectedTotal = 12 * MONTHLY_QUOTA
  const progressPercent = expectedTotal > 0 ? Math.round((apt.totalPaid / expectedTotal) * 100) : 0

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
              hasDebt
                ? "bg-[#F9ECEE] text-[#B86B73] border-[#EFCDD1]"
                : "bg-[#E8F0EA] text-[#6A9B72] border-[#D4E5D7]"
            )}>
              {apt.unit}
            </div>
            <div className="min-w-0 flex-1">
              {apt.residentName ? (
                <span className="text-[11px] font-medium text-[#495057] truncate block flex items-center gap-1">
                  <User className="w-3 h-3 text-[#8E9AAF] shrink-0" />
                  {apt.residentName}
                </span>
              ) : (
                <span className="text-[10px] text-[#8E9AAF] italic">Sem residente</span>
              )}
              <div className="text-[9px] text-[#8E9AAF] mt-0.5">
                {formatCurrency(apt.totalPaid)} de {formatCurrency(expectedTotal)}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <div className={cn(
              "px-1.5 py-0.5 rounded text-[9px] font-medium border",
              hasDebt
                ? "bg-[#F9ECEE] text-[#B86B73] border-[#EFCDD1]"
                : "bg-[#E8F0EA] text-[#6A9B72] border-[#D4E5D7]"
            )}>
              {hasDebt ? (
                <span className="flex items-center gap-0.5">
                  <TrendingDown className="w-3 h-3" />
                  {formatCurrency(apt.balance)}
                </span>
              ) : (
                "Em dia"
              )}
            </div>
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
            Quotas Mensais
          </div>

          <div className="grid grid-cols-6 gap-1">
            {MONTHS.map((monthName, idx) => {
              const monthNum = idx + 1
              const payment = apt.payments[monthNum]
              const status = payment?.status || "pending"
              const isInteractive = !!activeTool

              return (
                <button
                  key={idx}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    if (isInteractive) onCellClick(apt.id, idx)
                  }}
                  disabled={!isInteractive}
                  className={cn(
                    "p-1.5 text-center transition-all border rounded",
                    status === "paid" && "bg-[#E8F0EA] border-[#D4E5D7]",
                    status === "late" && "bg-[#F9ECEE] border-[#EFCDD1]",
                    status === "pending" && "bg-white border-[#E9ECEF]",
                    isInteractive && "cursor-pointer active:scale-95",
                    !isInteractive && "cursor-default"
                  )}
                >
                  <div className="text-[8px] font-medium text-[#8E9AAF]">{monthName}</div>
                  <div className={cn(
                    "text-[10px] font-bold mt-0.5",
                    status === "paid" && "text-[#6A9B72]",
                    status === "late" && "text-[#B86B73]",
                    status === "pending" && "text-[#8E9AAF]"
                  )}>
                    {status === "paid" ? "✓" : status === "late" ? "!" : "—"}
                  </div>
                </button>
              )
            })}
          </div>

          <div className="flex items-center justify-center gap-2 mt-1.5 pt-1.5 border-t border-[#E9ECEF]">
            <span className="flex items-center gap-0.5 text-[8px] text-[#8E9AAF]">
              <span className="w-2 h-2 bg-[#8FB996] rounded-sm" /> Pago
            </span>
            <span className="flex items-center gap-0.5 text-[8px] text-[#8E9AAF]">
              <span className="w-2 h-2 bg-[#DEE2E6] rounded-sm" /> Pendente
            </span>
            <span className="flex items-center gap-0.5 text-[8px] text-[#8E9AAF]">
              <span className="w-2 h-2 bg-[#D4848C] rounded-sm" /> Dívida
            </span>
          </div>

          {activeTool && (
            <div className="mt-1.5 text-center text-[9px] text-[#8FB996] animate-pulse">
              Toque num mês para alterar
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// Desktop Table Component
function DesktopTable({
  data,
  activeTool,
  onCellClick,
}: {
  data: ApartmentData[]
  activeTool: ToolType
  onCellClick: (aptId: number, monthIdx: number) => void
}) {
  return (
    <div className="hidden sm:block overflow-x-auto rounded-lg border border-[#E9ECEF]">
      <table className="w-full border-collapse text-[10px]">
        <thead>
          <tr className="bg-[#F8F9FA] border-b border-[#E9ECEF]">
            <th className="sticky left-0 z-10 bg-[#F8F9FA] px-1.5 py-1 text-left text-[9px] font-medium uppercase tracking-wide text-[#8E9AAF] border-r border-[#E9ECEF] w-12">
              Fração
            </th>
            <th className="sticky left-12 z-10 bg-[#F8F9FA] px-1.5 py-1 text-left text-[9px] font-medium uppercase tracking-wide text-[#8E9AAF] border-r border-[#E9ECEF] w-28">
              Residente
            </th>
            {MONTHS.map((month) => (
              <th key={month} className="px-1.5 py-1 text-center text-[9px] font-medium uppercase tracking-wide text-[#8E9AAF] w-12">
                {month}
              </th>
            ))}
            <th className="sticky right-16 z-10 bg-[#F8F9FA] px-1.5 py-1 text-right text-[9px] font-medium uppercase tracking-wide text-[#8E9AAF] border-l border-[#E9ECEF] w-16">
              Pago
            </th>
            <th className="sticky right-0 z-10 bg-[#F8F9FA] px-1.5 py-1 text-right text-[9px] font-medium uppercase tracking-wide text-[#8E9AAF] w-16">
              Dívida
            </th>
          </tr>
        </thead>
        <tbody>
          {data.map((apt, idx) => (
            <tr
              key={apt.id}
              className={cn(
                "border-b border-[#F1F3F5] transition-colors hover:bg-[#F8F9FA]",
                idx % 2 === 1 && "bg-[#FAFBFC]"
              )}
            >
              <td className="sticky left-0 z-10 bg-inherit px-1.5 py-1 font-medium text-[#343A40] border-r border-[#E9ECEF]">
                {apt.unit}
              </td>
              <td className="sticky left-12 z-10 bg-inherit px-1.5 py-1 text-[#495057] border-r border-[#E9ECEF] truncate max-w-28">
                {apt.residentName || <span className="text-[#ADB5BD] italic">Sem residente</span>}
              </td>
              {MONTHS.map((_, monthIdx) => {
                const monthNum = monthIdx + 1
                const payment = apt.payments[monthNum]
                const status = payment?.status || "pending"
                const isInteractive = !!activeTool

                return (
                  <td key={monthIdx} className="p-0.5">
                    <button
                      type="button"
                      disabled={!isInteractive}
                      onClick={() => isInteractive && onCellClick(apt.id, monthIdx)}
                      className={cn(
                        "w-full h-6 flex items-center justify-center rounded text-[9px] font-medium transition-all",
                        status === "paid" && "bg-[#E8F0EA] text-[#6A9B72]",
                        status === "late" && "bg-[#F9ECEE] text-[#B86B73]",
                        status === "pending" && "text-[#ADB5BD]",
                        isInteractive && "cursor-crosshair hover:ring-1 hover:ring-[#8FB996]",
                        !isInteractive && "cursor-default"
                      )}
                    >
                      {status === "paid" ? formatCurrency(payment?.amount || MONTHLY_QUOTA) : status === "late" ? "DÍVIDA" : "-"}
                    </button>
                  </td>
                )
              })}
              <td className="sticky right-16 z-10 bg-inherit px-1.5 py-1 text-right font-mono font-medium text-[#6A9B72] border-l border-[#E9ECEF]">
                {formatCurrency(apt.totalPaid)}
              </td>
              <td className={cn(
                "sticky right-0 z-10 bg-inherit px-1.5 py-1 text-right font-mono font-medium",
                apt.balance > 0 ? "text-[#B86B73] bg-[#F9ECEE]" : "text-[#ADB5BD]"
              )}>
                {formatCurrency(apt.balance)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// Main Content
function PaymentQuotasContent() {
  const { addToast } = useToast()
  const [data, setData] = useState(mockApartments)
  const [activeTool, setActiveTool] = useState<ToolType>(null)
  const [filterMode, setFilterMode] = useState<FilterMode>("all")
  const [searchTerm, setSearchTerm] = useState("")

  // Filter data
  const filteredData = data.filter((apt) => {
    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      if (!apt.unit.toLowerCase().includes(term) && !apt.residentName?.toLowerCase().includes(term)) {
        return false
      }
    }

    // Status filter
    if (filterMode === "paid") return apt.balance === 0
    if (filterMode === "late") return apt.balance > 0
    if (filterMode === "pending") {
      return Object.values(apt.payments).some((p) => p.status === "pending")
    }

    return true
  })

  // Calculate stats
  const totalCollected = data.reduce((sum, apt) => sum + apt.totalPaid, 0)
  const totalOverdue = data.reduce((sum, apt) => sum + apt.balance, 0)
  const paidCount = data.filter((apt) => apt.balance === 0).length
  const overdueCount = data.filter((apt) => apt.balance > 0).length

  // Handle cell click
  const handleCellClick = (aptId: number, monthIdx: number) => {
    if (!activeTool) return

    const monthNum = monthIdx + 1
    let newStatus: PaymentStatus

    if (activeTool === "markPaid") newStatus = "paid"
    else if (activeTool === "markPending") newStatus = "pending"
    else newStatus = "late"

    setData((prev) =>
      prev.map((apt) => {
        if (apt.id !== aptId) return apt

        const newPayments = {
          ...apt.payments,
          [monthNum]: {
            status: newStatus,
            amount: newStatus === "paid" ? MONTHLY_QUOTA : 0,
          },
        }

        const totalPaid = Object.values(newPayments).reduce(
          (sum, p) => sum + (p.status === "paid" ? (p.amount || MONTHLY_QUOTA) : 0),
          0
        )
        const currentMonth = new Date().getMonth() + 1
        const expectedTotal = currentMonth * MONTHLY_QUOTA
        const balance = Math.max(0, expectedTotal - totalPaid)

        return {
          ...apt,
          payments: newPayments,
          totalPaid,
          balance,
        }
      })
    )

    addToast({
      variant: "success",
      title: "Pagamento atualizado",
      description: `${MONTHS[monthIdx]} marcado como ${newStatus === "paid" ? "pago" : newStatus === "late" ? "em dívida" : "pendente"}.`,
    })
  }

  const handleToolClick = (tool: ToolType) => {
    setActiveTool((prev) => (prev === tool ? null : tool))
  }

  return (
    <div className="flex-1 overflow-y-auto p-1.5">
      <div className="mb-1.5">
        <h1 className="text-[14px] font-semibold text-[#343A40]">Quotas Mensais</h1>
        <p className="text-[10px] text-[#8E9AAF]">Gestão de pagamentos de quotas do condomínio - 2025</p>
      </div>

      {/* Stats */}
      <div className="mb-1.5 grid grid-cols-2 gap-1.5 lg:grid-cols-4">
        <StatCard
          label="Total Cobrado"
          value={formatCurrency(totalCollected)}
          change={{ value: "12%", positive: true }}
          icon={<DollarSign className="h-4 w-4" />}
        />
        <StatCard
          label="Frações"
          value={data.length.toString()}
          icon={<Users className="h-4 w-4" />}
        />
        <StatCard
          label="Em Dia"
          value={paidCount.toString()}
          icon={<Check className="h-4 w-4" />}
        />
        <StatCard
          label="Em Dívida"
          value={formatCurrency(totalOverdue)}
          change={overdueCount > 0 ? { value: `${overdueCount} frações`, positive: false } : undefined}
          icon={<TrendingDown className="h-4 w-4" />}
        />
      </div>

      {/* Toolbar */}
      <Card className="mb-1.5">
        <CardContent className="flex flex-wrap items-center justify-between gap-1.5">
          {/* Tools */}
          <div className="flex items-center gap-1">
            <span className="text-[9px] font-medium text-[#8E9AAF] mr-1">FERRAMENTAS:</span>
            <ToolButton
              icon={<Check className="h-3 w-3" />}
              label="Pago"
              active={activeTool === "markPaid"}
              onClick={() => handleToolClick("markPaid")}
              variant="success"
            />
            <ToolButton
              icon={<RotateCcw className="h-3 w-3" />}
              label="Pendente"
              active={activeTool === "markPending"}
              onClick={() => handleToolClick("markPending")}
              variant="warning"
            />
            <ToolButton
              icon={<X className="h-3 w-3" />}
              label="Dívida"
              active={activeTool === "markLate"}
              onClick={() => handleToolClick("markLate")}
              variant="error"
            />
          </div>

          {/* Search & Filter */}
          <div className="flex items-center gap-1.5">
            <div className="relative">
              <Search className="absolute left-1.5 top-1/2 -translate-y-1/2 h-3 w-3 text-[#8E9AAF]" />
              <Input
                type="text"
                placeholder="Pesquisar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-6 w-32"
              />
            </div>

            <Dropdown
              trigger={
                <Button variant="outline" size="sm">
                  <Filter className="h-3 w-3" />
                  <span className="hidden sm:inline ml-1">
                    {filterMode === "all" ? "Todos" : filterMode === "paid" ? "Em dia" : filterMode === "late" ? "Em dívida" : "Pendentes"}
                  </span>
                </Button>
              }
            >
              <DropdownItem onClick={() => setFilterMode("all")}>Todos</DropdownItem>
              <DropdownItem onClick={() => setFilterMode("paid")}>Em dia</DropdownItem>
              <DropdownItem onClick={() => setFilterMode("pending")}>Pendentes</DropdownItem>
              <DropdownItem onClick={() => setFilterMode("late")}>Em dívida</DropdownItem>
            </Dropdown>

            <Dropdown
              trigger={
                <IconButton variant="outline" icon={<MoreVertical className="h-3 w-3" />} label="Mais opções" />
              }
              align="right"
            >
              <DropdownItem onClick={() => addToast({ variant: "info", title: "Exportar", description: "Exportando para PDF..." })}>
                <FileText className="mr-1.5 h-3 w-3" /> Exportar PDF
              </DropdownItem>
              <DropdownItem onClick={() => addToast({ variant: "info", title: "Exportar", description: "Exportando para Excel..." })}>
                <Download className="mr-1.5 h-3 w-3" /> Exportar Excel
              </DropdownItem>
            </Dropdown>
          </div>
        </CardContent>
      </Card>

      {/* Edit mode indicator */}
      {activeTool && (
        <div className="mb-1.5 rounded-lg bg-[#E8F0EA] border border-[#D4E5D7] p-1.5 text-center">
          <span className="text-[10px] font-medium text-[#6A9B72]">
            Modo de edição ativo: clique nas células para marcar como{" "}
            {activeTool === "markPaid" ? "pago" : activeTool === "markPending" ? "pendente" : "em dívida"}
          </span>
        </div>
      )}

      {/* Desktop Table */}
      <DesktopTable
        data={filteredData}
        activeTool={activeTool}
        onCellClick={handleCellClick}
      />

      {/* Mobile Cards */}
      <div className="sm:hidden space-y-1.5">
        {filteredData.map((apt) => (
          <MobileCard
            key={apt.id}
            apt={apt}
            activeTool={activeTool}
            onCellClick={handleCellClick}
          />
        ))}

        {/* Summary */}
        <div className="rounded-lg bg-[#F8F9FA] border border-[#E9ECEF] p-1.5">
          <div className="flex items-center justify-between text-[10px] font-medium uppercase tracking-wide">
            <span className="text-[#8E9AAF]">{filteredData.length} Frações</span>
            <div className="flex items-center gap-2">
              <span className="text-[#6A9B72]">{formatCurrency(totalCollected)} Cobrado</span>
              {totalOverdue > 0 && (
                <span className="text-[#B86B73]">{formatCurrency(totalOverdue)} Dívida</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Empty state */}
      {filteredData.length === 0 && (
        <div className="flex items-center justify-center h-48 rounded-lg border border-dashed border-[#DEE2E6] bg-[#F8F9FA]">
          <div className="text-center">
            <p className="text-[11px] font-medium text-[#8E9AAF] uppercase tracking-wide">
              Sem frações
            </p>
            <p className="text-[10px] text-[#ADB5BD] mt-1">
              Nenhum registo corresponde ao filtro
            </p>
          </div>
        </div>
      )}

      {/* Footer Legend */}
      <div className="mt-1.5 flex items-center justify-center gap-3 py-1.5 border-t border-[#F1F3F5]">
        <span className="flex items-center gap-1 text-[9px] text-[#8E9AAF]">
          <span className="w-2 h-2 bg-[#8FB996] rounded" /> Pago
        </span>
        <span className="flex items-center gap-1 text-[9px] text-[#8E9AAF]">
          <span className="w-2 h-2 bg-[#DEE2E6] rounded" /> Pendente
        </span>
        <span className="flex items-center gap-1 text-[9px] text-[#8E9AAF]">
          <span className="w-2 h-2 bg-[#D4848C] rounded" /> Em dívida
        </span>
      </div>
    </div>
  )
}

export default function PaymentQuotasPage() {
  return (
    <ToastProvider>
      <div className="h-full bg-white">
        <PaymentQuotasContent />
      </div>
    </ToastProvider>
  )
}
