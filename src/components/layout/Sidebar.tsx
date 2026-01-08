"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu } from "lucide-react"
import { cn } from "@/lib/utils"
import { useSidebar } from "./SidebarProvider"
import { useDashboard } from "@/contexts/DashboardContext"
import { managerNavItems, residentNavItems } from "@/config/navigation"

export function Sidebar() {
    const { isCollapsed, toggleCollapsed } = useSidebar()
    const pathname = usePathname()
    const { session, activeBuilding, setupComplete } = useDashboard()

    // 1. Determine User Role
    const userRole = session?.role || "resident"

    // 2. Select the correct menu
    const allItems = userRole === "manager" ? managerNavItems : residentNavItems

    // 3. Filter items based on permissions
    const hasActiveSubscription = activeBuilding?.building.subscriptionStatus === 'active'

    const filteredItems = allItems.filter((item) => {
        // Hide if setup is required but not complete
        if (item.requiresSetup && !setupComplete) return false

        // Hide if subscription is required but not active
        if (item.requiresSubscription && !hasActiveSubscription) return false

        // Hide if role specific (safety check, though we already selected list)
        if (item.roles && !item.roles.includes(userRole as any)) return false

        return true
    })

    return (
        <aside
            className={cn(
                "hidden lg:flex flex-col rounded-lg border border-[#E9ECEF] bg-[#F8F8F6] transition-all duration-200",
                isCollapsed ? "w-12" : "w-48"
            )}
        >
            <div className="flex h-10 items-center justify-between px-1.5">
                {!isCollapsed && (
                    <span className="text-[11px] font-semibold text-[#495057] pl-1.5">
                        Condominium
                    </span>
                )}
                <button
                    onClick={toggleCollapsed}
                    className="flex h-7 w-7 items-center justify-center rounded text-[#6C757D] hover:bg-[#E9ECEF]"
                >
                    <Menu className="h-4 w-4" />
                </button>
            </div>

            <nav className="flex-1 px-1.5 py-1.5 space-y-0.5">
                {filteredItems.map((item) => {
                    const isActive = pathname === item.href

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-2 rounded px-1.5 py-1.5 text-[10px] transition-colors",
                                isActive
                                    ? "bg-[#E8F0EA] font-medium text-[#6A9B72]"
                                    : "text-[#6C757D] hover:bg-[#E9ECEF]"
                            )}
                            title={isCollapsed ? item.label : undefined}
                        >
                            <item.icon className="h-3.5 w-3.5 flex-shrink-0" />
                            {!isCollapsed && <span>{item.label}</span>}
                        </Link>
                    )
                })}
            </nav>
        </aside>
    )
}