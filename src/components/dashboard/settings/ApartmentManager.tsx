"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { FormField, FormLabel } from "@/components/ui/Form-Field"
import { Badge } from "@/components/ui/Badge"
import { Modal } from "@/components/ui/Modal"
import { ConfirmModal } from "@/components/ui/ConfirmModal"
import { IconButton } from "@/components/ui/Icon-Button"
import { Edit } from "lucide-react"
import { updateApartment } from "@/lib/actions/building"
import { unclaimApartmentAction } from "@/lib/actions/residents"

export type Apartment = {
    id: number
    unit: string
    permillage: number
    resident: {
        id: string
        name: string
    } | null
}

export type ApartmentData = Apartment

interface ApartmentManagerProps {
    apartments: Apartment[]
}

export function ApartmentManager({ apartments }: ApartmentManagerProps) {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState("")

    const [disconnectTarget, setDisconnectTarget] = useState<Apartment | null>(null)

    const [editTarget, setEditTarget] = useState<Apartment | null>(null)
    const [editUnit, setEditUnit] = useState("")
    const [editPermillage, setEditPermillage] = useState("")

    const totalPermillage = apartments.reduce((sum, apt) => sum + apt.permillage, 0)

    const handleDisconnect = async () => {
        if (!disconnectTarget) return

        try {
            const result = await unclaimApartmentAction(disconnectTarget.id)
            if (result.success) {
                router.refresh()
            }
        } catch (err) {
            console.error("Failed to disconnect resident", err)
        } finally {
            setDisconnectTarget(null)
        }
    }

    const openEditModal = (apt: Apartment) => {
        setEditTarget(apt)
        setEditUnit(apt.unit)
        setEditPermillage(apt.permillage.toString())
        setError("")
    }

    const handleEditApartment = async () => {
        if (!editTarget) return

        if (!editUnit.trim() || !editPermillage.trim()) {
            setError("Os campos Fração e Permilagem são obrigatórios.")
            return
        }

        const permillageValue = parseFloat(editPermillage)
        if (isNaN(permillageValue) || permillageValue <= 0) {
            setError("A permilagem deve ser um número positivo.")
            return
        }

        setIsLoading(true)
        setError("")

        try {
            const result = await updateApartment(editTarget.id, {
                unit: editUnit.trim(),
                permillage: permillageValue
            })

            if (result.success) {
                setEditTarget(null)
                setEditUnit("")
                setEditPermillage("")
                router.refresh()
            } else {
                setError(result.error || "Ocorreu um erro inesperado")
            }
        } catch {
            setError("Ocorreu um erro inesperado")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <>
            <Card>
                <CardHeader>
                    <CardTitle>Frações ({apartments.length})</CardTitle>
                </CardHeader>

                <CardContent className="p-0">
                    <div className="divide-y divide-gray-100">
                        {apartments.map((apt) => (
                            <div
                                key={apt.id}
                                className="flex items-center justify-between p-1.5 hover:bg-gray-50 transition-colors"
                            >
                                <div className="flex items-center gap-1.5">
                                    <div className="w-8 h-8 flex items-center justify-center rounded bg-gray-50 border border-gray-200 text-body font-medium text-gray-700">
                                        {apt.unit}
                                    </div>
                                    <div>
                                        <p className="text-body font-medium text-gray-700">
                                            {apt.resident?.name || (
                                                <span className="text-gray-400 italic">Sem residente</span>
                                            )}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {apt.permillage.toFixed(2)}‰
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    {apt.resident ? (
                                        <Badge variant="success">Ocupado</Badge>
                                    ) : (
                                        <Badge variant="warning">Vago</Badge>
                                    )}
                                    <IconButton
                                        size="sm"
                                        variant="ghost"
                                        icon={<Edit className="h-3 w-3" />}
                                        label="Editar"
                                        onClick={() => openEditModal(apt)}
                                        data-testid={`edit-unit-button-${apt.id}`}
                                    />
                                </div>
                            </div>
                        ))}

                        {apartments.length === 0 && (
                            <div className="p-8 text-center">
                                <p className="text-body text-gray-400 italic">
                                    Nenhuma fração definida.
                                </p>
                            </div>
                        )}
                    </div>
                </CardContent>

                <CardFooter>
                    <p className="text-xs text-gray-500">
                        Total permilagem: {totalPermillage.toFixed(2)}%
                    </p>
                </CardFooter>
            </Card>

            {/* Edit Modal */}
            <Modal
                open={!!editTarget}
                onClose={() => {
                    setEditTarget(null)
                    setEditUnit("")
                    setEditPermillage("")
                    setError("")
                }}
                title="Editar Fração"
                description={`Editar os dados da fração ${editTarget?.unit}.`}
                footer={
                    <div className="flex justify-end gap-1.5">
                        <Button variant="outline" onClick={() => setEditTarget(null)}>
                            Cancelar
                        </Button>
                        <Button onClick={handleEditApartment} loading={isLoading}>
                            Guardar
                        </Button>
                    </div>
                }
            >
                <div className="space-y-1.5">
                    <div className="grid grid-cols-2 gap-1.5">
                        <FormField required>
                            <FormLabel>Fração</FormLabel>
                            <Input
                                value={editUnit}
                                onChange={(e) => setEditUnit(e.target.value)}
                                placeholder="Ex: 1A"
                                className="font-mono uppercase"
                            />
                        </FormField>
                        <FormField required>
                            <FormLabel>Permilagem</FormLabel>
                            <Input
                                type="number"
                                value={editPermillage}
                                onChange={(e) => setEditPermillage(e.target.value)}
                                placeholder="166.67"
                                step="0.01"
                                className="font-mono"
                            />
                        </FormField>
                    </div>
                    {error && (
                        <p className="text-label text-error font-medium">{error}</p>
                    )}
                </div>
            </Modal>

            {/* Disconnect Confirmation */}
            <ConfirmModal
                isOpen={!!disconnectTarget}
                title="Desassociar Residente"
                message={
                    disconnectTarget?.resident
                        ? `Tem a certeza que deseja desassociar ${disconnectTarget.resident.name} da fração ${disconnectTarget.unit}?`
                        : ""
                }
                onConfirm={handleDisconnect}
                onCancel={() => setDisconnectTarget(null)}
                variant="neutral"
            />
        </>
    )
}