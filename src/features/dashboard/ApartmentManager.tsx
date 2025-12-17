"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { bulkCreateApartments, updateApartment, deleteApartment } from "@/app/actions/building"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Card, CardHeader, CardContent } from "@/components/ui/Card"
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

    const [expandedId, setExpandedId] = useState<number | null>(null)
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
        setExpandedId(apt.id)
        setEditForm({
            unit: apt.unit,
            floor: apt.floor?.toString() || "",
            permillage: apt.permillage?.toString().replace('.', ',') || "",
        })
    }

    const handleEditSave = async (e: React.FormEvent, apartmentId: number) => {
        e.preventDefault()
        if (!apartmentId) return

        setIsEditSaving(true)
        // Handle comma as decimal separator and parse as float
        const cleanFloor = editForm.floor.replace(',', '.')
        const cleanPerm = editForm.permillage.replace(',', '.')

        const parsedFloor = parseInt(cleanFloor)
        const parsedPerm = parseFloat(cleanPerm)

        try {
            await updateApartment(apartmentId, {
                unit: editForm.unit,
                floor: editForm.floor && !isNaN(parsedFloor) ? parsedFloor : null,
                permillage: editForm.permillage && !isNaN(parsedPerm) ? parsedPerm : null,
            })
            setExpandedId(null)
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
                        <div className="space-y-1">
                            <label className="block text-sm font-medium text-gray-700">Units (comma or line separated)</label>
                            <textarea
                                placeholder={"Loja A\nCave B\nR/C Esq\n1Dto"}
                                value={bulkInput}
                                onChange={e => setBulkInput(e.target.value)}
                                rows={4}
                                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-black text-black placeholder:text-gray-400 border-gray-300"
                            />
                        </div>
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {apartments.map(({ apartment, resident }) => {
                            const isOpen = expandedId === apartment.id
                            return (
                                <div key={apartment.id} className="border border-gray-200 rounded-lg p-3 bg-white shadow-sm">
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <span className="text-base font-semibold text-black">{apartment.unit}</span>
                                                <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">
                                                    {apartment.floor !== null && apartment.floor !== undefined ? `Floor ${apartment.floor}` : "No floor"}
                                                </span>
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                Permillage: {apartment.permillage !== null && apartment.permillage !== undefined
                                                    ? apartment.permillage.toString().replace('.', ',')
                                                    : "—"}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                Resident: {resident ? resident.name : "Unclaimed"}
                                            </div>
                                        </div>
                                        <div className="flex gap-1">
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => (isOpen ? setExpandedId(null) : openEdit(apartment))}
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
                                    </div>

                                    {isOpen && (
                                        <form onSubmit={(e) => handleEditSave(e, apartment.id)} className="mt-3 space-y-3">
                                            <Input
                                                label="Unit label"
                                                value={editForm.unit}
                                                onChange={e => setEditForm(prev => ({ ...prev, unit: e.target.value }))}
                                                required
                                            />
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                <Input
                                                    label="Floor"
                                                    value={editForm.floor}
                                                    onChange={e => setEditForm(prev => ({ ...prev, floor: e.target.value }))}
                                                    placeholder="-1, 0, 1..."
                                                />
                                                <Input
                                                    label="Permillage (‰)"
                                                    value={editForm.permillage}
                                                    onChange={e => setEditForm(prev => ({ ...prev, permillage: e.target.value }))}
                                                    placeholder="e.g., 16,48"
                                                />
                                            </div>
                                            <div className="flex justify-end gap-2">
                                                <Button type="button" variant="ghost" onClick={() => setExpandedId(null)}>
                                                    Cancel
                                                </Button>
                                                <Button type="submit" disabled={isEditSaving}>
                                                    {isEditSaving ? "Saving..." : "Save"}
                                                </Button>
                                            </div>
                                        </form>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
