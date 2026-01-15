"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Home } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { selectApartment } from "@/lib/actions/onboarding"

export function ClaimStepClient({
    buildingName,
    unclaimedApartments
}: {
    buildingName: string
    unclaimedApartments: any[]
}) {
    const router = useRouter()
    const [selectedAptId, setSelectedAptId] = useState<number | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState("")

    const handleSelectApartment = async () => {
        if (!selectedAptId) {
            setError("Campo obrigatório")
            return
        }

        setIsLoading(true)
        setError("")

        try {
            const result = await selectApartment(selectedAptId)
            if (result.success) {
                router.refresh()
                router.push("/onboarding/resident/financial")
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
        <div className="space-y-6">
            <div className="text-center">
                <Home className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <h2 className="text-sm font-bold text-slate-700 uppercase mb-2">
                    Selecione a sua Unidade
                </h2>
                <p className="text-xs text-slate-400">{buildingName}</p>
            </div>

            <div>
                <select
                    value={selectedAptId || ""}
                    onChange={(e) => setSelectedAptId(Number(e.target.value) || null)}
                    className="w-full px-4 py-3 text-sm border border-slate-200 focus:outline-none focus:border-blue-400 uppercase font-mono"
                >
                    <option value="">SELECIONAR FRAÇÃO</option>
                    {unclaimedApartments.map(apt => (
                        <option key={apt.id} value={apt.id}>
                            {apt.unit}
                        </option>
                    ))}
                </select>
            </div>

            {error && (
                <p className="text-center text-xs text-rose-600 font-bold">{error}</p>
            )}

            <Button
                className="w-full"
                onClick={handleSelectApartment}
                disabled={isLoading || !selectedAptId}
            >
                {isLoading ? "A CARREGAR..." : "CONFIRMAR ALOCAÇÃO"}
            </Button>
        </div>
    )
}
