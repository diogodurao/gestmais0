"use client"

import { useState, useCallback, useOptimistic, useTransition } from "react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { getMonthName } from "@/lib/format"
import {
    updateExtraordinaryPayment,
    type ApartmentPaymentData
} from "@/lib/actions/extraordinary-projects"
import { useToast } from "@/components/ui/Toast"

// Sub-components
import { BudgetProgress } from "./components/BudgetProgress"
import { ExtraPaymentGridToolbar, EditModeIndicator } from "./components/ExtraPaymentGridToolbar"
import { MobileApartmentCard } from "./components/MobileApartmentCard"
import { ApartmentRow } from "./components/ApartmentRow"

// Types
import {
    type ExtraordinaryToolMode,
    type PaymentStatus,
    type ExtraordinaryProjectSummary
} from "@/lib/types"

interface ExtraPaymentGridProps {
    project: ExtraordinaryProjectSummary
    payments: ApartmentPaymentData[]
    onRefresh?: () => void
    readOnly?: boolean
}

function formatCurrencyShort(cents: number): string {
    return `€${(cents / 100).toFixed(0)}`
}

export function ExtraPaymentGrid({ project, payments, readOnly = false }: ExtraPaymentGridProps) {
    const router = useRouter()
    const { addToast } = useToast()
    const [isPending, startTransition] = useTransition()

    const [toolMode, setToolMode] = useState<ExtraordinaryToolMode>(null)
    const [filterStatus, setFilterStatus] = useState<PaymentStatus | "all">("all")

    // Optimistic State
    const [optimisticPayments, addOptimistic] = useOptimistic(
        payments,
        (state: ApartmentPaymentData[], action: { paymentId: number; status: PaymentStatus; paidAmount: number }) => {
            return state.map((apt) => ({
                ...apt,
                installments: apt.installments.map((inst) =>
                    inst.id === action.paymentId
                        ? { ...inst, status: action.status, paidAmount: action.paidAmount }
                        : inst
                ),
                totalPaid: apt.installments.reduce((sum, inst) => {
                    if (inst.id === action.paymentId) return sum + action.paidAmount
                    return sum + inst.paidAmount
                }, 0),
            }))
        }
    )

    // Calculate totals
    const totalCollected = optimisticPayments.reduce((sum, p) => sum + p.totalPaid, 0)
    const progressPercent = project.totalBudget > 0
        ? Math.round((totalCollected / project.totalBudget) * 100)
        : 0

    // Filter payments
    const filteredPayments = filterStatus === "all"
        ? optimisticPayments
        : optimisticPayments.filter((p) => {
            if (filterStatus === "paid") return p.status === "complete"
            if (filterStatus === "pending") return p.status === "pending" || p.status === "partial"
            return true
        })

    // Cell click handler - optimistic updates with background sync (instant, no debounce)
    const handleCellClick = useCallback((
        paymentId: number,
        currentStatus: PaymentStatus,
        expectedAmount: number
    ) => {
        if (!toolMode || readOnly) return

        let newStatus: PaymentStatus
        let newPaidAmount: number

        if (toolMode === "markPaid") {
            newStatus = "paid"
            newPaidAmount = expectedAmount
        } else if (toolMode === "markPending") {
            newStatus = "pending"
            newPaidAmount = 0
        } else if (toolMode === "markLate") {
            newStatus = "late"
            newPaidAmount = 0
        } else {
            return
        }

        // Optimistic update - UI changes immediately
        startTransition(async () => {
            addOptimistic({ paymentId, status: newStatus, paidAmount: newPaidAmount })

            // Background sync - no blocking
            const result = await updateExtraordinaryPayment({
                paymentId,
                status: newStatus,
                paidAmount: newPaidAmount,
            })

            if (!result.success) {
                addToast({
                    title: "Erro",
                    description: "Não foi possível atualizar o pagamento",
                    variant: "error"
                })
                router.refresh() // Revert optimistic state
            }
        })
    }, [toolMode, readOnly, startTransition, addOptimistic, addToast, router])

    return (
        <div>
            <BudgetProgress
                totalCollected={totalCollected}
                totalBudget={project.totalBudget}
                progressPercent={progressPercent}
            />

            <ExtraPaymentGridToolbar
                isManager={!readOnly}
                readOnly={readOnly}
                toolMode={toolMode}
                onToolModeChange={setToolMode}
                filterMode={filterStatus}
                onFilterModeChange={setFilterStatus}
            />

            {/* Edit mode indicator */}
            <EditModeIndicator activeTool={toolMode} isPending={isPending} className="mb-1.5" />

            {/* Desktop Table */}
            <div className="hidden sm:block overflow-x-auto rounded-lg border border-gray-200 bg-white">
                <table className="w-full border-collapse text-label">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-200">
                            <th className="sticky left-0 z-10 bg-gray-50 px-1.5 py-1 text-center text-xs font-medium uppercase tracking-wide text-gray-500 w-12">
                                Fração
                            </th>
                            <th className="px-1.5 py-1 text-left text-xs font-medium uppercase tracking-wide text-gray-500 w-28">
                                Residente
                            </th>
                            <th className="px-1.5 py-1 text-right text-xs font-medium uppercase tracking-wide text-gray-500 w-14">
                                ‰
                            </th>
                            <th className="px-1.5 py-1 text-right text-xs font-medium uppercase tracking-wide text-gray-500 w-20">
                                Quota
                            </th>
                            {Array.from({ length: project.numInstallments }, (_, i) => {
                                let month = project.startMonth + i
                                let year = project.startYear
                                while (month > 12) { month -= 12; year++ }
                                return (
                                    <th key={i} className="px-1.5 py-1 text-center text-xs font-medium uppercase tracking-wide text-gray-500 w-14">
                                        <div>P{i + 1}</div>
                                        <div className="text-micro font-normal text-gray-400">
                                            {getMonthName(month, true)}/{String(year).slice(-2)}
                                        </div>
                                    </th>
                                )
                            })}
                            <th className="px-1.5 py-1 text-right text-xs font-medium uppercase tracking-wide text-gray-500 w-20">
                                Pago
                            </th>
                            <th className="px-1.5 py-1 text-right text-xs font-medium uppercase tracking-wide text-gray-500 w-20">
                                Dívida
                            </th>
                            <th className="px-1.5 py-1 text-center text-xs font-medium uppercase tracking-wide text-gray-500 w-16">
                                Estado
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredPayments.map((apartment, idx) => (
                            <ApartmentRow
                                key={apartment.apartmentId}
                                apartment={apartment}
                                toolMode={toolMode}
                                onCellClick={handleCellClick}
                                readOnly={readOnly}
                                startMonth={project.startMonth}
                                startYear={project.startYear}
                                rowIndex={idx}
                            />
                        ))}
                    </tbody>
                    <tfoot>
                        <tr className="bg-gray-50 font-medium">
                            <td className="sticky left-0 z-10 bg-gray-50 px-1.5 py-1 text-center">TOTAL</td>
                            <td className="px-1.5 py-1">{optimisticPayments.length} Frações</td>
                            <td className="px-1.5 py-1 text-right font-mono">{optimisticPayments.reduce((sum, p) => sum + p.permillage, 0).toFixed(2)}</td>
                            <td className="px-1.5 py-1 text-right font-mono">{formatCurrencyShort(project.totalBudget)}</td>
                            {Array.from({ length: project.numInstallments }, (_, i) => {
                                const paidCount = optimisticPayments.filter((p) => p.installments[i]?.status === "paid").length
                                const total = optimisticPayments.length
                                return (
                                    <td key={i} className="px-1.5 py-1 text-center">
                                        <span className={cn(
                                            "text-xs font-medium",
                                            paidCount === total ? "text-primary-dark" :
                                                paidCount > 0 ? "text-warning" : "text-gray-400"
                                        )}>
                                            {paidCount}/{total}
                                        </span>
                                    </td>
                                )
                            })}
                            <td className="px-1.5 py-1 text-right font-mono text-primary-dark">{formatCurrencyShort(totalCollected)}</td>
                            <td className="px-1.5 py-1 text-right font-mono text-error">{formatCurrencyShort(project.totalBudget - totalCollected)}</td>
                            <td className="px-1.5 py-1 text-center text-label">{progressPercent}%</td>
                        </tr>
                    </tfoot>
                </table>
            </div>

            {/* Mobile Cards */}
            <div className="sm:hidden space-y-1.5">
                {filteredPayments.map((apartment) => (
                    <MobileApartmentCard
                        key={apartment.apartmentId}
                        apartment={apartment}
                        project={{
                            startMonth: project.startMonth,
                            startYear: project.startYear
                        }}
                        toolMode={toolMode}
                        onCellClick={handleCellClick}
                        readOnly={readOnly}
                    />
                ))}

                {/* Summary */}
                <div className="rounded-lg bg-gray-50 border border-gray-200 p-1.5">
                    <div className="flex items-center justify-between text-label font-medium uppercase tracking-wide">
                        <span className="text-gray-500">{filteredPayments.length} Frações</span>
                        <span className="text-primary-dark">{formatCurrencyShort(totalCollected)} Cobrado</span>
                    </div>
                </div>
            </div>

            {/* Footer Legend */}
            <div className="flex items-center justify-center gap-3 py-1.5 mt-1.5 border-t border-gray-200 bg-white rounded-b-lg">
                <span className="flex items-center gap-1 text-label text-gray-500">
                    <span className="w-2 h-2 bg-primary-dark rounded" /> Pago
                </span>
                <span className="flex items-center gap-1 text-label text-gray-500">
                    <span className="w-2 h-2 bg-gray-400 rounded" /> Pendente
                </span>
                <span className="flex items-center gap-1 text-label text-gray-500">
                    <span className="w-2 h-2 bg-error rounded" /> Em dívida
                </span>
            </div>
        </div>
    )
}

export default ExtraPaymentGrid
