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
} from "@/components/ui/dropdown"

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
                className="flex items-center gap-1.5 px-1.5 py-1 hover:bg-[#E9ECEF] rounded text-[11px] font-medium text-[#495057] transition-colors disabled:opacity-50"
                disabled={isPending}
            >
                <Building2 className="w-3.5 h-3.5 text-[#8E9AAF]" />
                <span className="truncate max-w-[120px]">
                    {activeBuilding?.building.name || "Selecionar Edifício"}
                </span>
                <ChevronDown className="w-3 h-3 text-[#ADB5BD]" />
            </DropdownTrigger>

            <DropdownContent align="start" className="w-56 p-0">
                <DropdownLabel className="border-b border-[#E9ECEF]">Os Seus Edifícios</DropdownLabel>
                <div className="max-h-60 overflow-y-auto">
                    {managerBuildings.map((mb) => (
                        <DropdownItem
                            key={mb.building.id}
                            onClick={() => handleSwitch(mb.building.id)}
                            disabled={isPending}
                            className={cn(
                                "flex items-start justify-between gap-2 py-1.5",
                                mb.building.id === activeBuilding?.building.id && "bg-[#E8F0EA]"
                            )}
                        >
                            <div className="flex flex-col min-w-0">
                                <span className={cn(
                                    "text-[11px] font-medium truncate",
                                    mb.building.id === activeBuilding?.building.id ? "text-[#6A9B72]" : "text-[#495057]"
                                )}>
                                    {mb.building.name}
                                </span>
                                <span className="text-[9px] text-[#ADB5BD] font-mono tracking-tight uppercase">
                                    {mb.building.code}
                                </span>
                            </div>
                            {mb.building.subscriptionStatus !== 'active' && (
                                <span className="shrink-0 flex items-center gap-0.5 text-[8px] font-medium text-[#E5C07B] bg-[#FBF6EC] px-1 py-0.5 rounded uppercase">
                                    <AlertCircle className="w-2.5 h-2.5" />
                                    Não Pago
                                </span>
                            )}
                        </DropdownItem>
                    ))}
                </div>
                <DropdownSeparator />
                <DropdownItem
                    icon={<Plus className="w-3.5 h-3.5" />}
                    onClick={handleAddBuilding}
                    disabled={isCreating || isPending}
                    className="text-[#6C757D] py-2"
                >
                    {isCreating ? "A criar..." : "Adicionar Novo Edifício"}
                </DropdownItem>
            </DropdownContent>
        </Dropdown>
    )
}
