"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { updateBuilding } from "@/app/actions/building"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Card, CardHeader, CardContent } from "@/components/ui/Card"

type Building = {
    id: string
    name: string
    nif: string
    code: string
    iban: string | null
    city: string | null
    street: string | null
    number: string | null
    quotaMode: string | null
    monthlyQuota: number | null
}

export function BuildingSettingsForm({ building }: { building: Building }) {
    const router = useRouter()
    const [isSaving, setIsSaving] = useState(false)
    const [formData, setFormData] = useState({
        name: building.name,
        nif: building.nif,
        iban: building.iban || "",
        city: building.city || "",
        street: building.street || "",
        number: building.number || "",
        quotaMode: building.quotaMode || "global",
    })
    const [monthlyQuotaStr, setMonthlyQuotaStr] = useState(
        building.monthlyQuota ? (building.monthlyQuota / 100).toString() : ""
    )

    const handleChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSaving(true)

        try {
            const parsedQuota = parseFloat(monthlyQuotaStr)
            await updateBuilding(building.id, {
                name: formData.name,
                nif: formData.nif,
                iban: formData.iban || null,
                city: formData.city || null,
                street: formData.street || null,
                number: formData.number || null,
                quotaMode: formData.quotaMode,
                monthlyQuota: monthlyQuotaStr && !isNaN(parsedQuota) ? Math.round(parsedQuota * 100) : 0,
            })
            router.refresh()
        } catch (error) {
            console.error("Failed to update building", error)
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <Card>
            <CardHeader>
                <h2 className="text-lg font-semibold">Building Details</h2>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <Input
                            label="Building Name"
                            value={formData.name}
                            onChange={e => handleChange("name", e.target.value)}
                            required
                        />
                        <Input
                            label="NIF"
                            value={formData.nif}
                            onChange={e => handleChange("nif", e.target.value)}
                            required
                        />
                        <Input
                            label="IBAN"
                            value={formData.iban}
                            onChange={e => handleChange("iban", e.target.value)}
                            placeholder="PT50..."
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Input
                            label="City"
                            value={formData.city}
                            onChange={e => handleChange("city", e.target.value)}
                        />
                        <Input
                            label="Street"
                            value={formData.street}
                            onChange={e => handleChange("street", e.target.value)}
                        />
                        <Input
                            label="Number"
                            value={formData.number}
                            onChange={e => handleChange("number", e.target.value)}
                        />
                    </div>

                    <div className="border-t border-gray-100 pt-6">
                        <h3 className="text-sm font-medium text-gray-700 mb-3">Monthly Quota</h3>
                        <div className="flex gap-4 mb-4">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="quotaMode"
                                    value="global"
                                    checked={formData.quotaMode === "global"}
                                    onChange={e => handleChange("quotaMode", e.target.value)}
                                    className="w-4 h-4"
                                />
                                <span className="text-sm">Same for all</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="quotaMode"
                                    value="permillage"
                                    checked={formData.quotaMode === "permillage"}
                                    onChange={e => handleChange("quotaMode", e.target.value)}
                                    className="w-4 h-4"
                                />
                                <span className="text-sm">Based on permillage</span>
                            </label>
                        </div>
                        <div className="max-w-[200px]">
                            <Input
                                label={formData.quotaMode === "global" ? "Monthly Value (€)" : "Base Value (€)"}
                                type="number"
                                step="0.01"
                                min="0"
                                value={monthlyQuotaStr}
                                onChange={e => setMonthlyQuotaStr(e.target.value)}
                            />
                            {formData.quotaMode === "permillage" && (
                                <p className="text-xs text-gray-500 mt-1">
                                    Apartment quota = Base × (permillage / 1000)
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="flex justify-end border-t border-gray-100 pt-4">
                        <Button type="submit" disabled={isSaving}>
                            {isSaving ? "Saving..." : "Save Changes"}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    )
}
