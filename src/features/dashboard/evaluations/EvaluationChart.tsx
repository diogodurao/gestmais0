"use client"

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card"
import { MonthlyAverages } from "@/lib/types"
import { EVALUATION_CATEGORIES as CATEGORIES, EVALUATION_MONTH_NAMES as MONTH_NAMES } from "@/lib/constants"

interface Props {
    history: MonthlyAverages[]
}

const COLORS: Record<string, string> = {
    securityRating: "#3b82f6", // blue
    cleaningRating: "#22c55e", // green
    maintenanceRating: "#f59e0b", // amber
    communicationRating: "#8b5cf6", // purple
    generalRating: "#64748b", // slate
}

export function EvaluationChart({ history }: Props) {
    if (history.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Histórico</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-body text-gray-500 text-center py-4">
                        Ainda não há dados históricos suficientes.
                    </p>
                </CardContent>
            </Card>
        )
    }

    const maxValue = 5
    const chartHeight = 200

    const getY = (value: number) => {
        return chartHeight - (value / maxValue) * chartHeight
    }

    const getMonthLabel = (avg: MonthlyAverages) => {
        return `${MONTH_NAMES[avg.month - 1].slice(0, 3)}`
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Tendências (últimos {history.length} meses)</CardTitle>
            </CardHeader>
            <CardContent>
                {/* Legend */}
                <div className="flex flex-wrap gap-4 mb-4">
                    {CATEGORIES.map(({ key, label }) => (
                        <div key={key} className="flex items-center gap-2">
                            <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: COLORS[key] }}
                            />
                            <span className="text-label text-gray-600">{label}</span>
                        </div>
                    ))}
                </div>

                {/* Simple bar chart */}
                <div className="overflow-x-auto">
                    <div className="flex gap-4 min-w-fit">
                        {history.map((month, idx) => (
                            <div key={idx} className="flex flex-col items-center">
                                {/* Bars */}
                                <div className="flex gap-1 h-[120px] items-end">
                                    {CATEGORIES.map(({ key }) => {
                                        const avgKey = key.replace('Rating', 'Avg') as keyof MonthlyAverages
                                        const value = month[avgKey] as number
                                        const height = (value / 5) * 100

                                        return (
                                            <div
                                                key={key}
                                                className="w-3 rounded-t transition-all"
                                                style={{
                                                    height: `${height}%`,
                                                    backgroundColor: COLORS[key],
                                                }}
                                                title={`${CATEGORIES.find(c => c.key === key)?.label}: ${value.toFixed(1)}`}
                                            />
                                        )
                                    })}
                                </div>
                                {/* Month label */}
                                <span className="text-label text-gray-500 mt-2">
                                    {getMonthLabel(month)}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Y-axis labels */}
                <div className="flex justify-between text-label text-gray-400 mt-2">
                    <span>1 ⭐</span>
                    <span>3 ⭐</span>
                    <span>5 ⭐</span>
                </div>
            </CardContent>
        </Card>
    )
}