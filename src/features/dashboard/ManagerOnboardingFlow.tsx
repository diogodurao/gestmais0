"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Building2, User, CreditCard, Check, AlertCircle, Loader2, MapPin, Calculator, Layers } from "lucide-react"
import { updateBuilding } from "@/app/actions/building"
import { updateUserProfile } from "@/app/actions/user"
import { Button, cn } from "@/components/ui/Button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card"
import { Input } from "@/components/ui/Input"
import { isValidIban, isValidNif, isBuildingComplete } from "@/lib/validations"
import { ApartmentManager } from "./ApartmentManager"

type Step = 'personal' | 'building' | 'units' | 'complete'

interface ManagerOnboardingFlowProps {
    user: { id: string, name: string, email: string, nif?: string | null, iban?: string | null }
    building: { id: string, nif?: string | null, iban?: string | null, street?: string | null, number?: string | null, city?: string | null, totalApartments?: number | null, monthlyQuota?: number | null }
    apartments: any[]
    initialStep: Step
}

export function ManagerOnboardingFlow({ user, building, apartments, initialStep }: ManagerOnboardingFlowProps) {
    const [step, setStep] = useState<Step>(initialStep)
    const [personalData, setPersonalData] = useState({
        name: user.name,
        nif: user.nif || "",
        iban: user.iban || ""
    })
    const [buildingData, setBuildingData] = useState({
        street: building.street || "",
        number: building.number || "",
        city: building.city || "",
        nif: building.nif !== "N/A" ? (building.nif || "") : "",
        iban: building.iban || "",
        totalApartments: building.totalApartments?.toString() || "",
        monthlyQuota: building.monthlyQuota ? (building.monthlyQuota / 100).toString() : "",
        quotaMode: "global" // Default to global
    })
    const [error, setError] = useState("")
    const [isPending, startTransition] = useTransition()
    const router = useRouter()

    const handlePersonalSave = async () => {
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

        startTransition(async () => {
            try {
                await updateUserProfile({
                    name: personalData.name,
                    nif: personalData.nif,
                    iban: normalizedIban
                })
                setStep('building')
            } catch (e: any) {
                setError("Failed to save personal information")
            }
        })
    }

    const handleBuildingSave = async () => {
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

        startTransition(async () => {
            try {
                await updateBuilding(building.id, {
                    name: `${buildingData.street} ${buildingData.number}`, // Auto-generate name from street
                    street: buildingData.street,
                    number: buildingData.number,
                    city: buildingData.city,
                    nif: buildingData.nif,
                    iban: normalizedIban,
                    totalApartments: parseInt(buildingData.totalApartments),
                    monthlyQuota: Math.round(parseFloat(buildingData.monthlyQuota) * 100),
                    quotaMode: buildingData.quotaMode,
                })
                setStep('units')
                router.refresh()
            } catch (e: any) {
                setError("Failed to save building information")
            }
        })
    }

    return (
        <div className="max-w-2xl mx-auto space-y-4 py-8">
            <div className="mb-8 px-4">
                <h1 className="text-2xl font-bold text-slate-900 uppercase tracking-tight">Manager_Setup</h1>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Initialize your condominium ecosystem</p>
            </div>

            {/* STEP 1: PERSONAL DATA */}
            <OnboardingStep
                title="1. PERSONAL_IDENTITY"
                isActive={step === 'personal'}
                isComplete={personalData.name !== "" && isValidNif(personalData.nif) && isValidIban(personalData.iban)}
                icon={User}
                onClick={() => step !== 'personal' && setStep('personal')}
            >
                <div className="space-y-0">
                    <div className="grid grid-cols-1 md:grid-cols-[140px_1fr] border-b border-slate-100">
                        <div className="label-col border-none">Full Name</div>
                        <div className="value-col border-none">
                            <input
                                value={personalData.name}
                                onChange={(e) => setPersonalData(prev => ({ ...prev, name: e.target.value }))}
                                className="input-cell"
                                disabled={isPending}
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-[140px_1fr] border-b border-slate-100">
                        <div className="label-col border-none">Personal NIF</div>
                        <div className="value-col border-none">
                            <input
                                value={personalData.nif}
                                onChange={(e) => setPersonalData(prev => ({ ...prev, nif: e.target.value }))}
                                className="input-cell font-mono"
                                maxLength={9}
                                disabled={isPending}
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-[140px_1fr] border-b border-slate-100">
                        <div className="label-col border-none">Personal IBAN</div>
                        <div className="value-col border-none">
                            <input
                                value={personalData.iban}
                                onChange={(e) => setPersonalData(prev => ({ ...prev, iban: e.target.value }))}
                                className="input-cell font-mono uppercase"
                                disabled={isPending}
                            />
                        </div>
                    </div>
                    <div className="p-2 flex justify-end bg-slate-50">
                        <Button 
                            variant="ghost" 
                            size="xs"
                            className="text-blue-600 font-bold"
                            disabled={isPending}
                            onClick={handlePersonalSave}
                        >
                            {isPending && step === 'personal' ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : null}
                            SAVE_CONTINUE
                        </Button>
                    </div>
                </div>
            </OnboardingStep>

            {/* STEP 2: BUILDING DATA */}
            <OnboardingStep
                title="2. BUILDING_STRUCTURE"
                isActive={step === 'building'}
                isComplete={step === 'units' || step === 'complete'}
                icon={Building2}
                disabled={step === 'personal' && !isBuildingComplete({
                    ...building,
                    street: buildingData.street,
                    number: buildingData.number,
                    city: buildingData.city,
                    totalApartments: parseInt(buildingData.totalApartments),
                    monthlyQuota: Math.round(parseFloat(buildingData.monthlyQuota) * 100),
                    nif: buildingData.nif,
                    iban: buildingData.iban
                })}
                onClick={() => (step === 'units' || step === 'complete') && setStep('building')}
            >
                <div className="space-y-0">
                    <div className="grid grid-cols-1 md:grid-cols-[140px_1fr] border-b border-slate-100">
                        <div className="label-col border-none">Street Line</div>
                        <div className="value-col border-none">
                            <input
                                value={buildingData.street}
                                onChange={(e) => setBuildingData(prev => ({ ...prev, street: e.target.value }))}
                                className="input-cell"
                                placeholder="E.G. AV. DA REPUBLICA"
                                disabled={isPending}
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-[140px_1fr] border-b border-slate-100">
                        <div className="label-col border-none">Number / City</div>
                        <div className="value-col border-none grid grid-cols-2">
                            <input
                                value={buildingData.number}
                                onChange={(e) => setBuildingData(prev => ({ ...prev, number: e.target.value }))}
                                className="input-cell border-r border-slate-100"
                                placeholder="Nº"
                                disabled={isPending}
                            />
                            <input
                                value={buildingData.city}
                                onChange={(e) => setBuildingData(prev => ({ ...prev, city: e.target.value }))}
                                className="input-cell"
                                placeholder="CITY"
                                disabled={isPending}
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-[140px_1fr] border-b border-slate-100">
                        <div className="label-col border-none">Building NIF</div>
                        <div className="value-col border-none">
                            <input
                                value={buildingData.nif}
                                onChange={(e) => setBuildingData(prev => ({ ...prev, nif: e.target.value }))}
                                className="input-cell font-mono"
                                placeholder="BUILDING_TAX_ID"
                                maxLength={9}
                                disabled={isPending}
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-[140px_1fr] border-b border-slate-100">
                        <div className="label-col border-none">Building IBAN</div>
                        <div className="value-col border-none">
                            <input
                                value={buildingData.iban}
                                onChange={(e) => setBuildingData(prev => ({ ...prev, iban: e.target.value }))}
                                className="input-cell font-mono uppercase"
                                placeholder="BUILDING_IBAN"
                                disabled={isPending}
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-[140px_1fr] border-b border-slate-100">
                        <div className="label-col border-none">Total Units</div>
                        <div className="value-col border-none">
                            <input
                                type="number"
                                value={buildingData.totalApartments}
                                onChange={(e) => setBuildingData(prev => ({ ...prev, totalApartments: e.target.value }))}
                                className="input-cell"
                                placeholder="NUMBER_OF_APARTMENTS"
                                disabled={isPending}
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-[140px_1fr_1fr] border-b border-slate-100">
                        <div className="label-col border-none">Quota Config</div>
                        <div className="value-col border-none flex bg-white h-8 border-r border-slate-100">
                            <button
                                type="button"
                                onClick={() => setBuildingData(prev => ({ ...prev, quotaMode: 'global' }))}
                                className={cn(
                                    "flex-1 text-[9px] font-bold uppercase transition-colors border-r border-slate-100",
                                    buildingData.quotaMode === 'global' ? "bg-blue-50 text-blue-600" : "text-slate-400 hover:bg-slate-50"
                                )}
                            >
                                Fixed
                            </button>
                            <button
                                type="button"
                                onClick={() => setBuildingData(prev => ({ ...prev, quotaMode: 'permillage' }))}
                                className={cn(
                                    "flex-1 text-[9px] font-bold uppercase transition-colors",
                                    buildingData.quotaMode === 'permillage' ? "bg-blue-50 text-blue-600" : "text-slate-400 hover:bg-slate-50"
                                )}
                            >
                                Permillage
                            </button>
                        </div>
                        <div className="value-col border-none flex items-center bg-white">
                            <div className="w-6 h-8 flex items-center justify-center bg-slate-50 border-r border-slate-100 text-slate-400 font-bold text-[10px] shrink-0">€</div>
                            <input
                                type="number"
                                step="0.01"
                                value={buildingData.monthlyQuota}
                                onChange={(e) => setBuildingData(prev => ({ ...prev, monthlyQuota: e.target.value }))}
                                className="input-cell px-3 font-mono font-bold text-slate-700"
                                placeholder={buildingData.quotaMode === 'global' ? "VALUE" : "BUDGET"}
                                disabled={isPending}
                            />
                        </div>
                    </div>
                    <div className="p-2 flex justify-end bg-slate-50">
                        <Button 
                            variant="ghost" 
                            size="xs"
                            className="text-blue-600 font-bold"
                            disabled={isPending}
                            onClick={handleBuildingSave}
                        >
                            {isPending && step === 'building' ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : null}
                            SAVE_CONTINUE
                        </Button>
                    </div>
                </div>
            </OnboardingStep>

            {/* STEP 3: UNITS REGISTRY */}
            <OnboardingStep
                title="3. UNIT_REGISTRY"
                isActive={step === 'units'}
                isComplete={step === 'complete'}
                icon={Layers}
                disabled={step !== 'units' && step !== 'complete'}
                onClick={() => step === 'complete' && setStep('units')}
            >
                <div className="p-0">
                    {/* Helper message about required fields */}
                    <div className="px-4 py-3 bg-blue-50 border-b border-blue-100 flex items-start gap-3">
                        <AlertCircle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                        <div className="flex flex-col gap-1">
                            <span className="text-[11px] font-bold text-blue-800 uppercase">Required Fields</span>
                            <span className="text-[10px] text-blue-700 leading-tight">
                                Each unit needs: <strong>Unit name</strong> (e.g., "1º Esq", "R/C A") and <strong>Permillage</strong> (‰ ownership fraction).
                                {buildingData.quotaMode === 'permillage' && (
                                    <> Permillage is <strong className="text-blue-900">mandatory</strong> since you selected permillage-based quotas.</>
                                )}
                            </span>
                        </div>
                    </div>
                    
                    <ApartmentManager 
                        apartments={apartments} 
                        buildingId={building.id} 
                        totalApartments={parseInt(buildingData.totalApartments)}
                    />
                    
                    {/* Permillage validation warning */}
                    {buildingData.quotaMode === 'permillage' && apartments.some(a => !a.apartment.permillage) && apartments.length > 0 && (
                        <div className="px-4 py-2 bg-amber-50 border-t border-amber-200 flex items-center gap-2">
                            <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                            <span className="text-[10px] font-bold text-amber-700 uppercase">
                                {apartments.filter(a => !a.apartment.permillage).length} unit(s) missing permillage value
                            </span>
                        </div>
                    )}
                    
                    <div className="p-4 bg-slate-50 flex items-center justify-between border-t border-slate-200">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">Status</span>
                            <span className={cn(
                                "text-[11px] font-bold uppercase",
                                apartments.length === parseInt(buildingData.totalApartments) ? "text-emerald-600" : "text-amber-600"
                            )}>
                                {apartments.length} OF {buildingData.totalApartments} UNITS CONFIGURED
                            </span>
                        </div>
                        <Button 
                            variant="ghost" 
                            size="xs"
                            className="text-blue-600 font-bold"
                            disabled={
                                isPending || 
                                apartments.length !== parseInt(buildingData.totalApartments) ||
                                (buildingData.quotaMode === 'permillage' && apartments.some(a => !a.apartment.permillage))
                            }
                            onClick={() => {
                                setStep('complete')
                                router.refresh()
                            }}
                        >
                            {isPending && step === 'units' ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : null}
                            FINALIZE_ONBOARDING
                        </Button>
                    </div>
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

