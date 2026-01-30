"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { updateBuilding } from "@/lib/actions/building"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { FormField, FormLabel } from "@/components/ui/Form-Field"
import { Divider } from "@/components/ui/Divider"
import { useAsyncAction } from "@/hooks/useAsyncAction"
import { Building2, Edit, Save, Check, AlertCircle } from "lucide-react"
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
    paymentDueDay: number | null
    totalApartments: number | null
}

export function BuildingSettingsForm({ building }: { building: Building }) {
    const router = useRouter()
    const [error, setError] = useState("")
    const [isEditing, setIsEditing] = useState(false)
    const [formData, setFormData] = useState({
        nif: building.nif,
        iban: building.iban || "",
        city: building.city || "",
        street: building.street || "",
        number: building.number || "",
        quotaMode: building.quotaMode || "global",
        totalApartments: building.totalApartments?.toString() || "",
        paymentDueDay: building.paymentDueDay?.toString() || "",
    })
    const [monthlyQuotaStr, setMonthlyQuotaStr] = useState(
        building.monthlyQuota ? (building.monthlyQuota / 100).toFixed(2) : ""
    )

    // For permillage mode: whether user inputs annual or monthly value
    const [inputPeriod, setInputPeriod] = useState<"monthly" | "annual">("monthly")

    const buildingComplete = isBuildingComplete({
        ...building,
        ...formData,
        monthlyQuota: parseFloat(monthlyQuotaStr) * 100 || 0,
        totalApartments: parseInt(formData.totalApartments) || 0,
    })

    const handleChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }))
        if (error) setError("")
    }

    const { execute: saveSettings, isPending } = useAsyncAction(async () => {
        const parsedQuota = parseFloat(monthlyQuotaStr)
        const parsedTotalUnits = parseInt(formData.totalApartments)
        const parsedDueDay = parseInt(formData.paymentDueDay)

        // Calculate monthly quota (convert from annual if needed for permillage mode)
        let monthlyQuotaInCents = 0
        if (!isNaN(parsedQuota)) {
            // If permillage mode and annual input, divide by 12
            const monthlyValue = formData.quotaMode === "permillage" && inputPeriod === "annual"
                ? parsedQuota / 12
                : parsedQuota
            monthlyQuotaInCents = Math.round(monthlyValue * 100)
        }

        return await updateBuilding(building.id, {
            ...formData,
            name: `${formData.street} ${formData.number}`,
            iban: formData.iban || null,
            city: formData.city || null,
            street: formData.street || null,
            number: formData.number || null,
            monthlyQuota: monthlyQuotaInCents,
            paymentDueDay: isNaN(parsedDueDay) ? null : parsedDueDay,
            totalApartments: isNaN(parsedTotalUnits) ? 0 : parsedTotalUnits,
        })
    }, {
        successMessage: "Alterações guardadas com sucesso",
        onSuccess: () => {
            setIsEditing(false)
            router.refresh()
        },
        onError: (msg) => setError(msg)
    })

    const handleSubmit = async (e: React.FormEvent): Promise<void> => {
        e.preventDefault()
        setError("")
        await saveSettings(undefined)
    }

    const handleCancel = () => {
        setFormData({
            nif: building.nif,
            iban: building.iban || "",
            city: building.city || "",
            street: building.street || "",
            number: building.number || "",
            quotaMode: building.quotaMode || "global",
            totalApartments: building.totalApartments?.toString() || "",
            paymentDueDay: building.paymentDueDay?.toString() || "",
        })
        setMonthlyQuotaStr(
            building.monthlyQuota ? (building.monthlyQuota / 100).toFixed(2) : ""
        )
        setIsEditing(false)
        setError("")
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <CardTitle className="flex items-center gap-1.5">
                            <Building2 className="w-4 h-4" />
                            Edifício
                        </CardTitle>
                        {buildingComplete ? (
                            <span className="flex items-center gap-1 text-label text-success font-medium">
                                <Check className="w-3 h-3" /> Completo
                            </span>
                        ) : (
                            <span className="flex items-center gap-1 text-label text-warning font-medium">
                                <AlertCircle className="w-3 h-3" /> Incompleto
                            </span>
                        )}
                    </div>
                    {!isEditing && (
                        <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                            <Edit className="h-3 w-3 mr-1" /> Editar
                        </Button>
                    )}
                </div>
            </CardHeader>

            <CardContent>
                <form onSubmit={handleSubmit}>
                    <div className="space-y-1.5">
                        {/* Building Code (read-only) */}
                        <FormField>
                            <FormLabel>Código do Edifício</FormLabel>
                            <Input
                                value={building.code}
                                disabled
                                className="bg-gray-50 font-mono uppercase"
                            />
                        </FormField>

                        {/* Address */}
                        <FormField required>
                            <FormLabel>Morada</FormLabel>
                            <Input
                                value={formData.street}
                                onChange={(e) => handleChange("street", e.target.value)}
                                disabled={!isEditing}
                            />
                        </FormField>

                        <div className="grid grid-cols-2 gap-1.5">
                            <FormField>
                                <FormLabel>Código Postal</FormLabel>
                                <Input
                                    value={formData.number}
                                    onChange={(e) => handleChange("number", e.target.value)}
                                    disabled={!isEditing}
                                />
                            </FormField>
                            <FormField>
                                <FormLabel>Cidade</FormLabel>
                                <Input
                                    value={formData.city}
                                    onChange={(e) => handleChange("city", e.target.value)}
                                    disabled={!isEditing}
                                />
                            </FormField>
                        </div>

                        <FormField>
                            <FormLabel>NIF do Condomínio</FormLabel>
                            <Input
                                value={formData.nif}
                                onChange={(e) => handleChange("nif", e.target.value.replace(/\D/g, ''))}
                                disabled={!isEditing}
                                maxLength={9}
                                className="font-mono"
                            />
                        </FormField>

                        <FormField required>
                            <FormLabel>IBAN do Condomínio</FormLabel>
                            <Input
                                value={formData.iban}
                                onChange={(e) => handleChange("iban", e.target.value.replace(/\s+/g, '').toUpperCase())}
                                disabled={!isEditing}
                                maxLength={25}
                                className="font-mono uppercase"
                            />
                        </FormField>

                        <Divider className="my-1.5" />

                        <div className="grid grid-cols-2 gap-1.5">
                            <FormField>
                                <FormLabel>
                                    {formData.quotaMode === "permillage" ? "Receita Total Esperada (€)" : "Quota Mensal (€)"}
                                </FormLabel>
                                {formData.quotaMode === "permillage" && isEditing && (
                                    <div className="flex gap-2 mb-1">
                                        <label className="flex items-center gap-1 cursor-pointer">
                                            <input
                                                type="radio"
                                                name="inputPeriodSettings"
                                                checked={inputPeriod === "monthly"}
                                                onChange={() => setInputPeriod("monthly")}
                                                className="w-3 h-3 accent-primary"
                                            />
                                            <span className="text-label">Mensal</span>
                                        </label>
                                        <label className="flex items-center gap-1 cursor-pointer">
                                            <input
                                                type="radio"
                                                name="inputPeriodSettings"
                                                checked={inputPeriod === "annual"}
                                                onChange={() => setInputPeriod("annual")}
                                                className="w-3 h-3 accent-primary"
                                            />
                                            <span className="text-label">Anual</span>
                                        </label>
                                    </div>
                                )}
                                <Input
                                    type="number"
                                    value={monthlyQuotaStr}
                                    onChange={(e) => setMonthlyQuotaStr(e.target.value)}
                                    disabled={!isEditing}
                                    placeholder="0.00"
                                    className="font-mono"
                                />
                                {formData.quotaMode === "permillage" && (
                                    <p className="text-label text-gray-500 mt-0.5">
                                        Valor total {inputPeriod === "annual" ? "anual" : "mensal"} a dividir pelas frações
                                    </p>
                                )}
                            </FormField>
                            <FormField>
                                <FormLabel>Total de Frações</FormLabel>
                                <Input
                                    type="number"
                                    value={formData.totalApartments}
                                    onChange={(e) => handleChange("totalApartments", e.target.value)}
                                    disabled={!isEditing}
                                    min={1}
                                />
                            </FormField>
                        </div>

                        <FormField>
                            <FormLabel>Dia de Vencimento da Quota</FormLabel>
                            <Input
                                type="number"
                                value={formData.paymentDueDay}
                                onChange={(e) => handleChange("paymentDueDay", e.target.value)}
                                disabled={!isEditing}
                                min={1}
                                max={28}
                                placeholder="Ex: 8"
                            />
                            <p className="text-label text-gray-500 mt-0.5">
                                Dia do mês em que a quota passa a estar em atraso (1-28)
                            </p>
                        </FormField>
                    </div>

                    {error && (
                        <p className="mt-1.5 text-label text-error font-medium">{error}</p>
                    )}

                    {isEditing && (
                        <div className="flex gap-1.5 mt-1.5">
                            <Button
                                type="button"
                                variant="outline"
                                className="flex-1"
                                onClick={handleCancel}
                            >
                                Cancelar
                            </Button>
                            <Button
                                type="submit"
                                className="flex-1"
                                loading={isPending}
                            >
                                <Save className="h-3 w-3 mr-1" /> Guardar
                            </Button>
                        </div>
                    )}
                </form>
            </CardContent>
        </Card>
    )
}