"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { updatePaymentStatus, PaymentData, PaymentStatus } from "@/app/actions/payments"
import { createApartment, deleteApartment } from "@/app/actions/building"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Modal } from "@/components/ui/Modal"
import { Plus } from "lucide-react"
import { PaymentDesktopTable } from "./PaymentDesktopTable"
import { PaymentMobileCards } from "./PaymentMobileCards"

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

export function PaymentGrid({
    data,
    buildingId,
    year,
    readOnly = false
}: {
    data: PaymentData[],
    buildingId: string,
    year: number,
    readOnly?: boolean
}) {
    const router = useRouter()
    const [isAdding, setIsAdding] = useState(false)
    const [newUnit, setNewUnit] = useState("")

    // Modal State
    const [editCell, setEditCell] = useState<{ aptId: number, monthIdx: number, status: string, unit: string } | null>(null)
    const [isSaving, setIsSaving] = useState(false)

    const handleAddApartment = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newUnit) return
        try {
            await createApartment(buildingId, newUnit)
            setNewUnit("")
            setIsAdding(false)
            router.refresh()
        } catch (error) {
            alert("Failed to create apartment. It might already exist.")
        }
    }

    const handleDeleteApartment = async (aptId: number) => {
        if (!confirm("Are you sure? This will delete all payments for this apartment.")) return
        try {
            await deleteApartment(aptId)
            router.refresh()
        } catch (error) {
            console.error(error)
            alert("Failed to delete apartment.")
        }
    }

    const handleCellClick = (aptId: number, monthIdx: number, currentStatus: string, unit: string) => {
        setEditCell({ aptId, monthIdx, status: currentStatus, unit })
    }

    const handleSaveStatus = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!editCell) return

        setIsSaving(true)
        const month = editCell.monthIdx + 1
        try {
            await updatePaymentStatus(editCell.aptId, month, year, editCell.status as PaymentStatus)
            setEditCell(null)
            router.refresh()
        } catch (error) {
            console.error(error)
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <div className="space-y-6">
            {/* Controls */}
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">Payments {year}</h2>
                {!readOnly && (
                    <Button size="sm" onClick={() => setIsAdding(!isAdding)}>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Apartment
                    </Button>
                )}
            </div>

            {/* Add Form */}
            {isAdding && !readOnly && (
                <form onSubmit={handleAddApartment} className="flex gap-2 items-center p-4 bg-gray-50 rounded-md border border-gray-200 animate-in slide-in-from-top-2">
                    <Input
                        placeholder="Unit (e.g. 1A)"
                        value={newUnit}
                        onChange={e => setNewUnit(e.target.value)}
                        className="w-32 bg-white"
                        autoFocus
                    />
                    <Button type="submit" size="sm">Save</Button>
                    <Button type="button" variant="ghost" size="sm" onClick={() => setIsAdding(false)}>Cancel</Button>
                </form>
            )}

            {/* Desktop View */}
            <PaymentDesktopTable
                data={data}
                readOnly={readOnly}
                loadingCell={null} // We removed optimistic loading state for now in favor of simple refresh
                onCellClick={handleCellClick}
                onDelete={handleDeleteApartment}
            />

            {/* Mobile View */}
            <PaymentMobileCards
                data={data}
                readOnly={readOnly}
                onCellClick={handleCellClick}
                onDelete={handleDeleteApartment}
            />

            {/* Legend */}
            <div className="flex gap-4 text-xs text-gray-500 justify-end">
                <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-green-100 border border-green-200"></div> Paid</div>
                <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-red-100 border border-red-200"></div> Late</div>
                <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-gray-50 border border-gray-200"></div> Pending</div>
            </div>

            {/* Edit Modal (Shared) */}
            <Modal
                isOpen={!!editCell}
                onClose={() => setEditCell(null)}
                title={editCell ? `Edit Payment: ${editCell.unit} - ${MONTHS[editCell.monthIdx]}` : "Edit Payment"}
            >
                {editCell && (
                    <form onSubmit={handleSaveStatus} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                            <select
                                value={editCell.status}
                                onChange={(e) => setEditCell({ ...editCell, status: e.target.value })}
                                className="w-full rounded-md border border-gray-300 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                            >
                                <option value="pending">Pending</option>
                                <option value="paid">Paid</option>
                                <option value="late">Late</option>
                            </select>
                        </div>

                        <div className="flex justify-end gap-2 pt-2">
                            <Button type="button" variant="ghost" onClick={() => setEditCell(null)}>Cancel</Button>
                            <Button type="submit" disabled={isSaving}>
                                {isSaving ? "Saving..." : "Save Changes"}
                            </Button>
                        </div>
                    </form>
                )}
            </Modal>
        </div>
    )
}