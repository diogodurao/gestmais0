"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createApartment, updateApartment, deleteApartment } from "@/app/actions/building"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Card, CardHeader, CardContent } from "@/components/ui/Card"
import { Modal } from "@/components/ui/Modal"
import { Plus, Trash2, Pencil, ChevronDown, ChevronRight, Home, Store, Car, Package } from "lucide-react"

type ApartmentData = {
    apartment: {
        id: number
        floor: string
        unitType: string
        identifier: string
        permillage: number | null
        residentId: string | null
    }
    resident: {
        id: string
        name: string
        email: string
    } | null
}

const UNIT_TYPES = [
    { value: "apartment", label: "Apartment", icon: Home },
    { value: "shop", label: "Shop/Loja", icon: Store },
    { value: "garage", label: "Garage", icon: Car },
    { value: "cave", label: "Cave", icon: Package },
    { value: "storage", label: "Storage", icon: Package },
]

const FLOOR_OPTIONS = [
    { value: "-2", label: "-2" },
    { value: "-1", label: "-1" },
    { value: "0", label: "R/C" },
    { value: "1", label: "1º" },
    { value: "2", label: "2º" },
    { value: "3", label: "3º" },
    { value: "4", label: "4º" },
    { value: "5", label: "5º" },
    { value: "6", label: "6º" },
    { value: "7", label: "7º" },
    { value: "8", label: "8º" },
    { value: "9", label: "9º" },
    { value: "10", label: "10º" },
]

function getFloorLabel(floor: string): string {
    const opt = FLOOR_OPTIONS.find(f => f.value === floor)
    return opt?.label || floor
}

function getUnitTypeIcon(unitType: string) {
    const type = UNIT_TYPES.find(t => t.value === unitType)
    return type?.icon || Home
}

export function ApartmentManager({
    apartments,
    buildingId
}: {
    apartments: ApartmentData[]
    buildingId: string
}) {
    const router = useRouter()
    const [showAddForm, setShowAddForm] = useState(false)
    const [addForm, setAddForm] = useState({ floor: "0", unitType: "apartment", identifier: "", permillage: "" })
    const [isAdding, setIsAdding] = useState(false)

    const [editApt, setEditApt] = useState<ApartmentData["apartment"] | null>(null)
    const [editForm, setEditForm] = useState({ floor: "", unitType: "", identifier: "", permillage: "" })
    const [isEditSaving, setIsEditSaving] = useState(false)

    const [expandedFloors, setExpandedFloors] = useState<Set<string>>(new Set())

    // Group apartments by floor
    const groupedByFloor = apartments.reduce((acc, item) => {
        const floor = item.apartment.floor
        if (!acc[floor]) acc[floor] = []
        acc[floor].push(item)
        return acc
    }, {} as Record<string, ApartmentData[]>)

    // Sort floors
    const sortedFloors = Object.keys(groupedByFloor).sort((a, b) => {
        const aNum = a === "R/C" ? 0 : parseInt(a)
        const bNum = b === "R/C" ? 0 : parseInt(b)
        const aVal = isNaN(aNum) ? 0 : aNum
        const bVal = isNaN(bNum) ? 0 : bNum
        return aVal - bVal
    })

    const toggleFloor = (floor: string) => {
        setExpandedFloors(prev => {
            const next = new Set(prev)
            if (next.has(floor)) {
                next.delete(floor)
            } else {
                next.add(floor)
            }
            return next
        })
    }

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!addForm.identifier.trim()) return

        setIsAdding(true)
        try {
            const cleanPerm = addForm.permillage.replace(',', '.')
            const parsedPerm = parseFloat(cleanPerm)

            await createApartment(buildingId, {
                floor: addForm.floor,
                unitType: addForm.unitType,
                identifier: addForm.identifier.trim(),
                permillage: addForm.permillage && !isNaN(parsedPerm) ? parsedPerm : null,
            })
            setAddForm({ floor: "0", unitType: "apartment", identifier: "", permillage: "" })
            setShowAddForm(false)
            router.refresh()
        } catch (error) {
            console.error("Add failed", error)
        } finally {
            setIsAdding(false)
        }
    }

    const openEdit = (apt: ApartmentData["apartment"]) => {
        setEditApt(apt)
        setEditForm({
            floor: apt.floor,
            unitType: apt.unitType,
            identifier: apt.identifier,
            permillage: apt.permillage?.toString().replace('.', ',') || "",
        })
    }

    const handleEditSave = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!editApt) return

        setIsEditSaving(true)
        const cleanPerm = editForm.permillage.replace(',', '.')
        const parsedPerm = parseFloat(cleanPerm)

        try {
            await updateApartment(editApt.id, {
                floor: editForm.floor,
                unitType: editForm.unitType,
                identifier: editForm.identifier,
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
        if (!confirm("Delete this unit and all its payments?")) return
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
                <h2 className="text-lg font-semibold">Units</h2>
                <Button size="sm" onClick={() => setShowAddForm(!showAddForm)}>
                    <Plus className="w-4 h-4 mr-1" />
                    Add Unit
                </Button>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Add Unit Form */}
                {showAddForm && (
                    <form onSubmit={handleAdd} className="p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            {/* Floor Select */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Floor</label>
                                <select
                                    value={addForm.floor}
                                    onChange={e => setAddForm(prev => ({ ...prev, floor: e.target.value }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
                                >
                                    {FLOOR_OPTIONS.map(opt => (
                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Unit Type Select */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                                <select
                                    value={addForm.unitType}
                                    onChange={e => setAddForm(prev => ({ ...prev, unitType: e.target.value }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
                                >
                                    {UNIT_TYPES.map(opt => (
                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            {/* Identifier */}
                            <Input
                                label="Identifier"
                                placeholder="A, B, esq, dto, 1..."
                                value={addForm.identifier}
                                onChange={e => setAddForm(prev => ({ ...prev, identifier: e.target.value }))}
                                required
                            />

                            {/* Permillage */}
                            <Input
                                label="Permillage"
                                placeholder="e.g., 45,50"
                                value={addForm.permillage}
                                onChange={e => setAddForm(prev => ({ ...prev, permillage: e.target.value }))}
                            />
                        </div>

                        <div className="flex gap-2">
                            <Button type="submit" size="sm" disabled={isAdding}>
                                {isAdding ? "Adding..." : "Add Unit"}
                            </Button>
                            <Button type="button" size="sm" variant="ghost" onClick={() => setShowAddForm(false)}>
                                Cancel
                            </Button>
                        </div>
                    </form>
                )}

                {/* Units List - Grouped by Floor */}
                {apartments.length === 0 ? (
                    <p className="text-sm text-gray-400 italic py-4">No units yet. Click "Add Unit" to create one.</p>
                ) : (
                    <div className="space-y-2">
                        {sortedFloors.map(floor => {
                            const floorUnits = groupedByFloor[floor]
                            const isExpanded = expandedFloors.has(floor)
                            const claimedCount = floorUnits.filter(u => u.resident).length

                            return (
                                <div key={floor} className="border border-gray-100 rounded-lg overflow-hidden">
                                    {/* Floor Header - Clickable */}
                                    <button
                                        onClick={() => toggleFloor(floor)}
                                        className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors"
                                    >
                                        <div className="flex items-center gap-2">
                                            {isExpanded ? (
                                                <ChevronDown className="w-4 h-4 text-gray-500" />
                                            ) : (
                                                <ChevronRight className="w-4 h-4 text-gray-500" />
                                            )}
                                            <span className="font-medium">{getFloorLabel(floor)}</span>
                                            <span className="text-sm text-gray-500">
                                                ({floorUnits.length} units, {claimedCount} claimed)
                                            </span>
                                        </div>
                                    </button>

                                    {/* Floor Units - Expandable */}
                                    {isExpanded && (
                                        <div className="divide-y divide-gray-50">
                                            {floorUnits.map(({ apartment, resident }) => {
                                                const Icon = getUnitTypeIcon(apartment.unitType)
                                                return (
                                                    <div
                                                        key={apartment.id}
                                                        className="flex items-center justify-between px-4 py-2 hover:bg-gray-50"
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <Icon className="w-4 h-4 text-gray-400" />
                                                            <div>
                                                                <span className="font-medium">{apartment.identifier}</span>
                                                                <span className="text-xs text-gray-400 ml-2">
                                                                    {apartment.unitType}
                                                                </span>
                                                            </div>
                                                            {apartment.permillage && (
                                                                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                                                                    {apartment.permillage.toString().replace('.', ',')}‰
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            {resident ? (
                                                                <span className="text-sm text-gray-600">{resident.name}</span>
                                                            ) : (
                                                                <span className="text-xs text-orange-500">Unclaimed</span>
                                                            )}
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
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                )}
            </CardContent>

            {/* Edit Modal */}
            <Modal
                isOpen={!!editApt}
                onClose={() => setEditApt(null)}
                title={`Edit Unit ${editApt ? `${getFloorLabel(editApt.floor)} ${editApt.identifier}` : ""}`}
            >
                {editApt && (
                    <form onSubmit={handleEditSave} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Floor</label>
                                <select
                                    value={editForm.floor}
                                    onChange={e => setEditForm(prev => ({ ...prev, floor: e.target.value }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
                                >
                                    {FLOOR_OPTIONS.map(opt => (
                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                                <select
                                    value={editForm.unitType}
                                    onChange={e => setEditForm(prev => ({ ...prev, unitType: e.target.value }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
                                >
                                    {UNIT_TYPES.map(opt => (
                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <Input
                            label="Identifier"
                            value={editForm.identifier}
                            onChange={e => setEditForm(prev => ({ ...prev, identifier: e.target.value }))}
                            required
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
