"use client"

import { useState } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { FormField, FormLabel } from "@/components/ui/Form-Field"
import { Divider } from "@/components/ui/Divider"
import { Avatar } from "@/components/ui/Avatar"
import { User, Save, Edit, Check, AlertCircle } from "lucide-react"
import { updateUserProfile } from "@/lib/actions/user"
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
    const [isEditing, setIsEditing] = useState(false)
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
                setError("Nome é obrigatório")
                return
            }
            if (formData.nif && !isValidNif(formData.nif)) {
                setError("NIF deve ter 9 dígitos numéricos")
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
                setIsEditing(false)
                setTimeout(() => setShowSuccess(false), 3000)
            } else {
                setError(result.error || "Ocorreu um erro")
            }
        } catch (err) {
            console.error("Failed to update profile", err)
            setError("Ocorreu um erro")
        } finally {
            setIsSaving(false)
        }
    }

    const handleCancel = () => {
        setFormData({
            name: user.name,
            nif: user.nif || "",
            iban: user.iban || "",
        })
        setIsEditing(false)
        setError("")
    }

    const hasChanges =
        formData.name !== user.name ||
        formData.nif !== (user.nif || "") ||
        formData.iban !== (user.iban || "")

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <CardTitle className="flex items-center gap-1.5">
                            <User className="w-4 h-4" />
                            Perfil Pessoal
                        </CardTitle>
                        {profileComplete ? (
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
                    {/* Avatar and role */}
                    <div className="flex items-center gap-1.5 mb-1.5">
                        <Avatar size="lg" fallback={formData.name.charAt(0)} alt={formData.name} />
                        <div>
                            <p className="text-base font-medium text-gray-700">{formData.name}</p>
                            <p className="text-label text-gray-500">
                                {user.role === 'manager' ? 'Administrador' : 'Residente'}
                            </p>
                        </div>
                    </div>

                    <Divider className="my-1.5" />

                    <div className="space-y-1.5">
                        <FormField required>
                            <FormLabel>Nome Completo</FormLabel>
                            <Input
                                value={formData.name}
                                onChange={(e) => handleChange("name", e.target.value)}
                                disabled={!isEditing}
                            />
                        </FormField>

                        <FormField>
                            <FormLabel>Email</FormLabel>
                            <Input
                                type="email"
                                value={user.email}
                                disabled
                                className="bg-gray-50"
                            />
                        </FormField>

                        <div className="grid grid-cols-2 gap-1.5">
                            <FormField>
                                <FormLabel>NIF</FormLabel>
                                <div className="relative">
                                    <Input
                                        value={formData.nif}
                                        onChange={(e) => handleChange("nif", e.target.value.replace(/\D/g, ''))}
                                        disabled={!isEditing}
                                        maxLength={9}
                                        className="font-mono"
                                    />
                                    {isValidNif(formData.nif) && (
                                        <div className="absolute right-2 top-1/2 -translate-y-1/2 text-success">
                                            <Check className="w-4 h-4" />
                                        </div>
                                    )}
                                </div>
                            </FormField>

                            <FormField>
                                <FormLabel>IBAN</FormLabel>
                                <div className="relative">
                                    <Input
                                        value={formData.iban}
                                        onChange={(e) => handleChange("iban", e.target.value.replace(/\s+/g, '').toUpperCase())}
                                        disabled={!isEditing}
                                        maxLength={25}
                                        className="font-mono uppercase"
                                    />
                                    {isValidIban(formData.iban) && (
                                        <div className="absolute right-2 top-1/2 -translate-y-1/2 text-success">
                                            <Check className="w-4 h-4" />
                                        </div>
                                    )}
                                </div>
                            </FormField>
                        </div>

                        {user.unitName && (
                            <FormField>
                                <FormLabel>Fração Atribuída</FormLabel>
                                <Input
                                    value={user.unitName}
                                    disabled
                                    className="bg-gray-50 font-medium"
                                />
                            </FormField>
                        )}
                    </div>

                    {error && (
                        <p className="mt-1.5 text-label text-error font-medium">{error}</p>
                    )}

                    {showSuccess && (
                        <p className="mt-1.5 text-label text-success font-medium flex items-center gap-1">
                            <Check className="w-3 h-3" /> Perfil atualizado com sucesso
                        </p>
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
                                loading={isSaving}
                                disabled={!hasChanges}
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