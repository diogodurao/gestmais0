"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { updateBuilding } from "@/app/actions/building"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Card, CardHeader, CardContent } from "@/components/ui/Card"
import { Pencil, Building2, MapPin, Wallet, Calculator } from "lucide-react"
import { isValidIban } from "@/lib/validations"

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
    totalApartments: number | null
}

export function BuildingSettingsForm({ building }: { building: Building }) {
    const router = useRouter()
    const [isEditing, setIsEditing] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [error, setError] = useState("")
    const [formData, setFormData] = useState({
        name: building.name,
        nif: building.nif,
        iban: building.iban || "",
        city: building.city || "",
        street: building.street || "",
        number: building.number || "",
        quotaMode: building.quotaMode || "global",
        totalApartments: building.totalApartments?.toString() || "",
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
        setError("")

        const requiredFilled =
            formData.name.trim() &&
            formData.nif.trim() &&
            formData.iban.trim() &&
            formData.city.trim() &&
            formData.street.trim() &&
            formData.number.trim() &&
            formData.totalApartments.trim() &&
            monthlyQuotaStr.trim()

        if (!requiredFilled) {
            setError("Please fill all building fields before saving.")
            setIsSaving(false)
            return
        }

        if (!isValidIban(formData.iban)) {
            setError("IBAN must have exactly 25 alphanumeric characters.")
            setIsSaving(false)
            return
        }

        const parsedQuota = parseFloat(monthlyQuotaStr)
        if (isNaN(parsedQuota) || parsedQuota <= 0) {
            setError("Monthly quota must be a positive number.")
            setIsSaving(false)
            return
        }

        const parsedTotalUnits = parseInt(formData.totalApartments)
        if (isNaN(parsedTotalUnits) || parsedTotalUnits <= 0) {
            setError("Total units must be a positive number.")
            setIsSaving(false)
            return
        }

        try {
            await updateBuilding(building.id, {
                name: formData.name,
                nif: formData.nif,
                iban: formData.iban || null,
                city: formData.city || null,
                street: formData.street || null,
                number: formData.number || null,
                quotaMode: formData.quotaMode,
                monthlyQuota: Math.round(parsedQuota * 100),
                totalApartments: parsedTotalUnits,
            })
            setIsEditing(false)
            router.refresh()
        } catch (error) {
            console.error("Failed to update building", error)
        } finally {
            setIsSaving(false)
        }
    }

    const handleCancel = () => {
        setIsEditing(false)
        setFormData({
            name: building.name,
            nif: building.nif,
            iban: building.iban || "",
            city: building.city || "",
            street: building.street || "",
            number: building.number || "",
            quotaMode: building.quotaMode || "global",
            totalApartments: building.totalApartments?.toString() || "",
        })
        setMonthlyQuotaStr(building.monthlyQuota ? (building.monthlyQuota / 100).toString() : "")
    }

    if (!isEditing) {
        return (
            <Card>
                <CardHeader className="flex flex-row items-center justify-between py-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-50 rounded-lg">
                            <Building2 className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                            <h2 className="text-base font-semibold text-gray-900">{building.name}</h2>
                            <p className="text-xs text-gray-500">NIF: {building.nif} • {building.totalApartments || 0} Units</p>
                        </div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)}>
                        <Pencil className="w-4 h-4 mr-2" /> Edit
                    </Button>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6 py-4 bg-gray-50/50">
                    <div className="flex gap-3">
                        <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                        <div>
                            <p className="text-xs font-medium text-gray-500 uppercase mb-1">Location</p>
                            <p className="text-sm text-gray-900">{building.street || "No street"} {building.number ? `, ${building.number}` : ""}</p>
                            <p className="text-sm text-gray-600">{building.city || "No city"}</p>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <Wallet className="w-4 h-4 text-gray-400 mt-0.5" />
                        <div>
                            <p className="text-xs font-medium text-gray-500 uppercase mb-1">Bank Info</p>
                            <p className="text-sm text-gray-900 break-all">{building.iban || "No IBAN configured"}</p>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <Calculator className="w-4 h-4 text-gray-400 mt-0.5" />
                        <div>
                            <p className="text-xs font-medium text-gray-500 uppercase mb-1">Quota Settings</p>
                            <div className="flex items-center gap-2">
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                    {building.quotaMode === "permillage" ? "Permillage Based" : "Fixed Global"}
                                </span>
                                <span className="text-sm font-semibold">
                                    {building.monthlyQuota ? `€${(building.monthlyQuota / 100).toFixed(2)}` : "€0.00"}
                                </span>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <h2 className="text-lg font-semibold">Edit Building Details</h2>
                <Button variant="ghost" size="sm" onClick={handleCancel}>Cancel</Button>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                    {error && <div className="p-3 rounded-md bg-red-50 border border-red-200 text-sm text-red-700">{error}</div>}
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <Input label="Building Name" value={formData.name} onChange={e => handleChange("name", e.target.value)} required />
                        <Input label="NIF" value={formData.nif} onChange={e => handleChange("nif", e.target.value)} required />
                        <Input label="Total Units" type="number" value={formData.totalApartments} onChange={e => handleChange("totalApartments", e.target.value)} required />
                        <Input label="IBAN" value={formData.iban} onChange={e => handleChange("iban", e.target.value)} placeholder="PT50..." required />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Input label="City" value={formData.city} onChange={e => handleChange("city", e.target.value)} />
                        <Input label="Street" value={formData.street} onChange={e => handleChange("street", e.target.value)} />
                        <Input label="Number" value={formData.number} onChange={e => handleChange("number", e.target.value)} />
                    </div>

                    <div className="border-t border-gray-100 pt-6">
                        <h3 className="text-sm font-medium text-gray-700 mb-3">Monthly Quota</h3>
                        <div className="flex gap-4 mb-4">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="radio" name="quotaMode" value="global" checked={formData.quotaMode === "global"} onChange={e => handleChange("quotaMode", e.target.value)} className="w-4 h-4" />
                                <span className="text-sm">Same for all</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="radio" name="quotaMode" value="permillage" checked={formData.quotaMode === "permillage"} onChange={e => handleChange("quotaMode", e.target.value)} className="w-4 h-4" />
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
                                <p className="text-xs text-gray-500 mt-1">Apartment quota = Base × (permillage / 1000)</p>
                            )}
                        </div>
                    </div>

                    <div className="flex justify-end border-t border-gray-100 pt-4 gap-3">
                        <Button type="button" variant="ghost" onClick={handleCancel}>Cancel</Button>
                        <Button type="submit" disabled={isSaving}>{isSaving ? "Saving..." : "Save Changes"}</Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    )
}