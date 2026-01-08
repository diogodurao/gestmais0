"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { useSidebar } from "./SidebarProvider"
import { managerNavItems, residentNavItems } from "@/config/navigation"
import { useDashboard } from "@/contexts/DashboardContext"
import { Menu } from "lucide-react"

export function Sidebar() {
    const { isDesktopCollapsed, toggleDesktopCollapse, closeSidebar } = useSidebar()
    const pathname = usePathname()
    const { session, activeBuilding, setupComplete } = useDashboard()

    const userRole = session?.role || "resident"
    const links = userRole === "manager" ? managerNavItems : residentNavItems

    // Check subscription status for managers
    const hasActiveSubscription = activeBuilding?.building.subscriptionStatus === 'active'

    return (
        <aside
            className={cn(
                "hidden lg:flex flex-col rounded-lg border border-[#E9ECEF] bg-[#F8F8F6] transition-all duration-200",
                isDesktopCollapsed ? "w-14" : "w-52"
            )}
        >
            {/* Header */}
            <div className="flex h-10 items-center justify-between px-1.5 border-b border-[#E9ECEF]">
                {!isDesktopCollapsed && (
                    <span className="text-[11px] font-semibold text-[#495057] truncate px-1.5">
                        {activeBuilding?.building.name || "Workspace"}
                    </span>
                )}
                <button
                    onClick={toggleDesktopCollapse}
                    className={cn(
                        "flex h-7 w-7 items-center justify-center rounded text-[#6C757D] hover:bg-[#E9ECEF] transition-colors",
                        isDesktopCollapsed && "mx-auto"
                    )}
                    aria-label="Toggle sidebar"
                >
                    <Menu className="h-4 w-4" />
                </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-1.5 py-1.5 overflow-y-auto">
                <div className="space-y-0.5">
                    {links.map((link) => {
                        const Icon = link.icon
                        const isActive = pathname === link.href

                        // Determine if disabled
                        const isSubscriptionRestricted = userRole === 'manager' && link.requiresSubscription && !hasActiveSubscription
                        const isSetupRestricted = link.requiresSetup && !setupComplete
                        const isDisabled = isSetupRestricted

                        if (isDisabled) {
                            return (
                                <div
                                    key={link.href}
                                    className={cn(
                                        "flex items-center gap-2 rounded px-1.5 py-1.5 text-[10px] text-[#ADB5BD] cursor-not-allowed",
                                        isDesktopCollapsed && "justify-center"
                                    )}
                                    title={isSubscriptionRestricted
                                        ? "Subscrição ativa necessária"
                                        : "Complete a configuração para aceder"}
                                >
                                    <Icon className="h-3.5 w-3.5 flex-shrink-0" />
                                    {!isDesktopCollapsed && (
                                        <span className="truncate">{link.label}</span>
                                    )}
                                </div>
                            )
                        }

                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={cn(
                                    "flex items-center gap-2 rounded px-1.5 py-1.5 text-[10px] transition-colors",
                                    isActive
                                        ? "bg-[#E8F0EA] font-medium text-[#6A9B72]"
                                        : "text-[#6C757D] hover:bg-[#E9ECEF]",
                                    isDesktopCollapsed && "justify-center"
                                )}
                                onClick={closeSidebar}
                                title={isDesktopCollapsed ? link.label : undefined}
                            >
                                <Icon className={cn(
                                    "h-3.5 w-3.5 flex-shrink-0",
                                    isActive && "text-[#6A9B72]"
                                )} />
                                {!isDesktopCollapsed && (
                                    <span className="truncate">{link.label}</span>
                                )}
                            </Link>
                        )
                    })}
                </div>
            </nav>

            {/* Footer */}
            <div className="px-1.5 py-1.5 border-t border-[#E9ECEF]">
                {!isDesktopCollapsed && (
                    <p className="text-[9px] text-[#ADB5BD] text-center">
                        GestMais v1.0
                    </p>
                )}
            </div>
        </aside>
    )
}
