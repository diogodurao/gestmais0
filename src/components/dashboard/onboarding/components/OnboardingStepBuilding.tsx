"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/Button"
import { Check } from "lucide-react"
import { updateBuilding } from "@/components/dashboard/settings/actions"
import { isValidNif, isValidIban } from "@/lib/validations"

type BuildingData = {
    id: string
    name: string
    nif: string
    iban: string | null
    street: string | null
    number: string | null
    city: string | null
    quotaMode: string | null
    monthlyQuota: number | null
    totalApartments: number | null
}

interface OnboardingStepBuildingProps {
    building: BuildingData
    onComplete: () => void
}

export function OnboardingStepBuilding({ building, onComplete }: OnboardingStepBuildingProps) {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState("")

    const [formData, setFormData] = useState({
        street: building.street || "",
        number: building.number || "",
        city: building.city || "",
        nif: (building.nif === "N/A" || !building.nif) ? "" : building.nif,
        iban: (building.iban === "N/A" || !building.iban) ? "" : building.iban,
        totalApartments: building.totalApartments?.toString() || "",
        quotaMode: building.quotaMode || "global",
        monthlyQuota: building.monthlyQuota ? (building.monthlyQuota / 100).toString() : ""
    })

    const handleChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }))
        if (error) setError("")
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")

        if (!formData.street.trim() || !formData.number.trim() || !formData.city.trim() || !formData.nif.trim() || !formData.iban.trim()) {
            setError("Todos os campos são obrigatórios")
            return
        }

        if (!isValidNif(formData.nif)) {
            setError("NIF inválido (deve ter 9 dígitos)")
            return
        }

        if (formData.iban && !isValidIban(formData.iban)) {
            setError("O IBAN deve começar com PT50 e ter 21 dígitos")
            return
        }

        setIsLoading(true)

        try {
            const result = await updateBuilding(building.id, {
                name: `${formData.street} ${formData.number}`.trim(),
                nif: formData.nif,
                iban: formData.iban || null,
                street: formData.street || null,
                number: formData.number || null,
                city: formData.city || null,
                quotaMode: formData.quotaMode,
                monthlyQuota: formData.monthlyQuota
                    ? Math.round(parseFloat(formData.monthlyQuota) * 100)
                    : 0,
                totalApartments: parseInt(formData.totalApartments) || 0
            })

            if (result.success) {
                router.refresh()
                onComplete()
            } else {
                setError(result.error || "Ocorreu um erro inesperado")
            }
        } catch (err) {
            setError("Ocorreu um erro inesperado")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">
                        Rua / Avenida *
                    </label>
                    <input
                        type="text"
                        value={formData.street}
                        onChange={(e) => handleChange("street", e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-200 focus:outline-none focus:border-gray-400"
                    />
                </div>

                <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">
                        Nº *
                    </label>
                    <input
                        type="text"
                        value={formData.number}
                        onChange={(e) => handleChange("number", e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-200 focus:outline-none focus:border-gray-400"
                    />
                </div>

                <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">
                        CIDADE *
                    </label>
                    <input
                        type="text"
                        value={formData.city}
                        onChange={(e) => handleChange("city", e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-200 focus:outline-none focus:border-gray-400"
                    />
                </div>

                <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">
                        NIF do Edifício *
                    </label>
                    <div className="relative">
                        <input
                            type="text"
                            value={formData.nif}
                            onChange={(e) => handleChange("nif", e.target.value)}
                            className="w-full px-3 py-2 text-sm font-mono border border-gray-200 focus:outline-none focus:border-gray-400"
                            maxLength={9}
                        />
                        {isValidNif(formData.nif) && (
                            <Check className="absolute right-2 top-2.5 w-4 h-4 text-emerald-500" />
                        )}
                    </div>
                </div>

                <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">
                        IBAN do Edifício *
                    </label>
                    <div className="relative">
                        <input
                            type="text"
                            value={formData.iban}
                            onChange={(e) => handleChange("iban", e.target.value.toUpperCase())}
                            className="w-full px-3 py-2 text-sm font-mono border border-gray-200 focus:outline-none focus:border-gray-400 uppercase"
                        />
                        {isValidIban(formData.iban) && (
                            <Check className="absolute right-2 top-2.5 w-4 h-4 text-emerald-500" />
                        )}
                    </div>
                </div>
            </div>

            <div className="border-t border-gray-200 pt-4">
                <h3 className="text-[10px] font-bold text-gray-400 uppercase mb-4">
                    Configuração de Quotas
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">
                            Total de Frações *
                        </label>
                        <input
                            type="number"
                            min="1"
                            value={formData.totalApartments}
                            onChange={(e) => handleChange("totalApartments", e.target.value)}
                            className="w-full px-3 py-2 text-sm font-mono border border-gray-200 focus:outline-none focus:border-gray-400"
                        />
                    </div>

                    <div>
                        <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">
                            Modo de Cálculo
                        </label>
                        <div className="flex gap-2">
                            <label className="flex items-center gap-1 cursor-pointer">
                                <input
                                    type="radio"
                                    name="quotaMode"
                                    checked={formData.quotaMode === "global"}
                                    onChange={() => handleChange("quotaMode", "global")}
                                    className="w-3 h-3"
                                />
                                <span className="text-xs">Valor Fixo Global</span>
                            </label>
                            <label className="flex items-center gap-1 cursor-pointer">
                                <input
                                    type="radio"
                                    name="quotaMode"
                                    checked={formData.quotaMode === "permillage"}
                                    onChange={() => handleChange("quotaMode", "permillage")}
                                    className="w-3 h-3"
                                />
                                <span className="text-xs">Baseado em Permilagem</span>
                            </label>
                        </div>
                    </div>

                    <div>
                        <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">
                            Valor Base (€) *
                        </label>
                        <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={formData.monthlyQuota}
                            onChange={(e) => handleChange("monthlyQuota", e.target.value)}
                            className="w-full px-3 py-2 text-sm font-mono border border-gray-200 focus:outline-none focus:border-gray-400"
                            placeholder="0.00"
                        />
                    </div>
                </div>
            </div>

            {error && (
                <p className="text-xs text-error font-bold">{error}</p>
            )}

            <div className="flex justify-end">
                <Button
                    type="submit"
                    disabled={
                        isLoading ||
                        !formData.street.trim() ||
                        !formData.number.trim() ||
                        !formData.city.trim() ||
                        !formData.nif.trim() ||
                        !isValidNif(formData.nif) ||
                        !formData.iban.trim() ||
                        !isValidIban(formData.iban) ||
                        !formData.totalApartments ||
                        !formData.monthlyQuota
                    }
                >
                    {isLoading ? "A guardar..." : "GUARDAR E CONTINUAR"}
                </Button>
            </div>
        </form>
    )
}