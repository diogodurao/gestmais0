"use client"

import { useState } from "react"
import { Check } from "lucide-react"
import { claimApartment } from "@/app/actions/building"

export type Apartment = {
    id: number
    unit: string
    permillage: number
}

interface OnboardingStepManagerUnitProps {
    apartments: Apartment[]
    currentManagerUnitId?: number | null
    onClaimSuccess: (unitId: number) => void
}

export function OnboardingStepManagerUnit({
    apartments,
    currentManagerUnitId,
    onClaimSuccess
}: OnboardingStepManagerUnitProps) {
    const [selectedUnitId, setSelectedUnitId] = useState<number | null>(currentManagerUnitId || null)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState("")

    const handleClaim = async (unitId: number) => {
        setIsLoading(true)
        setError("")

        try {
            const result = await claimApartment(unitId)
            if (result.success) {
                setSelectedUnitId(unitId)
                onClaimSuccess(unitId)
            } else {
                setError(result.error || "Erro ao associar fração")
            }
        } catch (err) {
            setError("Ocorreu um erro inesperado")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="space-y-6">
            <div className="bg-info-light border border-gray-200 p-4">
                <h3 className="text-xs font-bold text-info uppercase mb-1">
                    SELECIONE A SUA FRAÇÃO
                </h3>
                <p className="text-xs text-info">
                    Como gestor, também deve identificar qual é a sua fração no condomínio. Esta ação irá associá-lo como proprietário.
                </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-96 overflow-y-auto p-1">
                {apartments.map((apt) => {
                    const isSelected = selectedUnitId === apt.id
                    return (
                        <button
                            key={apt.id}
                            disabled={isLoading}
                            onClick={() => handleClaim(apt.id)}
                            className={`
                                relative p-4 text-left border rounded-lg transition-all
                                ${isSelected
                                    ? "bg-info border-info text-white shadow-md ring-2 ring-blue-200"
                                    : "bg-white border-gray-200 text-gray-600 hover:border-gray-400 hover:shadow-sm"
                                }
                            `}
                        >
                            <div className="flex justify-between items-start">
                                <div>
                                    <div className={`text-sm font-bold font-mono ${isSelected ? "text-white" : "text-gray-800"}`}>
                                        {apt.unit}
                                    </div>
                                    <div className={`text-xs ${isSelected ? "text-white" : "text-gray-400"}`}>
                                        {apt.permillage} %
                                    </div>
                                </div>
                                {isSelected && <Check className="w-4 h-4 text-white" />}
                            </div>
                        </button>
                    )
                })}
            </div>

            {error && (
                <p className="text-xs text-error font-bold text-center">{error}</p>
            )}

            {apartments.length === 0 && (
                <div className="text-center p-8 border-2 border-dashed border-gray-200 rounded-lg">
                    <p className="text-gray-400 text-sm">Não existem frações criadas.</p>
                </div>
            )}
        </div>
    )
}
