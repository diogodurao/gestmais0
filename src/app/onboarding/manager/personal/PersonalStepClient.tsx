"use client"

import { useRouter } from "next/navigation"
import { OnboardingStepPersonal } from "@/components/dashboard/onboarding/components/OnboardingStepPersonal"
import type { OnboardingUserData } from "@/lib/types"

export function PersonalStepClient({ user }: { user: OnboardingUserData }) {
    const router = useRouter()

    return (
        <OnboardingStepPersonal
            user={user}
            onComplete={() => router.push("/onboarding/manager/building")}
        />
    )
}