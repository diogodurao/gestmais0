"use client"

import { useState } from "react"
import { authClient } from "@/lib/auth-client"

import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { isValidNif } from "@/lib/validations"

export function RegisterForm() {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const [role, setRole] = useState<"manager" | "resident">("resident")


    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        nif: ""
    })

    const handleSubmit = async (e: React.FormEvent): Promise<void> => {
        e.preventDefault()
        setLoading(true)
        setError("")

        // NIF Validation
        if (!isValidNif(formData.nif)) {
            setError("Invalid NIF format. Please check your NIF.")
            setLoading(false)
            return
        }

        // Password Validation
        const passwordErrors = validatePassword(formData.password)
        if (passwordErrors.length > 0) {
            setError(`Password requirements not met: ${passwordErrors.join(", ")}`)
            setLoading(false)
            return
        }

        try {
            await authClient.signUp.email({
                email: formData.email,
                password: formData.password,
                name: formData.name,
                // Helper cast for custom fields configured in server
                role: role,
                nif: formData.nif,
                callbackURL: "/dashboard"
            } as Parameters<typeof authClient.signUp.email>[0] & { role: string; nif: string }, {
                onRequest: () => {

                    setLoading(true)
                },

                onError: (ctx) => {

                    setError(ctx.error.message || "Failed to create account")
                    setLoading(false)
                }
            })
        } catch (err) {
            setError("An unexpected error occurred")
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {/* Role Selection */}
            <div className="flex gap-2 mb-4">
                <Button
                    type="button"
                    variant={role === "resident" ? "primary" : "outline"}
                    fullWidth
                    onClick={() => setRole("resident")}
                >
                    Resident
                </Button>
                <Button
                    type="button"
                    variant={role === "manager" ? "primary" : "outline"}
                    fullWidth
                    onClick={() => setRole("manager")}
                >
                    Manager
                </Button>
            </div>

            <Input
                label="Full Name"
                type="text"
                placeholder="John Doe"
                required
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            />
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
                onChange={(e) => {
                    const newPassword = e.target.value
                    setFormData(prev => ({ ...prev, password: newPassword }))

                    // Real-time validation feedback (optional, but good UX)
                    const passwordErrors = []
                    if (newPassword.length < 8) passwordErrors.push("At least 8 characters")
                    if (!/[A-Z]/.test(newPassword)) passwordErrors.push("At least one uppercase letter")
                    if (!/[a-z]/.test(newPassword)) passwordErrors.push("At least one lowercase letter")
                    if (!/\d/.test(newPassword)) passwordErrors.push("At least one number")

                    // We only show these errors if the user has tried to submit or if we want real-time feedback.
                    // For now, sticking to the requested simple validation on submit, but the input is ready.
                }}
            />
            {/* Password Strength Indicators could go here, but for now we validate on submit as requested */}
            <Input
                label={role === "manager" ? "Personal NIF" : "NIF"}
                type="text"
                placeholder="123456789"
                required
                maxLength={9}
                value={formData.nif}
                onChange={(e) => setFormData(prev => ({ ...prev, nif: e.target.value }))}
            />

            {error && <p className="text-sm text-red-600">{error}</p>}

            <Button type="submit" fullWidth disabled={loading}>
                {loading ? "Creating Account..." : "Sign Up"}
            </Button>
        </form>
    )
}

const validatePassword = (password: string): string[] => {
    const errors: string[] = []
    if (password.length < 8) errors.push("At least 8 characters")
    if (!/[A-Z]/.test(password)) errors.push("At least one uppercase letter")
    if (!/[a-z]/.test(password)) errors.push("At least one lowercase letter")
    if (!/\d/.test(password)) errors.push("At least one number")
    return errors
}
