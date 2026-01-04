"use client"

import { Search, Info, Filter } from "lucide-react"
import { cn } from "@/lib/utils"
import { type PaymentToolType as ToolType, type PaymentFilterMode as FilterMode } from "@/lib/types"

interface PaymentGridToolbarProps {
    activeTool: ToolType
    onToolChange: (tool: ToolType) => void
    filterMode: FilterMode
    onFilterChange: (mode: FilterMode) => void
    searchTerm: string
    onSearchChange: (term: string) => void
    onSearchSubmit: (e: React.FormEvent) => void
    isSaving: boolean
}

export function PaymentGridToolbar({
    activeTool,
    onToolChange,
    filterMode,
    onFilterChange,
    searchTerm,
    onSearchChange,
    onSearchSubmit,
    isSaving
}: PaymentGridToolbarProps) {
    return (
        <div className="border-b border-slate-100 bg-slate-50/50 shrink-0">
            {/* Main toolbar row */}
            <div className="h-10 flex items-center px-4 gap-3 overflow-x-auto">
                {/* Tool Selector */}
                <div className="flex bg-white p-0.5 rounded-sm border border-slate-200 shrink-0 shadow-sm">
                    <button
                        type="button"
                        onClick={() => onToolChange(activeTool === 'paid' ? null : 'paid')}
                        disabled={isSaving}
                        className={cn(
                            "px-3 py-1 rounded-sm font-bold text-label transition-all whitespace-nowrap",
                            activeTool === 'paid'
                                ? "bg-emerald-500 text-white shadow-sm"
                                : "text-slate-500 hover:text-emerald-600 hover:bg-emerald-50",
                            isSaving && "opacity-50 cursor-not-allowed"
                        )}
                    >
                        ✓ Pago
                    </button>
                    <button
                        type="button"
                        onClick={() => onToolChange(activeTool === 'late' ? null : 'late')}
                        disabled={isSaving}
                        className={cn(
                            "px-3 py-1 rounded-sm font-bold text-label transition-all whitespace-nowrap",
                            activeTool === 'late'
                                ? "bg-rose-500 text-white shadow-sm"
                                : "text-slate-500 hover:text-rose-600 hover:bg-rose-50",
                            isSaving && "opacity-50 cursor-not-allowed"
                        )}
                    >
                        ✗ Dívida
                    </button>
                    <button
                        type="button"
                        onClick={() => onToolChange(activeTool === 'clear' ? null : 'clear')}
                        disabled={isSaving}
                        className={cn(
                            "px-3 py-1 rounded-sm font-bold text-label transition-all whitespace-nowrap",
                            activeTool === 'clear'
                                ? "bg-slate-600 text-white shadow-sm"
                                : "text-slate-500 hover:text-slate-700 hover:bg-slate-100",
                            isSaving && "opacity-50 cursor-not-allowed"
                        )}
                    >
                        ○ Limpar
                    </button>
                </div>

                {/* Filter Selector */}
                <div className="hidden sm:flex items-center gap-1 shrink-0">
                    <Filter className="w-3 h-3 text-slate-400" />
                    <div className="flex bg-white p-0.5 rounded-sm border border-slate-200 shadow-sm">
                        <button
                            type="button"
                            onClick={() => onFilterChange("all")}
                            className={cn(
                                "px-2 py-0.5 rounded-sm text-micro font-bold uppercase transition-all",
                                filterMode === "all"
                                    ? "bg-slate-700 text-white"
                                    : "text-slate-500 hover:bg-slate-100"
                            )}
                        >
                            Todas
                        </button>
                        <button
                            type="button"
                            onClick={() => onFilterChange("paid")}
                            className={cn(
                                "px-2 py-0.5 rounded-sm text-micro font-bold uppercase transition-all",
                                filterMode === "paid"
                                    ? "bg-emerald-500 text-white"
                                    : "text-slate-500 hover:bg-emerald-50"
                            )}
                        >
                            Pagas
                        </button>
                        <button
                            type="button"
                            onClick={() => onFilterChange("late")}
                            className={cn(
                                "px-2 py-0.5 rounded-sm text-micro font-bold uppercase transition-all",
                                filterMode === "late"
                                    ? "bg-rose-500 text-white"
                                    : "text-slate-500 hover:bg-rose-50"
                            )}
                        >
                            Dívidas
                        </button>
                    </div>
                </div>

                {/* Search */}
                <form onSubmit={onSearchSubmit} className="relative shrink-0 ml-auto">
                    <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Procurar..."
                        value={searchTerm}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="bg-white border border-slate-200 text-label pl-7 pr-3 py-1.5 rounded-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 w-32 placeholder:text-slate-400"
                    />
                </form>
            </div>

            {/* Active Tool Indicator */}
            {activeTool && (
                <div className="h-6 flex items-center px-4 gap-2 text-micro text-blue-600 font-medium border-t border-slate-100 bg-blue-50/50">
                    <Info className="w-3 h-3 animate-pulse" />
                    <span>
                        Modo ativo: {activeTool === 'paid' ? 'Marcar Pago' : activeTool === 'late' ? 'Marcar Dívida' : 'Limpar'}
                        — Clique nas células para aplicar
                    </span>
                    {isSaving && (
                        <span className="ml-auto text-slate-500">A guardar...</span>
                    )}
                </div>
            )}
        </div>
    )
}