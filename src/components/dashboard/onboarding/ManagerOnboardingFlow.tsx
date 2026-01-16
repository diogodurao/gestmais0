"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { User, Building2, LayoutGrid, Home } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { OnboardingStepper, OnboardingStatus } from "./OnboardingStepper"
import { OnboardingStepPersonal } from "./components/OnboardingStepPersonal"
import { OnboardingStepBuilding } from "./components/OnboardingStepBuilding"
import { OnboardingStepUnits } from "./components/OnboardingStepUnits"
import { OnboardingStepManagerUnit } from "./components/OnboardingStepManagerUnit"
import { completeOnboarding } from "@/lib/actions/onboarding"
import { useDashboard } from "@/contexts/DashboardContext"
import type { OnboardingUserData, OnboardingBuildingData, OnboardingApartment } from "@/lib/types"

interface ManagerOnboardingFlowProps {
  user: OnboardingUserData
  building: OnboardingBuildingData | null
  apartments: OnboardingApartment[]
  initialStep?: string
  currentManagerUnitId?: number | null
}

export function ManagerOnboardingFlow({
  user,
  building,
  apartments,
  initialStep,
  currentManagerUnitId,
}: ManagerOnboardingFlowProps) {
  const router = useRouter()
  const { managerBuildings } = useDashboard()

  const getStepNumber = (step?: string) => {
    switch (step) {
      case "personal":
        return 1
      case "building":
        return 2
      case "units":
        return 3
      case "claim":
        return 4
      default:
        return 1
    }
  }

  const [currentStep, setCurrentStep] = useState(getStepNumber(initialStep))
  const [isLoading, setIsLoading] = useState(false)
  const [claimedUnitId, setClaimedUnitId] = useState<number | null>(
    currentManagerUnitId || null
  )

  const totalPermillage = apartments.reduce((sum, apt) => sum + apt.permillage, 0)
  const isPermillageValid = Math.abs(totalPermillage - 1000) < 0.01

  const steps = [
    {
      number: 1,
      title: "Identidade Pessoal",
      icon: User,
      isComplete: Boolean(user.name && user.nif),
    },
    {
      number: 2,
      title: "Estrutura do Edifício",
      icon: Building2,
      isComplete: Boolean(building?.name && building?.nif && building?.street),
    },
    {
      number: 3,
      title: "Registo de Frações",
      icon: LayoutGrid,
      isComplete: apartments.length > 0 && isPermillageValid,
    },
    {
      number: 4,
      title: "Reivindicar Fração",
      icon: Home,
      isComplete: Boolean(claimedUnitId),
    },
  ]

  const canFinalize = steps.every((s) => s.isComplete)

  const handleFinalize = async () => {
    if (!canFinalize) return

    setIsLoading(true)
    try {
      const result = await completeOnboarding(user.id)
      if (result.success) {
        router.push("/dashboard")
      }
    } catch (error) {
      console.error("Failed to complete onboarding", error)
    } finally {
      setIsLoading(false)
    }
  }

  const headerExtra = managerBuildings.length > 1 ? (
    <div className="mt-4">
      <button
        onClick={() => router.push("/dashboard")}
        className="text-label font-semibold text-info uppercase hover:underline"
      >
        ← Voltar para os outros edifícios
      </button>
    </div>
  ) : null

  const footer = (
    <>
      <div className="flex justify-center">
        {currentStep === 3 ? (
          <Button onClick={() => setCurrentStep(4)} disabled={!steps[2].isComplete}>
            CONTINUAR
          </Button>
        ) : currentStep === 4 ? (
          <Button disabled={!canFinalize || isLoading} onClick={handleFinalize}>
            {isLoading ? "A CARREGAR..." : "FINALIZAR E ENTRAR"}
          </Button>
        ) : null}
      </div>

      <OnboardingStatus
        items={[
          { label: "FRAÇÕES CONFIGURADAS", value: apartments.length },
          {
            label: "CONCLUÍDO",
            value: `${steps.filter((s) => s.isComplete).length}/${steps.length}`,
          },
        ]}
      />
    </>
  )

  return (
    <OnboardingStepper
      label="INICIALIZAÇÃO DO SISTEMA"
      title="Configuração do Condomínio"
      description="Vamos configurar o seu condomínio em 4 passos simples. Pode alterar estas definições mais tarde."
      steps={steps}
      currentStep={currentStep}
      onStepChange={setCurrentStep}
      headerExtra={headerExtra}
      footer={footer}
    >
      {currentStep === 1 && (
        <OnboardingStepPersonal user={user} onComplete={() => setCurrentStep(2)} />
      )}
      {currentStep === 2 && building && (
        <OnboardingStepBuilding
          building={building}
          onComplete={() => setCurrentStep(3)}
        />
      )}
      {currentStep === 3 && building && (
        <OnboardingStepUnits
          buildingId={building.id}
          apartments={apartments}
          totalApartments={building.totalApartments || 0}
        />
      )}
      {currentStep === 4 && (
        <OnboardingStepManagerUnit
          apartments={apartments}
          currentManagerUnitId={claimedUnitId}
          onClaimSuccess={(unitId) => setClaimedUnitId(unitId)}
        />
      )}
    </OnboardingStepper>
  )
}