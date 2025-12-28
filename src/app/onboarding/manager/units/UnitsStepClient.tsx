"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { OnboardingStepUnits } from "@/features/dashboard/onboarding/components/OnboardingStepUnits"
import { Button } from "@/components/ui/Button"
import { completeOnboarding } from "@/app/actions/onboarding"

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
    const canFinalize = hasUnits && isPermillageValid

    const handleFinalize = async () => {
        if (!canFinalize) return

        setIsLoading(true)
        try {
            const result = await completeOnboarding(userId)
            if (result.success) {
                router.push("/dashboard")
                router.refresh()
            } else {
                console.error(result.error)
                // Optionally show error toast/message
            }
        } catch (error) {
            console.error(error)
        } finally {
            setIsLoading(false)
        }
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
                    onClick={handleFinalize}
                    disabled={!canFinalize || isLoading}
                >
                    {isLoading ? "A CARREGAR..." : "FINALIZAR E ENTRAR"}
                </Button>
            </div>
        </div>
    )
}
