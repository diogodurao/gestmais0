"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createSetupBuilding } from "@/app/actions/building"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Card, CardHeader, CardContent } from "@/components/ui/Card"
import { Building2 } from "lucide-react"

export function CreateBuildingForm({ userId, userNif }: { userId: string, userNif: string }) {
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState("")
    const router = useRouter()

    const [formData, setFormData] = useState({
        city: "",
        street: "",
        number: "",
        buildingNif: "",
        iban: "",
        totalApartments: ""
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError("")

        // Validations
        if (formData.buildingNif.length !== 9 || !/^\d+$/.test(formData.buildingNif)) {
            setError("NIF do edifício deve ter conter 9 digits")
            setIsLoading(false)
            return
        }

        if (formData.iban.length !== 25 || !/^[a-zA-Z0-9]+$/.test(formData.iban)) {
            setError("IBAN é composto por 25 caracteres alfanuméricos")
            setIsLoading(false)
            return
        }

        try {
            await createSetupBuilding({
                userId,
                userNif,
                city: formData.city,
                street: formData.street,
                number: formData.number,
                buildingNif: formData.buildingNif,
                iban: formData.iban,
                totalApartments: parseInt(formData.totalApartments) || 0
            })
            router.refresh()
        } catch (e) {
            console.error(e)
            setError("Failed to create building. Please check your inputs.")
            setIsLoading(false)
        }
    }

    return (
        <Card className="max-w-2xl mx-auto mt-10">
            <CardHeader>
                <div className="flex items-center gap-2 mb-2 justify-center">
                    <div className="p-3 bg-blue-100 rounded-full">
                        <Building2 className="w-8 h-8 text-blue-600" />
                    </div>
                </div>
                <h2 className="text-xl font-bold text-center">Setup Your Building</h2>
                <p className="text-center text-gray-500 text-sm">
                    Please provide the details of the condominium you manage.
                </p>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="md:col-span-1">
                            <label className="text-sm font-medium">City</label>
                            <Input
                                name="city"
                                placeholder="Lisbon"
                                value={formData.city}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="md:col-span-1">
                            <label className="text-sm font-medium">Street</label>
                            <Input
                                name="street"
                                placeholder="Rua A"
                                value={formData.street}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="md:col-span-1">
                            <label className="text-sm font-medium">Number</label>
                            <Input
                                name="number"
                                placeholder="10"
                                value={formData.number}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium">Building NIF</label>
                            <Input
                                name="buildingNif"
                                placeholder="123456789"
                                value={formData.buildingNif}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium">Total Apartments</label>
                            <Input
                                name="totalApartments"
                                type="number"
                                placeholder="20"
                                value={formData.totalApartments}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="text-sm font-medium">IBAN</label>
                        <Input
                            name="iban"
                            placeholder="PT50..."
                            value={formData.iban}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    {error && (
                        <p className="text-sm text-red-500 text-center">{error}</p>
                    )}
                    <Button
                        type="submit"
                        fullWidth
                        disabled={isLoading}
                    >
                        {isLoading ? "Creating..." : "Create Building"}
                    </Button>
                </form>
            </CardContent>
        </Card>
    )
}
