"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { CreditCard, Check } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { completeResidentOnboarding } from "@/app/actions/onboarding"

export function FinancialStepClient({
    userId,
    initialIban,
    apartmentUnit
}: {
    userId: string
    initialIban: string
    apartmentUnit: string
}) {
    const router = useRouter()
    const [iban, setIban] = useState(initialIban || "")
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState("")

    const handleCompleteSetup = async () => {
        setIsLoading(true)
        setError("")

        try {
            const result = await completeResidentOnboarding(userId, iban || null)
            if (result.success) {
                router.refresh()
                router.push("/dashboard")
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
                <CreditCard className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <h2 className="text-sm font-bold text-slate-700 uppercase mb-2">
                    Configuração de Débito Direto
                </h2>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    Adicione o seu IBAN para facilitar o pagamento das quotas via débito direto (opcional).
                </p>
            </div>

            <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                    Número IBAN (opcional)
                </label>
                <input
                    type="text"
                    value={iban}
                    onChange={(e) => setIban(e.target.value.toUpperCase())}
                    placeholder="PT50 0000 0000 0000 0000 0000 0"
                    className="w-full px-4 py-3 text-sm font-mono border border-slate-200 focus:outline-none focus:border-blue-400 uppercase"
                />
            </div>

            <div className="bg-emerald-50 border border-emerald-200 p-3 flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600" />
                <span className="text-xs font-bold text-emerald-700 uppercase">
                    VERIFICADO: {apartmentUnit}
                </span>
            </div>

            {error && (
                <p className="text-center text-xs text-rose-600 font-bold">{error}</p>
            )}

            <Button
                fullWidth
                onClick={handleCompleteSetup}
                disabled={isLoading}
            >
                {isLoading ? "A CARREGAR..." : "CONCLUIR CONFIGURAÇÃO"}
            </Button>
        </div>
    )
}
