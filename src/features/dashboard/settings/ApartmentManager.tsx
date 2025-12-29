"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Home, Plus, Trash2, UserX, AlertCircle } from "lucide-react"
import { createApartment, deleteApartment } from "@/app/actions/building"
import { unclaimApartmentAction } from "@/app/actions/resident-management"
import { ConfirmModal } from "@/components/ui/ConfirmModal"

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

export function ApartmentManager({ buildingId, apartments, totalApartments, buildingComplete }: ApartmentManagerProps) {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState("")

    const [newUnit, setNewUnit] = useState("")
    const [newPermillage, setNewPermillage] = useState("")

    const [deleteTarget, setDeleteTarget] = useState<Apartment | null>(null)
    const [disconnectTarget, setDisconnectTarget] = useState<Apartment | null>(null)

    const totalPermillage = apartments.reduce((sum, apt) => sum + apt.permillage, 0)
    const isAtLimit = totalApartments !== null && apartments.length >= totalApartments

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
                router.refresh()
            } else {
                setError(result.error || "Ocorreu um erro inesperado")
            }
        } catch (err) {
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
                    <CardTitle>
                        <Home className="w-3.5 h-3.5" />
                        Inventário de Frações
                    </CardTitle>
                    <span className="text-[10px] text-slate-400 font-mono">
                        {totalPermillage}/1000 ‰
                    </span>
                </CardHeader>
                <CardContent className="p-0">
                    {/* Table Header */}
                    <div className="grid grid-cols-12 bg-slate-100 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase">
                        <div className="col-span-3 p-3">Fração</div>
                        <div className="col-span-2 p-3 text-right">Permilagem</div>
                        <div className="col-span-5 p-3">Residente</div>
                        <div className="col-span-2 p-3">Ações</div>
                    </div>

                    {/* Apartment Rows */}
                    <div className="max-h-[400px] overflow-y-auto">
                        {apartments.map((apt) => (
                            <div
                                key={apt.id}
                                className="grid grid-cols-12 border-b border-slate-100 items-center hover:bg-slate-50"
                            >
                                <div className="col-span-3 p-3 text-sm font-mono font-bold uppercase">
                                    {apt.unit}
                                </div>
                                <div className="col-span-2 p-3 text-sm font-mono text-right">
                                    {apt.permillage} ‰
                                </div>
                                <div className="col-span-5 p-3">
                                    {apt.resident ? (
                                        <span className="text-xs text-slate-700">{apt.resident.name}</span>
                                    ) : (
                                        <span className="text-[10px] text-slate-400 italic">
                                            Sem residente
                                        </span>
                                    )}
                                </div>
                                <div className="col-span-2 p-3 flex gap-1">
                                    {apt.resident && (
                                        <button
                                            onClick={() => setDisconnectTarget(apt)}
                                            className="p-1 text-slate-400 hover:text-amber-600 transition-colors"
                                            title="Desassociar Residente"
                                        >
                                            <UserX className="w-3.5 h-3.5" />
                                        </button>
                                    )}
                                    <button
                                        onClick={() => setDeleteTarget(apt)}
                                        className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                                        title="Eliminar Fração"
                                        data-testid={`delete-unit-button-${apt.id}`}
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>
                        ))}

                        {apartments.length === 0 && (
                            <div className="p-8 text-center text-xs text-slate-400 italic">
                                Nenhuma fração definida.
                            </div>
                        )}
                    </div>

                    {/* Add New Apartment */}
                    {!isAtLimit && (
                        <div className="grid grid-cols-12 border-t border-slate-200 items-center bg-slate-50 p-2">
                            <div className="col-span-3 px-1">
                                <input
                                    type="text"
                                    value={newUnit}
                                    onChange={(e) => setNewUnit(e.target.value)}
                                    placeholder="Nova Fração"
                                    className="w-full px-2 py-1.5 text-sm border border-slate-200 focus:outline-none focus:border-blue-400"
                                />
                            </div>
                            <div className="col-span-2 px-1">
                                <input
                                    type="number"
                                    value={newPermillage}
                                    onChange={(e) => setNewPermillage(e.target.value)}
                                    placeholder="‰"
                                    className="w-full px-2 py-1.5 text-sm font-mono border border-slate-200 focus:outline-none focus:border-blue-400"
                                />
                            </div>
                            <div className="col-span-5"></div>
                            <div className="col-span-2 px-1">
                                <Button
                                    size="xs"
                                    fullWidth
                                    onClick={handleAddApartment}
                                    disabled={isLoading}
                                >
                                    <Plus className="w-3 h-3" />
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Limit Warning */}
                    {isAtLimit && (
                        <div className="flex items-center gap-2 p-3 bg-amber-50 border-t border-amber-200 text-amber-700">
                            <AlertCircle className="w-4 h-4" />
                            <span className="text-[10px] font-bold uppercase">
                                Limite de frações atingido
                            </span>
                        </div>
                    )}

                    {error && (
                        <div className="p-3 border-t border-slate-100">
                            <p className="text-[10px] text-rose-600 font-bold">{error}</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Delete Confirmation */}
            <ConfirmModal
                isOpen={!!deleteTarget}
                title="Eliminar Fração"
                message="Tem a certeza que deseja eliminar esta fração? Esta ação é irreversível."
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
                        ? `Tem a certeza que deseja desassociar ${disconnectTarget.resident.name} desta fração?`
                        : ""
                }
                onConfirm={handleDisconnect}
                onCancel={() => setDisconnectTarget(null)}
                variant="neutral"
            />
        </>
    )
}