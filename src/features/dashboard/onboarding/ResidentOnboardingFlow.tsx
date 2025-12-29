"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Check, ChevronRight, Building2, Home, CreditCard } from "lucide-react"
import { Card, CardContent } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { joinBuilding, selectApartment, completeResidentOnboarding } from "@/app/actions/onboarding"

type UserData = {
    id: string
    name: string
    email: string
    nif: string | null
    iban: string | null
    buildingId?: string | null
}

type BuildingInfo = {
    id: string
    name: string
} | null

type Apartment = {
    id: number
    unit: string
}

interface ResidentOnboardingFlowProps {
    user: UserData
    initialStep?: string
    unclaimedApartments?: Apartment[]
    // Optional props to maintain compatibility if needed or strictly follow page.tsx
    building?: BuildingInfo
    selectedApartment?: Apartment | null
}

export function ResidentOnboardingFlow({
    user,
    initialStep,
    unclaimedApartments = [],
    building = null,
    selectedApartment = null
}: ResidentOnboardingFlowProps) {
    const router = useRouter()

    const getStepNumber = (step?: string) => {
        switch (step) {
            case 'join': return 1
            case 'claim': return 2
            case 'iban': return 3
            default: return 1
        }
    }

    const [currentStep, setCurrentStep] = useState(getStepNumber(initialStep) || (user.buildingId ? 2 : 1))
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState("")

    // Step 1: Join Building
    const [inviteCode, setInviteCode] = useState("")

    // Step 2: Select Apartment
    const [selectedAptId, setSelectedAptId] = useState<number | null>(selectedApartment?.id || null)

    // Step 3: Financial Setup
    const [iban, setIban] = useState(user.iban || "")

    const steps = [
        {
            number: 1,
            title: "Entrada no Sistema",
            icon: Building2,
            isComplete: Boolean(building)
        },
        {
            number: 2,
            title: "Alocação de Fração",
            icon: Home,
            isComplete: Boolean(selectedApartment)
        },
        {
            number: 3,
            title: "Configuração Financeira",
            icon: CreditCard,
            isComplete: Boolean(user.iban)
        }
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
        } catch (err) {
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
        } catch (err) {
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

    return (
        <div className="min-h-screen bg-slate-50 py-8 px-4">
            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="text-[10px] font-mono text-slate-400 uppercase tracking-widest mb-2">
                        NOVO PORTAL DE RESIDENTE
                    </div>
                    <h1 className="text-2xl font-bold text-slate-800 uppercase tracking-wide">
                        Bem-vindo a Bordo
                    </h1>
                    <p className="text-sm text-slate-500 mt-2">
                        Vamos ligá-lo ao seu condomínio em segundos.
                    </p>
                </div>

                {/* Progress Steps */}
                <div className="flex items-center justify-center gap-2 mb-8">
                    {steps.map((step, idx) => {
                        const Icon = step.icon
                        return (
                            <div key={step.number} className="flex items-center">
                                <div
                                    className={`flex items-center gap-2 px-3 py-2 text-[10px] font-bold uppercase ${currentStep === step.number
                                        ? "bg-blue-600 text-white"
                                        : step.isComplete
                                            ? "bg-emerald-100 text-emerald-700"
                                            : "bg-slate-100 text-slate-400"
                                        }`}
                                >
                                    {step.isComplete ? (
                                        <Check className="w-4 h-4" />
                                    ) : (
                                        <Icon className="w-4 h-4" />
                                    )}
                                    <span className="hidden sm:inline">{step.title}</span>
                                </div>
                                {idx < steps.length - 1 && (
                                    <ChevronRight className="w-4 h-4 text-slate-300 mx-1" />
                                )}
                            </div>
                        )
                    })}
                </div>

                {/* Step Content */}
                <Card className="mb-6">
                    <CardContent className="p-6">
                        {/* Step 1: Join Building */}
                        {currentStep === 1 && (
                            <div className="space-y-6">
                                <div className="text-center">
                                    <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                                    <h2 className="text-sm font-bold text-slate-700 uppercase mb-2">
                                        Insira o Código de Convite
                                    </h2>
                                </div>

                                <div>
                                    <input
                                        type="text"
                                        value={inviteCode}
                                        onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                                        placeholder="XXXXXX"
                                        className="w-full text-center text-2xl font-mono font-bold tracking-[0.5em] px-4 py-4 border-2 border-slate-200 focus:outline-none focus:border-blue-400 uppercase"
                                        maxLength={6}
                                    />
                                </div>

                                {error && (
                                    <p className="text-center text-xs text-rose-600 font-bold">{error}</p>
                                )}

                                <Button
                                    fullWidth
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
                                    <Home className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                                    <h2 className="text-sm font-bold text-slate-700 uppercase mb-2">
                                        Selecione a sua Unidade
                                    </h2>
                                    {building && (
                                        <p className="text-xs text-slate-400">{building.name}</p>
                                    )}
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
                                    fullWidth
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
                                    <CreditCard className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                                    <h2 className="text-sm font-bold text-slate-700 uppercase mb-2">
                                        Configuração do IBAN
                                    </h2>
                                    <p className="text-xs text-slate-400 max-w-sm mx-auto">
                                        Adicione o seu IBAN para automatizar a informação relativa aos pagamentos.
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                                        Número IBAN
                                    </label>
                                    <input
                                        type="text"
                                        value={iban}
                                        onChange={(e) => setIban(e.target.value.toUpperCase())}
                                        placeholder="PT50 1234 4321 5678 9012 3456 7"
                                        className="w-full px-4 py-3 text-sm font-mono border border-slate-200 focus:outline-none focus:border-blue-400 uppercase"
                                    />
                                </div>

                                {selectedApartment && (
                                    <div className="bg-emerald-50 border border-emerald-200 p-3 flex items-center gap-2">
                                        <Check className="w-4 h-4 text-emerald-600" />
                                        <span className="text-xs font-bold text-emerald-700 uppercase">
                                            VERIFICADO: {selectedApartment.unit}
                                        </span>
                                    </div>
                                )}

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
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}