import Link from "next/link"
import { Lock, Clock, CheckCircle, BarChart3 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { EvaluationStatus } from "@/lib/types"
import { EVALUATION_MONTH_NAMES as MONTH_NAMES } from "@/lib/constants"
import { cn } from "@/lib/utils"

interface Props {
    status: EvaluationStatus
}

export function EvaluationWidget({ status }: Props) {
    const { year, month, isOpen, daysUntilOpen, daysRemaining, hasSubmitted } = status

    // State 1: Locked (before day 24)
    if (!isOpen) {
        return (
            <Card className="bg-slate-50 border-slate-200">
                <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                        <div className="p-2 bg-slate-200 rounded-lg">
                            <Lock className="w-5 h-5 text-slate-500" />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-body font-bold text-slate-700">
                                Avaliação de {MONTH_NAMES[month - 1]}
                            </h3>
                            <p className="text-label text-slate-500 mt-1">
                                A avaliação abre dia 24
                            </p>
                            <p className="text-label text-slate-400">
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
            <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <Clock className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-body font-bold text-slate-700">
                                Avaliação de {MONTH_NAMES[month - 1]}
                            </h3>
                            <p className="text-label text-blue-600 mt-1">
                                A avaliação está aberta!
                            </p>
                            <p className="text-label text-slate-500">
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
        <Card className="bg-green-50 border-green-200">
            <CardContent className="p-4">
                <div className="flex items-start gap-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-body font-bold text-slate-700">
                            Avaliação de {MONTH_NAMES[month - 1]}
                        </h3>
                        <p className="text-label text-green-600 mt-1">
                            Avaliação submetida ✓
                        </p>
                        <p className="text-label text-slate-500">
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