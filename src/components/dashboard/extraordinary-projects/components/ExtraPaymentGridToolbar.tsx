"use client"

import { Filter, Check, RotateCcw, AlertTriangle } from "lucide-react"
import { Card, CardContent } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { ToolButton, ToolButtonGroup } from "@/components/ui/Tool-Button"
import { Dropdown, DropdownTrigger, DropdownContent, DropdownItem } from "@/components/ui/Dropdown"
import { type ExtraordinaryToolMode } from "@/lib/types"
import { cn } from "@/lib/utils"

type FilterMode = "all" | "paid" | "pending" | "late" | "partial"

interface ExtraPaymentGridToolbarProps {
    isManager: boolean
    toolMode: ExtraordinaryToolMode
    filterMode: FilterMode
    onToolModeChange: (mode: ExtraordinaryToolMode) => void
    onFilterModeChange: (mode: FilterMode) => void
    readOnly?: boolean
}

const filterLabels: Record<FilterMode, string> = {
    all: "Todos",
    paid: "Pagos",
    pending: "Pendentes",
    late: "Em Atraso",
    partial: "Parciais",
}

export function ExtraPaymentGridToolbar({
    isManager,
    toolMode,
    filterMode,
    onToolModeChange,
    onFilterModeChange,
    readOnly,
}: ExtraPaymentGridToolbarProps) {
    return (
        <Card className="mb-1.5">
            <CardContent className="flex flex-wrap items-center justify-between gap-1.5">
                {/* Tools */}
                {isManager && !readOnly && (
                    <ToolButtonGroup label="Ferramentas">
                        <ToolButton
                            icon={<Check className="h-3 w-3" />}
                            label="Pago"
                            active={toolMode === "markPaid"}
                            onClick={() => onToolModeChange(toolMode === "markPaid" ? null : "markPaid")}
                            variant="success"
                        />
                        <ToolButton
                            icon={<RotateCcw className="h-3 w-3" />}
                            label="Pendente"
                            active={toolMode === "markPending"}
                            onClick={() => onToolModeChange(toolMode === "markPending" ? null : "markPending")}
                            variant="warning"
                        />
                        <ToolButton
                            icon={<AlertTriangle className="h-3 w-3" />}
                            label="Dívida"
                            active={toolMode === "markLate"}
                            onClick={() => onToolModeChange(toolMode === "markLate" ? null : "markLate")}
                            variant="error"
                        />
                    </ToolButtonGroup>
                )}

                {/* Filter */}
                <Dropdown>
                    <DropdownTrigger asChild>
                        <Button variant="outline" size="sm">
                            <Filter className="h-3 w-3" />
                            <span className="hidden sm:inline ml-1">
                                {filterLabels[filterMode]}
                            </span>
                        </Button>
                    </DropdownTrigger>
                    <DropdownContent>
                        <DropdownItem onClick={() => onFilterModeChange("all")}>Todos</DropdownItem>
                        <DropdownItem onClick={() => onFilterModeChange("paid")}>Pagos</DropdownItem>
                        <DropdownItem onClick={() => onFilterModeChange("pending")}>Pendentes</DropdownItem>
                    </DropdownContent>
                </Dropdown>
            </CardContent>
        </Card>
    )
}

// Edit Mode Indicator component
interface EditModeIndicatorProps {
    activeTool: ExtraordinaryToolMode
    isPending?: boolean
    className?: string
}

const toolLabels: Record<string, string> = {
    markPaid: "marcar como pago",
    markPending: "marcar como pendente",
    markLate: "marcar como em dívida",
}

export function EditModeIndicator({ activeTool, isPending, className }: EditModeIndicatorProps) {
    if (!activeTool) return null

    const label = toolLabels[activeTool] || activeTool

    return (
        <div className={cn("rounded-lg bg-primary-light border border-primary p-1.5 text-center", className)}>
            <span className="text-label font-medium text-primary-dark">
                Modo de edição ativo: clique nas células para {label}
                {isPending && <span className="ml-2 italic opacity-70">— A guardar...</span>}
            </span>
        </div>
    )
}
