"use client"

import { useState } from "react"
import { EvaluationForm } from "./EvaluationForm"
import { EvaluationSummary } from "./EvaluationSummary"
import { EvaluationChart } from "./EvaluationChart"
import { EvaluationStatus, MonthlyAverages, Evaluation } from "@/lib/types"
import { EVALUATION_MONTH_NAMES as MONTH_NAMES } from "@/lib/constants/timing"
import { Lock, Star, Users, MessageSquare, Calendar, ChevronLeft, ChevronRight } from "lucide-react"
import { Card, CardContent, CardHeader } from "@/components/ui/Card"
import { StatCard } from "@/components/ui/Stat-Card"
import { Button } from "@/components/ui/Button"

interface Props {
    buildingId: string
    status: EvaluationStatus
    averages: MonthlyAverages | null
    history: MonthlyAverages[]
    evaluations?: Evaluation[]
    submissionStats?: { submitted: number; total: number; percentage: number }
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

    const [selectedMonthIndex, setSelectedMonthIndex] = useState(0)

    // Calculate stats
    const avgRating = history.length > 0
        ? (history.reduce((sum, h) => sum + h.generalAvg, 0) / history.length).toFixed(1)
        : "-"
    const avgParticipation = submissionStats?.percentage ?? 0
    const totalComments = evaluations?.filter(e => e.comments).length ?? 0

    // Get selected month data
    const selectedMonth = history[selectedMonthIndex] ?? null

    // Navigation
    const goToPrevMonth = () => {
        if (selectedMonthIndex < history.length - 1) {
            setSelectedMonthIndex(selectedMonthIndex + 1)
        }
    }

    const goToNextMonth = () => {
        if (selectedMonthIndex > 0) {
            setSelectedMonthIndex(selectedMonthIndex - 1)
        }
    }

    // Resident view - simple form only
    if (!isManager) {
        return (
            <>
                {/* Header */}
                <div className="mb-1.5">
                    <h1 className="text-heading font-semibold text-gray-800">Avaliação Mensal</h1>
                    <p className="text-label text-gray-500">Avalie a qualidade da gestão do condomínio</p>
                </div>

                {/* Form or Locked State */}
                {status.isOpen ? (
                    <EvaluationForm buildingId={buildingId} status={status} />
                ) : (
                    <Card className="bg-gray-50">
                        <CardContent className="py-6 text-center">
                            <Lock className="w-10 h-10 text-gray-400 mx-auto mb-1.5" />
                            <h2 className="text-base font-semibold text-gray-700 mb-1">
                                Avaliação de {MONTH_NAMES[status.month - 1]} {status.year}
                            </h2>
                            <p className="text-label text-gray-500">
                                A avaliação abre no dia 24 deste mês.
                            </p>
                            <p className="text-label text-gray-400 mt-0.5">
                                Faltam {status.daysUntilOpen} dias.
                            </p>
                        </CardContent>
                    </Card>
                )}
            </>
        )
    }

    // Manager view - full dashboard
    return (
        <>
            {/* Header */}
            <div className="mb-1.5">
                <h1 className="text-heading font-semibold text-gray-800">Avaliação Mensal</h1>
                <p className="text-label text-gray-500">Avalie e acompanhe a qualidade da gestão do condomínio</p>
            </div>

            {/* Stats */}
            <div className="mb-1.5 grid grid-cols-2 gap-1.5 lg:grid-cols-4">
                <StatCard
                    label="Média Geral"
                    value={avgRating}
                    icon={<Star className="h-4 w-4" />}
                />
                <StatCard
                    label="Participação"
                    value={`${avgParticipation}%`}
                    icon={<Users className="h-4 w-4" />}
                />
                <StatCard
                    label="Comentários"
                    value={totalComments.toString()}
                    icon={<MessageSquare className="h-4 w-4" />}
                />
                <StatCard
                    label="Meses Avaliados"
                    value={history.length.toString()}
                    icon={<Calendar className="h-4 w-4" />}
                />
            </div>

            <div className="grid gap-1.5 lg:grid-cols-3">
                {/* Left Column */}
                <div className="lg:col-span-2 space-y-1.5">
                    {/* Form or Locked State */}
                    {status.isOpen ? (
                        <EvaluationForm buildingId={buildingId} status={status} />
                    ) : (
                        <Card className="bg-gray-50">
                            <CardContent className="py-6 text-center">
                                <Lock className="w-10 h-10 text-gray-400 mx-auto mb-1.5" />
                                <h2 className="text-base font-semibold text-gray-700 mb-1">
                                    Avaliação de {MONTH_NAMES[status.month - 1]} {status.year}
                                </h2>
                                <p className="text-label text-gray-500">
                                    A avaliação abre no dia 24 deste mês.
                                </p>
                                <p className="text-label text-gray-400 mt-0.5">
                                    Faltam {status.daysUntilOpen} dias.
                                </p>
                            </CardContent>
                        </Card>
                    )}

                    {/* Month Navigation + Individual Responses */}
                    {history.length > 0 && (
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={goToPrevMonth}
                                        disabled={selectedMonthIndex >= history.length - 1}
                                    >
                                        <ChevronLeft className="h-3 w-3" />
                                    </Button>
                                    <span className="text-base font-medium text-gray-700">
                                        {selectedMonth
                                            ? `${MONTH_NAMES[selectedMonth.month - 1]} ${selectedMonth.year}`
                                            : "Sem dados"}
                                    </span>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={goToNextMonth}
                                        disabled={selectedMonthIndex === 0}
                                    >
                                        <ChevronRight className="h-3 w-3" />
                                    </Button>
                                </div>
                            </CardHeader>
                            {/* Individual Responses */}
                            {evaluations && evaluations.length > 0 && (
                                <CardContent className="pt-0">
                                    <div className="border-t border-gray-100 pt-1.5">
                                        <h4 className="text-body font-semibold text-gray-700 mb-1.5">
                                            Respostas individuais ({evaluations.length})
                                        </h4>
                                        <div className="space-y-1.5 max-h-60 overflow-y-auto">
                                            {evaluations.map((evaluation) => (
                                                <div
                                                    key={evaluation.id}
                                                    className="bg-gray-50 rounded-lg p-1.5"
                                                >
                                                    <div className="flex items-center justify-between mb-0.5">
                                                        <span className="text-label font-medium text-gray-700">
                                                            {evaluation.userName || "Anónimo"}
                                                        </span>
                                                        <span className="text-xs text-gray-500">
                                                            Média: {(
                                                                (evaluation.securityRating +
                                                                    evaluation.cleaningRating +
                                                                    evaluation.maintenanceRating +
                                                                    evaluation.communicationRating +
                                                                    evaluation.generalRating) / 5
                                                            ).toFixed(1)} ⭐
                                                        </span>
                                                    </div>
                                                    <div className="flex gap-2 text-xs text-gray-600 mb-0.5">
                                                        <span>Seg: {evaluation.securityRating}</span>
                                                        <span>Lim: {evaluation.cleaningRating}</span>
                                                        <span>Man: {evaluation.maintenanceRating}</span>
                                                        <span>Com: {evaluation.communicationRating}</span>
                                                        <span>Ger: {evaluation.generalRating}</span>
                                                    </div>
                                                    {evaluation.comments && (
                                                        <p className="text-xs text-gray-600 italic">
                                                            "{evaluation.comments}"
                                                        </p>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </CardContent>
                            )}
                        </Card>
                    )}
                </div>

                {/* Right Column */}
                <div className="space-y-1.5">
                    {/* Monthly Summary */}
                    <EvaluationSummary
                        averages={selectedMonth ?? averages}
                        submissionStats={submissionStats}
                        isManager={isManager}
                    />

                    {/* Trend Chart */}
                    <EvaluationChart history={history} />
                </div>
            </div>
        </>
    )
}