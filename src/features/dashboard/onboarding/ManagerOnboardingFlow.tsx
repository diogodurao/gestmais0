"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { AlertCircle } from "lucide-react"
import { updateBuilding, completeBuildingSetup } from "@/app/actions/building"
import { updateUserProfile } from "@/app/actions/user"
import { isValidIban, isValidNif, isUnitsComplete, isProfileComplete } from "@/lib/validations"
import { type InferSelectModel } from "drizzle-orm"
import { user, building, apartments } from "@/db/schema"
import { type Dictionary } from "@/types/i18n"

// Sub-components
import { OnboardingStepPersonal } from "./components/OnboardingStepPersonal"
import { OnboardingStepBuilding } from "./components/OnboardingStepBuilding"
import { OnboardingStepUnits } from "./components/OnboardingStepUnits"

type Step = 'personal' | 'building' | 'units' | 'complete'

type UserProfile = InferSelectModel<typeof user>
type Building = InferSelectModel<typeof building>
type Apartment = InferSelectModel<typeof apartments>

export type ApartmentWithResident = {
    apartment: Apartment
    resident: Pick<UserProfile, 'id' | 'name' | 'email'> | null
}

interface ManagerOnboardingFlowProps {
    user: Pick<UserProfile, 'id' | 'name' | 'email' | 'nif' | 'iban'>
    building: Pick<Building, 'id' | 'nif' | 'iban' | 'street' | 'number' | 'city' | 'totalApartments' | 'monthlyQuota'>
    apartments: ApartmentWithResident[]
    initialStep: Step
    dictionary: Dictionary
}

export function ManagerOnboardingFlow({ user, building: buildingInfo, apartments: apartmentsList, initialStep, dictionary }: ManagerOnboardingFlowProps) {
    const [step, setStep] = useState<Step>(initialStep)
    const [personalData, setPersonalData] = useState({
        name: user.name,
        nif: user.nif || "",
        iban: user.iban || ""
    })
    const [buildingData, setBuildingData] = useState({
        street: buildingInfo.street || "",
        number: buildingInfo.number || "",
        city: buildingInfo.city || "",
        nif: buildingInfo.nif !== "N/A" ? (buildingInfo.nif || "") : "",
        iban: buildingInfo.iban || "",
        totalApartments: buildingInfo.totalApartments?.toString() || "",
        monthlyQuota: buildingInfo.monthlyQuota ? (buildingInfo.monthlyQuota / 100).toString() : "",
        quotaMode: "global" // Default to global
    })
    const [error, setError] = useState("")
    const [isPending, startTransition] = useTransition()
    const router = useRouter()

    const handlePersonalSave = async (): Promise<void> => {
        setError("")
        if (!isValidNif(personalData.nif)) {
            setError("Invalid NIF (must be 9 digits)")
            return
        }
        const normalizedIban = personalData.iban.toUpperCase().replace(/\s/g, "")
        if (!isValidIban(normalizedIban)) {
            setError("Invalid IBAN format")
            return
        }

        startTransition(async (): Promise<void> => {
            try {
                const result = await updateUserProfile({
                    name: personalData.name,
                    nif: personalData.nif,
                    iban: normalizedIban
                })
                if (result.success) {
                    setStep('building')
                } else {
                    setError(result.error || "Failed to save personal information")
                }
            } catch (e) {
                const message = e instanceof Error ? e.message : "An unexpected error occurred"
                setError(message)
            }
        })
    }

    const handleBuildingSave = async (): Promise<void> => {
        setError("")
        if (!buildingData.street || !buildingData.number || !buildingData.city || !buildingData.nif || !buildingData.iban || !buildingData.totalApartments || !buildingData.monthlyQuota) {
            setError("All fields are required")
            return
        }

        if (!isValidNif(buildingData.nif)) {
            setError("Invalid Building NIF (9 digits)")
            return
        }

        const normalizedIban = buildingData.iban.toUpperCase().replace(/\s/g, "")
        if (!isValidIban(normalizedIban)) {
            setError("Invalid Building IBAN format")
            return
        }

        startTransition(async (): Promise<void> => {
            try {
                const result = await updateBuilding(buildingInfo.id, {
                    name: `${buildingData.street} ${buildingData.number}`, // Auto-generate name from street
                    street: buildingData.street,
                    number: buildingData.number,
                    city: buildingData.city,
                    nif: buildingData.nif,
                    iban: normalizedIban,
                    totalApartments: parseInt(buildingData.totalApartments),
                    monthlyQuota: Math.round(parseFloat(buildingData.monthlyQuota) * 100),
                    quotaMode: buildingData.quotaMode as "global" | "permillage",
                })
                if (result.success) {
                    setStep('units')
                    router.refresh()
                } else {
                    setError(result.error || "Failed to save building information")
                }
            } catch (e) {
                const message = e instanceof Error ? e.message : "An unexpected error occurred"
                setError(message)
            }
        })
    }

    const handleFinalize = () => {
        startTransition(async (): Promise<void> => {
            try {
                const result = await completeBuildingSetup(buildingInfo.id)
                if (result.success) {
                    setStep('complete')
                    router.refresh()
                } else {
                    setError(result.error || "Failed to finalize onboarding")
                }
            } catch (e) {
                const message = e instanceof Error ? e.message : "An unexpected error occurred"
                setError(message)
            }
        })
    }

    return (
        <div className="bg-grid min-h-screen flex flex-col items-center py-12 px-4">
            <div className="w-full max-w-4xl space-y-8">
                <div className="text-center space-y-2">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-white border border-slate-300 rounded-full text-xs font-mono text-slate-600 mb-2">
                        <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                        SYSTEM_INITIALIZATION
                    </div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Manager Setup Protocol</h1>
                    <p className="text-slate-500 max-w-lg mx-auto">Initialize your condominium ecosystem. Complete all required data points to activate your dashboard.</p>
                </div>

                <div className="space-y-4">
                    <OnboardingStepPersonal
                        isActive={step === 'personal'}
                        isComplete={isProfileComplete(personalData)}
                        isPending={isPending}
                        personalData={personalData}
                        setPersonalData={setPersonalData}
                        handleSave={handlePersonalSave}
                        onStepClick={() => step !== 'personal' && setStep('personal')}
                    />

                    <OnboardingStepBuilding
                        isActive={step === 'building'}
                        isComplete={step === 'units' || step === 'complete'}
                        isPending={isPending}
                        disabled={step === 'personal' && !isProfileComplete(personalData)}
                        buildingData={buildingData}
                        setBuildingData={setBuildingData}
                        handleSave={handleBuildingSave}
                        onStepClick={() => (step === 'units' || step === 'complete') && setStep('building')}
                    />

                    <OnboardingStepUnits
                        isActive={step === 'units'}
                        isComplete={step === 'complete'}
                        isPending={isPending}
                        disabled={step !== 'units' && step !== 'complete'}
                        buildingId={buildingInfo.id}
                        totalApartments={parseInt(buildingData.totalApartments)}
                        quotaMode={buildingData.quotaMode}
                        apartments={apartmentsList}
                        handleFinalize={handleFinalize}
                        onStepClick={() => step === 'complete' && setStep('units')}
                        dictionary={dictionary}
                    />

                    {error && (
                        <div className="p-4 bg-rose-50 border border-rose-200 flex items-center gap-3 animate-in fade-in slide-in-from-top-1 shadow-sm">
                            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                            <span className="text-xs font-bold text-rose-700 uppercase tracking-wide">{error}</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}