"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/Button"
import { Check } from "lucide-react"
import { updateUserProfile } from "@/lib/actions/user"
import { isValidNif, isValidIban } from "@/lib/validations"
import type { OnboardingUserData } from "@/lib/types"

interface OnboardingStepPersonalProps {
  user: OnboardingUserData
  onComplete: () => void
}

export function OnboardingStepPersonal({ user, onComplete }: OnboardingStepPersonalProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const [formData, setFormData] = useState({
    name: user.name,
    nif: user.nif || "",
    iban: user.iban || "",
  })

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
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
    } catch {
      setError("Ocorreu um erro inesperado")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label className="block text-label font-semibold text-gray-500 uppercase mb-1">
            Nome Completo *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => handleChange("name", e.target.value)}
            className="w-full px-3 py-2 text-body border border-gray-200 rounded-md focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          />
        </div>

        <div>
          <label className="block text-label font-semibold text-gray-500 uppercase mb-1">
            NIF Pessoal *
          </label>
          <div className="relative">
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={formData.nif}
              onChange={(e) => handleChange("nif", e.target.value.replace(/\D/g, ""))}
              className="w-full px-3 py-2 text-body font-mono border border-gray-200 rounded-md focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              maxLength={9}
            />
            {isValidNif(formData.nif) && (
              <Check className="absolute right-2 top-2.5 w-4 h-4 text-success" />
            )}
          </div>
        </div>

        <div>
          <label className="block text-label font-semibold text-gray-500 uppercase mb-1">
            IBAN Pessoal *
          </label>
          <div className="relative">
            <input
              type="text"
              value={formData.iban}
              onChange={(e) =>
                handleChange("iban", e.target.value.replace(/\s+/g, "").toUpperCase())
              }
              className="w-full px-3 py-2 text-body font-mono border border-gray-200 rounded-md focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary uppercase"
              maxLength={25}
            />
            {isValidIban(formData.iban) && (
              <Check className="absolute right-2 top-2.5 w-4 h-4 text-success" />
            )}
          </div>
        </div>
      </div>

      {error && <p className="text-label text-error font-semibold">{error}</p>}

      <div className="flex justify-end">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "A guardar..." : "GUARDAR E CONTINUAR"}
        </Button>
      </div>
    </form>
  )
}