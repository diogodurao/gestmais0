"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { claimApartment } from "@/app/actions/building"
import { updateResidentProfile } from "@/app/actions/user"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Card, CardHeader, CardContent } from "@/components/ui/Card"
import { Home } from "lucide-react"

type Props = {
    buildingId: string
    availableApartments: { id: number; unit: string }[]
    userNif?: string | null
    userIban?: string | null
}

export function ClaimApartmentForm({ buildingId, availableApartments, userNif, userIban, userId }: Props & { userId: string }) {
    const [unit, setUnit] = useState("")
    const [nif, setNif] = useState(userNif || "")
    const [iban, setIban] = useState(userIban || "")
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState("")
    const router = useRouter()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError("")

        try {
            // 1. Claim Apartment
            await claimApartment(buildingId, unit)

            // 2. Update Profile (IBAN/NIF)
            await updateResidentProfile(
                userId,
                { nif, iban }
            )

            router.refresh()
        } catch (e) {
            console.error(e)
            setError("Failed to save details. Please try again.")
            setIsLoading(false)
        }
    }

    return (
        <Card className="max-w-md mx-auto mt-10">
            <CardHeader>
                <div className="flex items-center gap-2 mb-2 justify-center">
                    <div className="p-3 bg-blue-100 rounded-full">
                        <Home className="w-8 h-8 text-blue-600" />
                    </div>
                </div>
                <h2 className="text-xl font-bold text-center">Setup Your Residency</h2>
                <p className="text-center text-gray-500 text-sm">
                    Select your apartment and provide your billing details.
                </p>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="text-sm font-medium text-gray-700">Select Apartment</label>
                        <select
                            value={unit}
                            onChange={(e) => setUnit(e.target.value)}
                            className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        >
                            <option value="">-- Select Unit --</option>
                            {availableApartments.map((apt) => (
                                <option key={apt.id} value={apt.unit}>
                                    {apt.unit}
                                </option>
                            ))}
                        </select>
                        {availableApartments.length === 0 && (
                            <p className="text-xs text-orange-500 mt-1">
                                No available apartments found. Ask your manager to add them.
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="text-sm font-medium text-gray-700">NIF (Tax ID)</label>
                        <Input
                            placeholder="123456789"
                            value={nif}
                            onChange={(e) => setNif(e.target.value)}
                            required
                        />
                    </div>

                    <div>
                        <label className="text-sm font-medium text-gray-700">IBAN</label>
                        <Input
                            placeholder="PT50..."
                            value={iban}
                            onChange={(e) => setIban(e.target.value)}
                            required
                        />
                    </div>

                    {error && (
                        <p className="text-sm text-red-500 text-center">{error}</p>
                    )}
                    <Button
                        type="submit"
                        fullWidth
                        disabled={isLoading || !unit || !nif || !iban}
                    >
                        {isLoading ? "Saving..." : "Complete Setup"}
                    </Button>
                </form>
            </CardContent>
        </Card>
    )
}
