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

                    setError(ctx.error.message || "Failed to sign in")
                    setLoading(false)
                }
            })
        } catch (err) {
            setError("An unexpected error occurred")
            setLoading(false) // Ensure loading is reset even for unexpected errors outside authClient callbacks
        } finally {
            // setLoading(false) // Moved to onError callback or handled by onSuccess navigation
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <Input
                label="Email"
                type="email"
                placeholder="you@example.com"
                required
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            />
            <Input
                label="Password"
                type="password"
                placeholder="••••••••"
                required
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
            />

            {error && <p className="text-sm text-red-600">{error}</p>}

            <Button type="submit" fullWidth disabled={loading}>
                {loading ? "Signing in..." : "Sign In"}
            </Button>
        </form>
    )
}
