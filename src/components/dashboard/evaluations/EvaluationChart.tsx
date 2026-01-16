"use client"

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card"
import { MonthlyAverages } from "@/lib/types"
import { EVALUATION_MONTH_NAMES as MONTH_NAMES } from "@/lib/constants/timing"
import { cn } from "@/lib/utils"

interface Props {
    history: MonthlyAverages[]
}

export function EvaluationChart({ history }: Props) {
    if (history.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Evolução</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-label text-gray-500 text-center py-4">
                        Ainda não há dados históricos suficientes.
                    </p>
                </CardContent>
            </Card>
        )
    }

    const maxRating = 5
    // Reverse to show oldest first (left to right)
    const sortedHistory = [...history].reverse()

    // Calculate overall average for each month
    const getOverallAvg = (month: MonthlyAverages) => {
        return (
            month.securityAvg +
            month.cleaningAvg +
            month.maintenanceAvg +
            month.communicationAvg +
            month.generalAvg
        ) / 5
    }

    const getBarColor = (rating: number) => {
        if (rating >= 4) return "bg-success"
        if (rating >= 3) return "bg-warning"
        return "bg-error"
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Evolução da Avaliação</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex items-end justify-between gap-1 h-24">
                    {sortedHistory.map((month, idx) => {
                        const avg = getOverallAvg(month)
                        const height = (avg / maxRating) * 100

                        return (
                            <div key={idx} className="flex-1 flex flex-col items-center gap-0.5">
                                <div className="w-full flex flex-col justify-end h-20">
                                    <div
                                        className={cn(
                                            "w-full rounded-t transition-all",
                                            getBarColor(avg)
                                        )}
                                        style={{ height: `${height}%` }}
                                    />
                                </div>
                                <span className="text-xs text-gray-500">
                                    {MONTH_NAMES[month.month - 1].slice(0, 3)}
                                </span>
                                <span className="text-label font-medium text-gray-700">
                                    {avg.toFixed(1)}
                                </span>
                            </div>
                        )
                    })}
                </div>
            </CardContent>
        </Card>
    )
}