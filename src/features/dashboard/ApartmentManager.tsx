"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createApartment, updateApartment, deleteApartment, bulkCreateApartments, bulkDeleteApartments } from "@/app/actions/building"
import { unclaimApartmentAction } from "@/app/actions/resident-management"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Card, CardHeader, CardContent } from "@/components/ui/Card"
import { Modal } from "@/components/ui/Modal"
import { Plus, Trash2, Pencil, ChevronDown, ChevronRight, Home, Store, Car, Package, UserMinus, Layers, CheckSquare, Square } from "lucide-react"

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
    buildingId,
    buildingComplete = true
}: {
    apartments: ApartmentData[]
    buildingId: string
    buildingComplete?: boolean
}) {
    const router = useRouter()
    const [showAddForm, setShowAddForm] = useState(false)
    const [showBulkForm, setShowBulkForm] = useState(false)
    const [addForm, setAddForm] = useState({ floor: "0", unitType: "apartment", identifier: "", permillage: "" })
    const [bulkForm, setBulkForm] = useState({ 
        startFloor: "0", 
        endFloor: "1", 
        identifierMode: "preset" as "preset" | "custom",
        presetType: "esq_dto" as "esq_dto" | "letters" | "numbers",
        customIdentifiers: "A, B",
        sequenceCount: "2",
        unitType: "apartment" 
    })
    const [isAdding, setIsAdding] = useState(false)
    const [isBulkAdding, setIsBulkAdding] = useState(false)

    const [editApt, setEditApt] = useState<ApartmentData["apartment"] | null>(null)
    const [editForm, setEditForm] = useState({ floor: "", unitType: "", identifier: "", permillage: "" })
    const [isEditSaving, setIsEditSaving] = useState(false)

    const [expandedFloors, setExpandedFloors] = useState<Set<string>>(new Set())
    const [showIncompleteModal, setShowIncompleteModal] = useState(false)
    
    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())
    const [isBulkDeleting, setIsBulkDeleting] = useState(false)

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

    const toggleSelection = (id: number) => {
        setSelectedIds(prev => {
            const next = new Set(prev)
            if (next.has(id)) {
                next.delete(id)
            } else {
                next.add(id)
            }
            return next
        })
    }

    const toggleFloorSelection = (floorUnits: ApartmentData[]) => {
        const floorIds = floorUnits.map(u => u.apartment.id)
        const allSelected = floorIds.every(id => selectedIds.has(id))
        
        setSelectedIds(prev => {
            const next = new Set(prev)
            if (allSelected) {
                floorIds.forEach(id => next.delete(id))
            } else {
                floorIds.forEach(id => next.add(id))
            }
            return next
        })
    }

    const handleBulkDelete = async () => {
        const count = selectedIds.size
        if (count === 0) return
        if (!confirm(`Are you sure you want to delete ${count} selected units and all their payments?`)) return

        setIsBulkDeleting(true)
        try {
            await bulkDeleteApartments(Array.from(selectedIds))
            setSelectedIds(new Set())
            router.refresh()
        } catch (error) {
            console.error("Bulk delete failed", error)
            alert("Failed to delete selected units.")
        } finally {
            setIsBulkDeleting(false)
        }
    }

    const handleAddClick = () => {
        if (!buildingComplete) {
            setShowIncompleteModal(true)
            return
        }
        setShowAddForm(!showAddForm)
        setShowBulkForm(false)
    }

    const handleBulkClick = () => {
        if (!buildingComplete) {
            setShowIncompleteModal(true)
            return
        }
        setShowBulkForm(!showBulkForm)
        setShowAddForm(false)
    }

    const handleBulkAdd = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsBulkAdding(true)

        try {
            const start = parseInt(bulkForm.startFloor)
            const end = parseInt(bulkForm.endFloor)
            
            let ids: string[] = []
            
            if (bulkForm.identifierMode === "preset") {
                if (bulkForm.presetType === "esq_dto") {
                    ids = ["Esq", "Dto"]
                } else if (bulkForm.presetType === "letters") {
                    const count = parseInt(bulkForm.sequenceCount) || 1
                    ids = Array.from({ length: count }, (_, i) => String.fromCharCode(65 + i))
                } else if (bulkForm.presetType === "numbers") {
                    const count = parseInt(bulkForm.sequenceCount) || 1
                    ids = Array.from({ length: count }, (_, i) => (i + 1).toString())
                }
            } else {
                ids = bulkForm.customIdentifiers.split(",").map(id => id.trim()).filter(id => id)
            }
            
            const unitsToCreate = []
            for (let f = start; f <= end; f++) {
                for (const id of ids) {
                    unitsToCreate.push({
                        floor: f.toString(),
                        unitType: bulkForm.unitType,
                        identifier: id,
                        permillage: null
                    })
                }
            }

            await bulkCreateApartments(buildingId, unitsToCreate)
            setShowBulkForm(false)
            router.refresh()
        } catch (error) {
            console.error("Bulk add failed", error)
            alert("Failed to bulk add units. Some might already exist.")
        } finally {
            setIsBulkAdding(false)
        }
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

    const handleUnclaim = async (id: number, residentName: string) => {
        if (!confirm(`Are you sure you want to disconnect ${residentName} from this unit?`)) return
        try {
            await unclaimApartmentAction(id)
            router.refresh()
        } catch (error) {
            console.error("Unclaim failed", error)
        }
    }

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div className="flex items-center gap-4">
                    <h2 className="text-lg font-semibold">Units</h2>
                    {selectedIds.size > 0 && (
                        <div className="flex items-center gap-2 animate-in fade-in zoom-in duration-200">
                            <span className="text-sm text-gray-500 font-medium bg-gray-100 px-2 py-1 rounded">
                                {selectedIds.size} selected
                            </span>
                            <Button 
                                size="sm" 
                                variant="ghost" 
                                onClick={handleBulkDelete}
                                disabled={isBulkDeleting}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50 h-8"
                            >
                                <Trash2 className="w-4 h-4 mr-1" />
                                {isBulkDeleting ? "Deleting..." : "Delete"}
                            </Button>
                            <Button 
                                size="sm" 
                                variant="ghost" 
                                onClick={() => setSelectedIds(new Set())}
                                className="h-8"
                            >
                                Cancel
                            </Button>
                        </div>
                    )}
                </div>
                <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={handleBulkClick}>
                        <Layers className="w-4 h-4 mr-1" />
                        Bulk Add
                    </Button>
                    <Button size="sm" onClick={handleAddClick}>
                        <Plus className="w-4 h-4 mr-1" />
                        Add Unit
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Bulk Add Form */}
                {showBulkForm && (
                    <form onSubmit={handleBulkAdd} className="p-4 bg-blue-50/50 rounded-lg border border-blue-100 space-y-4 animate-in slide-in-from-top-2">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <Input 
                                label="Start Floor" 
                                type="number" 
                                value={bulkForm.startFloor}
                                onChange={e => setBulkForm(prev => ({ ...prev, startFloor: e.target.value }))}
                            />
                            <Input 
                                label="End Floor" 
                                type="number" 
                                value={bulkForm.endFloor}
                                onChange={e => setBulkForm(prev => ({ ...prev, endFloor: e.target.value }))}
                            />
                            
                            <div className="col-span-2">
                                <label className="block text-xs font-medium text-gray-700 mb-1">Identifier Mode</label>
                                <div className="flex gap-2">
                                    <Button 
                                        type="button" 
                                        size="sm" 
                                        variant={bulkForm.identifierMode === "preset" ? "primary" : "outline"}
                                        onClick={() => setBulkForm(prev => ({ ...prev, identifierMode: "preset" }))}
                                        fullWidth
                                    >
                                        Presets
                                    </Button>
                                    <Button 
                                        type="button" 
                                        size="sm" 
                                        variant={bulkForm.identifierMode === "custom" ? "primary" : "outline"}
                                        onClick={() => setBulkForm(prev => ({ ...prev, identifierMode: "custom" }))}
                                        fullWidth
                                    >
                                        Custom
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {bulkForm.identifierMode === "preset" ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white/50 p-3 rounded-md border border-blue-100">
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Pattern</label>
                                    <select
                                        value={bulkForm.presetType}
                                        onChange={e => setBulkForm(prev => ({ ...prev, presetType: e.target.value as any }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black text-sm"
                                    >
                                        <option value="esq_dto">Esq / Dto</option>
                                        <option value="letters">Letters (A, B, C...)</option>
                                        <option value="numbers">Numbers (1, 2, 3...)</option>
                                    </select>
                                </div>
                                {bulkForm.presetType !== "esq_dto" && (
                                    <Input 
                                        label="Count per floor" 
                                        type="number" 
                                        min="1"
                                        max="26"
                                        value={bulkForm.sequenceCount}
                                        onChange={e => setBulkForm(prev => ({ ...prev, sequenceCount: e.target.value }))}
                                    />
                                )}
                            </div>
                        ) : (
                            <div className="bg-white/50 p-3 rounded-md border border-blue-100">
                                <label className="block text-xs font-medium text-gray-700 mb-1">Custom Identifiers (comma separated)</label>
                                <Input 
                                    placeholder="A, B, C or 1, 2, 3" 
                                    value={bulkForm.customIdentifiers}
                                    onChange={e => setBulkForm(prev => ({ ...prev, customIdentifiers: e.target.value }))}
                                />
                            </div>
                        )}

                        <div className="flex justify-between items-end">
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Unit Type</label>
                                <select
                                    value={bulkForm.unitType}
                                    onChange={e => setBulkForm(prev => ({ ...prev, unitType: e.target.value }))}
                                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black text-sm"
                                >
                                    {UNIT_TYPES.map(opt => (
                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex gap-2">
                                <Button type="submit" size="sm" disabled={isBulkAdding}>
                                    {isBulkAdding ? "Generating..." : "Generate Units"}
                                </Button>
                                <Button type="button" size="sm" variant="ghost" onClick={() => setShowBulkForm(false)}>
                                    Cancel
                                </Button>
                            </div>
                        </div>
                    </form>
                )}

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
                                            <div 
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    toggleFloorSelection(floorUnits)
                                                }}
                                                className="p-1 hover:bg-gray-200 rounded cursor-pointer"
                                            >
                                                {floorUnits.every(u => selectedIds.has(u.apartment.id)) ? (
                                                    <CheckSquare className="w-4 h-4 text-blue-600" />
                                                ) : (
                                                    <Square className="w-4 h-4 text-gray-400" />
                                                )}
                                            </div>
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
                                                const isSelected = selectedIds.has(apartment.id)
                                                return (
                                                    <div
                                                        key={apartment.id}
                                                        className={`flex items-center justify-between px-4 py-2 hover:bg-gray-50 transition-colors ${isSelected ? 'bg-blue-50/50' : ''}`}
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <div 
                                                                onClick={() => toggleSelection(apartment.id)}
                                                                className="cursor-pointer p-1"
                                                            >
                                                                {isSelected ? (
                                                                    <CheckSquare className="w-4 h-4 text-blue-600" />
                                                                ) : (
                                                                    <Square className="w-4 h-4 text-gray-300" />
                                                                )}
                                                            </div>
                                                            <Icon className="w-4 h-4 text-gray-400" />
                                                            <div>
                                                                <span className="font-medium text-sm">{apartment.identifier}</span>
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
                                                                <div className="flex items-center gap-2">
                                                                    <span className="text-sm text-gray-600">{resident.name}</span>
                                                                    <Button
                                                                        size="sm"
                                                                        variant="ghost"
                                                                        onClick={() => handleUnclaim(apartment.id, resident.name)}
                                                                        className="p-1 h-auto text-orange-500 hover:text-orange-600"
                                                                        title="Disconnect user from unit"
                                                                    >
                                                                        <UserMinus className="w-4 h-4" />
                                                                    </Button>
                                                                </div>
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

            {/* Incomplete building modal */}
            <Modal
                isOpen={showIncompleteModal}
                onClose={() => setShowIncompleteModal(false)}
                title="Complete building details first"
            >
                <div className="space-y-4">
                    <p className="text-sm text-gray-600">
                        First, insert the building details in the My Condominium section, then add units.
                    </p>
                    <div className="flex justify-end">
                        <Button onClick={() => setShowIncompleteModal(false)}>Got it</Button>
                    </div>
                </div>
            </Modal>

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
