"use client"

import { DollarSign, TrendingUp, Calendar, Building } from "lucide-react"
import { StatCard } from "@/components/ui/Stat-Card"

interface ProjectDetailStatsProps {
    totalBudget: number
    totalPaid: number
    progressPercent: number
    numInstallments: number
    apartmentsTotal: number
}

function formatCurrencyShort(cents: number): string {
    return `€${(cents / 100).toFixed(0)}`
}

export function ProjectDetailStats({
    totalBudget,
    totalPaid,
    progressPercent,
    numInstallments,
    apartmentsTotal
}: ProjectDetailStatsProps) {
    return (
        <div className="mb-1.5 grid grid-cols-2 gap-1.5 lg:grid-cols-4">
            <StatCard
                label="Orçamento"
                value={formatCurrencyShort(totalBudget)}
                icon={<DollarSign className="h-4 w-4" />}
            />
            <StatCard
                label="Cobrado"
                value={formatCurrencyShort(totalPaid)}
                change={{ value: `${progressPercent}%`, positive: true }}
                icon={<TrendingUp className="h-4 w-4" />}
            />
            <StatCard
                label="Prestações"
                value={numInstallments.toString()}
                icon={<Calendar className="h-4 w-4" />}
            />
            <StatCard
                label="Frações"
                value={apartmentsTotal.toString()}
                icon={<Building className="h-4 w-4" />}
            />
        </div>
    )
}
