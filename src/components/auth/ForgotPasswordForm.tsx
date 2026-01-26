"use client"

import { useState, useTransition } from "react"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { FormField, FormLabel, FormControl, FormError } from "@/components/ui/Form-Field"
import { authClient } from "@/lib/auth-client"

interface ForgotPasswordFormProps {
    onSuccess: () => void
}

export function ForgotPasswordForm({ onSuccess }: ForgotPasswordFormProps) {
    const [isPending, startTransition] = useTransition()
    const [error, setError] = useState<string | null>(null)

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setError(null)

        const formData = new FormData(e.currentTarget)
        const email = formData.get("email") as string

        if (!email?.trim()) {
            setError("Email é obrigatório")
            return
        }

        startTransition(async () => {
            const result = await authClient.requestPasswordReset({
                email,
                redirectTo: "/reset-password",
            })

            if (result.error) {
                setError(result.error.message || "Ocorreu um erro. Tente novamente.")
                return
            }

            onSuccess()
        })
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
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

            <Button type="submit" className="w-full" disabled={isPending}>
                {isPending ? "A enviar..." : "Enviar link de recuperação"}
            </Button>
        </form>
    )
}
