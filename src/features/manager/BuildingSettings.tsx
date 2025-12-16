"use client"

import { useState } from "react"
import { updateBuilding } from "@/app/actions/building"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Card, CardHeader, CardContent } from "@/components/ui/Card"
import { useRouter } from "next/navigation"

type Building = {
    id: string
    name: string
    address: string | null
    city: string | null
    zip: string | null
    country: string | null
    nif: string
    iban: string | null
}

export function BuildingSettings({ building }: { building: Building }) {
    const [isLoading, setIsLoading] = useState(false)
    const [formData, setFormData] = useState({
        name: building.name,
        address: building.address || "",
        city: building.city || "",
        zip: building.zip || "",
        country: building.country || "",
        nif: building.nif,
        iban: building.iban || "",
    })
    const router = useRouter()

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        try {
            await updateBuilding(building.id, formData)
            router.refresh()
            alert("Settings saved!")
        } catch (error) {
            console.error(error)
            alert("Failed to save settings")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Card>
            <CardHeader>
                <h3 className="text-lg font-medium">Building Settings</h3>
                <p className="text-sm text-gray-500">Update address and financial details</p>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="text-sm font-medium text-gray-700">Building Name</label>
                        <Input name="name" value={formData.name} onChange={handleChange} required />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium text-gray-700">NIF</label>
                            <Input name="nif" value={formData.nif} onChange={handleChange} required />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-700">IBAN</label>
                            <Input name="iban" value={formData.iban} onChange={handleChange} placeholder="PT50..." />
                        </div>
                    </div>

                    <div>
                        <label className="text-sm font-medium text-gray-700">Address</label>
                        <Input name="address" value={formData.address} onChange={handleChange} placeholder="Street address" />
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div>
                            <label className="text-sm font-medium text-gray-700">City</label>
                            <Input name="city" value={formData.city} onChange={handleChange} />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-700">Zip Code</label>
                            <Input name="zip" value={formData.zip} onChange={handleChange} />
                        </div>
                        <div className="col-span-2 md:col-span-1">
                            <label className="text-sm font-medium text-gray-700">Country</label>
                            <Input name="country" value={formData.country} onChange={handleChange} />
                        </div>
                    </div>

                    <div className="pt-4 flex justify-end">
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? "Saving..." : "Save Changes"}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    )
}
