"use client"

import { useRouter } from "next/navigation"
import { switchActiveBuilding, createNewBuilding } from "@/app/actions/building"
import { useState, useTransition } from "react"
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Building2, Plus, Check, AlertCircle } from "lucide-react"
import { cn } from "@/components/ui/Button"

type Building = {
    id: string
    name: string
    code: string
    subscriptionStatus?: string
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
    const [newNif, setNewNif] = useState("")
    const [error, setError] = useState<string | null>(null)

    const handleActivate = (buildingId: string) => {
        startTransition(async () => {
            try {
                await switchActiveBuilding(buildingId)
                router.refresh()
            } catch (err: any) {
                setError(err.message || "Failed to switch building")
            }
        })
    }

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newName.trim()) return
        
        setIsCreating(true)
        setError(null)
        try {
            await createNewBuilding(managerId, newName.trim(), newNif.trim() || managerNif)
            setNewName("")
            setNewNif("")
            router.refresh()
        } catch (err: any) {
            setError(err.message || "Failed to create building")
        } finally {
            setIsCreating(false)
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>
                    <Building2 className="w-3.5 h-3.5" />
                    BUILDING_SELECTOR
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-0 border border-slate-200">
                    {buildings.map((b) => {
                        const isActive = b.id === activeBuildingId
                        return (
                            <div 
                                key={b.id} 
                                className={cn(
                                    "p-3 border-b border-r border-slate-200 last:border-b-0",
                                    isActive ? "bg-blue-50/30" : "bg-white"
                                )}
                            >
                                <div className="flex items-start justify-between">
                                    <div className="space-y-1">
                                        <div className="text-xs font-bold text-slate-700 uppercase tracking-tight">{b.name}</div>
                                        <div className="text-[10px] font-mono text-slate-500 uppercase tracking-tighter">Code: {b.code}</div>
                                    </div>
                                    <div className="flex flex-col items-end gap-1">
                                        {b.subscriptionStatus !== 'active' && (
                                            <span className="status-badge status-pending text-[9px]">
                                                <AlertCircle className="w-2 h-2 mr-0.5" />
                                                Unpaid
                                            </span>
                                        )}
                                        {isActive ? (
                                            <span className="status-badge status-active">
                                                <Check className="w-2.5 h-2.5 mr-1" />
                                                Active
                                            </span>
                                        ) : (
                                            <Button 
                                                size="xs" 
                                                variant="outline" 
                                                onClick={() => handleActivate(b.id)} 
                                                disabled={isPending}
                                            >
                                                {isPending ? "..." : "Select"}
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-200 p-3 text-[11px] text-red-700 uppercase font-bold">
                        <AlertCircle className="w-3 h-3 inline mr-1" />
                        {error}
                    </div>
                )}

                <div className="bg-slate-50 border border-dashed border-slate-300 p-4">
                    <div className="mb-3">
                        <p className="text-[11px] font-bold text-slate-700 uppercase">Create New Building</p>
                        <p className="text-[10px] text-slate-500">Each building requires a separate subscription.</p>
                    </div>
                    <form onSubmit={handleCreate} className="space-y-3">
                        <Input
                            label="Building Name"
                            value={newName}
                            onChange={e => setNewName(e.target.value)}
                            placeholder="e.g. OCEAN VIEW APTS"
                            className="bg-white"
                            required
                        />
                        <Input
                            label="Building NIF (optional)"
                            value={newNif}
                            onChange={e => setNewNif(e.target.value)}
                            placeholder={managerNif || "Leave blank to use your NIF"}
                            className="bg-white"
                        />
                        <div className="flex justify-end">
                            <Button type="submit" size="sm" disabled={isCreating || !newName.trim()}>
                                <Plus className="w-3 h-3 mr-1" />
                                {isCreating ? "Creating..." : "Add Building"}
                            </Button>
                        </div>
                    </form>
                </div>
            </CardContent>
        </Card>
    )
}



