import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { Progress } from "@/components/ui/Progress"
import { StarRating } from "./StarRating"
import { MonthlyAverages } from "@/lib/types"
import { EVALUATION_CATEGORIES as CATEGORIES } from "@/lib/constants/ui"
import { EVALUATION_MONTH_NAMES as MONTH_NAMES } from "@/lib/constants/timing"

interface Props {
    averages: MonthlyAverages | null
    submissionStats?: { submitted: number; total: number; percentage: number }
    isManager: boolean
}

export function EvaluationSummary({ averages, submissionStats, isManager }: Props) {
    if (!averages) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Resultados</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-label text-gray-500 text-center py-4">
                        Ainda não há avaliações submetidas.
                    </p>
                </CardContent>
            </Card>
        )
    }

    const avgMap: Record<string, number> = {
        securityRating: averages.securityAvg,
        cleaningRating: averages.cleaningAvg,
        maintenanceRating: averages.maintenanceAvg,
        communicationRating: averages.communicationAvg,
        generalRating: averages.generalAvg,
    }

    // Calculate overall average
    const overallAvg = (
        averages.securityAvg +
        averages.cleaningAvg +
        averages.maintenanceAvg +
        averages.communicationAvg +
        averages.generalAvg
    ) / 5

    const getBadgeVariant = (rating: number) => {
        if (rating >= 4) return "success"
        if (rating >= 3) return "warning"
        return "error"
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between w-full">
                    <CardTitle>{MONTH_NAMES[averages.month - 1]} {averages.year}</CardTitle>
                    <Badge variant={getBadgeVariant(overallAvg)}>
                        {overallAvg.toFixed(1)}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent>
                {/* Overall Rating */}
                <div className="text-center mb-1.5">
                    <StarRating value={Math.round(overallAvg)} size="lg" readonly />
                    <p className="text-heading font-semibold text-gray-800 mt-0.5">{overallAvg.toFixed(1)}</p>
                    <p className="text-label text-gray-500">
                        Média de {averages.totalResponses} avaliações
                    </p>
                </div>

                {/* Participation (Manager only) */}
                {isManager && submissionStats && (
                    <div className="mb-1.5">
                        <div className="flex items-center justify-between mb-0.5">
                            <span className="text-label text-gray-500">Participação</span>
                            <span className="text-label font-medium text-gray-700">{submissionStats.percentage}%</span>
                        </div>
                        <Progress value={submissionStats.percentage} size="sm" />
                        <p className="text-xs text-gray-400 mt-0.5">
                            {submissionStats.submitted} de {submissionStats.total} condóminos
                        </p>
                    </div>
                )}

                <div className="border-t border-gray-100 pt-1.5 mt-1.5" />

                {/* Category Ratings */}
                <div className="space-y-1">
                    {CATEGORIES.map(({ key, label }) => (
                        <div key={key} className="flex items-center justify-between">
                            <span className="text-label text-gray-500">{label}</span>
                            <div className="flex items-center gap-1">
                                <StarRating value={Math.round(avgMap[key])} readonly size="sm" />
                                <span className="text-label font-medium text-gray-700 w-6 text-right">
                                    {avgMap[key].toFixed(1)}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}