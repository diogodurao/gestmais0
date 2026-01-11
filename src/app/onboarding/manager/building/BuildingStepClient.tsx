"use client"

import { useRouter } from "next/navigation"
import { OnboardingStepBuilding } from "@/components/dashboard/onboarding/components/OnboardingStepBuilding"

export function BuildingStepClient({ building }: { building: any }) {
    const router = useRouter()

    return (
        <OnboardingStepBuilding
            building={building}
            onComplete={() => router.push("/onboarding/manager/units")}
        />
    )
}
