"use client"

import { ChevronDown, Building2, Plus, AlertCircle, Menu } from "lucide-react"
import { useState, useTransition } from "react"
import { cn } from "@/lib/utils"
import { switchActiveBuilding, createNewBuilding } from "@/app/actions/building"
import { useRouter } from "next/navigation"
import { useSidebar } from "./SidebarProvider"

type ManagedBuilding = {
    building: { id: string; name: string; code: string; subscriptionStatus?: string | null }
    isOwner: boolean | null
}

interface DashboardHeaderProps {
    userName: string
    userRole: string
    managerId?: string
    activeBuilding?: ManagedBuilding
    managerBuildings?: ManagedBuilding[]
}

export function DashboardHeader({
    userName,
    userRole,
    managerId = "",
    activeBuilding,
    managerBuildings = []
}: DashboardHeaderProps) {
    const { toggleSidebar, toggleDesktopCollapse } = useSidebar()
    const [dropdownOpen, setDropdownOpen] = useState(false)
    const [isPending, startTransition] = useTransition()
    const [isCreating, setIsCreating] = useState(false)
    const router = useRouter()

    const handleSwitch = (buildingId: string) => {
        startTransition(async () => {
            await switchActiveBuilding(buildingId)
            setDropdownOpen(false)
            router.refresh()
        })
    }

    const handleAddBuilding = async () => {
        if (!managerId) return
        setIsCreating(true)
        try {
            await createNewBuilding(managerId, "New Building", "")
            setDropdownOpen(false)
            router.refresh()
        } catch (error) {
            console.error("Failed to create building:", error)
        } finally {
            setIsCreating(false)
        }
    }

    const initials = userName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)

    return (
        <header className="h-10 bg-slate-50 border-b border-slate-300 flex items-center px-3 justify-between shrink-0 z-50">
            <div className="flex items-center gap-2">
                {/* Mobile Toggle */}
                <button
                    onClick={toggleSidebar}
                    className="lg:hidden p-1.5 hover:bg-slate-200 rounded-sm text-slate-600 transition-colors"
                    aria-label="Toggle menu"
                >
                    <Menu className="w-5 h-5" />
                </button>

                {/* Desktop Toggle */}
                <button
                    onClick={toggleDesktopCollapse}
                    className="hidden lg:flex p-1.5 hover:bg-slate-200 rounded-sm text-slate-600 transition-colors"
                    aria-label="Toggle sidebar"
                >
                    <Menu className="w-4 h-4" />
                </button>

                <div className="flex items-center font-bold tracking-tight text-sm ml-1">
                    <span className="text-slate-400 font-normal">GEST</span>
                    <span className="text-slate-800">MAIS+</span>
                </div>

                <div className="h-5 w-px bg-slate-300 mx-2"></div>

                {userRole === "manager" && managerBuildings.length > 0 ? (
                    <div className="relative">
                        <button
                            onClick={() => setDropdownOpen(!dropdownOpen)}
                            className="flex items-center gap-2 px-2 py-1 hover:bg-slate-200 rounded-sm text-xs font-medium text-slate-700 transition-colors"
                            disabled={isPending}
                        >
                            <Building2 className="w-3.5 h-3.5 text-slate-500" />
                            <span className="truncate max-w-[150px]">
                                {activeBuilding?.building.name || "Select Building"}
                            </span>
                            <ChevronDown className={cn("w-3 h-3 text-slate-400 transition-transform", dropdownOpen && "rotate-180")} />
                        </button>

                        {dropdownOpen && (
                            <>
                                <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />
                                <div className="absolute top-full left-0 mt-1 w-56 bg-white border border-slate-300 shadow-lg z-50 py-1">
                                    <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                                        Your Buildings
                                    </div>
                                    <div className="max-h-60 overflow-y-auto">
                                        {managerBuildings.map((mb) => (
                                            <button
                                                key={mb.building.id}
                                                onClick={() => handleSwitch(mb.building.id)}
                                                disabled={isPending}
                                                className={cn(
                                                    "w-full text-left px-3 py-2 text-xs hover:bg-slate-50 transition-colors flex items-start justify-between gap-2",
                                                    mb.building.id === activeBuilding?.building.id && "bg-blue-50/50"
                                                )}
                                            >
                                                <div className="flex flex-col min-w-0">
                                                    <span className={cn(
                                                        "font-bold truncate",
                                                        mb.building.id === activeBuilding?.building.id ? "text-blue-700" : "text-slate-700"
                                                    )}>
                                                        {mb.building.name}
                                                    </span>
                                                    <span className="text-[10px] text-slate-400 font-mono tracking-tighter uppercase">{mb.building.code}</span>
                                                </div>
                                                {mb.building.subscriptionStatus !== 'active' && (
                                                    <span className="shrink-0 flex items-center gap-0.5 text-[9px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-sm uppercase">
                                                        <AlertCircle className="w-2.5 h-2.5" />
                                                        Unpaid
                                                    </span>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                    <div className="border-t border-slate-100">
                                        <button
                                            onClick={handleAddBuilding}
                                            disabled={isCreating || isPending}
                                            className="w-full text-left px-3 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors flex items-center gap-2"
                                        >
                                            <Plus className="w-3.5 h-3.5" />
                                            {isCreating ? "Creating..." : "Add New Building"}
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                ) : activeBuilding ? (
                    <div className="flex items-center gap-2 px-2 py-1 text-xs font-medium text-slate-700">
                        <Building2 className="w-3.5 h-3.5 text-slate-500" />
                        <span>{activeBuilding.building.name}</span>
                    </div>
                ) : null}
            </div>

            <div className="flex items-center gap-3">
                <div className="text-right leading-3 hidden sm:block">
                    <div className="text-[11px] font-bold text-slate-700">{userName}</div>
                    <div className="text-[9px] text-slate-500 uppercase tracking-widest">{userRole} Access</div>
                </div>
                <div className="w-7 h-7 bg-blue-600 text-white rounded-sm flex items-center justify-center text-xs font-bold shadow-sm">
                    {initials}
                </div>
            </div>
        </header>
    )
}
