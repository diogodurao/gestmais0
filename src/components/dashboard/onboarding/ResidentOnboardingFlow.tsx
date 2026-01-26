"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Check, Building2, Home, CreditCard } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { OnboardingStepper } from "./OnboardingStepper"
import { joinBuilding, selectApartment, completeResidentOnboarding } from "@/lib/actions/onboarding"
import { isValidIban } from "@/lib/validations"
import type { OnboardingUserData, OnboardingApartmentSimple, OnboardingBuildingInfo } from "@/lib/types"

interface ResidentOnboardingFlowProps {
  user: OnboardingUserData
  initialStep?: string
  unclaimedApartments?: OnboardingApartmentSimple[]
  building?: OnboardingBuildingInfo | null
  selectedApartment?: OnboardingApartmentSimple | null
}

export function ResidentOnboardingFlow({
  user,
  initialStep,
  unclaimedApartments = [],
  building = null,
  selectedApartment = null,
}: ResidentOnboardingFlowProps) {
  const router = useRouter()

  const getStepNumber = (step?: string) => {
    switch (step) {
      case "join":
        return 1
      case "claim":
        return 2
      case "iban":
        return 3
      default:
        return 1
    }
  }

  const [currentStep, setCurrentStep] = useState(
    getStepNumber(initialStep) || (user.buildingId ? 2 : 1)
  )
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  // Step 1: Join Building
  const [inviteCode, setInviteCode] = useState("")

  // Step 2: Select Apartment
  const [selectedAptId, setSelectedAptId] = useState<number | null>(
    selectedApartment?.id || null
  )

  // Step 3: Financial Setup
  const [iban, setIban] = useState(user.iban || "")

  const steps = [
    {
      number: 1,
      title: "Entrada no Sistema",
      icon: Building2,
      isComplete: Boolean(building),
    },
    {
      number: 2,
      title: "Alocação de Fração",
      icon: Home,
      isComplete: Boolean(selectedApartment),
    },
    {
      number: 3,
      title: "Configuração Financeira",
      icon: CreditCard,
      isComplete: Boolean(user.iban),
    },
  ]

  const handleJoinBuilding = async () => {
    if (!inviteCode.trim()) {
      setError("Campo obrigatório")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      const result = await joinBuilding(inviteCode.toUpperCase())
      if (result.success) {
        router.refresh()
        setCurrentStep(2)
      } else {
        setError(result.error || "Ocorreu um erro inesperado")
      }
    } catch {
      setError("Ocorreu um erro inesperado")
    } finally {
      setIsLoading(false)
    }
  }

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
        setCurrentStep(3)
      } else {
        setError(result.error || "Ocorreu um erro inesperado")
      }
    } catch {
      setError("Ocorreu um erro inesperado")
    } finally {
      setIsLoading(false)
    }
  }

  const handleCompleteSetup = async () => {
    setIsLoading(true)
    setError("")

    try {
      const result = await completeResidentOnboarding(user.id, iban || null)
      if (result.success) {
        router.push("/dashboard")
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
    <OnboardingStepper
      label="NOVO PORTAL DE RESIDENTE"
      title="Bem-vindo a Bordo"
      description="Vamos ligá-lo ao seu condomínio em segundos."
      steps={steps}
      currentStep={currentStep}
      onStepChange={setCurrentStep}
    >
      {/* Step 1: Join Building */}
      {currentStep === 1 && (
        <div className="space-y-6">
          <div className="text-center">
            <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h2 className="text-subtitle font-semibold text-gray-700 uppercase mb-2">
              Insira o Código de Convite
            </h2>
          </div>

          <div>
            <input
              type="text"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
              placeholder="XXXXXX"
              className="w-full text-center text-heading font-mono font-semibold tracking-[0.5em] px-3 py-3 border border-gray-200 rounded-md focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary uppercase"
              maxLength={6}
            />
          </div>

          {error && (
            <p className="text-center text-label text-error font-semibold">
              {error}
            </p>
          )}

          <Button
            className="w-full"
            onClick={handleJoinBuilding}
            disabled={isLoading || !inviteCode.trim()}
          >
            {isLoading ? "A CARREGAR..." : "LIGAR AO EDIFÍCIO"}
          </Button>
        </div>
      )}

      {/* Step 2: Select Apartment */}
      {currentStep === 2 && (
        <div className="space-y-6">
          <div className="text-center">
            <Home className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h2 className="text-subtitle font-semibold text-gray-700 uppercase mb-2">
              Selecione a sua Unidade
            </h2>
            {building && (
              <p className="text-label text-gray-400">{building.name}</p>
            )}
          </div>

          <div>
            <select
              value={selectedAptId || ""}
              onChange={(e) => setSelectedAptId(Number(e.target.value) || null)}
              className="w-full px-3 py-2 text-body border border-gray-200 rounded-md focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary uppercase font-mono"
            >
              <option value="">SELECIONAR FRAÇÃO</option>
              {unclaimedApartments.map((apt) => (
                <option key={apt.id} value={apt.id}>
                  {apt.unit}
                </option>
              ))}
            </select>
          </div>

          {error && (
            <p className="text-center text-label text-error font-semibold">
              {error}
            </p>
          )}

          <Button
            className="w-full"
            onClick={handleSelectApartment}
            disabled={isLoading || !selectedAptId}
          >
            {isLoading ? "A CARREGAR..." : "CONFIRMAR ALOCAÇÃO"}
          </Button>
        </div>
      )}

      {/* Step 3: Financial Setup */}
      {currentStep === 3 && (
        <div className="space-y-6">
          <div className="text-center">
            <CreditCard className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h2 className="text-subtitle font-semibold text-gray-700 uppercase mb-2">
              Configuração do IBAN
            </h2>
            <p className="text-label text-gray-400 max-w-sm mx-auto">
              Adicione o seu IBAN para automatizar a informação relativa aos
              pagamentos.
            </p>
          </div>

          <div className="relative">
            <label className="block text-label font-semibold text-gray-500 uppercase mb-1">
              Número IBAN *
            </label>
            <input
              type="text"
              value={iban}
              onChange={(e) =>
                setIban(e.target.value.replace(/\s+/g, "").toUpperCase())
              }
              placeholder="PT50123443215678901234567"
              className="w-full px-3 py-2 text-body font-mono border border-gray-200 rounded-md focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary uppercase"
              maxLength={25}
            />
            {isValidIban(iban) && (
              <Check className="absolute right-2 top-7 w-4 h-4 text-success" />
            )}
          </div>

          {selectedApartment && (
            <div className="bg-success-light border border-success rounded-md p-3 flex items-center gap-2">
              <Check className="w-4 h-4 text-primary-dark" />
              <span className="text-label font-semibold text-primary-dark uppercase">
                VERIFICADO: {selectedApartment.unit}
              </span>
            </div>
          )}

          {error && (
            <p className="text-center text-label text-error font-semibold">
              {error}
            </p>
          )}

          <Button
            className="w-full"
            onClick={handleCompleteSetup}
            disabled={isLoading || !isValidIban(iban)}
          >
            {isLoading ? "A CARREGAR..." : "CONCLUIR CONFIGURAÇÃO"}
          </Button>
        </div>
      )}
    </OnboardingStepper>
  )
}