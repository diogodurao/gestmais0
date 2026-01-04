"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Plus, Trash2, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { createApartment, deleteApartment } from "@/app/actions/building"

export type Apartment = {
    id: number
    unit: string
    permillage: number
}

interface OnboardingStepUnitsProps {
    buildingId: string
    apartments: Apartment[]
    totalApartments: number
}

export function OnboardingStepUnits({ buildingId, apartments, totalApartments }: OnboardingStepUnitsProps) {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState("")

    const [newUnit, setNewUnit] = useState("")
    const [newPermillage, setNewPermillage] = useState("")

    const totalPermillage = apartments.reduce((sum, apt) => sum + apt.permillage, 0)
    const isAtLimit = totalApartments > 0 && apartments.length >= totalApartments

    const handleAddUnit = async () => {
        if (!newUnit.trim() || !newPermillage.trim()) {
            setError("Ambos os campos são obrigatórios")
            return
        }

        const permillageValue = parseFloat(newPermillage)
        if (isNaN(permillageValue) || permillageValue <= 0) {
            setError("A permilagem deve ser um número positivo")
            return
        }

        setIsLoading(true)
        setError("")

        try {
            const result = await createApartment(buildingId, {
                unit: newUnit.trim(),
                permillage: permillageValue
            })

            if (result.success) {
                setNewUnit("")
                setNewPermillage("")
                router.refresh()
            } else {
                setError(result.error || "Ocorreu um erro inesperado")
            }
        } catch (err) {
            setError("Ocorreu um erro inesperado")
        } finally {
            setIsLoading(false)
        }
    }

    const handleDeleteUnit = async (apartmentId: number) => {
        if (!confirm("Tem a certeza que deseja eliminar esta fração?")) return

        try {
            const result = await deleteApartment(apartmentId)
            if (result.success) {
                router.refresh()
            }
        } catch (err) {
            console.error("Failed to delete unit", err)
        }
    }

    return (
        <div className="space-y-6">
            {/* Instructions */}
            <div className="bg-blue-50 border border-blue-200 p-4">
                <h3 className="text-xs font-bold text-blue-700 uppercase mb-1">
                    INSTRUÇÕES DE REGISTO
                </h3>
                <p className="text-xs text-blue-600">
                    Ao adicionar frações, a permilagem total deve somar exatamente 1000. Pode adicionar mais frações posteriormente no painel de definições.
                </p>
            </div>

            {/* Unit List */}
            <div className="border border-slate-200">
                <div className="grid grid-cols-12 bg-slate-100 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase">
                    <div className="col-span-5 p-2">FRAÇÃO</div>
                    <div className="col-span-4 p-2">PERMILAGEM</div>
                    <div className="col-span-3 p-2"></div>
                </div>

                <div className="max-h-64 overflow-y-auto">
                    {apartments.map((apt) => (
                        <div
                            key={apt.id}
                            className="grid grid-cols-12 border-b border-slate-100 items-center hover:bg-slate-50"
                        >
                            <div className="col-span-5 p-2 text-sm font-mono font-bold uppercase">
                                {apt.unit}
                            </div>
                            <div className="col-span-4 p-2 text-sm font-mono">
                                {apt.permillage} %
                            </div>
                            <div className="col-span-3 p-2 text-right">
                                <button
                                    onClick={() => handleDeleteUnit(apt.id)}
                                    className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}

                    {apartments.length === 0 && (
                        <div className="p-4 text-center text-xs text-slate-400 italic">
                            Nenhuma fração definida
                        </div>
                    )}
                </div>

                {/* Add New Unit Row */}
                {!isAtLimit && (
                    <div className="grid grid-cols-12 border-t border-slate-200 items-center bg-slate-50">
                        <div className="col-span-5 p-2">
                            <input
                                type="text"
                                value={newUnit}
                                onChange={(e) => setNewUnit(e.target.value)}
                                placeholder="Ex: 1º Esq"
                                className="w-full px-2 py-1 text-sm border border-slate-200 focus:outline-none focus:border-blue-400"
                            />
                        </div>
                        <div className="col-span-4 p-2">
                            <input
                                type="number"
                                value={newPermillage}
                                onChange={(e) => setNewPermillage(e.target.value)}
                                placeholder="0"
                                className="w-full px-2 py-1 text-sm font-mono border border-slate-200 focus:outline-none focus:border-blue-400"
                            />
                        </div>
                        <div className="col-span-3 p-2">
                            <Button
                                size="xs"
                                onClick={handleAddUnit}
                                disabled={isLoading}
                            >
                                <Plus className="w-3 h-3 mr-1" />
                                ADICIONAR
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            {/* Limit Warning */}
            {isAtLimit && (
                <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 text-amber-700">
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase">Limite de frações atingido</span>
                </div>
            )}

            {error && (
                <p className="text-xs text-rose-600 font-bold">{error}</p>
            )}

            {/* Summary */}
            <div className="flex items-center justify-between text-xs text-slate-500">
                <span>
                    {apartments.length} FRAÇÕES
                </span>
                <span className={totalPermillage === 1000 ? "text-emerald-600 font-bold" : ""}>
                    {totalPermillage}/1000 %
                </span>
            </div>
        </div>
    )
}