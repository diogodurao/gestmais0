"use client"

import { useActionState, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { FormField, FormLabel, FormControl, FormError, FormDescription } from "@/components/ui/Form-Field"
import { registerAction } from "@/app/actions/auth"

export function RegisterForm() {
    const router = useRouter()
    const [role, setRole] = useState<"manager" | "resident">("resident")
    const [state, formAction, isPending] = useActionState(registerAction, null)

    // Redirect on success - different route based on role
    useEffect(() => {
        if (state?.success && state?.role) {
            if (state.role === "manager") {
                router.push("/onboarding/manager/personal")
            } else {
                router.push("/onboarding/resident/join")
            }
        }
    }, [state?.success, state?.role, router])

    return (
        <form action={formAction} className="space-y-4">
            <div className="flex gap-2">
                <Button
                    type="button"
                    variant={role === "resident" ? "primary" : "outline"}
                    className="w-full"
                    onClick={() => setRole("resident")}
                >
                    Residente
                </Button>
                <Button
                    type="button"
                    variant={role === "manager" ? "primary" : "outline"}
                    className="w-full"
                    onClick={() => setRole("manager")}
                >
                    Gestor
                </Button>
            </div>

            <input type="hidden" name="role" value={role} />

            <FormField error={state?.errors?.name} required>
                <FormLabel>Nome Completo</FormLabel>
                <FormControl>
                    {(props) => (
                        <Input
                            {...props}
                            name="name"
                            type="text"
                            placeholder="Tiago Silva"
                            autoComplete="name"
                            required
                        />
                    )}
                </FormControl>
                <FormError />
            </FormField>

            <FormField error={state?.errors?.email} required>
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

            <FormField error={state?.errors?.password} required>
                <FormLabel>Palavra-passe</FormLabel>
                <FormControl>
                    {(props) => (
                        <Input
                            {...props}
                            name="password"
                            type="password"
                            placeholder="••••••••"
                            autoComplete="new-password"
                            required
                        />
                    )}
                </FormControl>
                <FormDescription>
                    Mínimo 8 caracteres, 1 maiúscula, 1 minúscula, 1 número
                </FormDescription>
                <FormError />
            </FormField>

            <FormField error={state?.errors?.nif} required>
                <FormLabel>{role === "manager" ? "NIF Pessoal" : "NIF"}</FormLabel>
                <FormControl>
                    {(props) => (
                        <Input
                            {...props}
                            name="nif"
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            placeholder="206578465"
                            maxLength={9}
                            required
                        />
                    )}
                </FormControl>
                <FormError />
            </FormField>

            {state?.errors?.form && (
                <p className="text-label text-error text-center">{state.errors.form}</p>
            )}

            <Button type="submit" className="w-full" disabled={isPending}>
                {isPending ? "A criar conta..." : "Registar"}
            </Button>
        </form>
    )
}