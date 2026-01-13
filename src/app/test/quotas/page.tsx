"use client"

import { useState } from "react"
import { Button } from "../components/ui/Button"
import { Card, CardContent } from "../components/ui/Card"
import { Input } from "../components/ui/Input"
import { IconButton } from "../components/ui/Icon-Button"
import { StatCard } from "../components/ui/Stat-Card"
import { Dropdown, DropdownItem } from "../components/ui/Dropdown"
import { ToastProvider, useToast } from "../components/ui/Toast"
import { ToolButton, ToolButtonGroup } from "../components/ui/Tool-Button"
import { EmptyState } from "../components/ui/Empty-State"

// Feature-specific payment grid components
import {
  type ApartmentData,
  type PaymentStatus,
  type ToolType,
  MONTHLY_QUOTA,
  formatCurrency,
  MobilePaymentCard,
  DesktopPaymentTable,
  PaymentGridSummary,
  PaymentGridLegend,
  EditModeIndicator,
} from "../components/features/quotas"

import {
  DollarSign, Users, TrendingDown,
  Check, X, RotateCcw, Search, Filter,
  MoreVertical, Download, FileText, Inbox,
} from "lucide-react"

// =============================================================================
// TYPES
// =============================================================================
type FilterMode = "all" | "paid" | "pending" | "late"

// =============================================================================
// MOCK DATA
// =============================================================================
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

// =============================================================================
// MAIN CONTENT
// =============================================================================
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

    const statusLabels = { paid: "pago", late: "em dívida", pending: "pendente" }
    addToast({
      variant: "success",
      title: "Pagamento atualizado",
      description: `Marcado como ${statusLabels[newStatus]}.`,
    })
  }

  const handleToolClick = (tool: ToolType) => {
    setActiveTool((prev) => (prev === tool ? null : tool))
  }

  return (
    <div className="flex-1 overflow-y-auto p-1.5">
      {/* Page header */}
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
          <ToolButtonGroup label="Ferramentas">
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
          </ToolButtonGroup>

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
      <EditModeIndicator activeTool={activeTool} className="mb-1.5" />

      {/* Desktop Table */}
      <DesktopPaymentTable
        data={filteredData}
        activeTool={activeTool}
        onCellClick={handleCellClick}
      />

      {/* Mobile Cards */}
      <div className="sm:hidden space-y-1.5">
        {filteredData.map((apt) => (
          <MobilePaymentCard
            key={apt.id}
            apartment={apt}
            activeTool={activeTool}
            onCellClick={handleCellClick}
          />
        ))}

        {/* Summary */}
        {filteredData.length > 0 && (
          <PaymentGridSummary
            count={filteredData.length}
            totalCollected={totalCollected}
            totalOverdue={totalOverdue}
          />
        )}
      </div>

      {/* Empty state */}
      {filteredData.length === 0 && (
        <EmptyState
          icon={<Inbox className="h-6 w-6" />}
          title="Sem frações"
          description="Nenhum registo corresponde ao filtro"
          className="h-48 rounded-lg border border-dashed border-[#DEE2E6] bg-[#F8F9FA]"
        />
      )}

      {/* Footer Legend */}
      <PaymentGridLegend className="mt-1.5" />
    </div>
  )
}

// =============================================================================
// PAGE EXPORT
// =============================================================================
export default function PaymentQuotasPage() {
  return (
    <ToastProvider>
      <div className="h-full bg-white">
        <PaymentQuotasContent />
      </div>
    </ToastProvider>
  )
}
