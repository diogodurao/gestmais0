"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { setActiveBuilding, createBuildingForManager } from "@/app/actions/building"
import { Card, CardHeader, CardContent } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"

type Building = {
    id: string
    name: string
    code: string
}

export function BuildingSwitcher({
    buildings,
    activeBuildingId,
    managerId,
    managerNif,
}: {
    buildings: Building[]
    activeBuildingId: string
    managerId: string
    managerNif: string
}) {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()
    const [isCreating, setIsCreating] = useState(false)
    const [newName, setNewName] = useState("")

    const handleActivate = (buildingId: string) => {
        startTransition(async () => {
            await setActiveBuilding(managerId, buildingId)
            router.refresh()
        })
    }

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsCreating(true)
        try {
            await createBuildingForManager(managerId, newName || "New Building", managerNif || null)
            setNewName("")
            router.refresh()
        } finally {
            setIsCreating(false)
        }
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-semibold">Buildings</h2>
                        <p className="text-sm text-gray-500">Select which building you are managing.</p>
                    </div>
                    <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700">
                        Active: {activeBuildingId.slice(0, 6)}...
                    </span>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {buildings.map((b) => {
                        const isActive = b.id === activeBuildingId
                        return (
                            <div key={b.id} className={`border rounded-lg p-3 ${isActive ? "border-black" : "border-gray-200"}`}>
                                <div className="flex items-start justify-between">
                                    <div className="space-y-1">
                                        <div className="text-sm font-semibold text-black">{b.name}</div>
                                        <div className="text-xs text-gray-500">Code: <span className="font-mono lowercase">{b.code}</span></div>
                                    </div>
                                    <span className={`text-xs px-2 py-0.5 rounded-full ${isActive ? "bg-black text-white" : "bg-gray-100 text-gray-700"}`}>
                                        {isActive ? "Active" : "Available"}
                                    </span>
                                </div>
                                {!isActive && (
                                    <div className="mt-3 flex justify-end">
                                        <Button size="sm" variant="outline" onClick={() => handleActivate(b.id)} disabled={isPending}>
                                            {isPending ? "Switching..." : "Set Active"}
                                        </Button>
                                    </div>
                                )}
                            </div>
                        )
                    })}
                    {buildings.length === 0 && (
                        <div className="text-sm text-gray-500">No buildings yet.</div>
                    )}
                </div>

                <form onSubmit={handleCreate} className="p-3 border border-dashed border-gray-300 rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-semibold text-black">Create new building</p>
                            <p className="text-xs text-gray-500">Generates a code and sets it active.</p>
                        </div>
                    </div>
                    <Input
                        label="Name"
                        value={newName}
                        onChange={e => setNewName(e.target.value)}
                        placeholder="e.g., Avenida Central 10"
                    />
                    <div className="flex justify-end">
                        <Button type="submit" disabled={isCreating}>
                            {isCreating ? "Creating..." : "Create & Set Active"}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    )
}


