"use client"

import { useState, useTransition } from "react"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { FormField, FormLabel, FormControl, FormError } from "@/components/ui/Form-Field"
import { Alert } from "@/components/ui/Alert"
import { authClient } from "@/lib/auth-client"

export function ResendVerificationButton() {
    const [isPending, startTransition] = useTransition()
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)
    const [showEmailInput, setShowEmailInput] = useState(false)

    async function handleResend(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setError(null)
        setSuccess(false)

        const formData = new FormData(e.currentTarget)
        const email = formData.get("email") as string

        if (!email?.trim()) {
            setError("Email é obrigatório")
            return
        }

        startTransition(async () => {
            const result = await authClient.sendVerificationEmail({
                email,
                callbackURL: "/verify-email",
            })

            if (result.error) {
                setError(result.error.message || "Ocorreu um erro. Tente novamente.")
                return
            }

            setSuccess(true)
        })
    }

    if (success) {
        return (
            <Alert variant="success">
                Email de verificação enviado! Verifique a sua caixa de entrada.
            </Alert>
        )
    }

    if (!showEmailInput) {
        return (
            <Button
                variant="outline"
                className="w-full"
                onClick={() => setShowEmailInput(true)}
            >
                Reenviar email de verificação
            </Button>
        )
    }

    return (
        <form onSubmit={handleResend} className="space-y-3">
            <FormField required>
                <FormLabel>Email</FormLabel>
                <FormControl>
                    {(props) => (
                        <Input
                            {...props}
                            name="email"
                            type="email"
                            placeholder="tiago123@gmail.com"
                            autoComplete="email"
                            required
                        />
                    )}
                </FormControl>
                <FormError />
            </FormField>

            {error && <p className="text-label text-error">{error}</p>}

            <div className="flex gap-2">
                <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => setShowEmailInput(false)}
                >
                    Cancelar
                </Button>
                <Button type="submit" className="flex-1" disabled={isPending}>
                    {isPending ? "A enviar..." : "Enviar"}
                </Button>
            </div>
        </form>
    )
}
