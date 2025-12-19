"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { updatePaymentStatus, bulkUpdatePayments, PaymentData, PaymentStatus } from "@/app/actions/payments"
import { deleteApartment } from "@/app/actions/building"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Modal } from "@/components/ui/Modal"
import { Search, ChevronRight } from "lucide-react"
import { PaymentDesktopTable } from "./PaymentDesktopTable"
import { PaymentMobileCards } from "./PaymentMobileCards"
import { MONTHS } from "@/lib/constants"

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
    const [searchTerm, setSearchTerm] = useState("")
    const [highlightedId, setHighlightedId] = useState<number | null>(null)
    const [editCell, setEditCell] = useState<{ aptId: number, monthIdx: number, status: string, unit: string } | null>(null)
    const [isBulk, setIsBulk] = useState(false)
    const [startMonthIdx, setStartMonthIdx] = useState<number>(0)
    const [endMonthIdx, setEndMonthIdx] = useState<number>(0)
    const [isSaving, setIsSaving] = useState(false)

    useEffect(() => {
        if (highlightedId !== null) {
            const timer = setTimeout(() => setHighlightedId(null), 3000)
            return () => clearTimeout(timer)
        }
    }, [highlightedId])

    const filteredData = data.filter(apt =>
        apt.unit.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        if (!searchTerm) return
        const match = filteredData[0]
        if (match) setHighlightedId(match.apartmentId)
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
        setStartMonthIdx(monthIdx)
        setEndMonthIdx(monthIdx)
        setIsBulk(false)
    }

    const handleSaveStatus = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!editCell) return

        setIsSaving(true)

        try {
            if (isBulk) {
                await bulkUpdatePayments(editCell.aptId, year, startMonthIdx + 1, endMonthIdx + 1, editCell.status as PaymentStatus)
            } else {
                await updatePaymentStatus(editCell.aptId, editCell.monthIdx + 1, year, editCell.status as PaymentStatus)
            }
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
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h2 className="text-xl font-bold whitespace-nowrap">Payments {year}</h2>

                <form onSubmit={handleSearch} className="relative w-full sm:max-w-xs">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                        placeholder="Search unit or floor..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9 pr-4 py-2 h-10 w-full"
                    />
                </form>
            </div>

            <PaymentDesktopTable
                data={filteredData}
                readOnly={readOnly}
                loadingCell={null}
                highlightedId={highlightedId}
                onCellClick={handleCellClick}
                onDelete={handleDeleteApartment}
            />

            <PaymentMobileCards
                data={filteredData}
                readOnly={readOnly}
                highlightedId={highlightedId}
                onCellClick={handleCellClick}
                onDelete={handleDeleteApartment}
            />

            <div className="flex gap-4 text-xs text-gray-500 justify-end">
                <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-green-100 border border-green-200"></div> Paid</div>
                <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-red-100 border border-red-200"></div> Late</div>
                <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-gray-50 border border-gray-200"></div> Pending</div>
            </div>

            <Modal isOpen={!!editCell} onClose={() => setEditCell(null)} title={editCell ? `Edit Payment: ${editCell.unit}` : "Edit Payment"}>
                {editCell && (
                    <form onSubmit={handleSaveStatus} className="space-y-6">
                        <div className="flex flex-col gap-4">
                            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-100">
                                <div className="flex-1 text-center">
                                    <span className="text-xs text-gray-400 uppercase font-semibold block">From</span>
                                    {isBulk ? (
                                        <select
                                            value={startMonthIdx}
                                            onChange={(e) => {
                                                const val = parseInt(e.target.value)
                                                setStartMonthIdx(val)
                                                if (endMonthIdx < val) setEndMonthIdx(val)
                                            }}
                                            className="text-sm font-medium bg-transparent border-none p-0 focus:ring-0 cursor-pointer"
                                        >
                                            {MONTHS.map((m, idx) => <option key={m} value={idx}>{m}</option>)}
                                        </select>
                                    ) : (
                                        <span className="text-sm font-medium">{MONTHS[editCell.monthIdx]}</span>
                                    )}
                                </div>
                                {isBulk && (
                                    <>
                                        <ChevronRight className="w-4 h-4 text-gray-300" />
                                        <div className="flex-1 text-center">
                                            <span className="text-xs text-gray-400 uppercase font-semibold block">To</span>
                                            <select
                                                value={endMonthIdx}
                                                onChange={(e) => setEndMonthIdx(parseInt(e.target.value))}
                                                className="text-sm font-medium bg-transparent border-none p-0 focus:ring-0 cursor-pointer"
                                            >
                                                {MONTHS.map((m, idx) => idx >= startMonthIdx && <option key={m} value={idx}>{m}</option>)}
                                            </select>
                                        </div>
                                    </>
                                )}
                            </div>

                            <div className="flex items-center gap-2">
                                <input type="checkbox" id="bulk-update" checked={isBulk} onChange={(e) => setIsBulk(e.target.checked)} className="w-4 h-4" />
                                <label htmlFor="bulk-update" className="text-sm text-gray-600 cursor-pointer">Update multiple months at once</label>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Status for {isBulk ? "selected months" : MONTHS[editCell.monthIdx]}</label>
                            <select
                                value={editCell.status}
                                onChange={(e) => setEditCell({ ...editCell, status: e.target.value })}
                                className="w-full rounded-md border border-gray-300 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                            >
                                <option value="pending">Pending</option>
                                <option value="paid">Paid</option>
                                <option value="late">Late</option>
                            </select>
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                            <Button type="button" variant="ghost" onClick={() => setEditCell(null)}>Cancel</Button>
                            <Button type="submit" disabled={isSaving}>{isSaving ? "Saving..." : isBulk ? "Apply Bulk Update" : "Save Changes"}</Button>
                        </div>
                    </form>
                )}
            </Modal>
        </div>
    )
}