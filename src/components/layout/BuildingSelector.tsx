"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Building2, ChevronDown, Plus, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { switchActiveBuilding, createNewBuilding } from "@/app/actions/building"
import { ManagedBuilding } from "@/lib/types"
import {
    Dropdown,
    DropdownTrigger,
    DropdownContent,
    DropdownItem,
    DropdownSeparator,
    DropdownLabel
} from "@/components/ui/Dropdown"

interface BuildingSelectorProps {
    managerBuildings: ManagedBuilding[]
    activeBuilding: ManagedBuilding | null
    managerId: string
}

export function BuildingSelector({
    managerBuildings,
    activeBuilding,
    managerId
}: BuildingSelectorProps) {
    const [isPending, startTransition] = useTransition()
    const [isCreating, setIsCreating] = useState(false)
    const router = useRouter()

    const handleSwitch = (buildingId: string) => {
        startTransition(async () => {
            await switchActiveBuilding(buildingId)
            router.refresh()
        })
    }

    const handleAddBuilding = async () => {
        if (!managerId) return
        setIsCreating(true)
        try {
            await createNewBuilding("Novo Edifício", "")
            router.refresh()
        } catch (error) {
            console.error("Failed to create building:", error)
        } finally {
            setIsCreating(false)
        }
    }

    if (!managerBuildings.length) return null

    return (
        <Dropdown>
            <DropdownTrigger
                className="flex items-center gap-2 px-2 py-1 rounded hover:bg-gray-200 text-body font-medium text-gray-700 transition-colors disabled:opacity-50"
                disabled={isPending}
            >
                <Building2 className="w-4 h-4 text-gray-500" />
                <span className="truncate max-w-[150px]">
                    {activeBuilding?.building.name || "Selecionar Edifício"}
                </span>
                <ChevronDown className="w-3 h-3 text-gray-400" />
            </DropdownTrigger>

            <DropdownContent align="start" className="w-64 p-0">
                <DropdownLabel className="border-b border-gray-100">Os Seus Edifícios</DropdownLabel>
                <div className="max-h-60 overflow-y-auto">
                    {managerBuildings.map((mb) => (
                        <DropdownItem
                            key={mb.building.id}
                            onClick={() => handleSwitch(mb.building.id)}
                            disabled={isPending}
                            className={cn(
                                "flex items-start justify-between gap-2 py-2",
                                mb.building.id === activeBuilding?.building.id && "bg-primary-light"
                            )}
                        >
                            <div className="flex flex-col min-w-0">
                                <span className={cn(
                                    "font-bold truncate",
                                    mb.building.id === activeBuilding?.building.id ? "text-primary-dark" : "text-gray-700"
                                )}>
                                    {mb.building.name}
                                </span>
                                <span className="text-label text-gray-400 font-mono tracking-tighter uppercase">
                                    {mb.building.code}
                                </span>
                            </div>
                            {mb.building.subscriptionStatus !== 'active' && (
                                <span className="shrink-0 flex items-center gap-0.5 text-label font-semibold text-warning bg-warning-light px-1.5 py-0.5 rounded uppercase">
                                    <AlertCircle className="w-2.5 h-2.5" />
                                    Não Pago
                                </span>
                            )}
                        </DropdownItem>
                    ))}
                </div>
                <DropdownSeparator />
                <DropdownItem
                    icon={<Plus className="w-4 h-4" />}
                    onClick={handleAddBuilding}
                    disabled={isCreating || isPending}
                    className="font-bold text-gray-600 py-2.5"
                >
                    {isCreating ? "A criar..." : "Adicionar Novo Edifício"}
                </DropdownItem>
            </DropdownContent>
        </Dropdown>
    )
}
