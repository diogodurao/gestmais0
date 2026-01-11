"use client"

import { useState } from "react"
import { Card, CardHeader, CardTitle } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { User, Check, AlertCircle } from "lucide-react"
import { updateUserProfile } from "@/app/actions/user"
import { isValidNif, isValidIban, isProfileComplete } from "@/lib/validations"

type UserData = {
    id: string
    name: string
    email: string
    role: string
    nif?: string | null
    iban?: string | null
    unitName?: string | null
}

export function ProfileSettings({ user }: { user: UserData }) {
    const [isSaving, setIsSaving] = useState(false)
    const [showSuccess, setShowSuccess] = useState(false)
    const [error, setError] = useState("")
    const [formData, setFormData] = useState({
        name: user.name,
        nif: user.nif || "",
        iban: user.iban || "",
    })

    const isManager = user.role === 'manager'
    const profileComplete = isProfileComplete(formData)

    const handleChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }))
        if (showSuccess) setShowSuccess(false)
        if (error) setError("")
    }

    const handleSubmit = async (e: React.FormEvent): Promise<void> => {
        e.preventDefault()
        setError("")

        if (isManager) {
            if (!formData.name.trim()) {
                setError("Obrigatório")
                return
            }
            if (formData.nif && !isValidNif(formData.nif)) {
                setError("Deve ter 9 dígitos numéricos")
                return
            }
            if (formData.iban && !isValidIban(formData.iban)) {
                setError("IBAN inválido")
                return
            }
        }

        setIsSaving(true)
        try {
            const result = await updateUserProfile(formData)

            if (result.success) {
                setShowSuccess(true)
                setTimeout(() => setShowSuccess(false), 3000)
            } else {
                setError(result.error || "Ocorreu um erro")
            }
        } catch (error) {
            console.error("Failed to update profile", error)
            setError("Ocorreu um erro")
        } finally {
            setIsSaving(false)
        }
    }

    const hasChanges =
        formData.name !== user.name ||
        formData.nif !== (user.nif || "") ||
        formData.iban !== (user.iban || "")

    return (
        <div className="space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle>
                        <User className="w-4 h-4" />
                        DADOS_PERFIL_UTILIZADOR
                    </CardTitle>
                    <div className="flex items-center gap-3">
                        {profileComplete ? (
                            <span className="text-label text-success font-mono flex items-center gap-1">
                                <Check className="w-3 h-3" /> VALIDADO
                            </span>
                        ) : (
                            <span className="text-label text-warning font-mono flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" /> INCOMPLETO
                            </span>
                        )}
                    </div>
                </CardHeader>

                <form onSubmit={handleSubmit} className="p-0">
                    <div className="grid grid-cols-1 md:grid-cols-[140px_1fr] border-b border-gray-100">
                        <div className="label-col border-none">Nome Completo</div>
                        <div className="value-col border-none">
                            <input
                                type="text"
                                value={formData.name}
                                onChange={e => handleChange("name", e.target.value)}
                                className="input-cell h-8"
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-[140px_1fr] border-b border-gray-100 border-t">
                        <div className="label-col border-none">Endereço de Email</div>
                        <div className="value-col border-none bg-gray-50">
                            <input
                                type="text"
                                value={user.email}
                                readOnly
                                className="input-cell border-none h-8 bg-transparent text-gray-500 cursor-not-allowed"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2">
                        <div className="grid grid-cols-1 md:grid-cols-[140px_1fr] border-b md:border-b-0 md:border-r border-gray-100 border-t md:border-t-0">
                            <div className="label-col border-none">NIF</div>
                            <div className="value-col border-none relative">
                                <input
                                    type="text"
                                    value={formData.nif}
                                    onChange={e => handleChange("nif", e.target.value)}
                                    className="input-cell border-none h-8 font-mono"
                                    maxLength={9}
                                />
                                {isValidNif(formData.nif) && (
                                    <div className="absolute right-2 top-2 text-success">
                                        <Check className="w-4 h-4" />
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-[80px_1fr] border-t md:border-t-0">
                            <div className="label-col border-none">IBAN</div>
                            <div className="value-col border-none">
                                <input
                                    type="text"
                                    value={formData.iban}
                                    onChange={e => handleChange("iban", e.target.value)}
                                    className="input-cell border-none h-8 font-mono"
                                />
                            </div>
                        </div>
                    </div>

                    {user.unitName && (
                        <div className="grid grid-cols-1 md:grid-cols-[140px_1fr] border-t border-gray-100">
                            <div className="label-col border-none">Fração Atribuída</div>
                            <div className="value-col border-none bg-gray-50">
                                <input
                                    type="text"
                                    value={user.unitName}
                                    readOnly
                                    className="input-cell border-none h-8 bg-transparent text-gray-500 font-bold"
                                />
                            </div>
                        </div>
                    )}

                    <div className="p-3 flex justify-end">
                        <Button type="submit" size="xs" disabled={isSaving || !hasChanges}>
                            {isSaving ? "A GUARDAR..." : "GUARDAR ALTERAÇÕES"}
                        </Button>
                    </div>
                </form>
            </Card>
            {error && <p className="text-label text-error font-bold uppercase text-right">{error}</p>}
        </div>
    )
}