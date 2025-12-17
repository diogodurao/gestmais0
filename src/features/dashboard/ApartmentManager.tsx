"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { bulkCreateApartments, updateApartment, deleteApartment } from "@/app/actions/building"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Card, CardHeader, CardContent } from "@/components/ui/Card"
import { Modal } from "@/components/ui/Modal"
import { Plus, Trash2, Pencil } from "lucide-react"

type ApartmentData = {
    apartment: {
        id: number
        unit: string
        floor: number | null
        permillage: number | null
        residentId: string | null
    }
    resident: {
        id: string
        name: string
        email: string
    } | null
}

export function ApartmentManager({
    apartments,
    buildingId
}: {
    apartments: ApartmentData[]
    buildingId: string
}) {
    const router = useRouter()
    const [showBulkAdd, setShowBulkAdd] = useState(false)
    const [bulkInput, setBulkInput] = useState("")
    const [isBulkSaving, setIsBulkSaving] = useState(false)

    const [editApt, setEditApt] = useState<ApartmentData["apartment"] | null>(null)
    const [editForm, setEditForm] = useState({ unit: "", floor: "", permillage: "" })
    const [isEditSaving, setIsEditSaving] = useState(false)

    const handleBulkAdd = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!bulkInput.trim()) return

        setIsBulkSaving(true)
        try {
            await bulkCreateApartments(buildingId, bulkInput)
            setBulkInput("")
            setShowBulkAdd(false)
            router.refresh()
        } catch (error) {
            console.error("Bulk add failed", error)
        } finally {
            setIsBulkSaving(false)
        }
    }

    const openEdit = (apt: ApartmentData["apartment"]) => {
        setEditApt(apt)
        setEditForm({
            unit: apt.unit,
            floor: apt.floor?.toString() || "",
            permillage: apt.permillage?.toString().replace('.', ',') || "",
        })
    }

    const handleEditSave = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!editApt) return

        setIsEditSaving(true)
        // Handle comma as decimal separator and parse as float
        const cleanFloor = editForm.floor.replace(',', '.')
        const cleanPerm = editForm.permillage.replace(',', '.')
        
        const parsedFloor = parseInt(cleanFloor)
        const parsedPerm = parseFloat(cleanPerm)

        try {
            await updateApartment(editApt.id, {
                unit: editForm.unit,
                floor: editForm.floor && !isNaN(parsedFloor) ? parsedFloor : null,
                permillage: editForm.permillage && !isNaN(parsedPerm) ? parsedPerm : null,
            })
            setEditApt(null)
            router.refresh()
        } catch (error) {
            console.error("Update failed", error)
        } finally {
            setIsEditSaving(false)
        }
    }

    const handleDelete = async (id: number) => {
        if (!confirm("Delete this apartment and all its payments?")) return
        try {
            await deleteApartment(id)
            router.refresh()
        } catch (error) {
            console.error("Delete failed", error)
        }
    }

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <h2 className="text-lg font-semibold">Apartments</h2>
                <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => setShowBulkAdd(!showBulkAdd)}>
                        Bulk Add
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {showBulkAdd && (
                    <form onSubmit={handleBulkAdd} className="p-4 bg-gray-50 rounded-md border border-gray-200 space-y-3">
                        <Input
                            label="Units (comma-separated)"
                            placeholder="1A, 1B, 2A, 2B, 3A, 3B"
                            value={bulkInput}
                            onChange={e => setBulkInput(e.target.value)}
                        />
                        <div className="flex gap-2">
                            <Button type="submit" size="sm" disabled={isBulkSaving}>
                                {isBulkSaving ? "Adding..." : "Add Units"}
                            </Button>
                            <Button type="button" size="sm" variant="ghost" onClick={() => setShowBulkAdd(false)}>
                                Cancel
                            </Button>
                        </div>
                    </form>
                )}

                {apartments.length === 0 ? (
                    <p className="text-sm text-gray-400 italic py-4">No apartments yet. Use Bulk Add to create multiple at once.</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-gray-100">
                                    <th className="text-left py-2 px-2 font-medium text-gray-600">Unit</th>
                                    <th className="text-left py-2 px-2 font-medium text-gray-600">Floor</th>
                                    <th className="text-left py-2 px-2 font-medium text-gray-600">Permillage</th>
                                    <th className="text-left py-2 px-2 font-medium text-gray-600">Resident</th>
                                    <th className="text-right py-2 px-2 font-medium text-gray-600">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {apartments.map(({ apartment, resident }) => (
                                    <tr key={apartment.id} className="border-b border-gray-50 hover:bg-gray-50">
                                        <td className="py-2 px-2 font-medium">{apartment.unit}</td>
                                        <td className="py-2 px-2 text-gray-600">{apartment.floor ?? "—"}</td>
                                        <td className="py-2 px-2 text-gray-600">
                                        {apartment.permillage?.toString().replace('.', ',') ?? "—"}
                                    </td>
                                        <td className="py-2 px-2 text-gray-600">
                                            {resident ? resident.name : <span className="text-gray-400">—</span>}
                                        </td>
                                        <td className="py-2 px-2 text-right">
                                            <div className="flex justify-end gap-1">
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => openEdit(apartment)}
                                                    className="p-1 h-auto"
                                                >
                                                    <Pencil className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => handleDelete(apartment.id)}
                                                    className="p-1 h-auto text-red-500 hover:text-red-600"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </CardContent>

            <Modal
                isOpen={!!editApt}
                onClose={() => setEditApt(null)}
                title={`Edit Apartment ${editApt?.unit || ""}`}
            >
                {editApt && (
                    <form onSubmit={handleEditSave} className="space-y-4">
                        <Input
                            label="Unit"
                            value={editForm.unit}
                            onChange={e => setEditForm(prev => ({ ...prev, unit: e.target.value }))}
                            required
                        />
                        <Input
                            label="Floor"
                            type="number"
                            value={editForm.floor}
                            onChange={e => setEditForm(prev => ({ ...prev, floor: e.target.value }))}
                        />
                        <Input
                            label="Permillage"
                            value={editForm.permillage}
                            onChange={e => setEditForm(prev => ({ ...prev, permillage: e.target.value }))}
                            placeholder="e.g., 45,50"
                        />
                        <div className="flex justify-end gap-2 pt-2">
                            <Button type="button" variant="ghost" onClick={() => setEditApt(null)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isEditSaving}>
                                {isEditSaving ? "Saving..." : "Save"}
                            </Button>
                        </div>
                    </form>
                )}
            </Modal>
        </Card>
    )
}
