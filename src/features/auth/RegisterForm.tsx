"use client"

import { useState } from "react"
import { authClient } from "@/lib/auth-client"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { isValidNif } from "@/lib/validations"

import { useRouter } from "next/navigation"

export function RegisterForm() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [errors, setErrors] = useState<{
        name?: string
        email?: string
        password?: string
        nif?: string
        form?: string
    }>({})
    const [role, setRole] = useState<"manager" | "resident">("resident")

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        nif: ""
    })

    const validatePassword = (password: string): string[] => {
        const errors: string[] = []
        if (password.length < 8) errors.push("Mínimo 8 caracteres")
        if (!/[A-Z]/.test(password)) errors.push("Pelo menos uma letra maiúscula")
        if (!/[a-z]/.test(password)) errors.push("Pelo menos uma letra minúscula")
        if (!/\d/.test(password)) errors.push("Pelo menos um número")
        return errors
    }

    const validateForm = (): boolean => {
        const newErrors: typeof errors = {}
        let isValid = true

        if (!formData.name.trim()) {
            newErrors.name = "Nome é obrigatório"
            isValid = false
        }

        if (!formData.email.trim()) {
            newErrors.email = "Email é obrigatório"
            isValid = false
        }

        const passwordValidation = validatePassword(formData.password)
        if (passwordValidation.length > 0) {
            newErrors.password = passwordValidation[0]
            isValid = false
        }

        if (!isValidNif(formData.nif)) {
            newErrors.nif = "NIF inválido"
            isValid = false
        }

        setErrors(newErrors)
        return isValid
    }

    const handleSubmit = async (e: React.FormEvent): Promise<void> => {
        e.preventDefault()
        setLoading(true)
        setErrors({})

        if (!validateForm()) {
            setLoading(false)
            return
        }

        try {
            await authClient.signUp.email({
                email: formData.email,
                password: formData.password,
                name: formData.name,
                role: role,
                nif: formData.nif,
                callbackURL: "/dashboard"
            } as Parameters<typeof authClient.signUp.email>[0] & { role: string; nif: string }, {
                onRequest: () => {
                    setLoading(true)
                },
                onSuccess: () => {
                    router.push("/dashboard")
                },
                onError: (ctx) => {
                    setErrors({ form: ctx.error.message || "Ocorreu um erro ao criar conta" })
                    setLoading(false)
                }
            })
        } catch (err) {
            setErrors({ form: "Ocorreu um erro inesperado" })
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex gap-2 mb-4">
                <Button
                    type="button"
                    variant={role === "resident" ? "primary" : "outline"}
                    fullWidth
                    onClick={() => setRole("resident")}
                >
                    Residente
                </Button>
                <Button
                    type="button"
                    variant={role === "manager" ? "primary" : "outline"}
                    fullWidth
                    onClick={() => setRole("manager")}
                >
                    Gestor
                </Button>
            </div>

            <div>
                <Input
                    label="Nome Completo"
                    type="text"
                    placeholder="Tiago Silva"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className={errors.name ? "border-red-500" : ""}
                />
                {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
            </div>

            <div>
                <Input
                    label="Email"
                    type="email"
                    placeholder="tiago123@gmail.com"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className={errors.email ? "border-red-500" : ""}
                />
                {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
            </div>

            <div>
                <Input
                    label="Palavra-passe"
                    type="password"
                    placeholder="••••••••"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    className={errors.password ? "border-red-500" : ""}
                />
                {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
                <p className="text-[10px] text-slate-400 mt-1">
                    Mínimo 8 caracteres, 1 maiúscula, 1 minúscula, 1 número
                </p>
            </div>

            <div>
                <Input
                    label={role === "manager" ? "NIF Pessoal" : "NIF"}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    placeholder="206578465"
                    required
                    maxLength={9}
                    value={formData.nif}
                    onChange={(e) => setFormData(prev => ({ ...prev, nif: e.target.value.replace(/\D/g, '') }))}
                    className={errors.nif ? "border-red-500" : ""}
                />
                {errors.nif && <p className="text-xs text-red-500 mt-1">{errors.nif}</p>}
            </div>

            {errors.form && <p className="text-sm text-red-600 text-center">{errors.form}</p>}

            <Button type="submit" fullWidth disabled={loading}>
                {loading ? "A criar conta..." : "Registar"}
            </Button>
        </form>
    )
}