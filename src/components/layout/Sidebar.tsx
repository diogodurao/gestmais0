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
                "hidden lg:flex flex-col rounded-lg border border-gray-200 bg-pearl transition-all duration-normal",
                isCollapsed ? "w-12" : "w-48"
            )}
        >
            <div className="flex h-10 items-center justify-between px-1.5">
                {!isCollapsed && (
                    <span className="text-body font-semibold text-gray-700 pl-1.5">
                        Condominium
                    </span>
                )}
                <button
                    onClick={toggleCollapsed}
                    className="flex h-7 w-7 items-center justify-center rounded text-gray-600 hover:bg-gray-200 transition-colors"
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
                                "flex items-center gap-2 rounded px-1.5 py-1.5 text-label transition-colors",
                                isActive
                                    ? "bg-primary-light font-medium text-primary-dark"
                                    : "text-gray-600 hover:bg-gray-200"
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