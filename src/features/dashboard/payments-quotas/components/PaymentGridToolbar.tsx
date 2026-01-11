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
        <div className="border-b border-[var(--color-gray-200)] bg-white shrink-0 flex flex-col">
            {/* Main toolbar row */}
            <div className="h-11 flex items-center px-4 gap-3 overflow-x-auto">
                
                {/* Tool Selector Group */}
                <div className="flex items-center bg-[var(--color-gray-50)] p-0.5 rounded-md border border-[var(--color-gray-200)] shrink-0">
                    <ToolButton 
                        isActive={activeTool === 'paid'}
                        onClick={() => onToolChange(activeTool === 'paid' ? null : 'paid')}
                        disabled={isSaving}
                        activeClass="bg-white text-[var(--color-primary)] shadow-sm ring-1 ring-[var(--color-primary)]/20"
                        inactiveClass="text-[var(--color-gray-600)] hover:text-[var(--color-gray-800)]"
                        label="✓ Pago"
                    />
                    <div className="w-px h-3 bg-[var(--color-gray-300)] mx-0.5" />
                    <ToolButton 
                        isActive={activeTool === 'late'}
                        onClick={() => onToolChange(activeTool === 'late' ? null : 'late')}
                        disabled={isSaving}
                        activeClass="bg-white text-[var(--color-error)] shadow-sm ring-1 ring-[var(--color-error)]/20"
                        inactiveClass="text-[var(--color-gray-600)] hover:text-[var(--color-gray-800)]"
                        label="✗ Dívida"
                    />
                    <div className="w-px h-3 bg-[var(--color-gray-300)] mx-0.5" />
                    <ToolButton 
                        isActive={activeTool === 'clear'}
                        onClick={() => onToolChange(activeTool === 'clear' ? null : 'clear')}
                        disabled={isSaving}
                        activeClass="bg-white text-[var(--color-gray-800)] shadow-sm ring-1 ring-[var(--color-gray-300)]"
                        inactiveClass="text-[var(--color-gray-600)] hover:text-[var(--color-gray-800)]"
                        label="○ Limpar"
                    />
                </div>

                {/* Filter Selector */}
                <div className="hidden sm:flex items-center gap-2 shrink-0 ml-2">
                    <Filter className="w-3.5 h-3.5 text-[var(--color-gray-400)]" />
                    <div className="flex gap-1">
                        <FilterChip 
                            active={filterMode === "all"} 
                            onClick={() => onFilterChange("all")} 
                            label="Todas" 
                        />
                        <FilterChip 
                            active={filterMode === "paid"} 
                            onClick={() => onFilterChange("paid")} 
                            label="Pagas" 
                        />
                        <FilterChip 
                            active={filterMode === "late"} 
                            onClick={() => onFilterChange("late")} 
                            label="Dívidas" 
                        />
                    </div>
                </div>

                {/* Search */}
                <form onSubmit={onSearchSubmit} className="relative shrink-0 ml-auto group">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--color-gray-400)] group-focus-within:text-[var(--color-primary)] transition-colors" />
                    <input
                        type="text"
                        placeholder="Procurar fração..."
                        value={searchTerm}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="bg-[var(--color-gray-50)] border border-[var(--color-gray-200)] text-[12px] pl-8 pr-3 py-1.5 rounded-md focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] w-36 transition-all placeholder:text-[var(--color-gray-400)] text-[var(--color-gray-800)]"
                    />
                </form>
            </div>

            {/* Active Tool Indicator */}
            <div className={cn(
                "h-7 flex items-center px-4 gap-2 text-[10px] font-medium border-t border-[var(--color-gray-200)] transition-all overflow-hidden",
                activeTool 
                    ? "bg-[var(--color-gray-50)] text-[var(--color-gray-700)]" 
                    : "h-0 border-t-0 opacity-0"
            )}>
                <Info className="w-3 h-3 text-[var(--color-primary)]" />
                <span>
                    Modo: <span className="font-bold">{activeTool === 'paid' ? 'Marcar Pago' : activeTool === 'late' ? 'Marcar Dívida' : 'Limpar'}</span>
                    — Clique nas células para aplicar
                </span>
                {isSaving && (
                    <span className="ml-auto text-[var(--color-gray-500)] italic">A guardar...</span>
                )}
            </div>
        </div>
    )
}

function ToolButton({ isActive, onClick, disabled, activeClass, inactiveClass, label }: any) {
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            className={cn(
                "px-3 py-1 rounded-sm text-[11px] font-semibold transition-all select-none",
                isActive ? activeClass : inactiveClass,
                disabled && "opacity-50 cursor-not-allowed"
            )}
        >
            {label}
        </button>
    )
}

function FilterChip({ active, onClick, label }: any) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={cn(
                "px-2.5 py-1 rounded-full text-[10px] font-medium border transition-all",
                active
                    ? "bg-[var(--color-gray-800)] border-[var(--color-gray-800)] text-white"
                    : "bg-white border-[var(--color-gray-200)] text-[var(--color-gray-600)] hover:border-[var(--color-gray-300)]"
            )}
        >
            {label}
        </button>
    )
}