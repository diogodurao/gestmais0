"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/Button"
import { Alert } from "@/components/ui/Alert"
import { authClient } from "@/lib/auth-client"
import { ResendVerificationButton } from "./ResendVerificationButton"

type VerificationState = "loading" | "success" | "error" | "no-token"

export function EmailVerificationStatus() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const [state, setState] = useState<VerificationState>("loading")
    const [errorMessage, setErrorMessage] = useState<string>("")
    const [userRole, setUserRole] = useState<string | null>(null)

    const token = searchParams.get("token")
    const urlError = searchParams.get("error")
    const verified = searchParams.get("verified")

    useEffect(() => {
        // Case 1: Already verified (redirected from Better Auth after clicking email link)
        if (verified === "true") {
            // Fetch user session to get role for redirect
            async function fetchUserRole() {
                const session = await authClient.getSession()
                if (session.data?.user) {
                    const role = (session.data.user as { role?: string }).role
                    setUserRole(role || "resident")
                }
                setState("success")
            }
            fetchUserRole()
            return
        }

        // Case 2: Error from URL
        if (urlError === "invalid_token" || urlError === "INVALID_TOKEN") {
            setState("error")
            setErrorMessage("O link de verificação expirou ou é inválido.")
            return
        }

        // Case 3: Has token - verify email manually
        if (token) {
            async function verifyEmail() {
                const result = await authClient.verifyEmail({
                    query: { token: token! },
                })

                if (result.error) {
                    setState("error")
                    setErrorMessage(result.error.message || "Ocorreu um erro na verificação.")
                    return
                }

                // Fetch user role after verification
                const session = await authClient.getSession()
                if (session.data?.user) {
                    const role = (session.data.user as { role?: string }).role
                    setUserRole(role || "resident")
                }
                setState("success")
            }
            verifyEmail()
            return
        }

        // Case 4: No token - show check email message
        setState("no-token")
    }, [token, urlError, verified])

    function handleContinueToOnboarding() {
        if (userRole === "manager") {
            router.push("/onboarding/manager/personal")
        } else {
            router.push("/onboarding/resident/join")
        }
    }

    if (state === "loading") {
        return (
            <div className="text-center py-4">
                <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                <p className="mt-3 text-body text-gray-600">A verificar o seu email...</p>
            </div>
        )
    }

    if (state === "success") {
        return (
            <div className="space-y-4">
                <Alert variant="success">
                    Email verificado com sucesso!
                </Alert>
                <p className="text-body text-gray-600 text-center">
                    A sua conta está agora ativa. Continue para completar o seu registo.
                </p>
                <Button
                    className="w-full"
                    onClick={handleContinueToOnboarding}
                >
                    Continuar registo
                </Button>
            </div>
        )
    }

    if (state === "error") {
        return (
            <div className="space-y-4">
                <Alert variant="error">
                    {errorMessage}
                </Alert>
                <p className="text-body text-gray-600 text-center">
                    Pode solicitar um novo email de verificação.
                </p>
                <ResendVerificationButton />
            </div>
        )
    }

    // no-token state - show check email message
    return (
        <div className="space-y-4">
            <Alert variant="info">
                Verifique o seu email para completar o registo.
            </Alert>
            <p className="text-body text-gray-600 text-center">
                Enviámos um email com um link de verificação. Verifique a sua caixa de entrada e pasta de spam.
            </p>
            <ResendVerificationButton />
        </div>
    )
}
