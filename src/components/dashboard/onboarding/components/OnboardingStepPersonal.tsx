"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/Button"
import { Check } from "lucide-react"
import { updateUserProfile } from "@/lib/actions/user"
import { isValidNif, isValidIban } from "@/lib/validations"

export type UserData = {
    id: string
    name: string
    email: string
    nif: string | null
    iban: string | null
}

export type PersonalData = UserData

interface OnboardingStepPersonalProps {
    user: UserData
    onComplete: () => void
}

export function OnboardingStepPersonal({ user, onComplete }: OnboardingStepPersonalProps) {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState("")

    const [formData, setFormData] = useState({
        name: user.name,
        nif: user.nif || "",
        iban: user.iban || ""
    })

    const handleChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }))
        if (error) setError("")
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")

        if (!formData.name.trim()) {
            setError("Campo obrigatório")
            return
        }
        if (!formData.nif || !isValidNif(formData.nif)) {
            setError("NIF inválido (deve ter 9 dígitos)")
            return
        }

        if (!formData.iban || !isValidIban(formData.iban)) {
            setError("IBAN inválido (deve ter 25 caracteres alfanuméricos)")
            return
        }

        setIsLoading(true)

        try {
            const result = await updateUserProfile(formData)
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">
                        Nome Completo *
                    </label>
                    <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => handleChange("name", e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-200 focus:outline-none focus:border-gray-400"
                    />
                </div>

                <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">
                        NIF Pessoal *
                    </label>
                    <div className="relative">
                        <input
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            value={formData.nif}
                            onChange={(e) => handleChange("nif", e.target.value.replace(/\D/g, ''))}
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
                        IBAN Pessoal *
                    </label>
                    <div className="relative">
                        <input
                            type="text"
                            value={formData.iban}
                            onChange={(e) => handleChange("iban", e.target.value.replace(/\s+/g, '').toUpperCase())}
                            className="w-full px-3 py-2 text-sm font-mono border border-gray-200 focus:outline-none focus:border-gray-400 uppercase"
                            maxLength={25}
                        />
                        {isValidIban(formData.iban) && (
                            <Check className="absolute right-2 top-2.5 w-4 h-4 text-emerald-500" />
                        )}
                    </div>
                </div>
            </div>

            {error && (
                <p className="text-xs text-error font-bold">{error}</p>
            )}

            <div className="flex justify-end">
                <Button type="submit" disabled={isLoading}>
                    {isLoading ? "A guardar..." : "GUARDAR E CONTINUAR"}
                </Button>
            </div>
        </form>
    )
}