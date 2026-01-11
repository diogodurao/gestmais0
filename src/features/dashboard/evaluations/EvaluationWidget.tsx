import Link from "next/link"
import { Lock, Clock, CheckCircle, BarChart3 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { EvaluationStatus } from "@/lib/types"
import { EVALUATION_MONTH_NAMES as MONTH_NAMES } from "@/lib/constants/timing"
import { cn } from "@/lib/utils"

interface Props {
    status: EvaluationStatus
}

export function EvaluationWidget({ status }: Props) {
    const { year, month, isOpen, daysUntilOpen, daysRemaining, hasSubmitted } = status

    // State 1: Locked (before day 24)
    if (!isOpen) {
        return (
            <Card className="bg-gray-50 border-gray-200">
                <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                        <div className="p-2 bg-gray-200 rounded-lg">
                            <Lock className="w-5 h-5 text-gray-500" />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-body font-bold text-gray-700">
                                Avaliação de {MONTH_NAMES[month - 1]}
                            </h3>
                            <p className="text-label text-gray-500 mt-1">
                                A avaliação abre dia 24
                            </p>
                            <p className="text-label text-gray-400">
                                Faltam {daysUntilOpen} dias
                            </p>
                        </div>
                        <Button variant="outline" size="sm" disabled>
                            Avaliar
                        </Button>
                    </div>
                </CardContent>
            </Card>
        )
    }

    // State 2: Open, not submitted
    if (!hasSubmitted) {
        return (
            <Card className="bg-info-light border-gray-200">
                <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                        <div className="p-2 bg-gray-100 rounded-lg">
                            <Clock className="w-5 h-5 text-info" />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-body font-bold text-gray-700">
                                Avaliação de {MONTH_NAMES[month - 1]}
                            </h3>
                            <p className="text-label text-info mt-1">
                                A avaliação está aberta!
                            </p>
                            <p className="text-label text-gray-500">
                                {daysRemaining === 0
                                    ? "Último dia para submeter"
                                    : `Faltam ${daysRemaining} dias para submeter`}
                            </p>
                        </div>
                        <Link href="/dashboard/evaluations">
                            <Button size="sm">
                                Avaliar agora →
                            </Button>
                        </Link>
                    </div>
                </CardContent>
            </Card>
        )
    }

    // State 3: Open, already submitted
    return (
        <Card className="bg-success-light border-gray-200">
            <CardContent className="p-4">
                <div className="flex items-start gap-3">
                    <div className="p-2 bg-primary-light rounded-lg">
                        <CheckCircle className="w-5 h-5 text-success" />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-body font-bold text-gray-700">
                            Avaliação de {MONTH_NAMES[month - 1]}
                        </h3>
                        <p className="text-label text-success mt-1">
                            Avaliação submetida ✓
                        </p>
                        <p className="text-label text-gray-500">
                            Pode editar até dia {new Date(year, month, 0).getDate()}
                        </p>
                    </div>
                    <Link href="/dashboard/evaluations">
                        <Button variant="outline" size="sm">
                            Ver/Editar →
                        </Button>
                    </Link>
                </div>
            </CardContent>
        </Card>
    )
}