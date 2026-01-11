"use client"

import { EvaluationForm } from "./EvaluationForm"
import { EvaluationSummary } from "./EvaluationSummary"
import { EvaluationChart } from "./EvaluationChart"
import { EvaluationStatus, MonthlyAverages, Evaluation } from "@/lib/types"
import { EVALUATION_MONTH_NAMES as MONTH_NAMES } from "@/lib/constants"
import { Lock } from "lucide-react"
import { Card, CardContent } from "@/components/ui/Card"

interface Props {
    buildingId: string
    status: EvaluationStatus
    averages: MonthlyAverages | null
    history: MonthlyAverages[]
    evaluations?: Evaluation[] // Manager only
    submissionStats?: { submitted: number; total: number; percentage: number } // Manager only
    isManager: boolean
}

export function EvaluationPage({
    buildingId,
    status,
    averages,
    history,
    evaluations,
    submissionStats,
    isManager,
}: Props) {
    return (
        <div className="space-y-6">
            {/* Form or Locked State */}
            {status.isOpen ? (
                <EvaluationForm buildingId={buildingId} status={status} />
            ) : (
                <Card className="bg-gray-50">
                    <CardContent className="p-6 text-center">
                        <Lock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h2 className="text-h4 font-bold text-gray-700 mb-2">
                            Avaliação de {MONTH_NAMES[status.month - 1]} {status.year}
                        </h2>
                        <p className="text-body text-gray-500">
                            A avaliação abre no dia 24 deste mês.
                        </p>
                        <p className="text-body text-gray-400 mt-1">
                            Faltam {status.daysUntilOpen} dias.
                        </p>
                    </CardContent>
                </Card>
            )}

            {/* Results Summary */}
            <EvaluationSummary
                averages={averages}
                evaluations={isManager ? evaluations : undefined}
                submissionStats={isManager ? submissionStats : undefined}
                isManager={isManager}
            />

            {/* Historical Chart */}
            <EvaluationChart history={history} />
        </div>
    )
}