"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { FormField, FormLabel, FormControl, FormError, FormDescription } from "@/components/ui/Form-Field"
import { authClient } from "@/lib/auth-client"
import { isValidNif } from "@/lib/validations"

type FormErrors = {
    name?: string
    email?: string
    password?: string
    nif?: string
    form?: string
}

export function RegisterForm() {
    const router = useRouter()
    const [role, setRole] = useState<"manager" | "resident">("resident")
    const [isPending, startTransition] = useTransition()
    const [errors, setErrors] = useState<FormErrors>({})

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setErrors({})

        const formData = new FormData(e.currentTarget)
        const name = formData.get("name") as string
        const email = formData.get("email") as string
        const password = formData.get("password") as string
        const nif = formData.get("nif") as string

        const newErrors: FormErrors = {}

        // Validation
        if (!name?.trim()) {
            newErrors.name = "Nome é obrigatório"
        }

        if (!email?.trim()) {
            newErrors.email = "Email é obrigatório"
        }

        if (!password) {
            newErrors.password = "Palavra-passe é obrigatória"
        } else if (password.length < 8) {
            newErrors.password = "Mínimo 8 caracteres"
        } else if (!/[A-Z]/.test(password)) {
            newErrors.password = "Pelo menos uma letra maiúscula"
        } else if (!/[a-z]/.test(password)) {
            newErrors.password = "Pelo menos uma letra minúscula"
        } else if (!/\d/.test(password)) {
            newErrors.password = "Pelo menos um número"
        }

        if (!isValidNif(nif)) {
            newErrors.nif = "NIF inválido"
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors)
            return
        }

        startTransition(async () => {
            const result = await authClient.signUp.email({
                email,
                password,
                name,
                role,
                nif,
            } as Parameters<typeof authClient.signUp.email>[0] & { role: string; nif: string })

            if (result.error) {
                setErrors({
                    form: result.error.message || "Ocorreu um erro ao criar conta",
                })
                return
            }

            // Redirect based on role
            if (role === "manager") {
                router.push("/onboarding/manager/personal")
            } else {
                router.push("/onboarding/resident/join")
            }
        })
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
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

            <FormField error={errors.name} required>
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

            <FormField error={errors.email} required>
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

            <FormField error={errors.password} required>
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

            <FormField error={errors.nif} required>
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

            {errors.form && (
                <p className="text-label text-error text-center">{errors.form}</p>
            )}

            <Button type="submit" className="w-full" disabled={isPending}>
                {isPending ? "A criar conta..." : "Registar"}
            </Button>
        </form>
    )
}