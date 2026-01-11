"use client"

import { Filter, Edit3, Check, Clock, ToggleLeft, FileText, Table, Smartphone } from "lucide-react"
import { type ExtraordinaryToolMode } from "@/lib/types"

type FilterMode = "all" | "paid" | "pending" | "late" | "partial"

interface ExtraPaymentGridToolbarProps {
    isManager: boolean
    toolMode: ExtraordinaryToolMode
    filterMode: FilterMode
    onToolModeChange: (mode: ExtraordinaryToolMode) => void
    onFilterModeChange: (mode: FilterMode) => void
    readOnly?: boolean
    showMobileTools?: boolean
    setShowMobileTools?: (show: boolean) => void
    handleExportPDF?: () => void
    handleExportExcel?: () => void
}

export function ExtraPaymentGridToolbar({
    isManager,
    toolMode,
    filterMode,
    onToolModeChange,
    onFilterModeChange,
    readOnly,
    showMobileTools,
    setShowMobileTools,
    handleExportPDF,
    handleExportExcel,
}: ExtraPaymentGridToolbarProps) {

    return (
        <div className="flex flex-wrap items-center gap-4 p-3 bg-gray-50 border-b border-gray-200">
            {/* Edit Tools (Manager Only) */}
            {isManager && !readOnly && (
                <div className="flex items-center gap-1">
                    <span className="text-label font-bold text-gray-400 uppercase mr-2">
                        Ferramentas:
                    </span>

                    <button
                        onClick={() => onToolModeChange(toolMode === "markPaid" ? null : "markPaid")}
                        className={`flex items-center gap-1 px-2 py-1 text-label font-bold uppercase transition-colors ${toolMode === "markPaid"
                            ? "bg-emerald-500 text-white"
                            : "bg-white text-gray-600 border border-gray-200 hover:border-emerald-300"
                            }`}
                    >
                        <Check className="w-3 h-3" />
                        Marcar Pago
                    </button>

                    <button
                        onClick={() => onToolModeChange(toolMode === "markPending" ? null : "markPending")}
                        className={`flex items-center gap-1 px-2 py-1 text-label font-bold uppercase transition-colors ${toolMode === "markPending"
                            ? "bg-warning-light0 text-white"
                            : "bg-white text-gray-600 border border-gray-200 hover:border-gray-300"
                            }`}
                    >
                        <Clock className="w-3 h-3" />
                        Marcar Pendente
                    </button>

                    <button
                        onClick={() => onToolModeChange(toolMode === "toggle" ? null : "toggle")}
                        className={`flex items-center gap-1 px-2 py-1 text-label font-bold uppercase transition-colors ${toolMode === "toggle"
                            ? "bg-info-light0 text-white"
                            : "bg-white text-gray-600 border border-gray-200 hover:border-gray-300"
                            }`}
                    >
                        <ToggleLeft className="w-3 h-3" />
                        Alternar
                    </button>
                </div>
            )}

            {/* Filter Tools */}
            <div className="flex items-center gap-1 ml-auto">
                <span className="text-label font-bold text-gray-400 uppercase mr-2">
                    <Filter className="w-3 h-3 inline mr-1" />
                    Filtros:
                </span>

                <button
                    onClick={() => onFilterModeChange("all")}
                    className={`px-2 py-1 text-label font-bold uppercase transition-colors ${filterMode === "all"
                        ? "bg-gray-700 text-white"
                        : "bg-white text-gray-600 border border-gray-200 hover:border-gray-400"
                        }`}
                >
                    Todas
                </button>

                <button
                    onClick={() => onFilterModeChange("paid")}
                    className={`px-2 py-1 text-label font-bold uppercase transition-colors ${filterMode === "paid"
                        ? "bg-emerald-600 text-white"
                        : "bg-white text-gray-600 border border-gray-200 hover:border-emerald-300"
                        }`}
                >
                    Pagas
                </button>

                <button
                    onClick={() => onFilterModeChange("pending")}
                    className={`px-2 py-1 text-label font-bold uppercase transition-colors ${filterMode === "pending"
                        ? "bg-warning text-white"
                        : "bg-white text-gray-600 border border-gray-200 hover:border-gray-300"
                        }`}
                >
                    Pendentes
                </button>
            </div>

            {/* Export & Mobile Tools */}
            <div className="flex items-center gap-1 pl-4 border-l border-gray-200 ml-4">
                {handleExportPDF && (
                    <button onClick={handleExportPDF} className="p-1 text-gray-400 hover:text-gray-600" title="Export PDF">
                        <FileText className="w-4 h-4" />
                    </button>
                )}
                {handleExportExcel && (
                    <button onClick={handleExportExcel} className="p-1 text-gray-400 hover:text-gray-600" title="Export Excel">
                        <Table className="w-4 h-4" />
                    </button>
                )}

                {setShowMobileTools && (
                    <button
                        onClick={() => setShowMobileTools(!showMobileTools)}
                        className={`sm:hidden p-1 ${showMobileTools ? 'text-info' : 'text-gray-400'}`}
                    >
                        <Smartphone className="w-4 h-4" />
                    </button>
                )}
            </div>

            {/* Tool Mode Indicator */}
            {toolMode !== null && isManager && !readOnly && (
                <div className="w-full text-label text-gray-500 mt-2">
                    {toolMode === "markPaid" && 'Modo de Edição: Marcar Pago'}
                    {toolMode === "markPending" && 'Modo de Edição: Marcar Pendente'}
                    {toolMode === "toggle" && 'Modo de Edição: Alternar Estado'}
                </div>
            )}
        </div>
    )
}