"use client"

import { useState } from "react"
import { useDebouncedCallback } from "use-debounce"
import { cn } from "@/lib/utils"
import { getMonthName, formatCurrency } from "@/lib/extraordinary-calculations"
import {
    updateExtraordinaryPayment,
} from "@/app/actions/extraordinary"
import { useToast } from "@/hooks/use-toast"
import { useAsyncAction } from "@/hooks/useAsyncAction"
import { Dictionary } from "@/types/i18n"

// Sub-components
import { BudgetProgress } from "./components/BudgetProgress"
import { ExtraPaymentGridToolbar } from "./components/ExtraPaymentGridToolbar"
import { MobileApartmentCard } from "./components/MobileApartmentCard"
import { ApartmentRow } from "./components/ApartmentRow"

// Types
import { type ExtraPaymentGridProps, type ToolMode, type CellStatus } from "./types"

export function ExtraPaymentGrid({ project, payments, onRefresh, readOnly = false, dictionary }: ExtraPaymentGridProps & { dictionary: Dictionary }) {
    const { toast } = useToast()
    const [toolMode, setToolMode] = useState<ToolMode>(null)
    const [filterStatus, setFilterStatus] = useState<CellStatus | "all">("all")
    const [localPayments, setLocalPayments] = useState(payments)
    const [showMobileTools, setShowMobileTools] = useState(false)

    const { execute: updatePayment } = useAsyncAction(updateExtraordinaryPayment, {
        successMessage: dictionary.extraPayment.updateSuccess,
        errorMessage: dictionary.common.error,
        onError: () => setLocalPayments(payments) // Rollback on error
    })

    // Calculate totals
    const totalCollected = localPayments.reduce((sum, p) => sum + p.totalPaid, 0)
    const progressPercent = project.totalBudget > 0
        ? Math.round((totalCollected / project.totalBudget) * 100)
        : 0

    // Filter payments
    const filteredPayments = filterStatus === "all"
        ? localPayments
        : localPayments.filter((p) => {
            if (filterStatus === "paid") return p.status === "complete"
            if (filterStatus === "pending") return p.status === "pending" || p.status === "partial"
            return true
        })

    // Handle cell click
    const handleCellClick = useDebouncedCallback(async (
        paymentId: number,
        currentStatus: CellStatus,
        expectedAmount: number
    ): Promise<void> => {
        if (!toolMode || readOnly) return

        let newStatus: CellStatus
        let newPaidAmount: number

        if (toolMode === "markPaid") {
            newStatus = "paid"
            newPaidAmount = expectedAmount
        } else if (toolMode === "markPending") {
            newStatus = "pending"
            newPaidAmount = 0
        } else {
            if (currentStatus === "paid") {
                newStatus = "pending"
                newPaidAmount = 0
            } else {
                newStatus = "paid"
                newPaidAmount = expectedAmount
            }
        }

        // Optimistic update
        setLocalPayments((prev) =>
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

        await updatePayment({
            paymentId,
            status: newStatus,
            paidAmount: newPaidAmount,
        })
    }, 300)

    // Export handlers
    const handleExportPDF = () => {
        import("@/lib/document-export").then(({ exportExtraPaymentsToPDF }) => {
            const exportData = localPayments.map((p) => ({
                apartment: p.unit,
                fraction: p.unit,
                resident: p.residentName || undefined,
                permillage: p.permillage,
                totalShare: p.totalShare,
                installments: p.installments.map((i) => i.status === "paid" ? "paid" as const : "pending" as const),
                totalPaid: p.totalPaid,
            }))
            exportExtraPaymentsToPDF(project.name, "Edifício", project.totalBudget, exportData)
        })
    }

    const handleExportExcel = () => {
        import("@/lib/document-export").then(({ exportToExcel }) => {
            const columns = [
                { header: "Fração", key: "unit" },
                { header: "Residente", key: "resident" },
                { header: "Permilagem", key: "permillage" },
                { header: "Quota Total", key: "totalShare", format: "currency" as const },
                ...Array.from({ length: project.numInstallments }, (_, i) => ({
                    header: `P${i + 1}`,
                    key: `inst_${i}`,
                })),
                { header: "Total Pago", key: "totalPaid", format: "currency" as const },
                { header: "Em Dívida", key: "balance", format: "currency" as const },
            ]

            const data = localPayments.map((p) => {
                const row: Record<string, unknown> = {
                    unit: p.unit,
                    resident: p.residentName || "",
                    permillage: p.permillage,
                    totalShare: p.totalShare,
                    totalPaid: p.totalPaid,
                    balance: p.balance,
                }
                p.installments.forEach((inst, i) => {
                    row[`inst_${i}`] = inst.status === "paid" ? "Pago" : inst.status === "overdue" ? "Atraso" : "Pendente"
                })
                return row
            })

            exportToExcel({
                filename: `extra-${project.name.toLowerCase().replace(/\s+/g, "-")}`,
                title: project.name,
                columns,
                data,
            })
        })
    }

    return (
        <div className="space-y-3 sm:space-y-4">
            <BudgetProgress
                totalCollected={totalCollected}
                totalBudget={project.totalBudget}
                progressPercent={progressPercent}
                dictionary={dictionary}
            />

            <ExtraPaymentGridToolbar
                readOnly={readOnly}
                toolMode={toolMode}
                setToolMode={setToolMode}
                filterStatus={filterStatus}
                setFilterStatus={setFilterStatus}
                showMobileTools={showMobileTools}
                setShowMobileTools={setShowMobileTools}
                handleExportPDF={handleExportPDF}
                handleExportExcel={handleExportExcel}
                dictionary={dictionary}
            />

            {/* Mobile Card View */}
            <div className="sm:hidden space-y-2">
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
                        dictionary={dictionary}
                    />
                ))}

                <div className="tech-border bg-slate-100 p-3">
                    <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-tight">
                        <span className="text-slate-500">{dictionary.extraPayment.allUnits} {localPayments.length}</span>
                        <span className="text-emerald-700">{formatCurrency(totalCollected)} {dictionary.extraPayment.collected}</span>
                    </div>
                </div>
            </div>

            {/* Desktop Table View */}
            <div className="hidden sm:block tech-border bg-white overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse whitespace-nowrap text-xs">
                        <thead>
                            <tr>
                                <th className="header-cell w-16 text-center sticky left-0 bg-slate-100 z-10">{dictionary.extraPayment.unit}</th>
                                <th className="header-cell w-40">{dictionary.extraPayment.resident}</th>
                                <th className="header-cell w-20 text-right">‰</th>
                                <th className="header-cell w-28 text-right">{dictionary.extraPayment.totalShare}</th>
                                {Array.from({ length: project.numInstallments }, (_, i) => {
                                    let month = project.startMonth + i
                                    let year = project.startYear
                                    while (month > 12) { month -= 12; year++ }
                                    return (
                                        <th key={i} className="header-cell w-20 text-center">
                                            <div className="text-[10px]">P{i + 1}</div>
                                            <div className="text-[8px] text-slate-400 font-normal">
                                                {getMonthName(month, true)}/{String(year).slice(-2)}
                                            </div>
                                        </th>
                                    )
                                })}
                                <th className="header-cell w-28 text-right">{dictionary.extraPayment.paid}</th>
                                <th className="header-cell w-28 text-right">{dictionary.extraPayment.debt}</th>
                                <th className="header-cell w-24 text-center">{dictionary.extraPayment.status}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredPayments.map((apartment) => (
                                <ApartmentRow
                                    key={apartment.apartmentId}
                                    apartment={apartment}
                                    toolMode={toolMode}
                                    onCellClick={handleCellClick}
                                    readOnly={readOnly}
                                    startMonth={project.startMonth}
                                    startYear={project.startYear}
                                    dictionary={dictionary}
                                />
                            ))}
                        </tbody>
                        <tfoot>
                            <tr className="bg-slate-100 font-bold">
                                <td className="data-cell sticky left-0 bg-slate-100 z-10">TOTAL</td>
                                <td className="data-cell">{localPayments.length} {dictionary.extraPayment.allUnits}</td>
                                <td className="data-cell text-right">{localPayments.reduce((sum, p) => sum + p.permillage, 0).toFixed(2)}‰</td>
                                <td className="data-cell text-right font-mono">{formatCurrency(project.totalBudget)}</td>
                                {Array.from({ length: project.numInstallments }, (_, i) => {
                                    const paidCount = localPayments.filter((p) => p.installments[i]?.status === "paid").length
                                    const total = localPayments.length
                                    return (
                                        <td key={i} className="data-cell text-center text-[10px]">
                                            <span className={cn(
                                                paidCount === total ? "text-emerald-600" :
                                                    paidCount > 0 ? "text-amber-600" : "text-slate-400"
                                            )}>
                                                {paidCount}/{total}
                                            </span>
                                        </td>
                                    )
                                })}
                                <td className="data-cell text-right font-mono text-emerald-700">{formatCurrency(totalCollected)}</td>
                                <td className="data-cell text-right font-mono text-rose-700">{formatCurrency(project.totalBudget - totalCollected)}</td>
                                <td className="data-cell text-center"><span className="text-[10px]">{progressPercent}%</span></td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>
        </div>
    )
}

export default ExtraPaymentGrid