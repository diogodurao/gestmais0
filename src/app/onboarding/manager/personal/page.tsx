import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { PersonalStepClient } from "./PersonalStepClient"
import type { SessionUser } from "@/lib/types"

export default async function PersonalStepPage() {
    const session = await auth.api.getSession({
        headers: await headers()
    })

    if (!session) {
        return redirect("/sign-in")
    }

    const sessionUser = session.user as unknown as SessionUser

    return (
        <PersonalStepClient
            user={{
                id: session.user.id,
                name: session.user.name,
                email: session.user.email,
                nif: session.user.nif || null,
                iban: session.user.iban || null
            }}
        />
    )
}