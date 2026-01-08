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
        <header className="bg-white border-b border-[#E9ECEF] shrink-0 z-30 px-4 h-12 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2.5 min-w-0">
                <div className="p-1.5 bg-[#F8F9FA] rounded-md border border-[#E9ECEF]">
                    <Calendar className="w-3.5 h-3.5 text-[#8E9AAF]" />
                </div>
                <div className="flex flex-col justify-center">
                    <h1 className="font-semibold text-[#343A40] text-[13px] leading-none">
                        Mapa de Quotas
                    </h1>
                    <span className="text-[10px] text-[#8E9AAF] font-medium uppercase tracking-wide mt-0.5">
                        Exercício {year}
                    </span>
                </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
                <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-[#F8F9FA] border border-[#E9ECEF] text-[#495057] rounded-md">
                    <span className="text-[10px] font-bold">
                        {stats.paidCount}/{stats.total}
                    </span>
                    <span className="text-[10px] text-[#8E9AAF] font-medium">em dia</span>
                </div>

                <div className="flex flex-col items-end sm:flex-row sm:items-center gap-0.5 sm:gap-2 px-2.5 py-1 bg-[#E8F0EA] border border-[#8FB996]/30 text-[#2F5E3D] rounded-md">
                    <span className="text-[9px] font-bold uppercase tracking-wider opacity-70 hidden sm:inline">Cobrado</span>
                    <span className="font-mono font-bold text-[12px]">
                        {formatCurrency(stats.totalCollected)}
                    </span>
                </div>

                <div className="flex flex-col items-end sm:flex-row sm:items-center gap-0.5 sm:gap-2 px-2.5 py-1 bg-[#F9ECEE] border border-[#D4848C]/30 text-[#B86B73] rounded-md">
                    <span className="text-[9px] font-bold uppercase tracking-wider opacity-70 hidden sm:inline">Dívida</span>
                    <span className="font-mono font-bold text-[12px]">
                        {formatCurrency(stats.totalOverdue)}
                    </span>
                </div>
            </div>
        </header>
    )
}