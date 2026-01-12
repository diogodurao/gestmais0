"use client"

import { cn } from "@/lib/utils"
import {
  type ApartmentData,
  type ToolType,
  MONTHS,
  MONTHLY_QUOTA,
  formatCurrency,
} from "./types"

// =============================================================================
// DESKTOP PAYMENT TABLE
// Full payment grid table with sticky columns for desktop view
// =============================================================================

interface DesktopPaymentTableProps {
  data: ApartmentData[]
  activeTool: ToolType
  onCellClick: (aptId: number, monthIdx: number) => void
  className?: string
}

export function DesktopPaymentTable({
  data,
  activeTool,
  onCellClick,
  className,
}: DesktopPaymentTableProps) {
  return (
    <div className={cn("hidden sm:block overflow-x-auto rounded-lg border border-[#E9ECEF]", className)}>
      <table className="w-full border-collapse text-[10px]">
        <thead>
          <tr className="bg-[#F8F9FA] border-b border-[#E9ECEF]">
            {/* Sticky columns - Unit & Resident */}
            <th className="sticky left-0 z-10 bg-[#F8F9FA] px-1.5 py-1 text-left text-[9px] font-medium uppercase tracking-wide text-[#8E9AAF] border-r border-[#E9ECEF] w-12">
              Fração
            </th>
            <th className="sticky left-12 z-10 bg-[#F8F9FA] px-1.5 py-1 text-left text-[9px] font-medium uppercase tracking-wide text-[#8E9AAF] border-r border-[#E9ECEF] w-28">
              Residente
            </th>

            {/* Month columns */}
            {MONTHS.map((month) => (
              <th key={month} className="px-1.5 py-1 text-center text-[9px] font-medium uppercase tracking-wide text-[#8E9AAF] w-12">
                {month}
              </th>
            ))}

            {/* Sticky columns - Totals */}
            <th className="sticky right-16 z-10 bg-[#F8F9FA] px-1.5 py-1 text-right text-[9px] font-medium uppercase tracking-wide text-[#8E9AAF] border-l border-[#E9ECEF] w-16">
              Pago
            </th>
            <th className="sticky right-0 z-10 bg-[#F8F9FA] px-1.5 py-1 text-right text-[9px] font-medium uppercase tracking-wide text-[#8E9AAF] w-16">
              Dívida
            </th>
          </tr>
        </thead>
        <tbody>
          {data.map((apt, idx) => (
            <tr
              key={apt.id}
              className={cn(
                "border-b border-[#F1F3F5] transition-colors hover:bg-[#F8F9FA]",
                idx % 2 === 1 && "bg-[#FAFBFC]"
              )}
            >
              {/* Unit */}
              <td className="sticky left-0 z-10 bg-inherit px-1.5 py-1 font-medium text-[#343A40] border-r border-[#E9ECEF]">
                {apt.unit}
              </td>

              {/* Resident */}
              <td className="sticky left-12 z-10 bg-inherit px-1.5 py-1 text-[#495057] border-r border-[#E9ECEF] truncate max-w-28">
                {apt.residentName || <span className="text-[#ADB5BD] italic">Sem residente</span>}
              </td>

              {/* Payment cells */}
              {MONTHS.map((_, monthIdx) => {
                const monthNum = monthIdx + 1
                const payment = apt.payments[monthNum]
                const status = payment?.status || "pending"
                const isInteractive = !!activeTool

                return (
                  <td key={monthIdx} className="p-0.5">
                    <button
                      type="button"
                      disabled={!isInteractive}
                      onClick={() => isInteractive && onCellClick(apt.id, monthIdx)}
                      className={cn(
                        "w-full h-6 flex items-center justify-center rounded text-[9px] font-medium transition-all",
                        status === "paid" && "bg-[#E8F0EA] text-[#6A9B72]",
                        status === "late" && "bg-[#F9ECEE] text-[#B86B73]",
                        status === "pending" && "text-[#ADB5BD]",
                        isInteractive && "cursor-crosshair hover:ring-1 hover:ring-[#8FB996]",
                        !isInteractive && "cursor-default"
                      )}
                    >
                      {status === "paid" ? formatCurrency(payment?.amount || MONTHLY_QUOTA) : status === "late" ? "DÍVIDA" : "-"}
                    </button>
                  </td>
                )
              })}

              {/* Total paid */}
              <td className="sticky right-16 z-10 bg-inherit px-1.5 py-1 text-right font-mono font-medium text-[#6A9B72] border-l border-[#E9ECEF]">
                {formatCurrency(apt.totalPaid)}
              </td>

              {/* Balance/Debt */}
              <td className={cn(
                "sticky right-0 z-10 bg-inherit px-1.5 py-1 text-right font-mono font-medium",
                apt.balance > 0 ? "text-[#B86B73] bg-[#F9ECEE]" : "text-[#ADB5BD]"
              )}>
                {formatCurrency(apt.balance)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// =============================================================================
// PAYMENT GRID SUMMARY
// Footer summary for mobile view
// =============================================================================

interface PaymentGridSummaryProps {
  count: number
  totalCollected: number
  totalOverdue: number
  className?: string
}

export function PaymentGridSummary({
  count,
  totalCollected,
  totalOverdue,
  className,
}: PaymentGridSummaryProps) {
  return (
    <div className={cn("rounded-lg bg-[#F8F9FA] border border-[#E9ECEF] p-1.5", className)}>
      <div className="flex items-center justify-between text-[10px] font-medium uppercase tracking-wide">
        <span className="text-[#8E9AAF]">{count} Frações</span>
        <div className="flex items-center gap-2">
          <span className="text-[#6A9B72]">{formatCurrency(totalCollected)} Cobrado</span>
          {totalOverdue > 0 && (
            <span className="text-[#B86B73]">{formatCurrency(totalOverdue)} Dívida</span>
          )}
        </div>
      </div>
    </div>
  )
}

// =============================================================================
// PAYMENT GRID LEGEND
// Status legend for the payment grid
// =============================================================================

interface PaymentGridLegendProps {
  className?: string
}

export function PaymentGridLegend({ className }: PaymentGridLegendProps) {
  return (
    <div className={cn("flex items-center justify-center gap-3 py-1.5 border-t border-[#F1F3F5]", className)}>
      <span className="flex items-center gap-1 text-[9px] text-[#8E9AAF]">
        <span className="w-2 h-2 bg-[#8FB996] rounded" /> Pago
      </span>
      <span className="flex items-center gap-1 text-[9px] text-[#8E9AAF]">
        <span className="w-2 h-2 bg-[#DEE2E6] rounded" /> Pendente
      </span>
      <span className="flex items-center gap-1 text-[9px] text-[#8E9AAF]">
        <span className="w-2 h-2 bg-[#D4848C] rounded" /> Em dívida
      </span>
    </div>
  )
}

// =============================================================================
// EDIT MODE INDICATOR
// Shows when edit tool is active
// =============================================================================

interface EditModeIndicatorProps {
  activeTool: string | null
  className?: string
  /** Custom labels for tool types. Falls back to defaults if not provided */
  toolLabels?: Record<string, string>
  /** Custom message prefix. Defaults to "Modo de edição ativo: clique nas células para" */
  messagePrefix?: string
}

const defaultToolLabels: Record<string, string> = {
  markPaid: "marcar como pago",
  markPending: "marcar como pendente",
  markLate: "marcar como em dívida",
  toggle: "alternar estado",
}

export function EditModeIndicator({
  activeTool,
  className,
  toolLabels,
  messagePrefix = "Modo de edição ativo: clique nas células para",
}: EditModeIndicatorProps) {
  if (!activeTool) return null

  const labels = { ...defaultToolLabels, ...toolLabels }
  const label = labels[activeTool] || activeTool

  return (
    <div className={cn("rounded-lg bg-[#E8F0EA] border border-[#D4E5D7] p-1.5 text-center", className)}>
      <span className="text-[10px] font-medium text-[#6A9B72]">
        {messagePrefix} {label}
      </span>
    </div>
  )
}
