"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { FormField, FormLabel, FormControl, FormError } from "@/components/ui/Form-Field"
import { authClient } from "@/lib/auth-client"

export function LoginForm() {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()
    const [error, setError] = useState<string | null>(null)

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setError(null)

        const formData = new FormData(e.currentTarget)
        const email = formData.get("email") as string
        const password = formData.get("password") as string

        if (!email || !password) {
            setError("Email e palavra-passe são obrigatórios")
            return
        }

        startTransition(async () => {
            const result = await authClient.signIn.email({
                email,
                password,
            })

            if (result.error) {
                setError(result.error.message || "Credenciais inválidas")
                return
            }

            router.push("/dashboard")
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

            <FormField required>
                <FormLabel>Palavra-passe</FormLabel>
                <FormControl>
                    {(props) => (
                        <Input
                            {...props}
                            name="password"
                            type="password"
                            placeholder="••••••••"
                            autoComplete="current-password"
                            required
                        />
                    )}
                </FormControl>
                <FormError />
            </FormField>

            {error && <p className="text-label text-error">{error}</p>}

            <Button type="submit" className="w-full" disabled={isPending}>
                {isPending ? "A entrar..." : "Entrar"}
            </Button>
        </form>
    )
}