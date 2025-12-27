"use client"

import { User, Loader2, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { OnboardingStepWrapper } from "./OnboardingStepWrapper"
import { isValidNif } from "@/lib/validations"

export type PersonalData = {
    name: string
    nif: string
    iban: string
}

interface OnboardingStepPersonalProps {
    isActive: boolean
    isComplete: boolean
    isPending: boolean
    personalData: PersonalData
    setPersonalData: React.Dispatch<React.SetStateAction<PersonalData>>
    handleSave: () => void
    onStepClick: () => void
}

export function OnboardingStepPersonal({
    isActive,
    isComplete,
    isPending,
    personalData,
    setPersonalData,
    handleSave,
    onStepClick
}: OnboardingStepPersonalProps) {
    return (
        <OnboardingStepWrapper
            title="01 // Personal_Identity"
            isActive={isActive}
            isComplete={isComplete}
            icon={User}
            onClick={onStepClick}
        >
            <div className="p-6 bg-white space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Full Name</label>
                        <input
                            value={personalData.name}
                            onChange={(e) => setPersonalData((prev) => ({ ...prev, name: e.target.value }))}
                            className="input-sharp w-full"
                            disabled={isPending}
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Personal NIF</label>
                        <input
                            value={personalData.nif}
                            onChange={(e) => setPersonalData((prev) => ({ ...prev, nif: e.target.value }))}
                            className="input-sharp w-full font-mono"
                            maxLength={9}
                            disabled={isPending}
                        />
                    </div>
                    <div className="col-span-1 md:col-span-2 space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Personal IBAN</label>
                        <input
                            value={personalData.iban}
                            onChange={(e) => setPersonalData((prev) => ({ ...prev, iban: e.target.value }))}
                            className="input-sharp w-full font-mono uppercase"
                            disabled={isPending}
                        />
                    </div>
                </div>

                <div className="flex justify-end pt-2">
                    <Button
                        variant="primary"
                        className="gap-2"
                        disabled={isPending}
                        onClick={handleSave}
                    >
                        Save & Continue
                        {isPending ? <Loader2 className="w-4 h-4 animate-spin ml-2" /> : <ArrowRight className="w-4 h-4 ml-2" />}
                    </Button>
                </div>
            </div>
        </OnboardingStepWrapper>
    )
}
