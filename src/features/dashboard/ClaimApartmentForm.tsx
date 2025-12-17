"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { claimApartment } from "@/app/actions/building"
import { Button } from "@/components/ui/Button"
import { Card, CardHeader, CardContent } from "@/components/ui/Card"
import { Home } from "lucide-react"

type ClaimApartmentFormProps = {
    buildingId: string
    userId: string
    units: {
        id: number
        unit: string
        floor: number | null
        permillage: number | null
    }[]
}

export function ClaimApartmentForm({ buildingId, userId, units }: ClaimApartmentFormProps) {
    const [selectedUnit, setSelectedUnit] = useState(units[0]?.id?.toString() || "")
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState("")
    const router = useRouter()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!selectedUnit) return

        setIsLoading(true)
        setError("")

        try {
            await claimApartment(buildingId, Number(selectedUnit), userId)
            router.refresh()
        } catch (e) {
            setError("Failed to claim apartment. Please try again.")
            setIsLoading(false)
        }
    }

    const noUnits = units.length === 0

    return (
        <Card className="max-w-md mx-auto mt-10">
            <CardHeader>
                <div className="flex items-center gap-2 mb-2 justify-center">
                    <div className="p-3 bg-blue-100 rounded-full">
                        <Home className="w-8 h-8 text-blue-600" />
                    </div>
                </div>
                <h2 className="text-xl font-bold text-center">Which unit is yours?</h2>
                <p className="text-center text-gray-500 text-sm">
                    Choose your unit label exactly as defined by the manager (e.g., Loja A, R/C Esq, 1Dto).
                </p>
            </CardHeader>
            <CardContent>
                {noUnits ? (
                    <div className="text-center text-gray-500 text-sm space-y-2">
                        <p>No unclaimed units are available right now.</p>
                        <p className="text-gray-400">Please contact your manager to add your unit.</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-1">
                            <label className="text-sm text-gray-600">Select your unit</label>
                            <select
                                value={selectedUnit}
                                onChange={e => setSelectedUnit(e.target.value)}
                                className="w-full px-3 py-2 border rounded-md text-sm border-gray-300 focus:outline-none focus:ring-1 focus:ring-black"
                            >
                                {units.map(u => (
                                    <option key={u.id} value={u.id}>
                                        {u.unit} {u.floor !== null ? `(Floor ${u.floor})` : ""} {u.permillage !== null ? `• ${u.permillage.toString().replace('.', ',')}‰` : ""}
                                    </option>
                                ))}
                            </select>
                        </div>
                        {error && (
                            <p className="text-sm text-red-500 text-center">{error}</p>
                        )}
                        <Button
                            type="submit"
                            fullWidth
                            disabled={isLoading || !selectedUnit}
                        >
                            {isLoading ? "Saving..." : "Claim Unit"}
                        </Button>
                    </form>
                )}
            </CardContent>
        </Card>
    )
}
