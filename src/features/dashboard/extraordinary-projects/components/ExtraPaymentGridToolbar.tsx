"use client"

import { Check, X, RotateCcw, FileText, FileSpreadsheet, ChevronDown, ChevronUp, Filter } from "lucide-react"
import { cn } from "@/lib/utils"
import { t } from "@/lib/translations"
import { type ToolMode, type CellStatus } from "../types"

interface ExtraPaymentGridToolbarProps {
    readOnly: boolean
    toolMode: ToolMode
    setToolMode: (mode: ToolMode) => void
    filterStatus: CellStatus | "all"
    setFilterStatus: (status: CellStatus | "all") => void
    showMobileTools: boolean
    setShowMobileTools: (show: boolean) => void
    handleExportPDF: () => void
    handleExportExcel: () => void
}

export function ExtraPaymentGridToolbar({
    readOnly,
    toolMode,
    setToolMode,
    filterStatus,
    setFilterStatus,
    showMobileTools,
    setShowMobileTools,
    handleExportPDF,
    handleExportExcel
}: ExtraPaymentGridToolbarProps) {
    return (
        <>
            {/* Mobile Toolbar Toggle */}
            <div className="sm:hidden">
                <button
                    onClick={() => setShowMobileTools(!showMobileTools)}
                    className="tech-border bg-white w-full p-3 flex items-center justify-between"
                >
                    <span className="text-[11px] font-bold text-slate-600 uppercase tracking-tight">
                        {t.extraPayment.toolsAndFilters}
                    </span>
                    {showMobileTools ? (
                        <ChevronUp className="w-4 h-4 text-slate-400" />
                    ) : (
                        <ChevronDown className="w-4 h-4 text-slate-400" />
                    )}
                </button>

                {showMobileTools && (
                    <div className="tech-border bg-white border-t-0 p-3 space-y-3">
                        {!readOnly && (
                            <div>
                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tight block mb-2">
                                    {t.extraPayment.editMode}
                                </span>
                                <div className="grid grid-cols-3 gap-2">
                                    <MobileToolButton
                                        icon={Check}
                                        label={t.extraPayment.paid}
                                        active={toolMode === "markPaid"}
                                        onClick={() => setToolMode(toolMode === "markPaid" ? null : "markPaid")}
                                        variant="success"
                                    />
                                    <MobileToolButton
                                        icon={X}
                                        label={t.extraPayment.pending}
                                        active={toolMode === "markPending"}
                                        onClick={() => setToolMode(toolMode === "markPending" ? null : "markPending")}
                                        variant="danger"
                                    />
                                    <MobileToolButton
                                        icon={RotateCcw}
                                        label={t.extraPayment.toggleState}
                                        active={toolMode === "toggle"}
                                        onClick={() => setToolMode(toolMode === "toggle" ? null : "toggle")}
                                        variant="neutral"
                                    />
                                </div>
                            </div>
                        )}

                        <div className={cn(
                            "flex items-center gap-2 pt-2",
                            !readOnly && "border-t border-slate-100"
                        )}>
                            <div className="relative flex-1">
                                <select
                                    value={filterStatus}
                                    onChange={(e) => setFilterStatus(e.target.value as CellStatus | "all")}
                                    className="w-full appearance-none pl-8 pr-8 py-2 border border-slate-200 text-[11px] bg-white focus:outline-none focus:border-slate-400"
                                >
                                    <option value="all">{t.extraPayment.allUnits}</option>
                                    <option value="paid">{t.extraPayment.paidUnits}</option>
                                    <option value="pending">{t.extraPayment.pendingUnits}</option>
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
                    {!readOnly ? (
                        <>
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight mr-2">
                                {t.extraPayment.tools}
                            </span>

                            <ToolButton
                                icon={Check}
                                label={t.extraPayment.markPaid}
                                active={toolMode === "markPaid"}
                                onClick={() => setToolMode(toolMode === "markPaid" ? null : "markPaid")}
                                variant="success"
                            />
                            <ToolButton
                                icon={X}
                                label={t.extraPayment.markPending}
                                active={toolMode === "markPending"}
                                onClick={() => setToolMode(toolMode === "markPending" ? null : "markPending")}
                                variant="danger"
                            />
                            <ToolButton
                                icon={RotateCcw}
                                label={t.extraPayment.toggleState}
                                active={toolMode === "toggle"}
                                onClick={() => setToolMode(toolMode === "toggle" ? null : "toggle")}
                                variant="neutral"
                            />
                        </>
                    ) : (
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight mr-2">
                                {t.extraPayment.filters}
                            </span>
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-2">
                    <div className="relative">
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value as CellStatus | "all")}
                            className="appearance-none pl-7 pr-8 py-1.5 border border-slate-200 text-[11px] bg-white focus:outline-none focus:border-slate-400"
                        >
                            <option value="all">{t.extraPayment.allUnits}</option>
                            <option value="paid">{t.extraPayment.paidUnits}</option>
                            <option value="pending">{t.extraPayment.pendingUnits}</option>
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
                        {toolMode === "markPaid" && `${t.extraPayment.tools}: ${t.extraPayment.markPaid} • Clique nas células para marcar`}
                        {toolMode === "markPending" && `${t.extraPayment.tools}: ${t.extraPayment.markPending} • Clique nas células para marcar`}
                        {toolMode === "toggle" && `${t.extraPayment.tools}: ${t.extraPayment.toggleState} • Clique nas células para alternar`}
                    </span>
                    <span className="sm:hidden">
                        {toolMode === "markPaid" && "Toque para marcar PAGO"}
                        {toolMode === "markPending" && "Toque para marcar PENDENTE"}
                        {toolMode === "toggle" && "Toque para ALTERNAR"}
                    </span>
                </div>
            )}
        </>
    )
}

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
