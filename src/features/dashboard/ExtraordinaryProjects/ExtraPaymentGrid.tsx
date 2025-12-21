"use client"

import { useState, useCallback } from "react"
import { cn } from "@/lib/utils"
import {
    Check,
    X,
    RotateCcw,
    FileText,
    FileSpreadsheet,
    ChevronDown,
    ChevronUp,
    Filter,
} from "lucide-react"
import { formatCurrency, getMonthName } from "@/lib/extraordinary-calculations"
import {
    updateExtraordinaryPayment,
    type ApartmentPaymentData,
} from "@/app/actions/extraordinary"
import { ProgressBar } from "@/components/ui/ProgressBar"

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
type ToolMode = "markPaid" | "markPending" | "toggle" | null

// ===========================================
// MAIN COMPONENT
// ===========================================

export function ExtraPaymentGrid({ project, payments, onRefresh }: ExtraPaymentGridProps) {
    const [toolMode, setToolMode] = useState<ToolMode>(null)
    const [filterStatus, setFilterStatus] = useState<CellStatus | "all">("all")
    const [localPayments, setLocalPayments] = useState(payments)
    const [showMobileTools, setShowMobileTools] = useState(false)

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
    const handleCellClick = useCallback(async (
        paymentId: number,
        currentStatus: CellStatus,
        expectedAmount: number
    ) => {
        if (!toolMode) return

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

        const result = await updateExtraordinaryPayment({
            paymentId,
            status: newStatus,
            paidAmount: newPaidAmount,
        })

        if (!result.success) {
            setLocalPayments(payments)
            alert(result.error)
        }
    }, [toolMode, payments])

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
            {/* Budget Progress */}
            <div className="tech-border bg-white p-3 sm:p-4">
                <div className="flex items-center justify-between mb-2 sm:mb-3">
                    <h3 className="text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase tracking-tight">
                        Execução do Orçamento
                    </h3>
                    <span className="text-sm font-bold text-slate-900 font-mono">
                        {progressPercent}%
                    </span>
                </div>

                <ProgressBar
                    value={totalCollected}
                    max={project.totalBudget}
                    variant="auto"
                    size="md"
                />

                <div className="flex items-center justify-between mt-2 sm:mt-3 text-[9px] sm:text-[10px]">
                    <div>
                        <span className="text-slate-400 uppercase font-bold tracking-tighter">Cobrado</span>
                        <span className="text-emerald-700 font-bold font-mono text-[11px] sm:text-[12px] ml-1 sm:ml-2">
                            {formatCurrency(totalCollected)}
                        </span>
                    </div>
                    <div className="text-right">
                        <span className="text-slate-400 uppercase font-bold tracking-tighter hidden sm:inline">Total </span>
                        <span className="text-slate-400 uppercase font-bold tracking-tighter">Orçam.</span>
                        <span className="text-slate-900 font-bold font-mono text-[11px] sm:text-[12px] ml-1 sm:ml-2">
                            {formatCurrency(project.totalBudget)}
                        </span>
                    </div>
                </div>
            </div>

            {/* Mobile Toolbar Toggle */}
            <div className="sm:hidden">
                <button
                    onClick={() => setShowMobileTools(!showMobileTools)}
                    className="tech-border bg-white w-full p-3 flex items-center justify-between"
                >
                    <span className="text-[11px] font-bold text-slate-600 uppercase tracking-tight">
                        Ferramentas & Filtros
                    </span>
                    {showMobileTools ? (
                        <ChevronUp className="w-4 h-4 text-slate-400" />
                    ) : (
                        <ChevronDown className="w-4 h-4 text-slate-400" />
                    )}
                </button>
                
                {showMobileTools && (
                    <div className="tech-border bg-white border-t-0 p-3 space-y-3">
                        <div>
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tight block mb-2">
                                Modo de Edição
                            </span>
                            <div className="grid grid-cols-3 gap-2">
                                <MobileToolButton
                                    icon={Check}
                                    label="Pago"
                                    active={toolMode === "markPaid"}
                                    onClick={() => setToolMode(toolMode === "markPaid" ? null : "markPaid")}
                                    variant="success"
                                />
                                <MobileToolButton
                                    icon={X}
                                    label="Pendente"
                                    active={toolMode === "markPending"}
                                    onClick={() => setToolMode(toolMode === "markPending" ? null : "markPending")}
                                    variant="danger"
                                />
                                <MobileToolButton
                                    icon={RotateCcw}
                                    label="Alternar"
                                    active={toolMode === "toggle"}
                                    onClick={() => setToolMode(toolMode === "toggle" ? null : "toggle")}
                                    variant="neutral"
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                            <div className="relative flex-1">
                                <select
                                    value={filterStatus}
                                    onChange={(e) => setFilterStatus(e.target.value as CellStatus | "all")}
                                    className="w-full appearance-none pl-8 pr-8 py-2 border border-slate-200 text-[11px] bg-white focus:outline-none focus:border-slate-400"
                                >
                                    <option value="all">Todas as Frações</option>
                                    <option value="paid">Só Pagos</option>
                                    <option value="pending">Só Pendentes</option>
                                </select>
                                <Filter className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400" />
                            </div>
                            
                            <button
                                onClick={handleExportPDF}
                                className="p-2 border border-slate-200 text-slate-500 hover:bg-slate-50"
                                title="PDF"
                            >
                                <FileText className="w-4 h-4" />
                            </button>
                            <button
                                onClick={handleExportExcel}
                                className="p-2 border border-slate-200 text-slate-500 hover:bg-slate-50"
                                title="Excel"
                            >
                                <FileSpreadsheet className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Desktop Toolbar */}
            <div className="hidden sm:flex tech-border bg-white p-3 items-center justify-between flex-wrap gap-3">
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
                        active={toolMode === "toggle"}
                        onClick={() => setToolMode(toolMode === "toggle" ? null : "toggle")}
                        variant="neutral"
                    />
                </div>

                <div className="flex items-center gap-2">
                    <div className="relative">
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value as CellStatus | "all")}
                            className="appearance-none pl-7 pr-8 py-1.5 border border-slate-200 text-[11px] bg-white focus:outline-none focus:border-slate-400"
                        >
                            <option value="all">Todos</option>
                            <option value="paid">Pagos</option>
                            <option value="pending">Pendentes</option>
                        </select>
                        <Filter className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400" />
                    </div>

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
                    "tech-border p-2 text-center text-[10px] sm:text-[11px] font-bold uppercase tracking-wider",
                    toolMode === "markPaid" && "bg-emerald-50 text-emerald-700 border-emerald-200",
                    toolMode === "markPending" && "bg-rose-50 text-rose-700 border-rose-200",
                    toolMode === "toggle" && "bg-blue-50 text-blue-700 border-blue-200"
                )}>
                    <span className="hidden sm:inline">
                        {toolMode === "markPaid" && "Modo: Marcar como Pago • Clique nas células para marcar"}
                        {toolMode === "markPending" && "Modo: Marcar como Pendente • Clique nas células para marcar"}
                        {toolMode === "toggle" && "Modo: Alternar Estado • Clique nas células para alternar"}
                    </span>
                    <span className="sm:hidden">
                        {toolMode === "markPaid" && "Toque para marcar PAGO"}
                        {toolMode === "markPending" && "Toque para marcar PENDENTE"}
                        {toolMode === "toggle" && "Toque para ALTERNAR"}
                    </span>
                </div>
            )}

            {/* Mobile Card View */}
            <div className="sm:hidden space-y-2">
                {filteredPayments.map((apartment) => (
                    <MobileApartmentCard
                        key={apartment.apartmentId}
                        apartment={apartment}
                        project={project}
                        toolMode={toolMode}
                        onCellClick={handleCellClick}
                    />
                ))}
                
                <div className="tech-border bg-slate-100 p-3">
                    <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-tight">
                        <span className="text-slate-500">Total {localPayments.length} frações</span>
                        <span className="text-emerald-700">{formatCurrency(totalCollected)} cobrado</span>
                    </div>
                </div>
            </div>

            {/* Desktop Table View */}
            <div className="hidden sm:block tech-border bg-white overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse whitespace-nowrap text-xs">
                        <thead>
                            <tr>
                                <th className="header-cell w-16 text-center sticky left-0 bg-slate-100 z-10">Fração</th>
                                <th className="header-cell w-40">Residente</th>
                                <th className="header-cell w-20 text-right">‰</th>
                                <th className="header-cell w-28 text-right">Quota Total</th>
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
                                <th className="header-cell w-28 text-right">Pago</th>
                                <th className="header-cell w-28 text-right">Em Dívida</th>
                                <th className="header-cell w-24 text-center">Estado</th>
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
                        <tfoot>
                            <tr className="bg-slate-100 font-bold">
                                <td className="data-cell sticky left-0 bg-slate-100 z-10">TOTAL</td>
                                <td className="data-cell">{localPayments.length} frações</td>
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

// ===========================================
// MOBILE APARTMENT CARD
// ===========================================

interface MobileApartmentCardProps {
    apartment: ApartmentPaymentData
    project: ExtraPaymentGridProps["project"]
    toolMode: ToolMode
    onCellClick: (paymentId: number, status: CellStatus, amount: number) => void
}

function MobileApartmentCard({ apartment, project, toolMode, onCellClick }: MobileApartmentCardProps) {
    const [isExpanded, setIsExpanded] = useState(false)
    const progressPercent = apartment.totalShare > 0 
        ? Math.round((apartment.totalPaid / apartment.totalShare) * 100)
        : 0

    return (
        <div className="tech-border bg-white overflow-hidden">
            <div 
                className="p-3 cursor-pointer active:bg-slate-50"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                        <div className="shrink-0 w-10 h-10 bg-slate-100 flex items-center justify-center">
                            <span className="text-[13px] font-bold text-slate-700">{apartment.unit}</span>
                        </div>
                        <div className="min-w-0 flex-1">
                            {apartment.residentName ? (
                                <span className="text-[12px] font-medium text-slate-800 truncate block">
                                    {apartment.residentName}
                                </span>
                            ) : (
                                <span className="text-[11px] text-slate-400 italic">Sem residente</span>
                            )}
                            <div className="text-[10px] text-slate-400 mt-0.5">
                                {apartment.permillage.toFixed(2)}‰ • {formatCurrency(apartment.totalShare)}
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                        <ApartmentStatusBadge status={apartment.status} />
                        {isExpanded ? (
                            <ChevronUp className="w-4 h-4 text-slate-400" />
                        ) : (
                            <ChevronDown className="w-4 h-4 text-slate-400" />
                        )}
                    </div>
                </div>

                <div className="mt-2">
                    <div className="flex items-center justify-between text-[9px] mb-1">
                        <span className="text-emerald-600 font-medium">{formatCurrency(apartment.totalPaid)} pago</span>
                        <span className={cn(
                            "font-medium",
                            apartment.balance > 0 ? "text-rose-600" : "text-slate-400"
                        )}>
                            {apartment.balance > 0 ? `${formatCurrency(apartment.balance)} em falta` : "Liquidado"}
                        </span>
                    </div>
                    <div className="h-1.5 bg-slate-100 overflow-hidden">
                        <div 
                            className={cn(
                                "h-full transition-all",
                                progressPercent >= 100 ? "bg-emerald-500" :
                                progressPercent >= 50 ? "bg-amber-500" : "bg-rose-500"
                            )}
                            style={{ width: `${Math.min(progressPercent, 100)}%` }}
                        />
                    </div>
                </div>
            </div>

            {isExpanded && (
                <div className="border-t border-slate-100 bg-slate-50/50 p-3">
                    <div className="text-[9px] font-bold text-slate-500 uppercase tracking-tight mb-2">
                        Prestações
                    </div>
                    <div className="grid grid-cols-4 gap-1.5">
                        {apartment.installments.map((inst, idx) => {
                            let month = project.startMonth + idx
                            let year = project.startYear
                            while (month > 12) { month -= 12; year++ }
                            
                            return (
                                <button
                                    key={inst.id}
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        if (toolMode) onCellClick(inst.id, inst.status, inst.expectedAmount)
                                    }}
                                    disabled={!toolMode}
                                    className={cn(
                                        "p-2 text-center transition-all border",
                                        inst.status === "paid" && "bg-emerald-50 border-emerald-200",
                                        inst.status === "overdue" && "bg-rose-50 border-rose-200",
                                        inst.status === "pending" && "bg-white border-slate-200",
                                        inst.status === "partial" && "bg-amber-50 border-amber-200",
                                        toolMode && "active:scale-95",
                                        !toolMode && "cursor-default"
                                    )}
                                >
                                    <div className="text-[8px] font-bold text-slate-500">P{idx + 1}</div>
                                    <div className="text-[7px] text-slate-400">
                                        {getMonthName(month, true)}/{String(year).slice(-2)}
                                    </div>
                                    <div className={cn(
                                        "text-[10px] font-mono font-bold mt-0.5",
                                        inst.status === "paid" && "text-emerald-700",
                                        inst.status === "overdue" && "text-rose-700",
                                        inst.status === "pending" && "text-slate-500",
                                        inst.status === "partial" && "text-amber-700"
                                    )}>
                                        {inst.status === "paid" ? "✓" : 
                                         inst.status === "overdue" ? "!" : "—"}
                                    </div>
                                </button>
                            )
                        })}
                    </div>
                    
                    <div className="flex items-center justify-center gap-3 mt-2 pt-2 border-t border-slate-200">
                        <span className="flex items-center gap-1 text-[8px] text-slate-500">
                            <span className="w-2 h-2 bg-emerald-500" /> Pago
                        </span>
                        <span className="flex items-center gap-1 text-[8px] text-slate-500">
                            <span className="w-2 h-2 bg-slate-300" /> Pendente
                        </span>
                        <span className="flex items-center gap-1 text-[8px] text-slate-500">
                            <span className="w-2 h-2 bg-rose-500" /> Atraso
                        </span>
                    </div>
                </div>
            )}
        </div>
    )
}

// ===========================================
// DESKTOP APARTMENT ROW
// ===========================================

function ApartmentRow({ apartment, toolMode, onCellClick }: {
    apartment: ApartmentPaymentData
    toolMode: ToolMode
    onCellClick: (paymentId: number, status: CellStatus, amount: number) => void
}) {
    return (
        <tr className="group hover:bg-slate-50/50">
            <td className="data-cell text-center font-bold bg-slate-50 sticky left-0 z-10 group-hover:bg-slate-100">
                {apartment.unit}
            </td>
            <td className="data-cell">
                {apartment.residentName || <span className="text-slate-400 italic">—</span>}
            </td>
            <td className="data-cell text-right font-mono text-slate-500">{apartment.permillage.toFixed(2)}</td>
            <td className="data-cell text-right font-mono font-bold">{formatCurrency(apartment.totalShare)}</td>
            
            {apartment.installments.map((inst) => (
                <td
                    key={inst.id}
                    onClick={toolMode ? () => onCellClick(inst.id, inst.status, inst.expectedAmount) : undefined}
                    className={cn(
                        "data-cell text-center transition-colors",
                        toolMode && "cursor-pointer",
                        inst.status === "paid" && "bg-emerald-50 text-emerald-700",
                        inst.status === "overdue" && "bg-rose-50 text-rose-700 font-bold",
                        inst.status === "partial" && "bg-amber-50 text-amber-700",
                        inst.status === "pending" && "text-slate-400",
                        toolMode && inst.status === "pending" && "hover:bg-emerald-100",
                        toolMode && inst.status === "paid" && "hover:bg-rose-100",
                        toolMode && inst.status === "overdue" && "hover:bg-emerald-100"
                    )}
                >
                    {inst.status === "paid" && <span className="font-mono text-[11px]">{formatCurrency(inst.paidAmount).replace("€", "").trim()}</span>}
                    {inst.status === "partial" && <span className="font-mono text-[10px]">{formatCurrency(inst.paidAmount).replace("€", "").trim()}</span>}
                    {inst.status === "overdue" && <span className="text-[9px] font-bold uppercase">Atraso</span>}
                    {inst.status === "pending" && "—"}
                </td>
            ))}
            
            <td className="data-cell text-right font-mono text-emerald-700">{formatCurrency(apartment.totalPaid)}</td>
            <td className={cn(
                "data-cell text-right font-mono font-bold",
                apartment.balance > 0 ? "text-rose-600 bg-rose-50" : "text-slate-400"
            )}>
                {formatCurrency(apartment.balance)}
            </td>
            <td className="data-cell text-center">
                <ApartmentStatusBadge status={apartment.status} />
            </td>
        </tr>
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
        complete: "OK",
        partial: "Parcial",
        pending: "Pend.",
    }
    return (
        <span className={cn(
            "inline-block px-1.5 sm:px-2 py-0.5 text-[8px] sm:text-[9px] font-bold uppercase tracking-wider border",
            styles[status]
        )}>
            {labels[status]}
        </span>
    )
}

// ===========================================
// TOOL BUTTONS
// ===========================================

function ToolButton({ icon: Icon, label, active, onClick, variant }: {
    icon: React.ComponentType<{ className?: string }>
    label: string
    active: boolean
    onClick: () => void
    variant: "success" | "danger" | "neutral"
}) {
    const variants = {
        success: { base: "text-emerald-600 border-emerald-200 hover:bg-emerald-50", active: "bg-emerald-100 border-emerald-300" },
        danger: { base: "text-rose-600 border-rose-200 hover:bg-rose-50", active: "bg-rose-100 border-rose-300" },
        neutral: { base: "text-blue-600 border-blue-200 hover:bg-blue-50", active: "bg-blue-100 border-blue-300" },
    }
    const v = variants[variant]
    return (
        <button
            onClick={onClick}
            className={cn(
                "flex items-center gap-1.5 px-2 py-1 border text-[10px] font-bold uppercase tracking-wider transition-colors",
                v.base, active && v.active
            )}
        >
            <Icon className="w-3.5 h-3.5" />
            {label}
        </button>
    )
}

function MobileToolButton({ icon: Icon, label, active, onClick, variant }: {
    icon: React.ComponentType<{ className?: string }>
    label: string
    active: boolean
    onClick: () => void
    variant: "success" | "danger" | "neutral"
}) {
    const variants = {
        success: { base: "text-emerald-600 border-emerald-200", active: "bg-emerald-100 border-emerald-400" },
        danger: { base: "text-rose-600 border-rose-200", active: "bg-rose-100 border-rose-400" },
        neutral: { base: "text-blue-600 border-blue-200", active: "bg-blue-100 border-blue-400" },
    }
    const v = variants[variant]
    return (
        <button
            onClick={onClick}
            className={cn(
                "flex flex-col items-center justify-center gap-1 p-2 border transition-colors",
                v.base, active && v.active
            )}
        >
            <Icon className="w-4 h-4" />
            <span className="text-[9px] font-bold uppercase">{label}</span>
        </button>
    )
}

export default ExtraPaymentGrid