import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card"
import { StarRating } from "./StarRating"
import { MonthlyAverages, Evaluation } from "@/lib/types"
import { EVALUATION_CATEGORIES as CATEGORIES, EVALUATION_MONTH_NAMES as MONTH_NAMES } from "@/lib/constants"

interface Props {
    averages: MonthlyAverages | null
    evaluations?: Evaluation[] // Only for manager
    submissionStats?: { submitted: number; total: number; percentage: number }
    isManager: boolean
}

export function EvaluationSummary({ averages, evaluations, submissionStats, isManager }: Props) {
    if (!averages) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Resultados</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-body text-slate-500 text-center py-4">
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

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between w-full">
                    <CardTitle>
                        Resultados de {MONTH_NAMES[averages.month - 1]} {averages.year}
                    </CardTitle>
                    {submissionStats && (
                        <span className="text-label text-slate-500">
                            {submissionStats.submitted} de {submissionStats.total} residentes ({submissionStats.percentage}%)
                        </span>
                    )}
                </div>
            </CardHeader>
            <CardContent>
                {/* Averages */}
                <div className="space-y-3 mb-6">
                    {CATEGORIES.map(({ key, label }) => (
                        <div key={key} className="flex items-center justify-between">
                            <span className="text-body font-medium text-slate-700">
                                {label}
                            </span>
                            <div className="flex items-center gap-2">
                                <StarRating value={Math.round(avgMap[key])} readonly size="sm" />
                                <span className="text-body text-slate-600 min-w-[2rem]">
                                    {avgMap[key].toFixed(1)}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Individual responses (manager only) */}
                {isManager && evaluations && evaluations.length > 0 && (
                    <div className="border-t border-slate-200 pt-4">
                        <h4 className="text-body font-bold text-slate-700 mb-3">
                            Respostas individuais
                        </h4>
                        <div className="space-y-3 max-h-64 overflow-y-auto">
                            {evaluations.map((evaluation) => (
                                <div
                                    key={evaluation.id}
                                    className="bg-slate-50 rounded-lg p-3"
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-body font-medium text-slate-700">
                                            {evaluation.userName}
                                        </span>
                                        <span className="text-label text-slate-400">
                                            Média: {(
                                                (evaluation.securityRating +
                                                    evaluation.cleaningRating +
                                                    evaluation.maintenanceRating +
                                                    evaluation.communicationRating +
                                                    evaluation.generalRating) / 5
                                            ).toFixed(1)} ⭐
                                        </span>
                                    </div>
                                    <div className="flex gap-4 text-label text-slate-600 mb-2">
                                        <span>Seg: {evaluation.securityRating}</span>
                                        <span>Lim: {evaluation.cleaningRating}</span>
                                        <span>Man: {evaluation.maintenanceRating}</span>
                                        <span>Com: {evaluation.communicationRating}</span>
                                        <span>Ger: {evaluation.generalRating}</span>
                                    </div>
                                    {evaluation.comments && (
                                        <p className="text-body text-slate-600 italic">
                                            "{evaluation.comments}"
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}