"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { FormField } from "@/components/ui/Form-Field"
import { Badge } from "@/components/ui/Badge"
import { Modal } from "@/components/ui/Modal"
import { ConfirmModal } from "@/components/ui/ConfirmModal"
import { IconButton } from "@/components/ui/Icon-Button"
import { LayoutGrid, Plus, Trash2, UserX, AlertCircle, Check } from "lucide-react"
import { createApartment, deleteApartment } from "@/lib/actions/building"
import { unclaimApartmentAction } from "@/lib/actions/residents"
import { isUnitsComplete } from "@/lib/validations"

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
    buildingId: string
    apartments: Apartment[]
    totalApartments: number | null
    buildingComplete?: boolean
}

export function ApartmentManager({ buildingId, apartments, totalApartments }: ApartmentManagerProps) {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState("")

    const [showAddModal, setShowAddModal] = useState(false)
    const [newUnit, setNewUnit] = useState("")
    const [newPermillage, setNewPermillage] = useState("")

    const [deleteTarget, setDeleteTarget] = useState<Apartment | null>(null)
    const [disconnectTarget, setDisconnectTarget] = useState<Apartment | null>(null)

    const totalPermillage = apartments.reduce((sum, apt) => sum + apt.permillage, 0)
    const isAtLimit = totalApartments !== null && apartments.length >= totalApartments
    // Transform to expected format for isUnitsComplete
    const apartmentsForValidation = apartments.map(apt => ({ apartment: { permillage: apt.permillage } }))
    const unitsComplete = isUnitsComplete(totalApartments, apartmentsForValidation)

    const handleAddApartment = async () => {
        if (!newUnit.trim() || !newPermillage.trim()) {
            setError("Os campos Fração e Permilagem são obrigatórios.")
            return
        }

        const permillageValue = parseFloat(newPermillage)
        if (isNaN(permillageValue) || permillageValue <= 0) {
            setError("A permilagem deve ser um número positivo.")
            return
        }

        setIsLoading(true)
        setError("")

        try {
            const result = await createApartment(buildingId, {
                unit: newUnit.trim(),
                permillage: permillageValue
            })

            if (result.success) {
                setNewUnit("")
                setNewPermillage("")
                setShowAddModal(false)
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

    const handleDelete = async () => {
        if (!deleteTarget) return

        try {
            const result = await deleteApartment(deleteTarget.id)
            if (result.success) {
                router.refresh()
            }
        } catch (err) {
            console.error("Failed to delete apartment", err)
        } finally {
            setDeleteTarget(null)
        }
    }

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

    return (
        <>
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <CardTitle className="flex items-center gap-1.5">
                                <LayoutGrid className="w-4 h-4" />
                                Frações
                            </CardTitle>
                            <span className="text-label text-gray-500 font-mono">
                                {apartments.length}/{totalApartments || "?"}
                            </span>
                            {unitsComplete ? (
                                <span className="flex items-center gap-1 text-label text-success font-medium">
                                    <Check className="w-3 h-3" /> Completo
                                </span>
                            ) : (
                                <span className="flex items-center gap-1 text-label text-warning font-medium">
                                    <AlertCircle className="w-3 h-3" /> Incompleto
                                </span>
                            )}
                        </div>
                        {!isAtLimit && (
                            <Button size="sm" onClick={() => setShowAddModal(true)}>
                                <Plus className="h-3 w-3 mr-1" /> Adicionar
                            </Button>
                        )}
                    </div>
                </CardHeader>

                <CardContent className="p-0">
                    {/* Permillage summary */}
                    <div className="px-3 py-2 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
                        <span className="text-label text-gray-500">Permilagem Total</span>
                        <span className={`text-label font-mono font-medium ${Math.abs(totalPermillage - 1000) < 0.01 ? 'text-success' : 'text-warning'}`}>
                            {totalPermillage.toFixed(2)}/1000 ‰
                        </span>
                    </div>

                    {/* Apartments list */}
                    <div className="divide-y divide-gray-100 max-h-[400px] overflow-y-auto">
                        {apartments.map((apt) => (
                            <div
                                key={apt.id}
                                className="flex items-center justify-between p-3 hover:bg-gray-50 transition-colors"
                            >
                                <div className="flex items-center gap-2">
                                    <div className="w-10 h-10 flex items-center justify-center rounded bg-gray-100 border border-gray-200">
                                        <span className="text-body font-mono font-bold text-gray-700">
                                            {apt.unit}
                                        </span>
                                    </div>
                                    <div>
                                        <p className="text-body font-medium text-gray-700">
                                            {apt.resident?.name || (
                                                <span className="text-gray-400 italic">Sem residente</span>
                                            )}
                                        </p>
                                        <p className="text-label text-gray-500 font-mono">
                                            {apt.permillage.toFixed(2)} ‰
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1">
                                    {apt.resident ? (
                                        <Badge variant="success">Ocupado</Badge>
                                    ) : (
                                        <Badge variant="warning">Vago</Badge>
                                    )}
                                    {apt.resident && (
                                        <IconButton
                                            size="sm"
                                            variant="ghost"
                                            icon={<UserX className="h-3.5 w-3.5" />}
                                            label="Desassociar"
                                            onClick={() => setDisconnectTarget(apt)}
                                        />
                                    )}
                                    <IconButton
                                        size="sm"
                                        variant="ghost"
                                        icon={<Trash2 className="h-3.5 w-3.5" />}
                                        label="Eliminar"
                                        onClick={() => setDeleteTarget(apt)}
                                        data-testid={`delete-unit-button-${apt.id}`}
                                    />
                                </div>
                            </div>
                        ))}

                        {apartments.length === 0 && (
                            <div className="p-8 text-center">
                                <p className="text-body text-gray-400 italic">
                                    Nenhuma fração definida.
                                </p>
                                <p className="text-label text-gray-400 mt-1">
                                    Clique em "Adicionar" para criar a primeira fração.
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Limit warning */}
                    {isAtLimit && (
                        <div className="flex items-center gap-2 p-3 bg-warning-light border-t border-gray-200 text-warning">
                            <AlertCircle className="w-4 h-4" />
                            <span className="text-label font-medium">
                                Limite de frações atingido ({totalApartments})
                            </span>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Add Modal */}
            <Modal
                open={showAddModal}
                onClose={() => {
                    setShowAddModal(false)
                    setNewUnit("")
                    setNewPermillage("")
                    setError("")
                }}
                title="Nova Fração"
                description="Adicione uma nova fração ao edifício."
                footer={
                    <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setShowAddModal(false)}>
                            Cancelar
                        </Button>
                        <Button onClick={handleAddApartment} loading={isLoading}>
                            Adicionar
                        </Button>
                    </div>
                }
            >
                <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                        <FormField label="Fração" required>
                            <Input
                                value={newUnit}
                                onChange={(e) => setNewUnit(e.target.value)}
                                placeholder="Ex: 1A"
                                className="font-mono uppercase"
                            />
                        </FormField>
                        <FormField label="Permilagem (‰)" required>
                            <Input
                                type="number"
                                value={newPermillage}
                                onChange={(e) => setNewPermillage(e.target.value)}
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

            {/* Delete Confirmation */}
            <ConfirmModal
                isOpen={!!deleteTarget}
                title="Eliminar Fração"
                message={`Tem a certeza que deseja eliminar a fração ${deleteTarget?.unit}? Esta ação é irreversível.`}
                onConfirm={handleDelete}
                onCancel={() => setDeleteTarget(null)}
                variant="danger"
            />

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