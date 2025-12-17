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
        floor: string
        identifier: string
    } | null
}

type Apartment = {
    id: number
    floor: string
    identifier: string
    unitType: string
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
                        className="absolute bg-white rounded-md shadow-lg border border-gray-100 z-70 py-1 w-48"
                        style={{
                            top: `${menuPosition.top}px`,
                            left: `${menuPosition.left}px`
                        }}
                    >
                        <button
                            onClick={() => {
                                setIsOpen(false)
                                setShowAssignModal(true)
                            }}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                        >
                            <Home className="w-4 h-4" />
                            {resident.apartment ? "Change Unit" : "Assign Unit"}
                        </button>

                        {resident.apartment && (
                            <button
                                onClick={handleUnassignUnit}
                                className="w-full text-left px-4 py-2 text-sm text-orange-600 hover:bg-orange-50 flex items-center gap-2"
                            >
                                <UserX className="w-4 h-4" />
                                Unassign Unit
                            </button>
                        )}

                        <div className="h-px bg-gray-100 my-1" />

                        <button
                            onClick={handleRemove}
                            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                        >
                            <Trash2 className="w-4 h-4" />
                            Remove User
                        </button>
                    </div>
                </>,
                document.body
            )}

            {/* Assign Unit Modal */}
            <Modal
                isOpen={showAssignModal}
                onClose={() => setShowAssignModal(false)}
                title={`Assign Unit to ${resident.user.name}`}
            >
                <div className="space-y-4">
                    <p className="text-sm text-gray-500">Select an available unit for this resident.</p>
                    
                    <div className="max-h-[300px] overflow-y-auto space-y-1">
                        {unclaimedApartments.length === 0 ? (
                            <p className="text-sm text-gray-400 italic text-center py-4">No unclaimed units available.</p>
                        ) : (
                            unclaimedApartments.map(apt => (
                                <button
                                    key={apt.id}
                                    onClick={() => handleAssignUnit(apt.id)}
                                    disabled={isLoading}
                                    className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 rounded border border-transparent hover:border-gray-200 flex justify-between items-center group"
                                >
                                    <span className="font-medium text-gray-700">
                                        {getApartmentDisplayName(apt)}
                                    </span>
                                    <span className="text-xs text-gray-400 group-hover:text-blue-600 uppercase">
                                        Select
                                    </span>
                                </button>
                            ))
                        )}
                    </div>
                    
                    <div className="flex justify-end pt-2">
                        <Button 
                            variant="ghost" 
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
