"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { claimApartment } from "@/app/actions/building"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Card, CardHeader, CardContent } from "@/components/ui/Card"
import { Home } from "lucide-react"

export function ClaimApartmentForm({ buildingId }: { buildingId: string }) {
    const [unit, setUnit] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState("")
    const router = useRouter()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError("")

        try {
            await claimApartment(buildingId, unit)
            router.refresh()
        } catch (e) {
            setError("Failed to claim apartment. Please try again.")
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
                <h2 className="text-xl font-bold text-center">Which apartment is yours?</h2>
                <p className="text-center text-gray-500 text-sm">
                    Enter your unit number (e.g. 1A, 2B) to link it to your account.
                </p>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                        placeholder="e.g. 1A"
                        value={unit}
                        onChange={(e) => setUnit(e.target.value)}
                        className="text-center text-lg"
                    />
                    {error && (
                        <p className="text-sm text-red-500 text-center">{error}</p>
                    )}
                    <Button
                        type="submit"
                        fullWidth
                        disabled={isLoading || unit.length < 1}
                    >
                        {isLoading ? "Saving..." : "Save Apartment"}
                    </Button>
                </form>
            </CardContent>
        </Card>
    )
}
