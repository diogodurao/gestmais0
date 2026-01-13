"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { Progress } from "../../ui/Progress"
import { ChevronDown, ChevronUp, TrendingDown, User } from "lucide-react"
import {
  type ApartmentData,
  type ToolType,
  MONTHS,
  MONTHLY_QUOTA,
  formatCurrency,
} from "./types"

// =============================================================================
// MOBILE PAYMENT CARD
// Expandable card showing apartment payment details for mobile view
// =============================================================================

interface MobilePaymentCardProps {
  apartment: ApartmentData
  activeTool: ToolType
  onCellClick: (aptId: number, monthIdx: number) => void
}

export function MobilePaymentCard({
  apartment,
  activeTool,
  onCellClick,
}: MobilePaymentCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const hasDebt = apartment.balance > 0
  const expectedTotal = 12 * MONTHLY_QUOTA
  const progressPercent = expectedTotal > 0 ? Math.round((apartment.totalPaid / expectedTotal) * 100) : 0

  return (
    <div className={cn(
      "rounded-lg border bg-white overflow-hidden",
      hasDebt ? "border-error" : "border-gray-200"
    )}>
      {/* Header - Always visible */}
      <div
        className="p-1.5 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between gap-1.5">
          <div className="flex items-center gap-1.5 min-w-0 flex-1">
            {/* Unit badge */}
            <div className={cn(
              "shrink-0 w-8 h-8 flex items-center justify-center font-medium text-body rounded border",
              hasDebt
                ? "bg-error-light text-error border-error"
                : "bg-primary-light text-primary-dark border-primary"
            )}>
              {apartment.unit}
            </div>

            {/* Resident info */}
            <div className="min-w-0 flex-1">
              {apartment.residentName ? (
                <span className="text-body font-medium text-gray-700 truncate block items-center gap-1">
                  <User className="w-3 h-3 text-gray-500 shrink-0" />
                  {apartment.residentName}
                </span>
              ) : (
                <span className="text-label text-gray-500 italic">Sem residente</span>
              )}
              <div className="text-xs text-gray-500 mt-0.5">
                {formatCurrency(apartment.totalPaid)} de {formatCurrency(expectedTotal)}
              </div>
            </div>
          </div>

          {/* Status badge and chevron */}
          <div className="flex items-center gap-1.5">
            <div className={cn(
              "px-1.5 py-0.5 rounded text-xs font-medium border",
              hasDebt
                ? "bg-error-light text-error border-error"
                : "bg-primary-light text-primary-dark border-primary"
            )}>
              {hasDebt ? (
                <span className="flex items-center gap-0.5">
                  <TrendingDown className="w-3 h-3" />
                  {formatCurrency(apartment.balance)}
                </span>
              ) : (
                "Em dia"
              )}
            </div>
            {isExpanded ? (
              <ChevronUp className="w-3 h-3 text-gray-500" />
            ) : (
              <ChevronDown className="w-3 h-3 text-gray-500" />
            )}
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-1.5">
          <Progress value={progressPercent} size="sm" />
        </div>
      </div>

      {/* Expanded content - Monthly payments grid */}
      {isExpanded && (
        <div className="border-t border-gray-100 bg-gray-50 p-1.5">
          <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">
            Quotas Mensais
          </div>

          <div className="grid grid-cols-6 gap-1">
            {MONTHS.map((monthName, idx) => {
              const monthNum = idx + 1
              const payment = apartment.payments[monthNum]
              const status = payment?.status || "pending"
              const isInteractive = !!activeTool

              return (
                <button
                  key={idx}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    if (isInteractive) onCellClick(apartment.id, idx)
                  }}
                  disabled={!isInteractive}
                  className={cn(
                    "p-1.5 text-center transition-all border rounded",
                    status === "paid" && "bg-primary-light border-primary",
                    status === "late" && "bg-error-light border-error",
                    status === "pending" && "bg-white border-gray-200",
                    isInteractive && "cursor-pointer active:scale-95",
                    !isInteractive && "cursor-default"
                  )}
                >
                  <div className="text-micro font-medium text-gray-500">{monthName}</div>
                  <div className={cn(
                    "text-label font-bold mt-0.5",
                    status === "paid" && "text-primary-dark",
                    status === "late" && "text-error",
                    status === "pending" && "text-gray-500"
                  )}>
                    {status === "paid" ? "✓" : status === "late" ? "!" : "—"}
                  </div>
                </button>
              )
            })}
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center gap-2 mt-1.5 pt-1.5 border-t border-gray-200">
            <span className="flex items-center gap-0.5 text-micro text-gray-500">
              <span className="w-2 h-2 bg-primary rounded-sm" /> Pago
            </span>
            <span className="flex items-center gap-0.5 text-micro text-gray-500">
              <span className="w-2 h-2 bg-gray-300 rounded-sm" /> Pendente
            </span>
            <span className="flex items-center gap-0.5 text-micro text-gray-500">
              <span className="w-2 h-2 bg-error rounded-sm" /> Dívida
            </span>
          </div>

          {/* Edit mode hint */}
          {activeTool && (
            <div className="mt-1.5 text-center text-xs text-primary animate-pulse">
              Toque num mês para alterar
            </div>
          )}
        </div>
      )}
    </div>
  )
}
