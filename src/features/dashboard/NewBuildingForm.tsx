"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createNewBuilding } from "@/app/actions/building"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Card, CardHeader, CardContent } from "@/components/ui/Card"
import { Building2 } from "lucide-react"
import { authClient } from "@/lib/auth-client"

export function NewBuildingForm() {
    const router = useRouter()
    const [isSaving, setIsSaving] = useState(false)
    const [error, setError] = useState("")
    const [formData, setFormData] = useState({
        name: "",
        nif: "",
    })

    const handleChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSaving(true)
        setError("")

        try {
            const session = await authClient.getSession()
            if (!session?.data?.user?.id) {
                throw new Error("Not authenticated")
            }

            await createNewBuilding(
                session.data.user.id,
                formData.name,
                formData.nif
            )
            router.push("/dashboard/settings")
            router.refresh()
        } catch (err) {
            console.error("Failed to create building", err)
            setError("Failed to create building. Please try again.")
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                        <Building2 className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold">New Building</h2>
                        <p className="text-sm text-gray-500">Enter the basic details for your new building</p>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                        label="Building Name"
                        placeholder="e.g., Edifício Mar Azul"
                        value={formData.name}
                        onChange={e => handleChange("name", e.target.value)}
                        required
                    />
                    <Input
                        label="Building NIF"
                        placeholder="e.g., 123456789"
                        value={formData.nif}
                        onChange={e => handleChange("nif", e.target.value)}
                        required
                    />

                    {error && (
                        <p className="text-sm text-red-500">{error}</p>
                    )}

                    <div className="flex gap-3 pt-2">
                        <Button type="submit" disabled={isSaving}>
                            {isSaving ? "Creating..." : "Create Building"}
                        </Button>
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => router.push("/dashboard/settings")}
                        >
                            Cancel
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    )
}

