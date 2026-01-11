"use client"

import { useActionState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { FormField, FormLabel, FormControl, FormError } from "@/components/ui/Form-Field"
import { loginAction } from "./actions"

export function LoginForm() {
    const router = useRouter()
    const [state, formAction, isPending] = useActionState(loginAction, null)

    // Redirect on success
    useEffect(() => {
        if (state?.success) {
            router.push("/dashboard")
        }
    }, [state?.success, router])

    return (
        <form action={formAction} className="space-y-4">
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

            {state?.error && <p className="text-label text-error">{state.error}</p>}

            <Button type="submit" className="w-full" disabled={isPending}>
                {isPending ? "A entrar..." : "Entrar"}
            </Button>
        </form>
    )
}