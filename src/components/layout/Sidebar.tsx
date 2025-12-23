"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { useSidebar } from "./SidebarProvider"
import { managerNavItems, residentNavItems } from "@/config/navigation"

type ManagedBuilding = {
    building: { id: string; name: string; code: string; subscriptionStatus?: string | null }
    isOwner: boolean | null
}

type SidebarProps = {
    userRole: string
    setupComplete?: boolean
    managerBuildings?: ManagedBuilding[]
    activeBuildingId?: string
}

export function Sidebar({
    userRole,
    setupComplete = false,
    activeBuildingId,
    managerBuildings = []
}: SidebarProps) {
    const { isOpen, isDesktopCollapsed, closeSidebar } = useSidebar()
    const pathname = usePathname()

    const activeBuilding = managerBuildings.find(b => b.building.id === activeBuildingId)

    const links = userRole === "manager" ? managerNavItems : residentNavItems

    return (
        <>
            {/* Sidebar Container */}
            <aside className={cn(
                "fixed inset-y-0 left-0 z-50 bg-slate-50 border-r border-slate-300 transform transition-all duration-300 ease-in-out flex flex-col py-3",
                // Mobile state
                isOpen ? "translate-x-0 w-64" : "-translate-x-full w-64",
                // Desktop state
                "lg:translate-x-0 lg:static lg:h-screen",
                isDesktopCollapsed ? "lg:w-0 lg:opacity-0 lg:pointer-events-none lg:border-r-0" : "lg:w-52 lg:opacity-100"
            )}>
                <div className={cn(
                    "px-4 mb-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider transition-opacity whitespace-nowrap overflow-hidden",
                    isDesktopCollapsed && "lg:opacity-0"
                )}>
                    Workspace
                </div>

                <nav className="flex-1 space-y-0 overflow-hidden">
                    {links.map((link) => {
                        const Icon = link.icon
                        const isActive = pathname === link.href

                        // Check subscription status for managers
                        const hasActiveSubscription = activeBuilding?.building.subscriptionStatus === 'active'

                        // Determine if disabled
                        const isSubscriptionRestricted = userRole === 'manager' && link.requiresSubscription && !hasActiveSubscription
                        const isSetupRestricted = link.requiresSetup && !setupComplete

                        const isDisabled = isSetupRestricted || isSubscriptionRestricted

                        if (isDisabled) {
                            return (
                                <div
                                    key={link.href}
                                    className="flex items-center px-4 py-1.5 text-slate-300 cursor-not-allowed border-l-[3px] border-transparent"
                                    title={isSubscriptionRestricted ? "Active subscription required" : "Complete setup to access this feature"}
                                >
                                    <Icon className="w-4 h-4 mr-3 shrink-0" />
                                    <span className="text-xs font-medium truncate whitespace-nowrap">{link.label}</span>
                                </div>
                            )
                        }

                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={cn(
                                    "flex items-center px-4 py-1.5 transition-all border-l-[3px]",
                                    isActive
                                        ? "bg-white border-blue-600 text-slate-900 font-medium shadow-sm"
                                        : "text-slate-600 border-transparent hover:bg-white hover:border-slate-300"
                                )}
                                onClick={closeSidebar}
                            >
                                <Icon className={cn("w-4 h-4 mr-3 shrink-0", isActive ? "text-blue-600" : "text-slate-400")} />
                                <span className="text-xs truncate whitespace-nowrap">{link.label}</span>
                            </Link>
                        )
                    })}
                </nav>

                {/* Footer */}
                <div className="mt-auto px-4 py-2 border-t border-slate-200">
                </div>
            </aside>


            {/* Overlay for mobile */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/30 lg:hidden backdrop-blur-[2px]"
                    onClick={closeSidebar}
                />
            )}
        </>
    )
}
