"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createApartment, updateApartment, deleteApartment } from "@/app/actions/building"
import { unclaimApartmentAction } from "@/app/actions/resident-management"
import { useToast } from "@/hooks/use-toast"
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/Card"
import { cn } from "@/lib/utils"
import { Trash2, UserMinus, Layers, Pencil } from "lucide-react"
import { type InferSelectModel } from "drizzle-orm"
import { user, apartments } from "@/db/schema"
import { ConfirmModal } from "@/components/ui/ConfirmModal"
import { useAsyncAction } from "@/hooks/useAsyncAction"
import { type Dictionary } from "@/types/i18n"

type Apartment = InferSelectModel<typeof apartments>
type UserProfile = InferSelectModel<typeof user>

export type ApartmentData = {
    apartment: Apartment
    resident: Pick<UserProfile, 'id' | 'name' | 'email'> | null
}

export function ApartmentManager({
    apartments,
    buildingId,
    buildingComplete = true,
    totalApartments,
    dictionary
}: {
    apartments: ApartmentData[];
    buildingId: string;
    buildingComplete?: boolean;
    totalApartments?: number | null;
    dictionary: Dictionary
}) {
    const router = useRouter()
    const { toast } = useToast()
    const [editingCell, setEditingCell] = useState<{ id: number | 'new'; field: 'unit' | 'permillage' } | null>(null)
    const [newRow, setNewRow] = useState({ unit: "", permillage: "" })
    const [editValue, setEditValue] = useState("")
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
    const [apartmentToDelete, setApartmentToDelete] = useState<number | null>(null)
    const [isUnclaimModalOpen, setIsUnclaimModalOpen] = useState(false)
    const [unclaimTarget, setUnclaimTarget] = useState<{ id: number; name: string } | null>(null)
    const inputRef = useRef<HTMLInputElement>(null)

    const isLimitReached = totalApartments ? apartments.length >= totalApartments : false

    const { execute: saveApartment } = useAsyncAction(updateApartment, {
        onSuccess: () => router.refresh(),
        successMessage: dictionary.extraPayment.updateSuccess,
        errorMessage: dictionary.common.error
    })

    const { execute: addApartment } = useAsyncAction(createApartment, {
        onSuccess: () => {
            setNewRow({ unit: "", permillage: "" })
            router.refresh()
        },
        successMessage: dictionary.common.success,
        errorMessage: dictionary.common.error
    })

    const { execute: removeApartment } = useAsyncAction(deleteApartment, {
        onSuccess: () => router.refresh(),
        successMessage: dictionary.extraPayment.deleteSuccess,
        errorMessage: dictionary.common.error
    })

    const { execute: unclaimResident } = useAsyncAction(unclaimApartmentAction, {
        onSuccess: () => router.refresh(),
        successMessage: dictionary.common.success,
        errorMessage: dictionary.common.error
    })

    useEffect(() => {
        if (editingCell && inputRef.current) {
            inputRef.current.focus()
            inputRef.current.select()
        }
    }, [editingCell])

    const startEdit = (id: number | 'new', field: 'unit' | 'permillage', currentValue: string) => {
        setEditingCell({ id, field })
        setEditValue(currentValue)
    }

    const handleSave = async (): Promise<void> => {
        if (!editingCell) return

        const { id, field } = editingCell

        if (id === 'new') {
            // Update local state for new row
            setNewRow(prev => ({ ...prev, [field]: editValue }))
            setEditingCell(null)
            return
        }

        // Update existing apartment
        const data: Partial<Apartment> = {}
        if (field === 'unit') data.unit = editValue
        if (field === 'permillage') {
            const cleanPerm = editValue.replace(',', '.')
            const parsedPerm = parseFloat(cleanPerm)
            data.permillage = editValue && !isNaN(parsedPerm) ? parsedPerm : null
        }
        await saveApartment(id, data)
        setEditingCell(null)
    }

    const handleKeyDown = async (e: React.KeyboardEvent): Promise<void> => {
        if (e.key === 'Enter') {
            e.preventDefault()
            await handleSave()

            // If we just saved the new row's unit, move to permillage
            if (editingCell?.id === 'new' && editingCell?.field === 'unit' && editValue.trim()) {
                setTimeout(() => startEdit('new', 'permillage', newRow.permillage), 0)
            }
        } else if (e.key === 'Escape') {
            setEditingCell(null)
        } else if (e.key === 'Tab') {
            e.preventDefault()
            await handleSave()

            // Tab navigation logic
            if (editingCell?.field === 'unit') {
                setTimeout(() => startEdit(editingCell.id, 'permillage',
                    editingCell.id === 'new' ? newRow.permillage :
                        apartments.find(a => a.apartment.id === editingCell.id)?.apartment.permillage?.toString().replace('.', ',') || ''
                ), 0)
            }
        }
    }

    const handleAddRow = async (): Promise<void> => {
        if (!newRow.unit.trim() || !newRow.permillage.trim()) {
            toast({
                title: dictionary.common.error,
                description: "Both unit and permillage are required.",
                variant: "destructive"
            })
            return
        }

        const cleanPerm = newRow.permillage.replace(',', '.')
        const parsedPerm = parseFloat(cleanPerm)

        if (isNaN(parsedPerm) || parsedPerm <= 0) {
            toast({
                title: dictionary.common.error,
                description: "Permillage must be a valid positive number.",
                variant: "destructive"
            })
            return
        }

        await addApartment(buildingId, {
            unit: newRow.unit.trim(),
            permillage: parsedPerm
        })
    }

    const isNewRowValid = newRow.unit.trim() && newRow.permillage.trim() && !isNaN(parseFloat(newRow.permillage.replace(',', '.')))

    const handleDeleteClick = (id: number) => {
        setApartmentToDelete(id)
        setIsDeleteModalOpen(true)
    }

    const confirmDelete = async (): Promise<void> => {
        if (!apartmentToDelete) return
        await removeApartment(apartmentToDelete)
        setIsDeleteModalOpen(false)
        setApartmentToDelete(null)
    }

    const handleDelete = async (id: number): Promise<void> => {
        setApartmentToDelete(id)
        setIsDeleteModalOpen(true)
    }

    const handleUnclaim = (id: number, name: string): void => {
        setUnclaimTarget({ id, name })
        setIsUnclaimModalOpen(true)
    }

    const confirmUnclaim = async (): Promise<void> => {
        if (!unclaimTarget) return
        await unclaimResident(unclaimTarget.id)
        setIsUnclaimModalOpen(false)
        setUnclaimTarget(null)
    }

    const renderCell = (id: number | 'new', field: 'unit' | 'permillage', value: string, placeholder: string) => {
        const isEditing = editingCell?.id === id && editingCell?.field === field

        if (isEditing) {
            return (
                <input
                    ref={inputRef}
                    value={editValue}
                    onChange={e => setEditValue(e.target.value)}
                    onBlur={handleSave}
                    onKeyDown={handleKeyDown}
                    className="w-full h-full bg-blue-50 border-0 outline-none px-3 py-2 font-mono text-[11px] uppercase"
                    placeholder={placeholder}
                />
            )
        }

        return (
            <div
                onClick={() => startEdit(id, field, value)}
                className="w-full h-full px-3 py-2 cursor-text hover:bg-blue-50/50 transition-colors font-mono text-[11px] uppercase"
            >
                {value || <span className="text-slate-300 italic normal-case">{id === 'new' ? dictionary.common.search : placeholder}</span>}
            </div>
        )
    }

    return (
        <Card className="rounded-none border-slate-200 shadow-none overflow-hidden">
            <CardHeader className="py-2 px-4 border-b border-slate-100 bg-slate-50">
                <CardTitle className="text-[9px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                    <Layers className="w-3 h-3" />
                    Unit_Inventory
                </CardTitle>
                <span className="text-[9px] font-mono text-slate-400">{apartments.length} units</span>
            </CardHeader>
            <CardContent className="p-0">
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-[11px]">
                        <thead>
                            <tr className="bg-slate-100 border-b border-slate-200">
                                <th className="text-left py-2 px-3 font-bold text-slate-500 uppercase tracking-tighter border-r border-slate-200 w-1/3">{dictionary.extraPayment.unit}</th>
                                <th className="text-left py-2 px-3 font-bold text-slate-500 uppercase tracking-tighter border-r border-slate-200 w-28">
                                    <span className="flex items-center gap-1">{dictionary.extraPayment.permillage} <span className="text-slate-400 font-normal">‰</span></span>
                                </th>
                                <th className="text-left py-2 px-3 font-bold text-slate-500 uppercase tracking-tighter border-r border-slate-200">{dictionary.extraPayment.resident}</th>
                                <th className="text-center py-2 px-2 font-bold text-slate-500 uppercase tracking-tighter w-16"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {apartments.map(({ apartment, resident }) => (
                                <tr key={apartment.id} className="border-b border-slate-100 group hover:bg-slate-50/50">
                                    <td className="border-r border-slate-100 p-0">
                                        {renderCell(apartment.id, 'unit', apartment.unit, 'unit...')}
                                    </td>
                                    <td className={cn(
                                        "border-r border-slate-100 p-0",
                                        !apartment.permillage && "bg-amber-50/50"
                                    )}>
                                        {renderCell(apartment.id, 'permillage', apartment.permillage?.toString().replace('.', ',') || '', 'e.g. 15,50')}
                                    </td>
                                    <td className="border-r border-slate-100 px-3 py-2">
                                        {resident ? (
                                            <div className="flex items-center justify-between">
                                                <span className="text-slate-700 font-medium truncate">{resident.name}</span>
                                                <button
                                                    onClick={() => handleUnclaim(apartment.id, resident.name)}
                                                    className="opacity-0 group-hover:opacity-100 text-orange-400 hover:text-orange-600 transition-opacity ml-2 shrink-0"
                                                    title="Disconnect resident"
                                                >
                                                    <UserMinus className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        ) : (
                                            <span className="text-slate-300 italic">—</span>
                                        )}
                                    </td>
                                    <td className="text-center p-0">
                                        <div className="flex items-center justify-center">
                                            <button
                                                onClick={() => startEdit(apartment.id, 'unit', apartment.unit)}
                                                className="p-2 text-slate-300 hover:text-blue-500 hover:bg-blue-50 transition-colors opacity-0 group-hover:opacity-100"
                                                title="Edit unit"
                                            >
                                                <Pencil className="w-3.5 h-3.5" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(apartment.id)}
                                                className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition-colors opacity-0 group-hover:opacity-100"
                                                title="Delete unit"
                                                data-testid={`delete-unit-button-${apartment.id}`}
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {/* New Row */}
                            {!isLimitReached && (
                                <tr className="bg-emerald-50/30 border-b border-slate-100">
                                    <td className="border-r border-slate-100 p-0">
                                        {renderCell('new', 'unit', newRow.unit, 'Type new unit...')}
                                    </td>
                                    <td className={cn(
                                        "border-r border-slate-100 p-0",
                                        newRow.unit.trim() && !newRow.permillage.trim() && "bg-rose-50/50"
                                    )}>
                                        {renderCell('new', 'permillage', newRow.permillage, 'required')}
                                    </td>
                                    <td className="border-r border-slate-100 px-3 py-2">
                                        <span className="text-slate-300 text-[10px] italic">
                                            {newRow.unit.trim() && !newRow.permillage.trim() ? (
                                                <span className="text-rose-400">fill permillage</span>
                                            ) : 'new entry'}
                                        </span>
                                    </td>
                                    <td className="text-center p-0">
                                        <button
                                            onClick={handleAddRow}
                                            disabled={!isNewRowValid}
                                            className="px-3 py-2 text-[9px] font-bold uppercase text-emerald-600 hover:bg-emerald-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                        >
                                            Add
                                        </button>
                                    </td>
                                </tr>
                            )}
                            {isLimitReached && apartments.length > 0 && (
                                <tr className="bg-slate-50 border-b border-slate-100">
                                    <td colSpan={4} className="py-2 px-4 text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                        [ UNIT_LIMIT_REACHED: {totalApartments} / {totalApartments} ]
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                {apartments.length === 0 && (
                    <div className="py-6 text-center text-slate-400 italic text-[11px] border-t border-slate-100">
                        Click on the cells above to add your first unit
                    </div>
                )}
            </CardContent>
            <ConfirmModal
                isOpen={isDeleteModalOpen}
                title={dictionary.paymentGrid.deleteApartment}
                message={dictionary.paymentGrid.deleteMessage}
                onConfirm={confirmDelete}
                onCancel={() => setIsDeleteModalOpen(false)}
                variant="danger"
            />
            <ConfirmModal
                isOpen={isUnclaimModalOpen}
                title="Desconectar Residente"
                message={`Tem a certeza que deseja desconectar ${unclaimTarget?.name} desta fração?`}
                onConfirm={confirmUnclaim}
                onCancel={() => setIsUnclaimModalOpen(false)}
                variant="neutral"
            />
        </Card>
    )
}
