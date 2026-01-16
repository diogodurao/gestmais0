"use client"

import { useState } from "react"
import { CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { Textarea } from "@/components/ui/Textarea"
import { FormField, FormLabel, FormControl, FormError } from "@/components/ui/Form-Field"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/Card"
import { Divider } from "@/components/ui/Divider"
import { StarRating } from "./StarRating"
import { submitEvaluation } from "@/lib/actions/evaluations"
import { EvaluationStatus, EvaluationCategoryKey as CategoryKey } from "@/lib/types"
import { EVALUATION_MONTH_NAMES as MONTH_NAMES } from "@/lib/constants/timing"
import { useToast } from "@/components/ui/Toast"
import { EVALUATION_CATEGORIES as CATEGORIES } from "@/lib/constants/ui"

interface Props {
    buildingId: string
    status: EvaluationStatus
}

export function EvaluationForm({ buildingId, status }: Props) {
    const { addToast } = useToast()

    const [ratings, setRatings] = useState<Record<CategoryKey, number>>({
        securityRating: status.userEvaluation?.securityRating || 0,
        cleaningRating: status.userEvaluation?.cleaningRating || 0,
        maintenanceRating: status.userEvaluation?.maintenanceRating || 0,
        communicationRating: status.userEvaluation?.communicationRating || 0,
        generalRating: status.userEvaluation?.generalRating || 0,
    })
    const [comments, setComments] = useState(status.userEvaluation?.comments || "")
    const [isLoading, setIsLoading] = useState(false)
    const [hasSubmitted, setHasSubmitted] = useState(status.hasSubmitted)

    const setRating = (key: CategoryKey, value: number) => {
        setRatings(prev => ({ ...prev, [key]: value }))
    }

    const allRated = Object.values(ratings).every(r => r > 0)

    const handleSubmit = async () => {
        if (!allRated) {
            addToast({
                title: "Erro",
                description: "Avalie todas as categorias",
                variant: "error"
            })
            return
        }

        setIsLoading(true)

        const result = await submitEvaluation({
            buildingId,
            securityRating: ratings.securityRating,
            cleaningRating: ratings.cleaningRating,
            maintenanceRating: ratings.maintenanceRating,
            communicationRating: ratings.communicationRating,
            generalRating: ratings.generalRating,
            comments: comments.trim() || undefined,
        })

        if (result.success) {
            setHasSubmitted(true)
            addToast({
                title: "Sucesso",
                description: status.hasSubmitted
                    ? "Avaliação atualizada"
                    : "Avaliação submetida",
                variant: "success"
            })
        } else {
            addToast({ title: "Erro", description: result.error, variant: "error" })
        }

        setIsLoading(false)
    }

    // Show submitted state
    if (hasSubmitted && !status.userEvaluation) {
        return (
            <Card>
                <CardContent className="py-6 text-center">
                    <CheckCircle className="h-10 w-10 text-success mx-auto mb-1.5" />
                    <p className="text-base font-medium text-gray-700">Avaliação Submetida</p>
                    <p className="text-label text-gray-500">Obrigado pelo seu feedback deste mês!</p>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Avaliação de {MONTH_NAMES[status.month - 1]} {status.year}</CardTitle>
                <CardDescription>Avalie a gestão do condomínio este mês</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-1.5">
                    {/* Rating Categories */}
                    {CATEGORIES.map(({ key, label }) => (
                        <div key={key} className="flex items-center justify-between py-1">
                            <span className="text-body text-gray-700">{label}</span>
                            <StarRating
                                value={ratings[key]}
                                onChange={(value) => setRating(key, value)}
                            />
                        </div>
                    ))}

                    <Divider className="my-1.5" />

                    {/* Comments */}
                    <FormField>
                        <FormLabel>Comentário (opcional)</FormLabel>
                        <FormControl>
                            {(props) => (
                                <Textarea
                                    {...props}
                                    value={comments}
                                    onChange={(e) => setComments(e.target.value)}
                                    placeholder="Partilhe a sua opinião ou sugestões..."
                                    rows={2}
                                />
                            )}
                        </FormControl>
                        <FormError />
                    </FormField>
                </div>
            </CardContent>
            <CardFooter>
                <Button
                    className="w-full"
                    onClick={handleSubmit}
                    loading={isLoading}
                    disabled={!allRated}
                >
                    <CheckCircle className="h-3 w-3 mr-1" />
                    {status.hasSubmitted ? "Atualizar Avaliação" : "Submeter Avaliação"}
                </Button>
            </CardFooter>
        </Card>
    )
}