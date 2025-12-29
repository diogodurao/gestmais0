"use client"

import { formatCurrency } from "@/lib/format"
import { ProgressBar } from "@/components/ui/ProgressBar"

interface BudgetProgressProps {
    totalCollected: number
    totalBudget: number
    progressPercent: number
}

export function BudgetProgress({ totalCollected, totalBudget, progressPercent }: BudgetProgressProps) {
    return (
        <div className="tech-border bg-white p-3 sm:p-4">
            <div className="flex items-center justify-between mb-2 sm:mb-3">
                <h3 className="text-label sm:text-body font-bold text-slate-500 uppercase tracking-tight">
                    Execução Orçamental
                </h3>
                <span className="text-content font-bold text-slate-900 font-mono">
                    {progressPercent}%
                </span>
            </div>

            <ProgressBar
                value={totalCollected}
                max={totalBudget}
                variant="auto"
                size="md"
            />

            <div className="flex items-center justify-between mt-2 sm:mt-3 text-micro sm:text-label">
                <div>
                    <span className="text-slate-400 uppercase font-bold tracking-tighter">Angariado</span>
                    <span className="text-emerald-700 font-bold font-mono text-body sm:text-content ml-1 sm:ml-2">
                        {formatCurrency(totalCollected)}
                    </span>
                </div>
                <div className="text-right">
                    <span className="text-slate-400 uppercase font-bold tracking-tighter hidden sm:inline">Orçamento Total </span>
                    <span className="text-slate-400 uppercase font-bold tracking-tighter sm:hidden">Orçamento</span>
                    <span className="text-slate-900 font-bold font-mono text-body sm:text-content ml-1 sm:ml-2">
                        {formatCurrency(totalBudget)}
                    </span>
                </div>
            </div>
        </div>
    )
}
