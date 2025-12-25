"use client"

import { useState, useRef, useEffect } from "react"
import { createPortal } from "react-dom"
import { useRouter } from "next/navigation"
import { MoreVertical, Trash2, Home, UserX } from "lucide-react"
import { removeResidentFromBuilding, updateResidentUnit } from "@/app/actions/resident-management"
import { Button } from "@/components/ui/Button"
import { Modal } from "@/components/ui/Modal"
import { getApartmentDisplayName } from "@/lib/utils"

type Resident = {
    user: {
        id: string
        name: string
        email: string
    }
    apartment: {
        id: number
        unit: string
    } | null
}

type Apartment = {
    id: number
    unit: string
}

export function ResidentActionsMenu({ 
    resident, 
    buildingId, 
    unclaimedApartments 
}: { 
    resident: Resident
    buildingId: string
    unclaimedApartments: Apartment[]
}) {
    const router = useRouter()
    const [isOpen, setIsOpen] = useState(false)
    const [showAssignModal, setShowAssignModal] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const buttonRef = useRef<HTMLButtonElement>(null)
    const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 })

    const toggleOpen = () => {
        if (!isOpen && buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect()
            setMenuPosition({
                top: rect.bottom + window.scrollY,
                left: rect.right + window.scrollX - 192 // 192px = w-48
            })
        }
        setIsOpen(!isOpen)
    }

    // Close on scroll to avoid detached menu
    useEffect(() => {
        if (!isOpen) return
        const handleScroll = () => setIsOpen(false)
        window.addEventListener('scroll', handleScroll, true)
        return () => window.removeEventListener('scroll', handleScroll, true)
    }, [isOpen])

    const handleRemove = async () => {
        if (!confirm(`Are you sure you want to remove ${resident.user.name} from the building?`)) return
        
        setIsLoading(true)
        try {
            await removeResidentFromBuilding(resident.user.id, buildingId)
            setIsOpen(false)
            router.refresh()
        } catch (error) {
            console.error("Failed to remove resident", error)
            alert("Failed to remove resident")
        } finally {
            setIsLoading(false)
        }
    }

    const handleUnassignUnit = async () => {
        if (!confirm(`Unassign ${resident.user.name} from their unit?`)) return
        
        setIsLoading(true)
        try {
            await updateResidentUnit(resident.user.id, null)
            setIsOpen(false)
            router.refresh()
        } catch (error) {
            console.error("Failed to unassign unit", error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleAssignUnit = async (apartmentId: number) => {
        setIsLoading(true)
        try {
            await updateResidentUnit(resident.user.id, apartmentId)
            setShowAssignModal(false)
            setIsOpen(false)
            router.refresh()
        } catch (error) {
            console.error("Failed to assign unit", error)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="relative">
            <button 
                ref={buttonRef}
                onClick={toggleOpen} 
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            >
                <MoreVertical className="w-4 h-4 text-gray-400" />
            </button>

            {isOpen && typeof document !== 'undefined' && createPortal(
                <>
                    <div 
                        className="fixed inset-0 z-60" 
                        onClick={() => setIsOpen(false)}
                    />
                    <div 
                        className="absolute bg-white tech-border shadow-lg z-70 py-1 w-48"
                        style={{
                            top: `${menuPosition.top}px`,
                            left: `${menuPosition.left}px`
                        }}
                    >
                        <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 mb-1">
                            Resident_Ops
                        </div>
                        <button
                            onClick={() => {
                                setIsOpen(false)
                                setShowAssignModal(true)
                            }}
                            className="w-full text-left px-4 py-1.5 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 uppercase font-medium"
                        >
                            <Home className="w-3.5 h-3.5 text-slate-400" />
                            {resident.apartment ? "Change_Unit" : "Assign_Unit"}
                        </button>

                        {resident.apartment && (
                            <button
                                onClick={handleUnassignUnit}
                                className="w-full text-left px-4 py-1.5 text-xs text-amber-600 hover:bg-amber-50 flex items-center gap-2 uppercase font-medium"
                            >
                                <UserX className="w-3.5 h-3.5" />
                                Unassign_Unit
                            </button>
                        )}

                        <div className="h-px bg-slate-100 my-1" />

                        <button
                            onClick={handleRemove}
                            className="w-full text-left px-4 py-1.5 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2 uppercase font-medium"
                        >
                            <Trash2 className="w-3.5 h-3.5" />
                            Purge_Resident
                        </button>
                    </div>
                </>,
                document.body
            )}

            {/* Assign Unit Modal */}
            <Modal
                isOpen={showAssignModal}
                onClose={() => setShowAssignModal(false)}
                title={`UPDATE_ASSIGNMENT: ${resident.user.name.toUpperCase()}`}
            >
                <div className="space-y-4">
                    <p className="text-[11px] font-bold text-slate-500 uppercase">Select available unit from registry:</p>
                    
                    <div className="max-h-[300px] overflow-y-auto tech-border bg-slate-50">
                        {unclaimedApartments.length === 0 ? (
                            <p className="text-[10px] text-slate-400 font-mono uppercase text-center py-8">[ NO_AVAILABLE_UNITS ]</p>
                        ) : (
                            unclaimedApartments.map(apt => (
                                <button
                                    key={apt.id}
                                    onClick={() => handleAssignUnit(apt.id)}
                                    disabled={isLoading}
                                    className="w-full text-left px-3 py-2 text-xs hover:bg-white border-b border-slate-200 last:border-b-0 flex justify-between items-center group transition-colors"
                                >
                                    <span className="font-bold text-slate-700 uppercase font-mono">
                                        {getApartmentDisplayName(apt)}
                                    </span>
                                    <span className="text-[10px] font-bold text-slate-400 group-hover:text-blue-600 uppercase tracking-tighter">
                                        [ SELECT ]
                                    </span>
                                </button>
                            ))
                        )}
                    </div>
                    
                    <div className="flex justify-end pt-2">
                        <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => setShowAssignModal(false)}
                        >
                            Cancel
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    )
}
