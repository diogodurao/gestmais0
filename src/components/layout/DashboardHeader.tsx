"use client"

import { Menu, LogOut, Settings } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ROUTES } from "@/lib/routes"
import { useSidebar } from "./SidebarProvider"
import { authClient } from "@/lib/auth-client"
import { useDashboard } from "@/contexts/DashboardContext"
import { NotificationBell } from "@/features/dashboard/notifications/NotificationBell"
import { BuildingSelector } from "./BuildingSelector"
import { cn } from "@/lib/utils"

export function DashboardHeader() {
    const { toggleSidebar } = useSidebar()
    const { session, managerBuildings, activeBuilding, setupComplete } = useDashboard()
    const router = useRouter()

    // Derived values
    const userName = session?.name || "User"
    const userRole = session?.role || "resident"
    const managerId = session?.id || ""

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
        <header className="flex h-10 items-center justify-between rounded-lg border border-[#E9ECEF] bg-[#F8F8F6] px-1.5">
            {/* Left side */}
            <div className="flex items-center gap-1.5">
                {/* Mobile menu toggle */}
                <button
                    onClick={toggleSidebar}
                    className="flex h-7 w-7 items-center justify-center rounded text-[#6C757D] hover:bg-[#E9ECEF] transition-colors lg:hidden"
                    aria-label="Toggle menu"
                >
                    <Menu className="h-4 w-4" />
                </button>

                {/* Logo */}
                <Link
                    href={ROUTES.DASHBOARD.HOME}
                    className="flex items-center text-[12px] font-medium hover:opacity-80 transition-opacity"
                >
                    <span className="text-[#8E9AAF]">GEST</span>
                    <span className="text-[#343A40] font-semibold">MAIS+</span>
                </Link>

                <div className="h-4 w-px bg-[#E9ECEF] mx-1"></div>

                {/* Building selector for managers / Building name for residents */}
                {userRole === "manager" && (setupComplete || managerBuildings.length > 1) ? (
                    <BuildingSelector
                        managerBuildings={managerBuildings}
                        activeBuilding={activeBuilding}
                        managerId={managerId}
                    />
                ) : userRole === "resident" && activeBuilding ? (
                    <span className="text-[11px] text-[#6C757D] hidden sm:block">
                        {activeBuilding.building.name}
                    </span>
                ) : null}
            </div>

            {/* Right side */}
            <div className="flex items-center gap-1.5">
                <NotificationBell />

                <div className="h-4 w-px bg-[#E9ECEF]"></div>

                {/* User dropdown */}
                <div className="relative group">
                    <button className="flex items-center gap-1.5 rounded px-1.5 py-1 hover:bg-[#E9ECEF] transition-colors">
                        {/* User info - hidden on mobile */}
                        <div className="text-right hidden sm:block">
                            <p className="text-[10px] font-medium text-[#495057] leading-tight">{userName}</p>
                            <p className="text-[9px] text-[#8E9AAF] leading-tight">
                                {userRole === 'manager' ? 'Gestor' : 'Residente'}
                            </p>
                        </div>

                        {/* Avatar */}
                        <div className="h-7 w-7 rounded-full bg-[#E8F0EA] flex items-center justify-center">
                            <span className="text-[10px] font-medium text-[#6A9B72]">{initials}</span>
                        </div>
                    </button>

                    {/* Dropdown menu */}
                    <div className="absolute right-0 top-full mt-1 w-40 rounded-lg border border-[#E9ECEF] bg-white py-1 shadow-sm opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                        <button
                            onClick={() => router.push(ROUTES.DASHBOARD.SETTINGS)}
                            className="flex w-full items-center gap-2 px-3 py-1.5 text-[10px] text-[#495057] hover:bg-[#F8F9FA] transition-colors"
                        >
                            <Settings className="h-3.5 w-3.5" />
                            Definições
                        </button>
                        <div className="my-1 h-px bg-[#E9ECEF]" />
                        <button
                            onClick={handleSignOut}
                            className="flex w-full items-center gap-2 px-3 py-1.5 text-[10px] text-[#D4848C] hover:bg-[#F8F9FA] transition-colors"
                        >
                            <LogOut className="h-3.5 w-3.5" />
                            Sair
                        </button>
                    </div>
                </div>
            </div>
        </header>
    )
}
