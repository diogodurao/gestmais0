"use client"

import { formatCurrency } from "@/lib/format"
import { StatCard } from "@/components/ui/Card"

interface ProjectDetailStatsProps {
    stats: {
        totalExpected: number
        totalPaid: number
        apartmentsCompleted: number
        apartmentsTotal: number
    }
}

export function ProjectDetailStats({ stats }: ProjectDetailStatsProps) {
    return (
        <div className="grid grid-cols-2 gap-2 sm:gap-3 md:grid-cols-4">
            <StatCard
                label="Total Esperado"
                value={formatCurrency(stats.totalExpected)}
                variant="neutral"
            />
            <StatCard
                label="Total Cobrado"
                value={formatCurrency(stats.totalPaid)}
                variant="success"
            />
            <StatCard
                label="Em Dívida"
                value={formatCurrency(stats.totalExpected - stats.totalPaid)}
                variant={stats.totalExpected - stats.totalPaid > 0 ? "warning" : "neutral"}
            />
            <StatCard
                label="Frações Liquidadas"
                value={`${stats.apartmentsCompleted}/${stats.apartmentsTotal}`}
                subValue={`${Math.round((stats.apartmentsCompleted / stats.apartmentsTotal) * 100)}%`}
                variant="info"
            />
        </div>
    )
}
