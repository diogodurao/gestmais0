"use client"

import { formatCurrency } from "@/lib/extraordinary-calculations"
import { ProgressBar } from "@/components/ui/ProgressBar"
import { t } from "@/lib/translations"

interface BudgetProgressProps {
    totalCollected: number
    totalBudget: number
    progressPercent: number
}

export function BudgetProgress({ totalCollected, totalBudget, progressPercent }: BudgetProgressProps) {
    return (
        <div className="tech-border bg-white p-3 sm:p-4">
            <div className="flex items-center justify-between mb-2 sm:mb-3">
                <h3 className="text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase tracking-tight">
                    {t.extraPayment.budgetExecution}
                </h3>
                <span className="text-sm font-bold text-slate-900 font-mono">
                    {progressPercent}%
                </span>
            </div>

            <ProgressBar
                value={totalCollected}
                max={totalBudget}
                variant="auto"
                size="md"
            />

            <div className="flex items-center justify-between mt-2 sm:mt-3 text-[9px] sm:text-[10px]">
                <div>
                    <span className="text-slate-400 uppercase font-bold tracking-tighter">{t.extraPayment.collected}</span>
                    <span className="text-emerald-700 font-bold font-mono text-[11px] sm:text-[12px] ml-1 sm:ml-2">
                        {formatCurrency(totalCollected)}
                    </span>
                </div>
                <div className="text-right">
                    <span className="text-slate-400 uppercase font-bold tracking-tighter hidden sm:inline">{t.extraPayment.totalBudget} </span>
                    <span className="text-slate-400 uppercase font-bold tracking-tighter">Orçam.</span>
                    <span className="text-slate-900 font-bold font-mono text-[11px] sm:text-[12px] ml-1 sm:ml-2">
                        {formatCurrency(totalBudget)}
                    </span>
                </div>
            </div>
        </div>
    )
}
