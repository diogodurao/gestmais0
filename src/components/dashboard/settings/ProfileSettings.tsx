"use client"

import { useState, useEffect, useTransition } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { FormField, FormLabel } from "@/components/ui/Form-Field"
import { Divider } from "@/components/ui/Divider"
import { Avatar } from "@/components/ui/Avatar"
import { Modal } from "@/components/ui/Modal"
import { User, Save, Edit, Check, AlertCircle, Plus, X, CreditCard } from "lucide-react"
import { updateUserProfile, getAdditionalIbans, addAdditionalIban, removeAdditionalIban } from "@/lib/actions/user"
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

    // Additional IBANs state
    const [additionalIbans, setAdditionalIbans] = useState<{ id: number; iban: string }[]>([])
    const [newIban, setNewIban] = useState("")
    const [ibanError, setIbanError] = useState("")
    const [isAddingIban, startAddIban] = useTransition()
    const [removingIbanId, setRemovingIbanId] = useState<number | null>(null)
    const [ibanToDelete, setIbanToDelete] = useState<{ id: number; iban: string } | null>(null)

    const isManager = user.role === 'manager'
    const isResident = user.role === 'resident'
    const hasUnit = !!user.unitName
    const profileComplete = isProfileComplete(formData)

    // Load additional IBANs for residents
    useEffect(() => {
        if (isResident && hasUnit) {
            getAdditionalIbans().then(result => {
                if (result.success && result.data) {
                    setAdditionalIbans(result.data)
                }
            })
        }
    }, [isResident, hasUnit])

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

    const handleAddIban = () => {
        if (!newIban.trim()) return

        const normalizedIban = newIban.replace(/\s+/g, '').toUpperCase()

        if (!isValidIban(normalizedIban)) {
            setIbanError("IBAN inválido")
            return
        }

        // Check if it's the same as main IBAN
        if (normalizedIban === formData.iban) {
            setIbanError("Este é o seu IBAN principal")
            return
        }

        // Check if already in the list
        if (additionalIbans.some(i => i.iban === normalizedIban)) {
            setIbanError("Este IBAN já está registado")
            return
        }

        setIbanError("")
        startAddIban(async () => {
            const result = await addAdditionalIban(normalizedIban)
            if (result.success && result.data) {
                setAdditionalIbans(prev => [...prev, result.data!])
                setNewIban("")
            } else if (!result.success) {
                setIbanError(result.error || "Erro ao adicionar IBAN")
            }
        })
    }

    const handleConfirmRemoveIban = async () => {
        if (!ibanToDelete) return

        setRemovingIbanId(ibanToDelete.id)
        const result = await removeAdditionalIban(ibanToDelete.id)
        if (result.success) {
            setAdditionalIbans(prev => prev.filter(i => i.id !== ibanToDelete.id))
        }
        setRemovingIbanId(null)
        setIbanToDelete(null)
    }

    return (
        <>
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
                            <p className="text-subtitle font-medium text-gray-700">{formData.name}</p>
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

        {/* Additional IBANs Section */}
        <Card className="mt-1.5">
                <CardHeader>
                    <CardTitle className="flex items-center gap-1.5">
                        <CreditCard className="w-4 h-4" />
                        IBANs Adicionais
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-label text-gray-500 mb-1.5">
                        Adicione outros IBANs que possam ser usados para pagamentos de quotas.
                        Útil quando efetua transferências a partir de contas diferentes.
                    </p>

                    {/* List of additional IBANs */}
                    {additionalIbans.length > 0 && (
                        <div className="space-y-1 mb-1.5">
                            {additionalIbans.map((item) => (
                                <div
                                    key={item.id}
                                    className="flex items-center justify-between p-1.5 bg-gray-50 rounded"
                                >
                                    <span className="font-mono text-body text-gray-700">
                                        {item.iban}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => setIbanToDelete(item)}
                                        className="p-0.5 text-gray-400 hover:text-error transition-colors"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Add new IBAN */}
                    <div className="flex gap-1.5">
                        <div className="flex-1 relative">
                            <Input
                                value={newIban}
                                onChange={(e) => {
                                    setNewIban(e.target.value.replace(/\s+/g, '').toUpperCase())
                                    if (ibanError) setIbanError("")
                                }}
                                placeholder="Adicionar novo IBAN"
                                maxLength={25}
                            />
                            {isValidIban(newIban) && (
                                <div className="absolute right-2 top-1/2 -translate-y-1/2 text-success">
                                    <Check className="w-4 h-4" />
                                </div>
                            )}
                        </div>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleAddIban}
                            disabled={!newIban.trim()}
                            loading={isAddingIban}
                        >
                            <Plus className="w-4 h-4" />
                        </Button>
                    </div>

                    {ibanError && (
                        <p className="mt-1 text-label text-error font-medium">{ibanError}</p>
                    )}
                </CardContent>
            </Card>

        {/* Delete IBAN Confirmation Modal */}
        <Modal
            open={!!ibanToDelete}
            onClose={() => setIbanToDelete(null)}
            title="Remover IBAN"
            description="Tem a certeza que deseja remover este IBAN?"
            size="sm"
            footer={
                <div className="flex gap-1.5 justify-end">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIbanToDelete(null)}
                        disabled={removingIbanId !== null}
                    >
                        Cancelar
                    </Button>
                    <Button
                        variant="primary"
                        size="sm"
                        onClick={handleConfirmRemoveIban}
                        loading={removingIbanId !== null}
                    >
                        Remover
                    </Button>
                </div>
            }
        >
            {ibanToDelete && (
                <p className="font-mono text-body text-gray-700 bg-gray-50 p-1.5 rounded">
                    {ibanToDelete.iban}
                </p>
            )}
        </Modal>
        </>
    )
}