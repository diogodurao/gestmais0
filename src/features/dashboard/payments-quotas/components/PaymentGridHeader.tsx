"use client"

import { Calendar } from "lucide-react"
import { formatCurrency } from "@/lib/format"
import { type PaymentStats } from "@/lib/types"

interface PaymentGridHeaderProps {
    year: number
    stats: PaymentStats
}

export function PaymentGridHeader({ year, stats }: PaymentGridHeaderProps) {
    return (
        <header className="bg-white border-b border-slate-300 shrink-0 z-30">
            <div className="h-12 flex items-center px-4 justify-between gap-4">
                {/* Title */}
                <div className="flex items-center gap-3 min-w-0">
                    <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                    <div className="min-w-0">
                        <h1 className="font-bold text-slate-800 text-content leading-tight truncate">
                            Mapa de Quotas
                        </h1>
                        <span className="text-micro text-slate-500 font-mono uppercase tracking-tight">
                            Exercício {year}
                        </span>
                    </div>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-2 shrink-0">
                    {/* Paid/Total ratio */}
                    <div className="hidden sm:flex items-center gap-1 px-2 py-1 bg-slate-100 border border-slate-200 text-slate-600 rounded-sm">
                        <span className="text-micro font-bold uppercase">
                            {stats.paidCount}/{stats.total}
                        </span>
                        <span className="text-micro text-slate-400">em dia</span>
                    </div>

                    {/* Total collected */}
                    <div className="flex items-center gap-1 px-2 py-1 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-sm">
                        <span className="text-micro font-bold uppercase hidden xs:inline">Cobrado</span>
                        <span className="font-mono font-bold text-label">
                            {formatCurrency(stats.totalCollected)}
                        </span>
                    </div>

                    {/* Total overdue */}
                    <div className="flex items-center gap-1 px-2 py-1 bg-rose-50 border border-rose-200 text-rose-700 rounded-sm">
                        <span className="text-micro font-bold uppercase hidden xs:inline">Dívida</span>
                        <span className="font-mono font-bold text-label">
                            {formatCurrency(stats.totalOverdue)}
                        </span>
                    </div>
                </div>
            </div>
        </header>
    )
}