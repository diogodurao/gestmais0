"use client"

import { useState } from "react"
import { Users, ChevronRight, Eye } from "lucide-react"
import { Card, CardHeader, CardContent } from "@/components/ui/Card"
import { Modal } from "@/components/ui/Modal"
import { ResidentActionsMenu } from "./ResidentActionsMenu"
import { getFloorLabel } from "@/lib/utils"

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

function getApartmentDisplayName(apt: { floor: string; identifier: string }) {
    return `${getFloorLabel(apt.floor)} ${apt.identifier}`
}

export function ResidentsList({ 
    residents, 
    buildingId, 
    unclaimedUnits 
}: { 
    residents: Resident[]
    buildingId: string
    unclaimedUnits: Apartment[]
}) {
    const [selectedFloor, setSelectedFloor] = useState<string | null>(null)
    const [floorResidents, setFloorResidents] = useState<Resident[]>([])

    // Group residents by floor
    const groupedByFloor = residents.reduce((acc, resident) => {
        const key = resident.apartment ? resident.apartment.floor : "unassigned"
        if (!acc[key]) acc[key] = []
        acc[key].push(resident)
        return acc
    }, {} as Record<string, Resident[]>)

    // Sort floors: Unassigned first, then numeric sort
    const sortedFloors = Object.keys(groupedByFloor).sort((a, b) => {
        if (a === "unassigned") return -1
        if (b === "unassigned") return 1
        
        const aNum = a === "R/C" ? 0 : parseInt(a)
        const bNum = b === "R/C" ? 0 : parseInt(b)
        const aVal = isNaN(aNum) ? 0 : aNum
        const bVal = isNaN(bNum) ? 0 : bNum
        
        return aVal - bVal
    })

    const openFloorDetails = (floor: string) => {
        setFloorResidents(groupedByFloor[floor] || [])
        setSelectedFloor(floor)
    }

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <h3 className="text-sm font-medium">Residents</h3>
                <Users className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{residents.length}</div>
                <p className="text-xs text-gray-500 mb-4">
                    {residents.length === 1 ? '1 resident joined' : `${residents.length} residents joined`}
                </p>
                
                <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
                    {residents.length === 0 && (
                        <p className="text-sm text-gray-400 italic">No residents yet.</p>
                    )}

                    {sortedFloors.map(floor => {
                        const count = groupedByFloor[floor]?.length || 0
                        const label = floor === "unassigned" ? "No Assigned Unit" : getFloorLabel(floor)

                        return (
                            <div key={floor} className="border border-gray-100 rounded-lg overflow-hidden">
                                <button
                                    onClick={() => openFloorDetails(floor)}
                                    className="w-full flex items-center justify-between px-3 py-2 bg-gray-50 hover:bg-gray-100 transition-colors"
                                >
                                    <div className="flex items-center gap-2">
                                        <ChevronRight className="w-3 h-3 text-gray-500" />
                                        <span className="text-xs font-medium text-gray-700 uppercase tracking-wide">
                                            {label}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-xs text-gray-400 bg-white px-1.5 py-0.5 rounded border border-gray-200">
                                            {count}
                                        </span>
                                        <Eye className="w-3 h-3 text-gray-400 opacity-50" />
                                    </div>
                                </button>
                            </div>
                        )
                    })}
                </div>
            </CardContent>

            {/* Floor Details Modal */}
            <Modal
                isOpen={!!selectedFloor}
                onClose={() => setSelectedFloor(null)}
                title={selectedFloor === "unassigned" ? "Residents with No Unit" : `Floor ${getFloorLabel(selectedFloor || "")} Residents`}
            >
                <div className="space-y-3 max-h-[500px] overflow-y-auto">
                    {floorResidents.map((r) => (
                        <div key={r.user.id} className="flex items-center justify-between p-2 border border-gray-100 rounded-lg bg-gray-50/50">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-xs font-medium border border-blue-100">
                                    {r.user.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-900 truncate max-w-[120px]">
                                        {r.user.name}
                                    </p>
                                    <p className="text-xs text-gray-500 truncate max-w-[140px]">
                                        {r.user.email}
                                    </p>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-2">
                                {r.apartment ? (
                                    <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">
                                        {r.apartment.identifier}
                                    </span>
                                ) : (
                                    <span className="text-[10px] uppercase font-bold text-orange-400 bg-orange-50 px-1.5 py-0.5 rounded border border-orange-100">
                                        No Unit
                                    </span>
                                )}
                                
                                {/* 
                                    Important: The Kebab menu (ResidentActionsMenu) has its own modals/popups.
                                    Ensuring z-index compatibility is key if this modal has z-50.
                                */}
                                <ResidentActionsMenu 
                                    resident={r} 
                                    buildingId={buildingId}
                                    unclaimedApartments={unclaimedUnits}
                                />
                            </div>
                        </div>
                    ))}
                    {floorResidents.length === 0 && (
                        <p className="text-sm text-gray-400 italic">No residents in this group.</p>
                    )}
                </div>
            </Modal>
        </Card>
    )
}
