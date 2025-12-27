"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { updateBuilding } from "@/app/actions/building"
import { Button } from "@/components/ui/Button"
import { Card, CardHeader, CardTitle } from "@/components/ui/Card"
import { Building2 } from "lucide-react"
import { isBuildingComplete } from "@/lib/validations"

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
    const [isSaving, setIsSaving] = useState(false)
    const [error, setError] = useState("")
    const [formData, setFormData] = useState({
        nif: building.nif,
        iban: building.iban || "",
        city: building.city || "",
        street: building.street || "",
        number: building.number || "",
        quotaMode: building.quotaMode || "global",
        totalApartments: building.totalApartments?.toString() || "",
    })
    const [monthlyQuotaStr, setMonthlyQuotaStr] = useState(
        building.monthlyQuota ? (building.monthlyQuota / 100).toFixed(2) : ""
    )

    const handleChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }))
        if (error) setError("")
    }

    const handleSubmit = async (e: React.FormEvent): Promise<void> => {
        e.preventDefault()
        setIsSaving(true)
        setError("")

        const parsedQuota = parseFloat(monthlyQuotaStr)
        const parsedTotalUnits = parseInt(formData.totalApartments)

        try {
            const result = await updateBuilding(building.id, {
                ...formData,
                name: `${formData.street} ${formData.number}`, // Auto-generate name
                iban: formData.iban || null,
                city: formData.city || null,
                street: formData.street || null,
                number: formData.number || null,
                monthlyQuota: isNaN(parsedQuota) ? 0 : Math.round(parsedQuota * 100),
                totalApartments: isNaN(parsedTotalUnits) ? 0 : parsedTotalUnits,
            })
            if (result.success) {
                router.refresh()
            } else {
                setError(result.error || "Update failed")
            }
        } catch (error) {
            console.error("Failed to update building", error)
            setError("Update failed")
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <div className="space-y-4">
            <Card className="mt-8">
                <CardHeader>
                    <CardTitle>
                        <Building2 className="w-3.5 h-3.5" />
                        BUILDING_PARAMETERS
                    </CardTitle>
                    <button type="button" className="text-[10px] text-blue-600 hover:underline">Edit Mode</button>
                </CardHeader>

                <form onSubmit={handleSubmit} className="p-0">
                    <div className="grid grid-cols-1 md:grid-cols-[140px_1fr] border-b border-slate-100">
                        <div className="label-col border-none">Building Code</div>
                        <div className="value-col border-none bg-slate-50 text-slate-500 px-3 py-1.5 font-mono text-xs uppercase">
                            {building.code}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-[140px_1fr] border-b border-slate-100">
                        <div className="label-col border-none">Street Line</div>
                        <div className="value-col border-none">
                            <input
                                type="text"
                                value={formData.street}
                                onChange={e => handleChange("street", e.target.value)}
                                className="input-cell h-8"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-[140px_1fr] border-b border-slate-100">
                        <div className="label-col border-none">Number / City</div>
                        <div className="value-col border-none grid grid-cols-2">
                            <input
                                type="text"
                                value={formData.number}
                                onChange={e => handleChange("number", e.target.value)}
                                className="input-cell h-8 border-r border-slate-100"
                                placeholder="Nº"
                            />
                            <input
                                type="text"
                                value={formData.city}
                                onChange={e => handleChange("city", e.target.value)}
                                className="input-cell h-8"
                                placeholder="CITY"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-[140px_1fr] border-b border-slate-100">
                        <div className="label-col border-none">Building NIF</div>
                        <div className="value-col border-none">
                            <input
                                type="text"
                                value={formData.nif}
                                onChange={e => handleChange("nif", e.target.value)}
                                className="input-cell h-8 font-mono"
                                maxLength={9}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-[140px_1fr] border-b border-slate-100">
                        <div className="label-col border-none">Building IBAN</div>
                        <div className="value-col border-none">
                            <input
                                type="text"
                                value={formData.iban}
                                onChange={e => handleChange("iban", e.target.value)}
                                className="input-cell h-8 font-mono uppercase"
                            />
                        </div>
                    </div>

                    <div className="bg-slate-50 px-4 py-2 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase">
                        FINANCIAL CONFIGURATION
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-[140px_1fr] border-b border-slate-100">
                        <div className="label-col border-none">Calculation Mode</div>
                        <div className="value-col border-none p-2 flex flex-col sm:flex-row gap-4 bg-white">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="quota"
                                    checked={formData.quotaMode === "global"}
                                    onChange={() => handleChange("quotaMode", "global")}
                                    className="w-3.5 h-3.5 accent-blue-600"
                                />
                                <span className="text-xs">Global Fixed (Equal)</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="quota"
                                    checked={formData.quotaMode === "permillage"}
                                    onChange={() => handleChange("quotaMode", "permillage")}
                                    className="w-3.5 h-3.5 accent-blue-600"
                                />
                                <span className="text-xs">Permillage Based</span>
                            </label>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-[140px_1fr]">
                        <div className="label-col border-none">Base Value (€)</div>
                        <div className="value-col border-none relative">
                            <input
                                type="number"
                                value={monthlyQuotaStr}
                                onChange={e => setMonthlyQuotaStr(e.target.value)}
                                className="input-cell h-8 font-mono font-bold text-slate-700"
                                placeholder="0.00"
                            />
                            <div className="absolute right-2 top-1.5 flex flex-col pointer-events-none opacity-50">
                                <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 15l7-7 7 7" /></svg>
                                <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M19 9l-7 7-7-7" /></svg>
                            </div>
                        </div>
                    </div>

                    <div className="p-3 flex justify-end border-t border-slate-100">
                        <Button type="submit" size="xs" isLoading={isSaving} variant="primary">
                            Save Changes
                        </Button>
                    </div>
                </form>
            </Card>
            {error && <p className="text-[10px] text-rose-600 font-bold uppercase text-right">{error}</p>}
        </div>
    )
}
