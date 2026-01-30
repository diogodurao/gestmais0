"use client"

import { useState, useTransition } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/Button"
import { PasswordInput } from "@/components/ui/PasswordInput"
import { FormField, FormLabel, FormControl, FormError, FormDescription } from "@/components/ui/Form-Field"
import { Alert } from "@/components/ui/Alert"
import { authClient } from "@/lib/auth-client"
import Link from "next/link"

type FormErrors = {
    password?: string
    confirmPassword?: string
    form?: string
}

export function ResetPasswordForm() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const [isPending, startTransition] = useTransition()
    const [errors, setErrors] = useState<FormErrors>({})
    const [success, setSuccess] = useState(false)

    const token = searchParams.get("token")
    const urlError = searchParams.get("error")

    // Invalid or expired token
    if (urlError === "INVALID_TOKEN" || !token) {
        return (
            <div className="space-y-4">
                <Alert variant="error">
                    {urlError === "INVALID_TOKEN"
                        ? "O link de recuperação expirou ou é inválido."
                        : "Link de recuperação inválido."}
                </Alert>
                <p className="text-body text-gray-600 text-center">
                    <Link
                        href="/forgot-password"
                        className="text-primary hover:underline font-medium"
                    >
                        Solicitar novo link
                    </Link>
                </p>
            </div>
        )
    }

    // Success state
    if (success) {
        return (
            <div className="space-y-4">
                <Alert variant="success">
                    Palavra-passe alterada com sucesso!
                </Alert>
                <Button
                    className="w-full"
                    onClick={() => router.push("/sign-in")}
                >
                    Ir para o login
                </Button>
            </div>
        )
    }

    function validatePassword(password: string): string | undefined {
        if (!password) return "Palavra-passe é obrigatória"
        if (password.length < 8) return "Mínimo 8 caracteres"
        if (!/[A-Z]/.test(password)) return "Pelo menos uma letra maiúscula"
        if (!/[a-z]/.test(password)) return "Pelo menos uma letra minúscula"
        if (!/\d/.test(password)) return "Pelo menos um número"
        return undefined
    }

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setErrors({})

        const formData = new FormData(e.currentTarget)
        const password = formData.get("password") as string
        const confirmPassword = formData.get("confirmPassword") as string

        const newErrors: FormErrors = {}

        const passwordError = validatePassword(password)
        if (passwordError) {
            newErrors.password = passwordError
        }

        if (password !== confirmPassword) {
            newErrors.confirmPassword = "As palavras-passe não coincidem"
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors)
            return
        }

        startTransition(async () => {
            const result = await authClient.resetPassword({
                newPassword: password,
                token: token!,
            })

            if (result.error) {
                setErrors({
                    form: result.error.message || "Ocorreu um erro. Tente novamente.",
                })
                return
            }

            setSuccess(true)
        })
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <FormField error={errors.password} required>
                <FormLabel>Nova palavra-passe</FormLabel>
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

            <FormField error={errors.confirmPassword} required>
                <FormLabel>Confirmar palavra-passe</FormLabel>
                <FormControl>
                    {(props) => (
                        <PasswordInput
                            {...props}
                            name="confirmPassword"
                            placeholder="••••••••"
                            autoComplete="new-password"
                            required
                        />
                    )}
                </FormControl>
                <FormError />
            </FormField>

            {errors.form && <p className="text-label text-error text-center">{errors.form}</p>}

            <Button type="submit" className="w-full" disabled={isPending}>
                {isPending ? "A guardar..." : "Guardar nova palavra-passe"}
            </Button>
        </form>
    )
}
