"use client"

import { useState } from "react"
import { Button } from "@/components/ui/Button"
import { Textarea } from "@/components/ui/Textarea"
import { FormField, FormLabel, FormControl, FormError } from "@/components/ui/Form-Field"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card"
import { StarRating } from "./StarRating"
import { submitEvaluation } from "./actions"
import { EvaluationStatus, EvaluationCategoryKey as CategoryKey } from "@/lib/types"
import { EVALUATION_CATEGORIES as CATEGORIES, EVALUATION_MONTH_NAMES as MONTH_NAMES } from "@/lib/constants"
import { useToast } from "@/components/ui/Toast"

interface Props {
    buildingId: string
    status: EvaluationStatus
}

export function EvaluationForm({ buildingId, status }: Props) {
    const { toast } = useToast()

    const [ratings, setRatings] = useState<Record<CategoryKey, number>>({
        securityRating: status.userEvaluation?.securityRating || 0,
        cleaningRating: status.userEvaluation?.cleaningRating || 0,
        maintenanceRating: status.userEvaluation?.maintenanceRating || 0,
        communicationRating: status.userEvaluation?.communicationRating || 0,
        generalRating: status.userEvaluation?.generalRating || 0,
    })
    const [comments, setComments] = useState(status.userEvaluation?.comments || "")
    const [isLoading, setIsLoading] = useState(false)

    const setRating = (key: CategoryKey, value: number) => {
        setRatings(prev => ({ ...prev, [key]: value }))
    }

    const allRated = Object.values(ratings).every(r => r > 0)

    const handleSubmit = async () => {
        if (!allRated) {
            toast({
                title: "Erro",
                description: "Avalie todas as categorias",
                variant: "destructive"
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
            toast({
                title: "Sucesso",
                description: status.hasSubmitted
                    ? "Avaliação atualizada"
                    : "Avaliação submetida"
            })
        } else {
            toast({ title: "Erro", description: result.error, variant: "destructive" })
        }

        setIsLoading(false)
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>
                    Avaliação de {MONTH_NAMES[status.month - 1]} {status.year}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-6">
                    {/* Rating Categories */}
                    <div className="space-y-4">
                        {CATEGORIES.map(({ key, label }) => (
                            <div key={key} className="flex items-center justify-between">
                                <span className="text-body font-medium text-gray-700">
                                    {label}
                                </span>
                                <StarRating
                                    value={ratings[key]}
                                    onChange={(value) => setRating(key, value)}
                                    size="lg"
                                />
                            </div>
                        ))}
                    </div>

                    {/* Comments */}
                    <FormField>
                        <FormLabel>Comentários ou sugestões (opcional)</FormLabel>
                        <FormControl>
                            {(props) => (
                                <Textarea
                                    {...props}
                                    value={comments}
                                    onChange={(e) => setComments(e.target.value)}
                                    placeholder="Partilhe a sua opinião ou sugestões de melhoria..."
                                    rows={4}
                                />
                            )}
                        </FormControl>
                        <FormError />
                    </FormField>

                    {/* Submit */}
                    <div className="flex items-center justify-between pt-2">
                        <p className="text-label text-gray-500">
                            {status.daysRemaining === 0
                                ? "Último dia para submeter"
                                : `Faltam ${status.daysRemaining} dias`}
                        </p>
                        <Button
                            onClick={handleSubmit}
                            isLoading={isLoading}
                            disabled={!allRated}
                        >
                            {status.hasSubmitted ? "Atualizar Avaliação" : "Submeter Avaliação"}
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}