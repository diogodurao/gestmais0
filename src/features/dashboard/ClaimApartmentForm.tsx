"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { claimApartment } from "@/app/actions/building"
import { Button } from "@/components/ui/Button"
import { Card, CardHeader, CardContent } from "@/components/ui/Card"
import { Home, AlertCircle, AlertTriangle } from "lucide-react"

type UnclaimedApartment = {
    id: number
    floor: string
    unitType: string
    identifier: string
}

function getFloorLabel(floor: string): string {
    if (floor === "0") return "R/C"
    if (floor === "-1") return "Cave"
    if (floor === "-2") return "-2"
    return `${floor}º`
}

function getDisplayName(apt: UnclaimedApartment): string {
    return `${getFloorLabel(apt.floor)} ${apt.identifier} (${apt.unitType})`
}

export function ClaimApartmentForm({ 
    buildingId,
    unclaimedApartments 
}: { 
    buildingId: string
    unclaimedApartments: UnclaimedApartment[]
}) {
    const [selectedId, setSelectedId] = useState<number | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState("")
    const [showConfirmation, setShowConfirmation] = useState(false)
    const router = useRouter()

    const selectedApartment = unclaimedApartments.find(apt => apt.id === selectedId)

    const handleInitiateClaim = (e: React.FormEvent) => {
        e.preventDefault()
        if (!selectedId) return
        setShowConfirmation(true)
    }

    const handleConfirmClaim = async () => {
        if (!selectedId) return
        
        setIsLoading(true)
        setError("")

        try {
            await claimApartment(selectedId)
            router.refresh()
        } catch (e) {
            setError("Failed to claim unit. Please try again.")
            setShowConfirmation(false)
        } finally {
            setIsLoading(false)
        }
    }

    // No unclaimed apartments available
    if (unclaimedApartments.length === 0) {
        return (
            <Card className="max-w-md mx-auto mt-10">
                <CardHeader>
                    <div className="flex items-center gap-2 mb-2 justify-center">
                        <div className="p-3 bg-amber-100 rounded-full">
                            <AlertCircle className="w-8 h-8 text-amber-600" />
                        </div>
                    </div>
                    <h2 className="text-xl font-bold text-center">No Available Units</h2>
                    <p className="text-center text-gray-500 text-sm">
                        There are no unclaimed units in this building. Please contact your building manager to add your unit.
                    </p>
                </CardHeader>
            </Card>
        )
    }

    // Group by floor for better UX
    const groupedByFloor = unclaimedApartments.reduce((acc, apt) => {
        const floor = apt.floor
        if (!acc[floor]) acc[floor] = []
        acc[floor].push(apt)
        return acc
    }, {} as Record<string, UnclaimedApartment[]>)

    const sortedFloors = Object.keys(groupedByFloor).sort((a, b) => {
        const aNum = a === "R/C" ? 0 : parseInt(a)
        const bNum = b === "R/C" ? 0 : parseInt(b)
        
        // Handle cases where parseInt might return NaN (though shouldn't happen with valid data)
        const aVal = isNaN(aNum) ? 0 : aNum
        const bVal = isNaN(bNum) ? 0 : bNum
        
        return aVal - bVal
    })

    // Confirmation Screen
    if (showConfirmation && selectedApartment) {
        return (
            <Card className="max-w-md mx-auto mt-10">
                <CardHeader>
                    <div className="flex items-center gap-2 mb-2 justify-center">
                        <div className="p-3 bg-amber-100 rounded-full">
                            <AlertTriangle className="w-8 h-8 text-amber-600" />
                        </div>
                    </div>
                    <h2 className="text-xl font-bold text-center">Confirm Your Selection</h2>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Selected Unit Display */}
                    <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg text-center">
                        <p className="text-sm text-gray-500 mb-1">You are claiming</p>
                        <p className="text-2xl font-bold text-gray-900">
                            {getDisplayName(selectedApartment)}
                        </p>
                    </div>

                    {/* Critical Warning */}
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                        <div className="flex gap-3">
                            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                            <div className="text-sm">
                                <p className="font-semibold text-red-800 mb-1">
                                    This action is critical
                                </p>
                                <p className="text-red-700 leading-relaxed">
                                    Make sure you are selecting the correct unit. Choosing the wrong apartment 
                                    could mix your payment history and data with another resident's information.
                                </p>
                            </div>
                        </div>
                    </div>

                    {error && (
                        <p className="text-sm text-red-500 text-center">{error}</p>
                    )}

                    {/* Actions */}
                    <div className="flex gap-3">
                        <Button
                            type="button"
                            variant="outline"
                            fullWidth
                            onClick={() => setShowConfirmation(false)}
                            disabled={isLoading}
                        >
                            Go Back
                        </Button>
                        <Button
                            type="button"
                            fullWidth
                            onClick={handleConfirmClaim}
                            disabled={isLoading}
                        >
                            {isLoading ? "Claiming..." : "Confirm"}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="max-w-md mx-auto mt-10">
            <CardHeader>
                <div className="flex items-center gap-2 mb-2 justify-center">
                    <div className="p-3 bg-blue-100 rounded-full">
                        <Home className="w-8 h-8 text-blue-600" />
                    </div>
                </div>
                <h2 className="text-xl font-bold text-center">Select Your Unit</h2>
                <p className="text-center text-gray-500 text-sm">
                    Choose your unit from the available options below.
                </p>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleInitiateClaim} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Available Units
                        </label>
                        <select
                            value={selectedId ?? ""}
                            onChange={(e) => setSelectedId(e.target.value ? parseInt(e.target.value) : null)}
                            className="w-full px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black text-center text-lg"
                            required
                        >
                            <option value="">Select your unit...</option>
                            {sortedFloors.map(floor => (
                                <optgroup key={floor} label={getFloorLabel(floor)}>
                                    {groupedByFloor[floor].map(apt => (
                                        <option key={apt.id} value={apt.id}>
                                            {getDisplayName(apt)}
                                        </option>
                                    ))}
                                </optgroup>
                            ))}
                        </select>
                    </div>
                    
                    {error && (
                        <p className="text-sm text-red-500 text-center">{error}</p>
                    )}
                    
                    <Button
                        type="submit"
                        fullWidth
                        disabled={isLoading || !selectedId}
                    >
                        Claim This Unit
                    </Button>
                </form>
            </CardContent>
        </Card>
    )
}
