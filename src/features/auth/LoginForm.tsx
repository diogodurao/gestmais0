"use client"

import { useState } from "react"
import { authClient } from "@/lib/auth-client"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { ROUTES } from "@/lib/routes"

export function LoginForm() {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const router = useRouter()

    const [formData, setFormData] = useState({
        email: "",
        password: ""
    })

    const handleSubmit = async (e: React.FormEvent): Promise<void> => {
        e.preventDefault()
        setLoading(true)
        setError("")

        try {
            await authClient.signIn.email({
                email: formData.email,
                password: formData.password,
                callbackURL: ROUTES.DASHBOARD.HOME
            }, {
                onRequest: () => {
                    setLoading(true)
                },
                onSuccess: () => {
                    router.push("/dashboard")
                },
                onError: (ctx) => {
                    setError(ctx.error.message || "Credenciais inválidas")
                    setLoading(false)
                }
            })
        } catch (err) {
            setError("Ocorreu um erro")
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <Input
                label="Email"
                type="email"
                placeholder="tiago123@gmail.com"
                required
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            />
            <Input
                label="Palavra-passe"
                type="password"
                placeholder="••••••••"
                required
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
            />

            {error && <p className="text-sm text-red-600">{error}</p>}

            <Button type="submit" fullWidth disabled={loading}>
                {loading ? "A entrar..." : "Entrar"}
            </Button>
        </form>
    )
}