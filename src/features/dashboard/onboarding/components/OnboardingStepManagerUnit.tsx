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
            <div className="bg-blue-50 border border-blue-200 p-4">
                <h3 className="text-xs font-bold text-blue-700 uppercase mb-1">
                    SELECIONE A SUA FRAÇÃO
                </h3>
                <p className="text-xs text-blue-600">
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
                                    ? "bg-blue-600 border-blue-600 text-white shadow-md ring-2 ring-blue-200"
                                    : "bg-white border-slate-200 text-slate-600 hover:border-blue-400 hover:shadow-sm"
                                }
                            `}
                        >
                            <div className="flex justify-between items-start">
                                <div>
                                    <div className={`text-sm font-bold font-mono ${isSelected ? "text-white" : "text-slate-800"}`}>
                                        {apt.unit}
                                    </div>
                                    <div className={`text-xs ${isSelected ? "text-blue-100" : "text-slate-400"}`}>
                                        {apt.permillage} ‰
                                    </div>
                                </div>
                                {isSelected && <Check className="w-4 h-4 text-white" />}
                            </div>
                        </button>
                    )
                })}
            </div>

            {error && (
                <p className="text-xs text-rose-600 font-bold text-center">{error}</p>
            )}

            {apartments.length === 0 && (
                <div className="text-center p-8 border-2 border-dashed border-slate-200 rounded-lg">
                    <p className="text-slate-400 text-sm">Não existem frações criadas.</p>
                </div>
            )}
        </div>
    )
}
