"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Building2, Home, CreditCard, Check, AlertCircle, Loader2 } from "lucide-react"
import { joinBuilding, claimApartment, getUnclaimedApartments } from "@/app/actions/building"
import { updateUserProfile } from "@/app/actions/user"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/Button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card"
import { Input } from "@/components/ui/Input"
import { isValidIban } from "@/lib/validations"
import { getApartmentDisplayName, getFloorLabel } from "@/lib/utils"

type Step = 'join' | 'claim' | 'iban' | 'complete'

interface ResidentOnboardingFlowProps {
    user: { id: string, name: string, email: string, buildingId?: string | null, iban?: string | null }
    initialStep: Step
    unclaimedApartments: any[]
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

    const handleJoin = async (code: string) => {
        setError("")
        startTransition(async () => {
            try {
                const b = await joinBuilding(user.id, code)
                setBuildingId(b.id)
                const units = await getUnclaimedApartments(b.id)
                setUnclaimedUnits(units)
                setStep('claim')
            } catch (e: any) {
                setError(e.message || "Invalid building code")
            }
        })
    }

    const handleClaim = async (unitId: number) => {
        setError("")
        startTransition(async () => {
            try {
                await claimApartment(unitId)
                setStep('iban')
            } catch (e: any) {
                setError(e.message || "Failed to claim unit")
            }
        })
    }

    const handleIban = async (ibanValue: string) => {
        setError("")
        const normalized = ibanValue.toUpperCase().replace(/\s/g, "")
        if (!isValidIban(normalized)) {
            setError("Invalid IBAN format")
            return
        }

        startTransition(async () => {
            try {
                await updateUserProfile({ name: user.name, iban: normalized })
                setStep('complete')
                router.refresh()
            } catch (e: any) {
                setError("Failed to save IBAN")
            }
        })
    }

    return (
        <div className="max-w-2xl mx-auto space-y-4 py-8">
            <div className="mb-8 px-4">
                <h1 className="text-2xl font-bold text-slate-900 uppercase tracking-tight">Setup_Required</h1>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Complete your resident profile to continue</p>
            </div>

            {/* STEP 1: JOIN BUILDING */}
            <OnboardingStep
                title="1. JOIN_BUILDING"
                isActive={step === 'join'}
                isComplete={!!buildingId}
                icon={Building2}
                onClick={() => step !== 'join' && setStep('join')}
            >
                <div className="grid grid-cols-1 md:grid-cols-[1fr_80px]">
                    <div className="value-col">
                        <input
                            placeholder="CODE_E.G._8K92LA"
                            className="input-cell font-mono tracking-[0.2em] uppercase text-center"
                            maxLength={6}
                            disabled={isPending}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') handleJoin(e.currentTarget.value)
                            }}
                        />
                    </div>
                    <Button 
                        variant="ghost"
                        className="h-8 border-l border-slate-200 rounded-none text-blue-600 hover:bg-blue-50"
                        disabled={isPending}
                        onClick={(e) => {
                            const input = e.currentTarget.parentElement?.querySelector('input')
                            if (input) handleJoin(input.value)
                        }}
                    >
                        {isPending && step === 'join' ? <Loader2 className="w-3 h-3 animate-spin" /> : "SAVE"}
                    </Button>
                </div>
            </OnboardingStep>

            {/* STEP 2: CLAIM UNIT */}
            <OnboardingStep
                title="2. SELECT_UNIT"
                isActive={step === 'claim'}
                isComplete={step === 'iban' || step === 'complete'}
                icon={Home}
                disabled={!buildingId}
                onClick={() => !buildingId ? undefined : setStep('claim')}
            >
                <div className="grid grid-cols-1 md:grid-cols-[1fr_80px]">
                    <div className="value-col">
                        <select
                            className="input-cell bg-transparent cursor-pointer font-bold uppercase"
                            value={selectedUnitId || ""}
                            onChange={(e) => setSelectedUnitId(e.target.value ? parseInt(e.target.value) : null)}
                            disabled={isPending}
                        >
                            <option value="">SELECT_UNIT...</option>
                            {unclaimedUnits.map(unit => (
                                <option key={unit.id} value={unit.id}>
                                    {getApartmentDisplayName(unit).toUpperCase()}
                                </option>
                            ))}
                        </select>
                    </div>
                    <Button 
                        variant="ghost"
                        className="h-8 border-l border-slate-200 rounded-none text-blue-600 hover:bg-blue-50"
                        disabled={!selectedUnitId || isPending}
                        onClick={() => selectedUnitId && handleClaim(selectedUnitId)}
                    >
                        {isPending && step === 'claim' ? <Loader2 className="w-3 h-3 animate-spin" /> : "SAVE"}
                    </Button>
                </div>
            </OnboardingStep>

            {/* STEP 3: IBAN SETUP */}
            <OnboardingStep
                title="3. FINANCIAL_SETUP"
                isActive={step === 'iban'}
                isComplete={step === 'complete'}
                icon={CreditCard}
                disabled={step === 'join' || step === 'claim'}
                onClick={() => (step === 'join' || step === 'claim') ? undefined : setStep('iban')}
            >
                <div className="grid grid-cols-1 md:grid-cols-[1fr_80px]">
                    <div className="value-col">
                        <input
                            placeholder="IBAN_NUMBER"
                            className="input-cell font-mono uppercase"
                            value={iban}
                            onChange={(e) => setIban(e.target.value)}
                            disabled={isPending}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') handleIban(e.currentTarget.value)
                            }}
                        />
                    </div>
                    <Button 
                        variant="ghost"
                        className="h-8 border-l border-slate-200 rounded-none text-blue-600 hover:bg-blue-50"
                        disabled={iban.length < 15 || isPending}
                        onClick={() => handleIban(iban)}
                    >
                        {isPending && step === 'iban' ? <Loader2 className="w-3 h-3 animate-spin" /> : "SAVE"}
                    </Button>
                </div>
            </OnboardingStep>

            {error && (
                <div className="px-4 py-3 bg-rose-50 border border-rose-200 flex items-center gap-3 animate-in fade-in slide-in-from-top-1">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span className="text-[11px] font-bold text-rose-700 uppercase">{error}</span>
                </div>
            )}
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
    icon: any, 
    children: React.ReactNode,
    disabled?: boolean,
    onClick?: () => void
}) {
    return (
        <Card 
            className={cn(
                "transition-all duration-300 rounded-none",
                isActive ? "border-blue-500 z-10" : "opacity-80 grayscale-[0.2]",
                !isActive && !disabled && "cursor-pointer hover:border-slate-400",
                disabled && "pointer-events-none opacity-40"
            )}
            onClick={onClick}
        >
            <CardHeader className={cn(
                "py-1.5 bg-slate-50",
                !isActive && "bg-slate-50/50"
            )}>
                <CardTitle className={cn("text-[9px] tracking-[0.15em] uppercase", isActive ? "text-slate-900" : "text-slate-500")}>
                    <Icon className={cn("w-3 h-3", isActive ? "text-blue-600" : "text-slate-400")} />
                    {title}
                </CardTitle>
                {isComplete && (
                    <div className="flex items-center gap-1.5 text-emerald-500">
                        <span className="text-[8px] font-bold uppercase tracking-tighter">Verified</span>
                        <Check className="w-2.5 h-2.5" />
                    </div>
                )}
            </CardHeader>
            {isActive && (
                <div className="p-0 border-t border-slate-200">
                    {children}
                </div>
            )}
        </Card>
    )
}