"use client"

import { Building2, Loader2, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { OnboardingStepWrapper } from "./OnboardingStepWrapper"
import { cn } from "@/lib/utils"

export type BuildingData = {
    street: string
    number: string
    city: string
    nif: string
    iban: string
    totalApartments: string
    monthlyQuota: string
    quotaMode: string
}

interface OnboardingStepBuildingProps {
    isActive: boolean
    isComplete: boolean
    isPending: boolean
    disabled: boolean
    buildingData: BuildingData
    setBuildingData: React.Dispatch<React.SetStateAction<BuildingData>>
    handleSave: () => void
    onStepClick: () => void
}

export function OnboardingStepBuilding({
    isActive,
    isComplete,
    isPending,
    disabled,
    buildingData,
    setBuildingData,
    handleSave,
    onStepClick
}: OnboardingStepBuildingProps) {
    return (
        <OnboardingStepWrapper
            title="02 // Building_Structure"
            isActive={isActive}
            isComplete={isComplete}
            icon={Building2}
            disabled={disabled}
            onClick={onStepClick}
        >
            <div className="p-6 bg-white space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                    <div className="md:col-span-8 space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Street Address</label>
                        <input
                            value={buildingData.street}
                            onChange={(e) => setBuildingData((prev) => ({ ...prev, street: e.target.value }))}
                            className="input-sharp w-full"
                            placeholder="E.G. AV. DA REPUBLICA"
                            disabled={isPending}
                        />
                    </div>
                    <div className="md:col-span-4 space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Number</label>
                        <input
                            value={buildingData.number}
                            onChange={(e) => setBuildingData((prev) => ({ ...prev, number: e.target.value }))}
                            className="input-sharp w-full"
                            placeholder="Nº"
                            disabled={isPending}
                        />
                    </div>
                    <div className="md:col-span-4 space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">City</label>
                        <input
                            value={buildingData.city}
                            onChange={(e) => setBuildingData((prev) => ({ ...prev, city: e.target.value }))}
                            className="input-sharp w-full"
                            placeholder="CITY"
                            disabled={isPending}
                        />
                    </div>
                    <div className="md:col-span-4 space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Building NIF</label>
                        <input
                            value={buildingData.nif}
                            onChange={(e) => setBuildingData((prev) => ({ ...prev, nif: e.target.value }))}
                            className="input-sharp w-full font-mono"
                            placeholder="123456789"
                            maxLength={9}
                            disabled={isPending}
                        />
                    </div>
                    <div className="md:col-span-4 space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Units</label>
                        <input
                            type="number"
                            value={buildingData.totalApartments}
                            onChange={(e) => setBuildingData((prev) => ({ ...prev, totalApartments: e.target.value }))}
                            className="input-sharp w-full"
                            disabled={isPending}
                        />
                    </div>

                    <div className="md:col-span-12 pt-2 pb-2">
                        <div className="h-px bg-slate-100"></div>
                    </div>

                    <div className="md:col-span-6 space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Building IBAN</label>
                        <input
                            value={buildingData.iban}
                            onChange={(e) => setBuildingData((prev) => ({ ...prev, iban: e.target.value }))}
                            className="input-sharp w-full font-mono uppercase"
                            placeholder="PT50..."
                            disabled={isPending}
                        />
                    </div>
                    <div className="md:col-span-6 space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Quota Configuration</label>
                        <div className="flex gap-2">
                            <div className="flex border border-slate-300 bg-white h-[38px] flex-1">
                                <button
                                    type="button"
                                    onClick={() => setBuildingData((prev) => ({ ...prev, quotaMode: 'global' }))}
                                    className={cn(
                                        "flex-1 text-[10px] font-bold uppercase transition-colors border-r border-slate-300 hover:bg-slate-50",
                                        buildingData.quotaMode === 'global' ? "bg-slate-100 text-slate-900" : "text-slate-400"
                                    )}
                                >
                                    Fixed
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setBuildingData((prev) => ({ ...prev, quotaMode: 'permillage' }))}
                                    className={cn(
                                        "flex-1 text-[10px] font-bold uppercase transition-colors hover:bg-slate-50",
                                        buildingData.quotaMode === 'permillage' ? "bg-slate-100 text-slate-900" : "text-slate-400"
                                    )}
                                >
                                    Permillage
                                </button>
                            </div>
                            <div className="relative w-32">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">€</div>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={buildingData.monthlyQuota}
                                    onChange={(e) => setBuildingData((prev) => ({ ...prev, monthlyQuota: e.target.value }))}
                                    className="input-sharp w-full pl-6 font-mono font-bold text-slate-700 h-[38px]"
                                    placeholder="0.00"
                                    disabled={isPending}
                                />
                            </div>
                        </div>
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
