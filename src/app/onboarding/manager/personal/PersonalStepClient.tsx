"use client"

import { useRouter } from "next/navigation"
import { OnboardingStepPersonal, type UserData } from "@/features/dashboard/onboarding/components/OnboardingStepPersonal"

export function PersonalStepClient({ user }: { user: UserData }) {
    const router = useRouter()

    return (
        <OnboardingStepPersonal
            user={user}
            onComplete={() => router.push("/onboarding/manager/building")}
        />
    )
}
