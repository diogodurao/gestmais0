"use client"

import { Building2, Menu, LogOut, Settings } from "lucide-react"
import Link from "next/link"
import { ROUTES } from "@/lib/routes"
import { useRouter } from "next/navigation"
import { useSidebar } from "./SidebarProvider"
import { authClient } from "@/lib/auth-client"
import { useDashboard } from "@/contexts/DashboardContext"
import { NotificationBell } from "@/features/dashboard/notifications/NotificationBell"
import {
    Dropdown,
    DropdownTrigger,
    DropdownContent,
    DropdownItem,
    DropdownSeparator,
    DropdownLabel
} from "@/components/ui/Dropdown"
import { BuildingSelector } from "./BuildingSelector"

export function DashboardHeader() {
    const { toggleSidebar, toggleDesktopCollapse } = useSidebar()
    const { session, managerBuildings, activeBuilding, setupComplete } = useDashboard()

    // Derived values
    const userName = session?.name || "User"
    const userRole = session?.role || "resident"
    const managerId = session?.id || ""
    const router = useRouter()

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

                {userRole === "manager" && (setupComplete || managerBuildings.length > 1) ? (
                    <BuildingSelector
                        managerBuildings={managerBuildings}
                        activeBuilding={activeBuilding}
                        managerId={managerId}
                    />
                ) : userRole === "resident" && activeBuilding ? (
                    <div className="flex items-center gap-2 px-2 py-1 text-body font-medium text-slate-700">
                        <Building2 className="w-4 h-4 text-slate-500" />
                        <span>{activeBuilding.building.name}</span>
                    </div>
                ) : null}
            </div>

            <div className="flex items-center gap-3">
                <NotificationBell />
                <div className="h-5 w-px bg-slate-200"></div>

                <Dropdown>
                    <DropdownTrigger className="flex items-center gap-3 hover:bg-slate-100 px-2 py-1 rounded-sm transition-colors outline-none">
                        <div className="text-right leading-3 hidden sm:block">
                            <div className="text-body font-bold text-slate-700">{userName}</div>
                            <div className="text-micro text-slate-500 uppercase tracking-widest">Acesso {userRole === 'manager' ? 'Gestor' : 'Residente'}</div>
                        </div>
                        <div className="w-7 h-7 bg-blue-600 text-white rounded-sm flex items-center justify-center text-body font-bold shadow-sm">
                            {initials}
                        </div>
                    </DropdownTrigger>
                    <DropdownContent align="end" className="w-48">
                        <DropdownLabel className="border-b border-slate-100">A Minha Conta</DropdownLabel>
                        <DropdownItem icon={<Settings className="w-4 h-4" />} onClick={() => router.push(ROUTES.DASHBOARD.SETTINGS)}>
                            Definições
                        </DropdownItem>
                        <DropdownSeparator />
                        <DropdownItem icon={<LogOut className="w-4 h-4" />} destructive onClick={handleSignOut}>
                            Sair
                        </DropdownItem>
                    </DropdownContent>
                </Dropdown>
            </div>
        </header>
    )
}
