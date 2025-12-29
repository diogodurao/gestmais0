"use client"

import { ChevronDown, Building2, Plus, AlertCircle, Menu, LogOut, Settings } from "lucide-react"
import { useState, useTransition } from "react"
import Link from "next/link"
import { ROUTES } from "@/lib/routes"
import { cn } from "@/lib/utils"
import { switchActiveBuilding, createNewBuilding } from "@/app/actions/building"
import { useRouter } from "next/navigation"
import { useSidebar } from "./SidebarProvider"
import { authClient } from "@/lib/auth-client"
import { useDashboard } from "@/contexts/DashboardContext"
import {
    Dropdown,
    DropdownTrigger,
    DropdownContent,
    DropdownItem,
    DropdownSeparator,
    DropdownLabel
} from "@/components/ui/Dropdown"

export function DashboardHeader() {
    const { toggleSidebar, toggleDesktopCollapse } = useSidebar()
    const { session, managerBuildings, activeBuilding, setupComplete } = useDashboard()

    // Derived values
    const userName = session?.name || "User"
    const userRole = session?.role || "resident"
    const managerId = session?.id || ""

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
            await createNewBuilding("New Building", "")
            setDropdownOpen(false)
            router.refresh()
        } catch (error) {
            console.error("Failed to create building:", error)
        } finally {
            setIsCreating(false)
        }
    }

    const handleSignOut = async () => {
        await authClient.signOut()
        router.push("/sign-in")
        router.refresh()
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

                <Link href={ROUTES.DASHBOARD.HOME} className="flex items-center font-bold tracking-tight text-content ml-1 hover:opacity-80 transition-opacity">
                    <span className="text-slate-400 font-normal">GEST</span>
                    <span className="text-slate-800">MAIS+</span>
                </Link>

                <div className="h-5 w-px bg-slate-300 mx-2"></div>

                {userRole === "manager" && setupComplete && managerBuildings.length > 0 ? (
                    <div className="relative">
                        <button
                            onClick={() => setDropdownOpen(!dropdownOpen)}
                            className="flex items-center gap-2 px-2 py-1 hover:bg-slate-200 rounded-sm text-body font-medium text-slate-700 transition-colors"
                            disabled={isPending}
                        >
                            <Building2 className="w-4 h-4 text-slate-500" />
                            <span className="truncate max-w-[150px]">
                                {activeBuilding?.building.name || "Select Building"}
                            </span>
                            <ChevronDown className={cn("w-3 h-3 text-slate-400 transition-transform", dropdownOpen && "rotate-180")} />
                        </button>

                        {dropdownOpen && (
                            <>
                                <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />
                                <div className="absolute top-full left-0 mt-1 w-56 bg-white border border-slate-300 shadow-lg z-50 py-1">
                                    <div className="px-3 py-1.5 text-label font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                                        Your Buildings
                                    </div>
                                    <div className="max-h-60 overflow-y-auto">
                                        {managerBuildings.map((mb) => (
                                            <button
                                                key={mb.building.id}
                                                onClick={() => handleSwitch(mb.building.id)}
                                                disabled={isPending}
                                                className={cn(
                                                    "w-full text-left px-3 py-2 text-body hover:bg-slate-50 transition-colors flex items-start justify-between gap-2",
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
                                                    <span className="text-label text-slate-400 font-mono tracking-tighter uppercase">{mb.building.code}</span>
                                                </div>
                                                {mb.building.subscriptionStatus !== 'active' && (
                                                    <span className="shrink-0 flex items-center gap-0.5 text-micro font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-sm uppercase">
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
                                            className="w-full text-left px-3 py-2.5 text-body font-bold text-slate-600 hover:bg-slate-50 transition-colors flex items-center gap-2"
                                        >
                                            <Plus className="w-4 h-4" />
                                            {isCreating ? "Creating..." : "Add New Building"}
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                ) : userRole === "resident" && activeBuilding ? (
                    <div className="flex items-center gap-2 px-2 py-1 text-body font-medium text-slate-700">
                        <Building2 className="w-4 h-4 text-slate-500" />
                        <span>{activeBuilding.building.name}</span>
                    </div>
                ) : null}
            </div>

            <Dropdown>
                <DropdownTrigger className="flex items-center gap-3 hover:bg-slate-100 px-2 py-1 rounded-sm transition-colors outline-none">
                    <div className="text-right leading-3 hidden sm:block">
                        <div className="text-body font-bold text-slate-700">{userName}</div>
                        <div className="text-micro text-slate-500 uppercase tracking-widest">{userRole} Access</div>
                    </div>
                    <div className="w-7 h-7 bg-blue-600 text-white rounded-sm flex items-center justify-center text-body font-bold shadow-sm">
                        {initials}
                    </div>
                </DropdownTrigger>
                <DropdownContent align="end" className="w-48">
                    <DropdownLabel>My Account</DropdownLabel>
                    <DropdownItem icon={<Settings className="w-4 h-4" />} onClick={() => router.push(ROUTES.DASHBOARD.SETTINGS)}>
                        Settings
                    </DropdownItem>
                    <DropdownSeparator />
                    <DropdownItem icon={<LogOut className="w-4 h-4" />} destructive onClick={handleSignOut}>
                        Sign Out
                    </DropdownItem>
                </DropdownContent>
            </Dropdown>
        </header>

    )
}
