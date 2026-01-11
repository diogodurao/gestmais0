"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { OnboardingStepManagerUnit } from "@/components/dashboard/onboarding/components/OnboardingStepManagerUnit"
import { Button } from "@/components/ui/Button"
import { completeOnboarding } from "@/lib/actions/onboarding"

export function ClaimStepClient({
    apartments,
    userId,
    currentManagerUnitId
}: {
    apartments: any[]
    userId: string
    currentManagerUnitId?: number | null
}) {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [hasClaimed, setHasClaimed] = useState(!!currentManagerUnitId)

    const canFinalize = hasClaimed

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
            }
        } catch (error) {
            console.error(error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleClaimSuccess = () => {
        setHasClaimed(true)
        // Optionally auto-advance or just enable button
    }

    return (
        <div className="space-y-8">
            <OnboardingStepManagerUnit
                apartments={apartments}
                currentManagerUnitId={currentManagerUnitId}
                onClaimSuccess={handleClaimSuccess}
            />

            <div className="pt-6 border-t border-slate-100 flex flex-col items-center gap-4">
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
