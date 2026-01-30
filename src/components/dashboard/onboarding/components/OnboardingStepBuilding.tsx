"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/Button"
import { Check } from "lucide-react"
import { updateBuilding } from "@/lib/actions/building"
import { isValidNif, isValidIban } from "@/lib/validations"
import type { OnboardingBuildingData } from "@/lib/types"
import { ONBOARDING_INPUT_CLASS } from "@/lib/constants/ui"

interface OnboardingStepBuildingProps {
  building: OnboardingBuildingData
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
    nif: building.nif === "N/A" || !building.nif ? "" : building.nif,
    iban: building.iban === "N/A" || !building.iban ? "" : building.iban,
    totalApartments: building.totalApartments?.toString() || "",
    quotaMode: building.quotaMode || "global",
    monthlyQuota: building.monthlyQuota ? (building.monthlyQuota / 100).toString() : "",
    paymentDueDay: "",
  })

  // For permillage mode: whether user inputs annual or monthly value
  const [inputPeriod, setInputPeriod] = useState<"monthly" | "annual">("monthly")

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (error) setError("")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (
      !formData.street.trim() ||
      !formData.number.trim() ||
      !formData.city.trim() ||
      !formData.nif.trim() ||
      !formData.iban.trim()
    ) {
      setError("Todos os campos são obrigatórios")
      return
    }

    if (!isValidNif(formData.nif)) {
      setError("NIF inválido (deve ter 9 dígitos)")
      return
    }
    if (!formData.iban || !isValidIban(formData.iban)) {
      setError("IBAN inválido (deve ter 25 caracteres alfanuméricos)")
      return
    }

    const dueDay = parseInt(formData.paymentDueDay)
    if (!formData.paymentDueDay || isNaN(dueDay) || dueDay < 1 || dueDay > 28) {
      setError("Dia de vencimento inválido (deve ser entre 1 e 28)")
      return
    }

    setIsLoading(true)

    try {
      // Calculate monthly quota (convert from annual if needed for permillage mode)
      let monthlyQuotaInCents = 0
      if (formData.monthlyQuota) {
        const inputValue = parseFloat(formData.monthlyQuota)
        // If permillage mode and annual input, divide by 12
        const monthlyValue = formData.quotaMode === "permillage" && inputPeriod === "annual"
          ? inputValue / 12
          : inputValue
        monthlyQuotaInCents = Math.round(monthlyValue * 100)
      }

      const result = await updateBuilding(building.id, {
        name: `${formData.street} ${formData.number}`.trim(),
        nif: formData.nif,
        iban: formData.iban || null,
        street: formData.street || null,
        number: formData.number || null,
        city: formData.city || null,
        quotaMode: formData.quotaMode,
        monthlyQuota: monthlyQuotaInCents,
        totalApartments: parseInt(formData.totalApartments) || 0,
        paymentDueDay: dueDay,
      })

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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2">
          <label className="block text-label font-semibold text-gray-500 uppercase mb-1">
            Rua / Avenida *
          </label>
          <input
            type="text"
            value={formData.street}
            onChange={(e) => handleChange("street", e.target.value)}
            className={ONBOARDING_INPUT_CLASS}
          />
        </div>

        <div>
          <label className="block text-label font-semibold text-gray-500 uppercase mb-1">
            Nº *
          </label>
          <input
            type="text"
            value={formData.number}
            onChange={(e) => handleChange("number", e.target.value)}
            className={ONBOARDING_INPUT_CLASS}
          />
        </div>

        <div>
          <label className="block text-label font-semibold text-gray-500 uppercase mb-1">
            CIDADE *
          </label>
          <input
            type="text"
            value={formData.city}
            onChange={(e) => handleChange("city", e.target.value)}
            className={ONBOARDING_INPUT_CLASS}
          />
        </div>

        <div>
          <label className="block text-label font-semibold text-gray-500 uppercase mb-1">
            NIF do Edifício *
          </label>
          <div className="relative">
            <input
              type="text"
              value={formData.nif}
              onChange={(e) => handleChange("nif", e.target.value.replace(/\D/g, ""))}
              inputMode="numeric"
              className={`${ONBOARDING_INPUT_CLASS} font-mono`}
              maxLength={9}
            />
            {isValidNif(formData.nif) && (
              <Check className="absolute right-2 top-2.5 w-4 h-4 text-success" />
            )}
          </div>
        </div>

        <div>
          <label className="block text-label font-semibold text-gray-500 uppercase mb-1">
            IBAN do Edifício *
          </label>
          <div className="relative">
            <input
              type="text"
              value={formData.iban}
              onChange={(e) =>
                handleChange("iban", e.target.value.replace(/\s+/g, "").toUpperCase())
              }
              className={`${ONBOARDING_INPUT_CLASS} font-mono uppercase`}
              maxLength={25}
            />
            {isValidIban(formData.iban) && (
              <Check className="absolute right-2 top-2.5 w-4 h-4 text-success" />
            )}
          </div>
        </div>
      </div>

      <div className="border-t border-gray-200 pt-4">
        <h3 className="text-label font-semibold text-gray-400 uppercase mb-4">
          Configuração de Quotas
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-label font-semibold text-gray-500 uppercase mb-1">
              Total de Frações *
            </label>
            <input
              type="number"
              min="1"
              value={formData.totalApartments}
              onChange={(e) => handleChange("totalApartments", e.target.value)}
              className={`${ONBOARDING_INPUT_CLASS} font-mono`}
            />
          </div>

          <div>
            <label className="block text-label font-semibold text-gray-500 uppercase mb-1">
              Modo de Cálculo
            </label>
            <div className="flex gap-3 mt-2">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="quotaMode"
                  checked={formData.quotaMode === "global"}
                  onChange={() => handleChange("quotaMode", "global")}
                  className="w-3.5 h-3.5 accent-primary"
                />
                <span className="text-label">Valor Fixo Global</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="quotaMode"
                  checked={formData.quotaMode === "permillage"}
                  onChange={() => handleChange("quotaMode", "permillage")}
                  className="w-3.5 h-3.5 accent-primary"
                />
                <span className="text-label">Baseado em Permilagem</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-label font-semibold text-gray-500 uppercase mb-1">
              {formData.quotaMode === "permillage" ? "Receita Total Esperada (€)" : "Quota Mensal (€)"} *
            </label>
            {formData.quotaMode === "permillage" && (
              <div className="flex gap-2 mb-1.5">
                <label className="flex items-center gap-1 cursor-pointer">
                  <input
                    type="radio"
                    name="inputPeriod"
                    checked={inputPeriod === "monthly"}
                    onChange={() => setInputPeriod("monthly")}
                    className="w-3 h-3 accent-primary"
                  />
                  <span className="text-label">Mensal</span>
                </label>
                <label className="flex items-center gap-1 cursor-pointer">
                  <input
                    type="radio"
                    name="inputPeriod"
                    checked={inputPeriod === "annual"}
                    onChange={() => setInputPeriod("annual")}
                    className="w-3 h-3 accent-primary"
                  />
                  <span className="text-label">Anual</span>
                </label>
              </div>
            )}
            <input
              type="number"
              step="0.01"
              min="0"
              value={formData.monthlyQuota}
              onChange={(e) => handleChange("monthlyQuota", e.target.value)}
              className={`${ONBOARDING_INPUT_CLASS} font-mono`}
              placeholder="0.00"
            />
            {formData.quotaMode === "permillage" && (
              <p className="text-label text-gray-500 mt-1">
                Valor total {inputPeriod === "annual" ? "anual" : "mensal"} a dividir pelas frações conforme permilagem
              </p>
            )}
          </div>

          <div>
            <label className="block text-label font-semibold text-gray-500 uppercase mb-1">
              Dia de Vencimento *
            </label>
            <input
              type="number"
              min="1"
              max="28"
              value={formData.paymentDueDay}
              onChange={(e) => handleChange("paymentDueDay", e.target.value)}
              className={`${ONBOARDING_INPUT_CLASS} font-mono`}
              placeholder="Ex: 8"
            />
            <p className="text-label text-gray-500 mt-1">
              Dia do mês em que a quota passa a estar em atraso (1-28)
            </p>
          </div>
        </div>
      </div>

      {error && <p className="text-label text-error font-semibold">{error}</p>}

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
            !formData.monthlyQuota ||
            !formData.paymentDueDay ||
            parseInt(formData.paymentDueDay) < 1 ||
            parseInt(formData.paymentDueDay) > 28
          }
        >
          {isLoading ? "A guardar..." : "GUARDAR E CONTINUAR"}
        </Button>
      </div>
    </form>
  )
}