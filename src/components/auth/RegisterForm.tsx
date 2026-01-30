"use client"

import { useState, useTransition } from "react"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { PasswordInput } from "@/components/ui/PasswordInput"
import { FormField, FormLabel, FormControl, FormError, FormDescription } from "@/components/ui/Form-Field"
import { Alert } from "@/components/ui/Alert"
import { createAccount } from "@/lib/actions/auth"
import { isValidNif } from "@/lib/validations"

type FormErrors = {
    name?: string
    email?: string
    password?: string
    nif?: string
    form?: string
}

export function RegisterForm() {
    const [role, setRole] = useState<"manager" | "resident">("resident")
    const [isPending, startTransition] = useTransition()
    const [errors, setErrors] = useState<FormErrors>({})
    const [isCreating, setIsCreating] = useState(false)
    const [registeredEmail, setRegisteredEmail] = useState<string | null>(null)

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

        // Show loading screen immediately — signup runs in background
        setIsCreating(true)

        startTransition(async () => {
            const result = await createAccount({ name, email, password, nif, role })

            if (!result.success) {
                setIsCreating(false)
                setErrors({
                    form: result.error || "Ocorreu um erro ao criar conta",
                })
                return
            }

            // Show verification notice
            setRegisteredEmail(email)
        })
    }

    // Show loading screen while creating account
    if (isCreating && !registeredEmail) {
        return (
            <div className="flex flex-col items-center justify-center py-8 gap-3">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
                <p className="text-body text-gray-600">A criar a sua conta...</p>
            </div>
        )
    }

    // Show verification notice after successful registration
    if (registeredEmail) {
        return (
            <div className="space-y-4">
                <Alert variant="info">
                    Enviámos um email de verificação para <strong>{registeredEmail}</strong>.
                </Alert>
                <p className="text-body text-gray-600 text-center">
                    Verifique a sua caixa de entrada e pasta de spam. Após verificar o email, poderá completar o registo.
                </p>
                <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                        setRegisteredEmail(null)
                        setIsCreating(false)
                    }}
                >
                    Registar outra conta
                </Button>
            </div>
        )
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
                        <PasswordInput
                            {...props}
                            name="password"
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
                            placeholder="206578465"
                            maxLength={9}
                            required
                            onChange={(e) => {
                                e.target.value = e.target.value.replace(/\D/g, "")
                            }}
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