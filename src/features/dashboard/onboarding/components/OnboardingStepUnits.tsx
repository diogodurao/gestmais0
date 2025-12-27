"use client"

import { Layers, AlertCircle, Calculator, Loader2, Check } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { OnboardingStepWrapper } from "./OnboardingStepWrapper"
import { ApartmentManager, type ApartmentData } from "@/features/dashboard/settings/ApartmentManager"
import { cn } from "@/lib/utils"
import { isUnitsComplete } from "@/lib/validations"

interface OnboardingStepUnitsProps {
    isActive: boolean
    isComplete: boolean
    isPending: boolean
    disabled: boolean
    buildingId: string
    totalApartments: number
    quotaMode: string
    apartments: ApartmentData[]
    handleFinalize: () => void
    onStepClick: () => void
}

export function OnboardingStepUnits({
    isActive,
    isComplete,
    isPending,
    disabled,
    buildingId,
    totalApartments,
    quotaMode,
    apartments,
    handleFinalize,
    onStepClick
}: OnboardingStepUnitsProps) {
    return (
        <OnboardingStepWrapper
            title="03 // Unit_Registry"
            isActive={isActive}
            isComplete={isComplete}
            icon={Layers}
            disabled={disabled}
            onClick={onStepClick}
        >
            <div className="bg-white">
                <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-start gap-3">
                    <div className="p-1.5 bg-blue-100 rounded-sm">
                        <AlertCircle className="w-4 h-4 text-blue-700" />
                    </div>
                    <div className="flex flex-col gap-1">
                        <span className="text-xs font-bold text-blue-900 uppercase tracking-wide">Registry Instructions</span>
                        <span className="text-xs text-blue-700/80 leading-relaxed max-w-2xl">
                            Define all units in your building. For each unit, specify the <strong>Unit Name</strong> (e.g., 1º Esq) and its <strong>Permillage</strong> (ownership %).
                            {quotaMode === 'permillage' && " Permillage is mandatory for budget calculation."}
                        </span>
                    </div>
                </div>

                <div className="p-0">
                    <ApartmentManager
                        apartments={apartments}
                        buildingId={buildingId}
                        totalApartments={totalApartments}
                    />
                </div>

                {/* FOOTER METRICS */}
                <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 space-y-4">
                    {/* Permillage Check */}
                    <div className="flex items-center justify-between p-3 bg-white border border-slate-200 shadow-sm">
                        <div className="flex items-center gap-2">
                            <Calculator className="w-4 h-4 text-slate-400" />
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total Permillage Check</span>
                        </div>
                        <div className="flex items-center gap-3">
                            {(() => {
                                const sum = apartments.reduce((acc, a) => acc + (Number(a.apartment.permillage) || 0), 0)
                                const roundedSum = Math.round(sum * 100) / 100
                                const isCorrect = Math.abs(roundedSum - 1000) < 0.01

                                return (
                                    <>
                                        <span className={cn(
                                            "text-sm font-mono font-bold",
                                            isCorrect ? "text-emerald-600" : "text-slate-900"
                                        )}>
                                            {roundedSum.toFixed(2).replace('.', ',')} / 1000,00 ‰
                                        </span>
                                        {isCorrect ? (
                                            <div className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-sm text-[10px] font-bold uppercase">Valid</div>
                                        ) : (
                                            <div className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded-sm text-[10px] font-bold uppercase">Pending</div>
                                        )}
                                    </>
                                )
                            })()}
                        </div>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                        <div className="flex items-center gap-2">
                            <div className={cn("w-2 h-2 rounded-full animate-pulse",
                                apartments.length === totalApartments ? "bg-emerald-500" : "bg-amber-500"
                            )}></div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                {apartments.length} / {totalApartments} Units Configured
                            </span>
                        </div>

                        <Button
                            variant={apartments.length === totalApartments ? "primary" : "secondary"}
                            className="gap-2"
                            disabled={
                                isPending ||
                                !isUnitsComplete(totalApartments, apartments)
                            }
                            onClick={handleFinalize}
                        >
                            Finalize System
                            {isPending ? <Loader2 className="w-4 h-4 animate-spin ml-2" /> : <Check className="w-4 h-4 ml-2" />}
                        </Button>
                    </div>
                </div>
            </div>
        </OnboardingStepWrapper>
    )
}
