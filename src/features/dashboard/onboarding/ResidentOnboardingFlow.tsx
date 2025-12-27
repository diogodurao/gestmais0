"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Building2, Home, CreditCard, Check, AlertCircle, Loader2, ArrowRight, Terminal } from "lucide-react"
import { joinBuilding, claimApartment, getUnclaimedApartments } from "@/app/actions/building"
import { updateUserProfile } from "@/app/actions/user"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/Button"
import { isValidIban } from "@/lib/validations"
import { getApartmentDisplayName } from "@/lib/utils"

type Step = 'join' | 'claim' | 'iban' | 'complete'

interface ResidentOnboardingFlowProps {
    user: { id: string, name: string, email: string, buildingId?: string | null, iban?: string | null }
    initialStep: Step
    unclaimedApartments: { id: number; unit: string; permillage?: number | null }[]
}

export function ResidentOnboardingFlow({ user, initialStep, unclaimedApartments: initialUnclaimed }: ResidentOnboardingFlowProps) {
    const [step, setStep] = useState<Step>(initialStep)
    const [buildingId, setBuildingId] = useState(user.buildingId || "")
    const [unclaimedUnits, setUnclaimedUnits] = useState(initialUnclaimed)
    const [selectedUnitId, setSelectedUnitId] = useState<number | null>(null)
    const [iban, setIban] = useState(user.iban || "")
    const [error, setError] = useState("")
    const [isPending, startTransition] = useTransition()
    const router = useRouter()

    const handleJoin = async (code: string): Promise<void> => {
        setError("")
        startTransition(async (): Promise<void> => {
            try {
                const result = await joinBuilding(code)
                if (result.success) {
                    const b = result.data
                    setBuildingId(b.id)
                    const units = await getUnclaimedApartments(b.id)
                    setUnclaimedUnits(units)
                    setStep('claim')
                } else {
                    setError(result.error || "Failed to join building")
                }
            } catch (e) {
                const message = e instanceof Error ? e.message : "An error occurred"
                setError(message)
            }
        })
    }

    const handleClaim = async (unitId: number): Promise<void> => {
        setError("")
        startTransition(async (): Promise<void> => {
            try {
                const result = await claimApartment(unitId)
                if (result.success) {
                    setStep('iban')
                } else {
                    setError(result.error || "Failed to claim unit")
                }
            } catch (e) {
                const message = e instanceof Error ? e.message : "An unexpected error occurred"
                setError(message)
            }
        })
    }

    const handleIban = async (ibanValue: string): Promise<void> => {
        setError("")
        const normalized = ibanValue.toUpperCase().replace(/\s/g, "")
        if (!isValidIban(normalized)) {
            setError("Invalid IBAN format")
            return
        }

        startTransition(async (): Promise<void> => {
            try {
                const result = await updateUserProfile({ name: user.name, iban: normalized })
                if (result.success) {
                    setStep('complete')
                    router.refresh()
                } else {
                    setError(result.error || "Failed to save IBAN")
                }
            } catch (e) {
                setError("An unexpected error occurred")
            }
        })
    }

    return (
        <div className="bg-grid min-h-screen flex flex-col items-center py-12 px-4">
            <div className="w-full max-w-2xl space-y-8">
                <div className="text-center space-y-2">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-white border border-slate-300 rounded-full text-xs font-mono text-slate-600 mb-2">
                        <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                        RESIDENT_PORTAL_V1
                    </div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Resident Access Terminal</h1>
                    <p className="text-slate-500 max-w-lg mx-auto">Complete your profile to access building management services.</p>
                </div>

                <div className="space-y-4">
                    {/* STEP 1: JOIN BUILDING */}
                    <OnboardingStep
                        title="01 // System_Entry"
                        isActive={step === 'join'}
                        isComplete={!!buildingId}
                        icon={Building2}
                        onClick={() => step !== 'join' && setStep('join')}
                    >
                        <div className="p-8 bg-white flex flex-col items-center text-center space-y-6">
                            <h3 className="text-slate-500 text-xs font-bold uppercase tracking-widest">
                                Enter Building Invite Code
                            </h3>

                            <div className="w-full max-w-[280px]">
                                <input
                                    placeholder="000000"
                                    className="w-full bg-slate-50 border border-slate-300 text-slate-900 text-center text-4xl font-mono tracking-[0.2em] py-4 rounded-sm focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all uppercase placeholder:text-slate-200"
                                    maxLength={6}
                                    disabled={isPending}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') handleJoin(e.currentTarget.value)
                                    }}
                                />
                            </div>

                            <Button
                                variant="primary"
                                className="w-full max-w-[280px]"
                                disabled={isPending}
                                onClick={(e) => {
                                    const input = e.currentTarget.parentElement?.querySelector('input')
                                    if (input) handleJoin(input.value)
                                }}
                            >
                                {isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : "Connect to Building"}
                            </Button>
                        </div>
                    </OnboardingStep>

                    {/* STEP 2: CLAIM UNIT */}
                    <OnboardingStep
                        title="02 // Unit_Allocation"
                        isActive={step === 'claim'}
                        isComplete={step === 'iban' || step === 'complete'}
                        icon={Home}
                        disabled={!buildingId}
                        onClick={() => !buildingId ? undefined : setStep('claim')}
                    >
                        <div className="p-6 bg-white space-y-4">
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Select Your Unit</label>
                                <select
                                    className="input-sharp w-full h-12 text-lg font-bold uppercase cursor-pointer"
                                    value={selectedUnitId || ""}
                                    onChange={(e) => setSelectedUnitId(e.target.value ? parseInt(e.target.value) : null)}
                                    disabled={isPending}
                                >
                                    <option value="">-- SELECT APARTMENT --</option>
                                    {unclaimedUnits.map(unit => (
                                        <option key={unit.id} value={unit.id}>
                                            {getApartmentDisplayName(unit).toUpperCase()}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex justify-end pt-2">
                                <Button
                                    variant="primary"
                                    disabled={!selectedUnitId || isPending}
                                    onClick={() => selectedUnitId && handleClaim(selectedUnitId)}
                                >
                                    Confirm Allocation
                                    {isPending ? <Loader2 className="w-4 h-4 animate-spin ml-2" /> : null}
                                </Button>
                            </div>
                        </div>
                    </OnboardingStep>

                    {/* STEP 3: IBAN SETUP */}
                    <OnboardingStep
                        title="03 // Financial_Setup"
                        isActive={step === 'iban'}
                        isComplete={step === 'complete'}
                        icon={CreditCard}
                        disabled={step === 'join' || step === 'claim'}
                        onClick={() => (step === 'join' || step === 'claim') ? undefined : setStep('iban')}
                    >
                        <div className="p-6 bg-white space-y-4">
                            <div className="p-4 bg-blue-50 border border-blue-100 mb-2">
                                <div className="flex gap-3">
                                    <div className="p-1 bg-blue-100 rounded-sm h-fit">
                                        <CreditCard className="w-4 h-4 text-blue-700" />
                                    </div>
                                    <div className="space-y-1">
                                        <h4 className="text-xs font-bold text-blue-900 uppercase">Direct Debit Setup</h4>
                                        <p className="text-xs text-blue-800/80">
                                            Connect your IBAN for automated quota settlement. This can be changed later in settings.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">IBAN Number</label>
                                <input
                                    placeholder="PT50..."
                                    className="input-sharp w-full font-mono uppercase text-lg"
                                    value={iban}
                                    onChange={(e) => setIban(e.target.value)}
                                    disabled={isPending}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') handleIban(e.currentTarget.value)
                                    }}
                                />
                            </div>

                            <div className="flex justify-end pt-4">
                                <Button
                                    variant="primary"
                                    disabled={iban.length < 15 || isPending}
                                    onClick={() => handleIban(iban)}
                                >
                                    Complete Setup
                                    {isPending ? <Loader2 className="w-4 h-4 animate-spin ml-2" /> : null}
                                </Button>
                            </div>
                        </div>
                    </OnboardingStep>

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

function OnboardingStep({
    title,
    isActive,
    isComplete,
    icon: Icon,
    children,
    disabled,
    onClick
}: {
    title: string,
    isActive: boolean,
    isComplete: boolean,
    icon: React.ComponentType<{ className?: string }>,
    children: React.ReactNode,
    disabled?: boolean,
    onClick?: () => void
}) {
    return (
        <div
            className={cn(
                "tech-card transition-all duration-300 relative overflow-hidden",
                !isActive && !disabled && "cursor-pointer hover:border-slate-400 opacity-60 hover:opacity-100",
                disabled && "opacity-40 pointer-events-none grayscale"
            )}
            onClick={onClick}
        >
            {/* Status Indicator Line */}
            <div className={cn(
                "absolute top-0 left-0 w-1 h-full transition-colors",
                isActive ? "bg-blue-600" : isComplete ? "bg-emerald-500" : "bg-slate-200"
            )}></div>

            <div className={cn(
                "flex items-center justify-between px-6 py-4 border-b border-slate-200",
                isActive ? "bg-slate-50/50" : "bg-slate-50"
            )}>
                <div className="flex items-center gap-3">
                    <div className={cn(
                        "w-8 h-8 flex items-center justify-center border rounded-sm",
                        isActive ? "bg-blue-50 border-blue-200 text-blue-600" : "bg-white border-slate-200 text-slate-400"
                    )}>
                        <Icon className="w-4 h-4" />
                    </div>
                    <span className={cn(
                        "font-mono font-bold text-sm uppercase tracking-wider",
                        isActive ? "text-slate-900" : "text-slate-500"
                    )}>
                        {title}
                    </span>
                </div>

                {isComplete && !isActive && (
                    <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-2 py-1 rounded-full border border-emerald-100">
                        <Check className="w-3 h-3" />
                        <span className="text-[10px] font-bold uppercase tracking-wide">Verified</span>
                    </div>
                )}
            </div>

            {isActive && (
                <div className="animate-in fade-in zoom-in-95 duration-200">
                    {children}
                </div>
            )}
        </div>
    )
}