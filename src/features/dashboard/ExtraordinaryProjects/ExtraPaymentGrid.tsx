"use client"

import { useState, useCallback } from "react"
import { cn } from "@/lib/utils"
import {
    Check,
    X,
    RotateCcw,
    Download,
    FileText,
    FileSpreadsheet,
    ChevronDown,
    Filter,
    MoreHorizontal,
} from "lucide-react"
import {
    formatCurrency,
    getMonthName,
    calculateProgress,
} from "@/lib/extraordinary-calculations"
import {
    updateExtraordinaryPayment,
    bulkUpdatePayments,
    type ApartmentPaymentData,
} from "@/app/actions/extraordinary"
import { BudgetProgress } from "@/features/dashboard/ProgressBar"
// import { useToast } from "@/components/ui/Toast"
// import { useConfirm } from "@/components/ui/ConfirmDialog"

// ===========================================
// TYPES
// ===========================================

interface ExtraPaymentGridProps {
    project: {
        id: number
        name: string
        totalBudget: number
        numInstallments: number
        startMonth: number
        startYear: number
        status: string
    }
    payments: ApartmentPaymentData[]
    onRefresh?: () => void
}

type CellStatus = "paid" | "pending" | "overdue" | "partial"
type ToolMode = "markPaid" | "markPending" | "clear" | null

// ===========================================
// MAIN COMPONENT
// ===========================================

export function ExtraPaymentGrid({ project, payments, onRefresh }: ExtraPaymentGridProps) {
    // const toast = useToast()
    // const { confirm } = useConfirm()
    
    const [toolMode, setToolMode] = useState<ToolMode>(null)
    const [selectedCells, setSelectedCells] = useState<Set<number>>(new Set())
    const [isUpdating, setIsUpdating] = useState(false)
    const [filterStatus, setFilterStatus] = useState<CellStatus | "all">("all")
    const [localPayments, setLocalPayments] = useState(payments)

    // Calculate totals
    const totalCollected = localPayments.reduce((sum, p) => sum + p.totalPaid, 0)
    const progressPercent = calculateProgress(totalCollected, project.totalBudget)

    // Filter payments
    const filteredPayments = filterStatus === "all"
        ? localPayments
        : localPayments.filter((p) => {
            if (filterStatus === "paid") return p.status === "complete"
            if (filterStatus === "pending") return p.status === "pending" || p.status === "partial"
            return true
        })

    // Handle cell click
    const handleCellClick = useCallback(async (
        paymentId: number,
        currentStatus: CellStatus,
        expectedAmount: number
    ) => {
        if (!toolMode) return

        // Determine new status
        let newStatus: CellStatus
        let newPaidAmount: number

        if (toolMode === "markPaid") {
            newStatus = "paid"
            newPaidAmount = expectedAmount
        } else if (toolMode === "markPending") {
            newStatus = "pending"
            newPaidAmount = 0
        } else {
            // clear - toggle
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

        // Server update
        const result = await updateExtraordinaryPayment({
            paymentId,
            status: newStatus,
            paidAmount: newPaidAmount,
        })

        if (!result.success) {
            // Revert on error
            setLocalPayments(payments)
            // toast.error("Erro", result.error)
        }
    }, [toolMode, payments])

    // Handle bulk update
    const handleBulkUpdate = async (status: "paid" | "pending") => {
        if (selectedCells.size === 0) return

        setIsUpdating(true)
        const result = await bulkUpdatePayments(Array.from(selectedCells), status)
        setIsUpdating(false)

        if (result.success) {
            // toast.success("Atualizado", `${result.data.updated} pagamentos atualizados`)
            setSelectedCells(new Set())
            onRefresh?.()
        } else {
            // toast.error("Erro", result.error)
        }
    }

    // Export handlers
    const handleExportPDF = () => {
        // Import dynamically to avoid SSR issues
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
        <div className="space-y-4">
            {/* Budget Progress */}
            <BudgetProgress
                paid={totalCollected}
                total={project.totalBudget}
                name={project.name}
                detailed
            />

            {/* Toolbar */}
            <div className="tech-border bg-white p-3 flex items-center justify-between flex-wrap gap-3">
                {/* Tools */}
                <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight mr-2">
                        Ferramentas:
                    </span>
                    
                    <ToolButton
                        icon={Check}
                        label="Marcar Pago"
                        active={toolMode === "markPaid"}
                        onClick={() => setToolMode(toolMode === "markPaid" ? null : "markPaid")}
                        variant="success"
                    />
                    <ToolButton
                        icon={X}
                        label="Marcar Pendente"
                        active={toolMode === "markPending"}
                        onClick={() => setToolMode(toolMode === "markPending" ? null : "markPending")}
                        variant="danger"
                    />
                    <ToolButton
                        icon={RotateCcw}
                        label="Alternar"
                        active={toolMode === "clear"}
                        onClick={() => setToolMode(toolMode === "clear" ? null : "clear")}
                        variant="neutral"
                    />
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                    {/* Filter */}
                    <div className="relative">
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value as any)}
                            className="appearance-none pl-7 pr-8 py-1.5 border border-slate-200 text-[11px] bg-white focus:outline-none focus:border-slate-400"
                        >
                            <option value="all">Todos</option>
                            <option value="paid">Pagos</option>
                            <option value="pending">Pendentes</option>
                        </select>
                        <Filter className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400" />
                    </div>

                    {/* Export */}
                    <div className="flex items-center border-l border-slate-200 pl-2 gap-1">
                        <button
                            onClick={handleExportPDF}
                            className="p-1.5 text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                            title="Exportar PDF"
                        >
                            <FileText className="w-4 h-4" />
                        </button>
                        <button
                            onClick={handleExportExcel}
                            className="p-1.5 text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                            title="Exportar Excel"
                        >
                            <FileSpreadsheet className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Tool Active Indicator */}
            {toolMode && (
                <div className={cn(
                    "tech-border p-2 text-center text-[11px] font-bold uppercase tracking-wider",
                    toolMode === "markPaid" && "bg-emerald-50 text-emerald-700 border-emerald-200",
                    toolMode === "markPending" && "bg-rose-50 text-rose-700 border-rose-200",
                    toolMode === "clear" && "bg-blue-50 text-blue-700 border-blue-200"
                )}>
                    {toolMode === "markPaid" && "Modo: Marcar como Pago • Clique nas células para marcar"}
                    {toolMode === "markPending" && "Modo: Marcar como Pendente • Clique nas células para marcar"}
                    {toolMode === "clear" && "Modo: Alternar Estado • Clique nas células para alternar"}
                </div>
            )}

            {/* Payment Table */}
            <div className="tech-border bg-white overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse whitespace-nowrap text-xs">
                        <thead>
                            <tr>
                                <th className="header-cell w-16 text-center sticky left-0 bg-slate-100 z-10">
                                    Fração
                                </th>
                                <th className="header-cell w-40">
                                    Residente
                                </th>
                                <th className="header-cell w-20 text-right">
                                    ‰
                                </th>
                                <th className="header-cell w-28 text-right">
                                    Quota Total
                                </th>
                                {/* Installment columns */}
                                {Array.from({ length: project.numInstallments }, (_, i) => {
                                    let month = project.startMonth + i
                                    let year = project.startYear
                                    while (month > 12) {
                                        month -= 12
                                        year++
                                    }
                                    return (
                                        <th key={i} className="header-cell w-20 text-center">
                                            <div className="text-[10px]">P{i + 1}</div>
                                            <div className="text-[8px] text-slate-400 font-normal">
                                                {getMonthName(month, true)}/{String(year).slice(-2)}
                                            </div>
                                        </th>
                                    )
                                })}
                                <th className="header-cell w-28 text-right">
                                    Pago
                                </th>
                                <th className="header-cell w-28 text-right">
                                    Em Dívida
                                </th>
                                <th className="header-cell w-24 text-center">
                                    Estado
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredPayments.map((apartment) => (
                                <ApartmentRow
                                    key={apartment.apartmentId}
                                    apartment={apartment}
                                    toolMode={toolMode}
                                    onCellClick={handleCellClick}
                                />
                            ))}
                        </tbody>
                        {/* Footer Totals */}
                        <tfoot>
                            <tr className="bg-slate-100 font-bold">
                                <td className="data-cell sticky left-0 bg-slate-100 z-10">
                                    TOTAL
                                </td>
                                <td className="data-cell">
                                    {localPayments.length} frações
                                </td>
                                <td className="data-cell text-right">
                                    {localPayments.reduce((sum, p) => sum + p.permillage, 0).toFixed(2)}‰
                                </td>
                                <td className="data-cell text-right font-mono">
                                    {formatCurrency(project.totalBudget)}
                                </td>
                                {/* Installment totals */}
                                {Array.from({ length: project.numInstallments }, (_, i) => {
                                    const paidCount = localPayments.filter(
                                        (p) => p.installments[i]?.status === "paid"
                                    ).length
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
                                <td className="data-cell text-right font-mono text-emerald-700">
                                    {formatCurrency(totalCollected)}
                                </td>
                                <td className="data-cell text-right font-mono text-rose-700">
                                    {formatCurrency(project.totalBudget - totalCollected)}
                                </td>
                                <td className="data-cell text-center">
                                    <span className="text-[10px]">
                                        {progressPercent}%
                                    </span>
                                </td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>
        </div>
    )
}

// ===========================================
// APARTMENT ROW
// ===========================================

interface ApartmentRowProps {
    apartment: ApartmentPaymentData
    toolMode: ToolMode
    onCellClick: (paymentId: number, status: CellStatus, amount: number) => void
}

function ApartmentRow({ apartment, toolMode, onCellClick }: ApartmentRowProps) {
    return (
        <tr className="group hover:bg-slate-50/50">
            {/* Unit */}
            <td className="data-cell text-center font-bold bg-slate-50 sticky left-0 z-10 group-hover:bg-slate-100">
                {apartment.unit}
            </td>
            
            {/* Resident */}
            <td className="data-cell">
                {apartment.residentName || (
                    <span className="text-slate-400 italic">—</span>
                )}
            </td>
            
            {/* Permillage */}
            <td className="data-cell text-right font-mono text-slate-500">
                {apartment.permillage.toFixed(2)}
            </td>
            
            {/* Total Share */}
            <td className="data-cell text-right font-mono font-bold">
                {formatCurrency(apartment.totalShare)}
            </td>
            
            {/* Installments */}
            {apartment.installments.map((inst) => (
                <PaymentCell
                    key={inst.id}
                    installment={inst}
                    toolMode={toolMode}
                    onClick={() => onCellClick(inst.id, inst.status, inst.expectedAmount)}
                />
            ))}
            
            {/* Total Paid */}
            <td className="data-cell text-right font-mono text-emerald-700">
                {formatCurrency(apartment.totalPaid)}
            </td>
            
            {/* Balance */}
            <td className={cn(
                "data-cell text-right font-mono font-bold",
                apartment.balance > 0 ? "text-rose-600 bg-rose-50" : "text-slate-400"
            )}>
                {formatCurrency(apartment.balance)}
            </td>
            
            {/* Status */}
            <td className="data-cell text-center">
                <ApartmentStatusBadge status={apartment.status} />
            </td>
        </tr>
    )
}

// ===========================================
// PAYMENT CELL
// ===========================================

interface PaymentCellProps {
    installment: ApartmentPaymentData["installments"][0]
    toolMode: ToolMode
    onClick: () => void
}

function PaymentCell({ installment, toolMode, onClick }: PaymentCellProps) {
    const { status, expectedAmount, paidAmount } = installment
    
    return (
        <td
            onClick={toolMode ? onClick : undefined}
            className={cn(
                "data-cell text-center transition-colors",
                toolMode && "cursor-pointer",
                // Status colors
                status === "paid" && "bg-emerald-50 text-emerald-700",
                status === "overdue" && "bg-rose-50 text-rose-700 font-bold",
                status === "partial" && "bg-amber-50 text-amber-700",
                status === "pending" && "text-slate-400",
                // Hover when tool active
                toolMode && status === "pending" && "hover:bg-emerald-100",
                toolMode && status === "paid" && "hover:bg-rose-100",
                toolMode && status === "overdue" && "hover:bg-emerald-100"
            )}
        >
            {status === "paid" && (
                <span className="font-mono text-[11px]">
                    {formatCurrency(paidAmount).replace("€", "").trim()}
                </span>
            )}
            {status === "partial" && (
                <span className="font-mono text-[10px]">
                    {formatCurrency(paidAmount).replace("€", "").trim()}
                </span>
            )}
            {status === "overdue" && (
                <span className="text-[9px] font-bold uppercase">Atraso</span>
            )}
            {status === "pending" && "—"}
        </td>
    )
}

// ===========================================
// STATUS BADGE
// ===========================================

function ApartmentStatusBadge({ status }: { status: ApartmentPaymentData["status"] }) {
    const styles: Record<string, string> = {
        complete: "bg-emerald-100 text-emerald-700 border-emerald-200",
        partial: "bg-amber-100 text-amber-700 border-amber-200",
        pending: "bg-slate-100 text-slate-500 border-slate-200",
    }

    const labels: Record<string, string> = {
        complete: "Liquidado",
        partial: "Parcial",
        pending: "Pendente",
    }

    return (
        <span className={cn(
            "inline-block px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider border",
            styles[status]
        )}>
            {labels[status]}
        </span>
    )
}

// ===========================================
// TOOL BUTTON
// ===========================================

interface ToolButtonProps {
    icon: React.ComponentType<{ className?: string }>
    label: string
    active: boolean
    onClick: () => void
    variant: "success" | "danger" | "neutral"
}

function ToolButton({ icon: Icon, label, active, onClick, variant }: ToolButtonProps) {
    const variants = {
        success: {
            base: "text-emerald-600 border-emerald-200 hover:bg-emerald-50",
            active: "bg-emerald-100 border-emerald-300",
        },
        danger: {
            base: "text-rose-600 border-rose-200 hover:bg-rose-50",
            active: "bg-rose-100 border-rose-300",
        },
        neutral: {
            base: "text-blue-600 border-blue-200 hover:bg-blue-50",
            active: "bg-blue-100 border-blue-300",
        },
    }

    const v = variants[variant]

    return (
        <button
            onClick={onClick}
            className={cn(
                "flex items-center gap-1.5 px-2 py-1 border text-[10px] font-bold uppercase tracking-wider transition-colors",
                v.base,
                active && v.active
            )}
        >
            <Icon className="w-3.5 h-3.5" />
            {label}
        </button>
    )
}

export default ExtraPaymentGrid