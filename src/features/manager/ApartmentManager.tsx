"use client"

import { useState } from "react"
import { createApartment, deleteApartment } from "@/app/actions/building"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Card, CardHeader, CardContent } from "@/components/ui/Card"
import { Trash2, Plus } from "lucide-react"
import { useRouter } from "next/navigation"

type Apartment = {
    id: number
    unit: string
    residentId: string | null
    residentName: string | null
}

export function ApartmentManager({ buildingId, apartments }: { buildingId: string, apartments: Apartment[] }) {
    const [newUnit, setNewUnit] = useState("")
    const [isAdding, setIsAdding] = useState(false)
    const router = useRouter()

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newUnit) return
        setIsAdding(true)
        try {
            await createApartment(buildingId, newUnit)
            setNewUnit("")
            router.refresh()
        } catch (error) {
            console.error(error)
            alert("Failed to add apartment")
        } finally {
            setIsAdding(false)
        }
    }

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure? This will delete the apartment and its payment history.")) return
        try {
            await deleteApartment(id)
            router.refresh()
        } catch (error) {
            console.error(error)
            alert("Failed to delete")
        }
    }

    return (
        <Card>
            <CardHeader>
                <h3 className="text-lg font-medium">Apartments</h3>
                <p className="text-sm text-gray-500">Manage units in your building</p>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleAdd} className="flex gap-2 mb-6">
                    <Input
                        placeholder="Unit (e.g. 1A)"
                        value={newUnit}
                        onChange={(e) => setNewUnit(e.target.value)}
                        className="max-w-[150px]"
                    />
                    <Button type="submit" disabled={isAdding || !newUnit}>
                        <Plus className="w-4 h-4 mr-1" />
                        Add
                    </Button>
                </form>

                <div className="space-y-2">
                    {apartments.length === 0 ? (
                        <p className="text-sm text-gray-500 italic">No apartments added yet.</p>
                    ) : (
                        apartments.map((apt) => (
                            <div key={apt.id} className="flex items-center justify-between p-3 bg-gray-50 rounded border border-gray-100">
                                <div>
                                    <span className="font-bold text-gray-900">{apt.unit}</span>
                                    {apt.residentName ? (
                                        <span className="ml-3 text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                                            {apt.residentName}
                                        </span>
                                    ) : (
                                        <span className="ml-3 text-xs text-gray-400">Empty</span>
                                    )}
                                </div>
                                <button
                                    onClick={() => handleDelete(apt.id)}
                                    className="text-gray-400 hover:text-red-500 transition-colors"
                                    title="Delete Apartment"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
