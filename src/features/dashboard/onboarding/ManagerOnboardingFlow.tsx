"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Check, ChevronRight } from "lucide-react"
import { Card, CardContent } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { OnboardingStepPersonal, type PersonalData } from "@/features/dashboard/onboarding/components/OnboardingStepPersonal"
import { OnboardingStepBuilding } from "@/features/dashboard/onboarding/components/OnboardingStepBuilding"
import { OnboardingStepUnits, type Apartment } from "@/features/dashboard/onboarding/components/OnboardingStepUnits"
import { completeOnboarding } from "@/app/actions/onboarding"

// We alias the imported types to match what we need or just use them directly
type ApartmentData = Apartment

type UserData = {
    id: string
    name: string
    email: string
    nif: string | null
    iban: string | null
}

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

type SimpleApartment = {
    id: number
    unit: string
    permillage: number
}

interface ManagerOnboardingFlowProps {
    user: UserData
    building: BuildingData | null
    apartments: SimpleApartment[]
    initialStep?: string
}

export function ManagerOnboardingFlow({ user, building, apartments, initialStep }: ManagerOnboardingFlowProps) {
    const router = useRouter()

    // Map string step to number
    const getStepNumber = (step?: string) => {
        switch (step) {
            case 'personal': return 1
            case 'building': return 2
            case 'units': return 3
            default: return 1
        }
    }

    const [currentStep, setCurrentStep] = useState(getStepNumber(initialStep))
    const [isLoading, setIsLoading] = useState(false)

    const totalPermillage = apartments.reduce((sum, apt) => sum + apt.permillage, 0)
    const isPermillageValid = Math.abs(totalPermillage - 1000) < 0.01

    const steps = [
        {
            number: 1,
            title: "Identidade Pessoal",
            isComplete: Boolean(user.name && user.nif)
        },
        {
            number: 2,
            title: "Estrutura do Edifício",
            isComplete: Boolean(building?.name && building?.nif && building?.street)
        },
        {
            number: 3,
            title: "Registo de Frações",
            isComplete: apartments.length > 0 && isPermillageValid
        }
    ]

    const canFinalize = steps.every(s => s.isComplete)

    const handleFinalize = async () => {
        if (!canFinalize) return

        setIsLoading(true)
        try {
            const result = await completeOnboarding(user.id)
            if (result.success) {
                // The action revalidates, we just push/refresh
                router.push("/dashboard")
                router.refresh()
            }
        } catch (error) {
            console.error("Failed to complete onboarding", error)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-slate-50 py-8 px-4">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="text-[10px] font-mono text-slate-400 uppercase tracking-widest mb-2">
                        INICIALIZAÇÃO DO SISTEMA
                    </div>
                    <h1 className="text-2xl font-bold text-slate-800 uppercase tracking-wide">
                        Configuração do Condomínio
                    </h1>
                    <p className="text-sm text-slate-500 mt-2 max-w-md mx-auto">
                        Vamos configurar o seu condomínio em 3 passos simples. Pode alterar estas definições mais tarde.
                    </p>
                </div>

                {/* Progress Steps */}
                <div className="flex items-center justify-center gap-2 mb-8">
                    {steps.map((step, idx) => (
                        <div key={step.number} className="flex items-center">
                            <button
                                onClick={() => setCurrentStep(step.number)}
                                className={`flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase transition-colors ${currentStep === step.number
                                    ? "bg-blue-600 text-white"
                                    : step.isComplete
                                        ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                                        : "bg-white text-slate-500 border border-slate-200"
                                    }`}
                            >
                                {step.isComplete ? (
                                    <Check className="w-3.5 h-3.5" />
                                ) : (
                                    <span className="w-4 h-4 flex items-center justify-center text-[10px] font-bold border border-current rounded-full">
                                        {step.number}
                                    </span>
                                )}
                                <span className="hidden sm:inline">{step.title}</span>
                            </button>
                            {idx < steps.length - 1 && (
                                <ChevronRight className="w-4 h-4 text-slate-300 mx-1" />
                            )}
                        </div>
                    ))}
                </div>

                {/* Step Content */}
                <Card className="mb-6">
                    <CardContent className="p-6">
                        {currentStep === 1 && (
                            <OnboardingStepPersonal
                                user={user}
                                onComplete={() => setCurrentStep(2)}
                            />
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
                    </CardContent>
                </Card>

                {/* Finalize Button */}
                <div className="flex justify-center">
                    <Button
                        size="lg"
                        disabled={!canFinalize || isLoading}
                        onClick={handleFinalize}
                    >
                        {isLoading ? "A CARREGAR..." : "FINALIZAR E ENTRAR"}
                    </Button>
                </div>

                {/* Status Summary */}
                <div className="mt-8 text-center">
                    <div className="inline-flex items-center gap-4 text-[10px] text-slate-400 uppercase">
                        <span>
                            {apartments.length} FRAÇÕES CONFIGURADAS
                        </span>
                        <span>•</span>
                        <span>
                            {steps.filter(s => s.isComplete).length}/{steps.length} CONCLUÍDO
                        </span>
                    </div>
                </div>
            </div>
        </div>
    )
}