"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { Progress } from "../../ui/progress"
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
      hasDebt ? "border-[#EFCDD1]" : "border-[#E9ECEF]"
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
              "shrink-0 w-8 h-8 flex items-center justify-center font-medium text-[11px] rounded border",
              hasDebt
                ? "bg-[#F9ECEE] text-[#B86B73] border-[#EFCDD1]"
                : "bg-[#E8F0EA] text-[#6A9B72] border-[#D4E5D7]"
            )}>
              {apartment.unit}
            </div>

            {/* Resident info */}
            <div className="min-w-0 flex-1">
              {apartment.residentName ? (
                <span className="text-[11px] font-medium text-[#495057] truncate block flex items-center gap-1">
                  <User className="w-3 h-3 text-[#8E9AAF] shrink-0" />
                  {apartment.residentName}
                </span>
              ) : (
                <span className="text-[10px] text-[#8E9AAF] italic">Sem residente</span>
              )}
              <div className="text-[9px] text-[#8E9AAF] mt-0.5">
                {formatCurrency(apartment.totalPaid)} de {formatCurrency(expectedTotal)}
              </div>
            </div>
          </div>

          {/* Status badge and chevron */}
          <div className="flex items-center gap-1.5">
            <div className={cn(
              "px-1.5 py-0.5 rounded text-[9px] font-medium border",
              hasDebt
                ? "bg-[#F9ECEE] text-[#B86B73] border-[#EFCDD1]"
                : "bg-[#E8F0EA] text-[#6A9B72] border-[#D4E5D7]"
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
              <ChevronUp className="w-3 h-3 text-[#8E9AAF]" />
            ) : (
              <ChevronDown className="w-3 h-3 text-[#8E9AAF]" />
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
        <div className="border-t border-[#F1F3F5] bg-[#F8F9FA] p-1.5">
          <div className="text-[9px] font-medium text-[#8E9AAF] uppercase tracking-wide mb-1.5">
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
                    status === "paid" && "bg-[#E8F0EA] border-[#D4E5D7]",
                    status === "late" && "bg-[#F9ECEE] border-[#EFCDD1]",
                    status === "pending" && "bg-white border-[#E9ECEF]",
                    isInteractive && "cursor-pointer active:scale-95",
                    !isInteractive && "cursor-default"
                  )}
                >
                  <div className="text-[8px] font-medium text-[#8E9AAF]">{monthName}</div>
                  <div className={cn(
                    "text-[10px] font-bold mt-0.5",
                    status === "paid" && "text-[#6A9B72]",
                    status === "late" && "text-[#B86B73]",
                    status === "pending" && "text-[#8E9AAF]"
                  )}>
                    {status === "paid" ? "✓" : status === "late" ? "!" : "—"}
                  </div>
                </button>
              )
            })}
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center gap-2 mt-1.5 pt-1.5 border-t border-[#E9ECEF]">
            <span className="flex items-center gap-0.5 text-[8px] text-[#8E9AAF]">
              <span className="w-2 h-2 bg-[#8FB996] rounded-sm" /> Pago
            </span>
            <span className="flex items-center gap-0.5 text-[8px] text-[#8E9AAF]">
              <span className="w-2 h-2 bg-[#DEE2E6] rounded-sm" /> Pendente
            </span>
            <span className="flex items-center gap-0.5 text-[8px] text-[#8E9AAF]">
              <span className="w-2 h-2 bg-[#D4848C] rounded-sm" /> Dívida
            </span>
          </div>

          {/* Edit mode hint */}
          {activeTool && (
            <div className="mt-1.5 text-center text-[9px] text-[#8FB996] animate-pulse">
              Toque num mês para alterar
            </div>
          )}
        </div>
      )}
    </div>
  )
}
