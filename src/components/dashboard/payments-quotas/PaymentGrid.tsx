"use client"

import { useState, useEffect, useCallback, useMemo, useOptimistic, useTransition } from "react"
import { useRouter } from "next/navigation"
import {
    DollarSign, Users, TrendingDown,
    Check, X, RotateCcw, Search, Filter,
    MoreVertical, Download, FileText, Inbox,
} from "lucide-react"
import { updatePaymentStatus } from "@/lib/actions/payments-quotas"
import { deleteApartment } from "@/lib/actions/building"
import { formatCurrency } from "@/lib/format"
import { PaymentDesktopTable } from "./PaymentDesktopTable"
import { PaymentMobileCards } from "./PaymentMobileCards"
import { Card, CardContent } from "@/components/ui/Card"
import { Input } from "@/components/ui/Input"
import { StatCard } from "@/components/ui/Stat-Card"
import { ToolButton, ToolButtonGroup } from "@/components/ui/Tool-Button"
import { Dropdown, DropdownTrigger, DropdownContent, DropdownItem } from "@/components/ui/Dropdown"
import { EmptyState } from "@/components/ui/Empty-State"
import { ConfirmModal } from "@/components/ui/ConfirmModal"
import { useToast } from "@/components/ui/Toast"
import { useAsyncAction } from "@/hooks/useAsyncAction"
import {
    type PaymentToolType,
    type PaymentFilterMode,
    type PaymentData
} from "@/lib/types"
import { PAYMENT_TOOL_TO_STATUS } from "@/lib/constants/ui"

interface PaymentGridProps {
    data: PaymentData[]
    monthlyQuota: number
    buildingId: string
    year: number
    readOnly?: boolean
}

export function PaymentGrid({
    data,
    monthlyQuota,
    buildingId: _buildingId,
    year,
    readOnly = false,
}: PaymentGridProps) {
    const router = useRouter()
    const { addToast } = useToast()
    const [isPending, startTransition] = useTransition()

    // Optimistic State
    const [optimisticData, addOptimistic] = useOptimistic(
        data,
        (state: PaymentData[], action: { aptId: number; monthNum: number; status: string }) => {
            return state.map((apt) => {
                if (apt.apartmentId === action.aptId) {
                    const dbStatus = action.status
                    const newPayments = {
                        ...apt.payments,
                        [action.monthNum]: {
                            status: dbStatus,
                            amount: dbStatus === 'paid' ? monthlyQuota : 0
                        }
                    }

                    const totalPaid = Object.values(newPayments).reduce((sum, p) =>
                        sum + (p.status === 'paid' ? (p.amount || monthlyQuota) : 0), 0
                    )

                    const currentMonth = new Date().getMonth() + 1
                    const isCurrentYear = new Date().getFullYear() === year
                    const monthsToCount = isCurrentYear ? currentMonth : 12
                    const expectedTotal = monthsToCount * monthlyQuota
                    const balance = Math.max(0, expectedTotal - totalPaid)

                    return {
                        ...apt,
                        payments: newPayments,
                        totalPaid,
                        balance
                    }
                }
                return apt
            })
        }
    )

    const [searchTerm, setSearchTerm] = useState("")
    const [highlightedId, setHighlightedId] = useState<number | null>(null)
    const [activeTool, setActiveTool] = useState<PaymentToolType>(null)
    const [filterMode, setFilterMode] = useState<PaymentFilterMode>("all")
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
    const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null)

    // Clear highlight after delay
    useEffect(() => {
        if (highlightedId !== null) {
            const timer = setTimeout(() => setHighlightedId(null), 3000)
            return () => clearTimeout(timer)
        }
    }, [highlightedId])

    // Delete action
    const { execute: removeApartment } = useAsyncAction(deleteApartment, {
        onSuccess: () => {
            router.refresh()
            addToast({
                title: "Sucesso",
                description: "Fração removida com sucesso",
                variant: "success"
            })
        },
        onError: () => {
            addToast({
                title: "Erro",
                description: "Não foi possível remover a fração",
                variant: "error"
            })
        }
    })

    // Filter and search logic
    const filteredData = useMemo(() => {
        let result = optimisticData

        if (searchTerm) {
            const term = searchTerm.toLowerCase()
            result = result.filter(apt =>
                apt.unit.toLowerCase().includes(term) ||
                apt.residentName?.toLowerCase().includes(term)
            )
        }

        if (filterMode !== "all") {
            result = result.filter(apt => {
                if (filterMode === "paid") return apt.balance === 0
                if (filterMode === "late") return apt.balance > 0
                if (filterMode === "pending") {
                    return Object.values(apt.payments).some(p => p.status === 'pending')
                }
                return true
            })
        }

        return result
    }, [optimisticData, searchTerm, filterMode])

    // Calculate stats
    const totalCollected = optimisticData.reduce((sum, apt) => sum + apt.totalPaid, 0)
    const totalOverdue = optimisticData.reduce((sum, apt) => sum + apt.balance, 0)
    const paidCount = optimisticData.filter(apt => apt.balance === 0).length
    const overdueCount = optimisticData.filter(apt => apt.balance > 0).length

    // Cell click handler - optimistic updates with background sync
    const handleCellClick = useCallback((aptId: number, monthIdx: number) => {
        if (!activeTool || readOnly) return

        const dbStatus = PAYMENT_TOOL_TO_STATUS[activeTool]
        const monthNum = monthIdx + 1

        // Optimistic update - UI changes immediately
        startTransition(async () => {
            addOptimistic({ aptId, monthNum, status: dbStatus })

            // Background sync - no blocking
            const result = await updatePaymentStatus(aptId, monthNum, year, dbStatus as 'paid' | 'late' | 'pending')

            if (!result.success) {
                // Only show error toast on failure (optimistic update will be reverted on next refresh)
                addToast({
                    title: "Erro",
                    description: "Não foi possível atualizar o pagamento",
                    variant: "error"
                })
                router.refresh() // Revert optimistic state
            }
        })
    }, [activeTool, readOnly, year, startTransition, addOptimistic, addToast, router])

    // Tool toggle
    const handleToolClick = (tool: PaymentToolType) => {
        setActiveTool(prev => prev === tool ? null : tool)
    }

    // Delete handlers
    const handleDeleteClick = useCallback((aptId: number) => {
        setDeleteTargetId(aptId)
        setShowDeleteConfirm(true)
    }, [])

    const handleDeleteConfirm = async (): Promise<void> => {
        if (!deleteTargetId) return
        await removeApartment(deleteTargetId)
        setShowDeleteConfirm(false)
        setDeleteTargetId(null)
    }

    return (
        <div className="flex-1 overflow-y-auto p-1.5">
            <ConfirmModal
                isOpen={showDeleteConfirm}
                title="Eliminar Fração"
                message="Tem a certeza que deseja eliminar esta fração? Todos os pagamentos associados serão também eliminados. Esta ação é irreversível."
                onConfirm={handleDeleteConfirm}
                onCancel={() => setShowDeleteConfirm(false)}
                variant="danger"
                confirmText="Eliminar"
                cancelText="Cancelar"
            />

            {/* Page header */}
            <div className="mb-1.5">
                <h1 className="text-[14px] font-semibold text-gray-800">Quotas Mensais</h1>
                <p className="text-[10px] text-gray-500">Gestão de pagamentos de quotas do condomínio - {year}</p>
            </div>

            {/* Stats */}
            <div className="mb-1.5 grid grid-cols-2 gap-1.5 lg:grid-cols-4">
                <StatCard
                    label="Total Cobrado"
                    value={formatCurrency(totalCollected)}
                    icon={<DollarSign className="h-4 w-4" />}
                />
                <StatCard
                    label="Frações"
                    value={optimisticData.length.toString()}
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
            {!readOnly && (
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
                                <Search className="absolute left-1.5 top-1/2 -translate-y-1/2 h-3 w-3 text-gray-400" />
                                <Input
                                    type="text"
                                    placeholder="Pesquisar..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-6 w-32 h-7 text-[10px]"
                                />
                            </div>

                            <Dropdown>
                                <DropdownTrigger className="inline-flex items-center justify-center gap-1 rounded-md border border-gray-200 bg-white px-2 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50">
                                    <Filter className="h-3 w-3" />
                                    <span className="hidden sm:inline">
                                        {filterMode === "all" ? "Todos" : filterMode === "paid" ? "Em dia" : filterMode === "late" ? "Em dívida" : "Pendentes"}
                                    </span>
                                </DropdownTrigger>
                                <DropdownContent>
                                    <DropdownItem onClick={() => setFilterMode("all")}>Todos</DropdownItem>
                                    <DropdownItem onClick={() => setFilterMode("paid")}>Em dia</DropdownItem>
                                    <DropdownItem onClick={() => setFilterMode("pending")}>Pendentes</DropdownItem>
                                    <DropdownItem onClick={() => setFilterMode("late")}>Em dívida</DropdownItem>
                                </DropdownContent>
                            </Dropdown>

                            <Dropdown>
                                <DropdownTrigger className="inline-flex h-7 w-7 items-center justify-center rounded border border-gray-200 bg-white text-gray-600 hover:bg-gray-50">
                                    <MoreVertical className="h-3 w-3" />
                                </DropdownTrigger>
                                <DropdownContent align="end">
                                    <DropdownItem onClick={() => addToast({ variant: "info", title: "Exportar", description: "Exportando para PDF..." })}>
                                        <FileText className="mr-1.5 h-3 w-3" /> Exportar PDF
                                    </DropdownItem>
                                    <DropdownItem onClick={() => addToast({ variant: "info", title: "Exportar", description: "Exportando para Excel..." })}>
                                        <Download className="mr-1.5 h-3 w-3" /> Exportar Excel
                                    </DropdownItem>
                                </DropdownContent>
                            </Dropdown>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Edit mode indicator */}
            {activeTool && (
                <div className="rounded-lg bg-primary-light border border-primary p-1.5 text-center mb-1.5">
                    <span className="text-label font-medium text-primary-dark">
                        Modo de edição ativo: clique nas células para {activeTool === 'markPaid' ? 'marcar como pago' : activeTool === 'markLate' ? 'marcar como em dívida' : 'marcar como pendente'}
                        {isPending && <span className="ml-2 italic opacity-70">— A guardar...</span>}
                    </span>
                </div>
            )}

            {/* Desktop Table */}
            <PaymentDesktopTable
                data={filteredData}
                monthlyQuota={monthlyQuota}
                readOnly={readOnly}
                activeTool={activeTool}
                highlightedId={highlightedId}
                onCellClick={handleCellClick}
                onDelete={handleDeleteClick}
            />

            {/* Mobile Cards */}
            <div className="sm:hidden">
                <PaymentMobileCards
                    data={filteredData}
                    monthlyQuota={monthlyQuota}
                    activeTool={activeTool}
                    onCellClick={handleCellClick}
                />
            </div>

            {/* Empty state */}
            {filteredData.length === 0 && (
                <EmptyState
                    icon={<Inbox className="h-6 w-6" />}
                    title="Sem frações"
                    description="Nenhum registo corresponde ao filtro"
                    className="h-48 rounded-lg border border-dashed border-gray-300 bg-gray-50"
                />
            )}

            {/* Footer Legend */}
            <div className="flex items-center justify-center gap-3 py-1.5 mt-1.5 border-t border-gray-100 bg-white">
                <span className="flex items-center gap-1 text-xs text-gray-500">
                    <span className="w-2 h-2 bg-primary rounded" /> Pago
                </span>
                <span className="flex items-center gap-1 text-xs text-gray-500">
                    <span className="w-2 h-2 bg-gray-300 rounded" /> Pendente
                </span>
                <span className="flex items-center gap-1 text-xs text-gray-500">
                    <span className="w-2 h-2 bg-error rounded" /> Em dívida
                </span>
            </div>
        </div>
    )
}

export default PaymentGrid