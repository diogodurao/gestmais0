"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { OnboardingStepUnits } from "@/features/dashboard/onboarding/components/OnboardingStepUnits"
import { Button } from "@/components/ui/Button"

export function UnitsStepClient({
    buildingId,
    apartments,
    totalApartments,
    userId
}: {
    buildingId: string
    apartments: any[]
    totalApartments: number
    userId: string
}) {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)

    const totalPermillage = apartments.reduce((sum, apt) => sum + apt.permillage, 0)
    // Javascript float precision issues fix
    const isPermillageValid = Math.abs(totalPermillage - 1000) < 0.01
    const hasUnits = apartments.length > 0
    // We allow proceeding even if permillage is not perfect but strongly suggest it? 
    // Usually only if perfectly 1000.
    const canContinue = hasUnits && isPermillageValid

    const handleContinue = () => {
        router.push("/onboarding/manager/claim")
        router.refresh()
    }

    return (
        <div className="space-y-8">
            <OnboardingStepUnits
                buildingId={buildingId}
                apartments={apartments}
                totalApartments={totalApartments}
            />

            <div className="pt-6 border-t border-slate-100 flex flex-col items-center gap-4">
                {/* Validation Helpers */}
                {!isPermillageValid && hasUnits && (
                    <p className="text-xs text-amber-600 font-bold uppercase">
                        A permilagem deve totalizar 1000 (Atual: {totalPermillage})
                    </p>
                )}

                <Button
                    size="lg"
                    fullWidth
                    onClick={handleContinue}
                    disabled={!canContinue}
                >
                    GUARDAR E CONTINUAR
                </Button>
            </div>
        </div>
    )
}
