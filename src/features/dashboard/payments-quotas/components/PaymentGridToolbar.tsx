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
        <div className="border-b border-[#E9ECEF] bg-white shrink-0 flex flex-col">
            {/* Main toolbar row */}
            <div className="h-11 flex items-center px-4 gap-3 overflow-x-auto">
                
                {/* Tool Selector Group */}
                <div className="flex items-center bg-[#F8F9FA] p-0.5 rounded-md border border-[#E9ECEF] shrink-0">
                    <ToolButton 
                        isActive={activeTool === 'paid'}
                        onClick={() => onToolChange(activeTool === 'paid' ? null : 'paid')}
                        disabled={isSaving}
                        activeClass="bg-white text-[#8FB996] shadow-sm ring-1 ring-[#8FB996]/20"
                        inactiveClass="text-[#6C757D] hover:text-[#343A40]"
                        label="✓ Pago"
                    />
                    <div className="w-px h-3 bg-[#DEE2E6] mx-0.5" />
                    <ToolButton 
                        isActive={activeTool === 'late'}
                        onClick={() => onToolChange(activeTool === 'late' ? null : 'late')}
                        disabled={isSaving}
                        activeClass="bg-white text-[#D4848C] shadow-sm ring-1 ring-[#D4848C]/20"
                        inactiveClass="text-[#6C757D] hover:text-[#343A40]"
                        label="✗ Dívida"
                    />
                    <div className="w-px h-3 bg-[#DEE2E6] mx-0.5" />
                    <ToolButton 
                        isActive={activeTool === 'clear'}
                        onClick={() => onToolChange(activeTool === 'clear' ? null : 'clear')}
                        disabled={isSaving}
                        activeClass="bg-white text-[#343A40] shadow-sm ring-1 ring-[#DEE2E6]"
                        inactiveClass="text-[#6C757D] hover:text-[#343A40]"
                        label="○ Limpar"
                    />
                </div>

                {/* Filter Selector */}
                <div className="hidden sm:flex items-center gap-2 shrink-0 ml-2">
                    <Filter className="w-3.5 h-3.5 text-[#ADB5BD]" />
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
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#ADB5BD] group-focus-within:text-[#8FB996] transition-colors" />
                    <input
                        type="text"
                        placeholder="Procurar fração..."
                        value={searchTerm}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="bg-[#F8F9FA] border border-[#E9ECEF] text-[12px] pl-8 pr-3 py-1.5 rounded-md focus:outline-none focus:ring-1 focus:ring-[#8FB996] focus:border-[#8FB996] w-36 transition-all placeholder:text-[#ADB5BD] text-[#343A40]"
                    />
                </form>
            </div>

            {/* Active Tool Indicator */}
            <div className={cn(
                "h-7 flex items-center px-4 gap-2 text-[10px] font-medium border-t border-[#E9ECEF] transition-all overflow-hidden",
                activeTool 
                    ? "bg-[#F8F9FA] text-[#495057]" 
                    : "h-0 border-t-0 opacity-0"
            )}>
                <Info className="w-3 h-3 text-[#8FB996]" />
                <span>
                    Modo: <span className="font-bold">{activeTool === 'paid' ? 'Marcar Pago' : activeTool === 'late' ? 'Marcar Dívida' : 'Limpar'}</span>
                    — Clique nas células para aplicar
                </span>
                {isSaving && (
                    <span className="ml-auto text-[#8E9AAF] italic">A guardar...</span>
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
                    ? "bg-[#343A40] border-[#343A40] text-white"
                    : "bg-white border-[#E9ECEF] text-[#6C757D] hover:border-[#DEE2E6]"
            )}
        >
            {label}
        </button>
    )
}