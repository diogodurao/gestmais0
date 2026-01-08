"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { useSidebar } from "./SidebarProvider"
import { managerNavItems, residentNavItems } from "@/config/navigation"
import { useDashboard } from "@/contexts/DashboardContext"
import { X } from "lucide-react"

export function MobileNav() {
    const { isOpen, closeSidebar } = useSidebar()
    const pathname = usePathname()
    const { session, activeBuilding, setupComplete } = useDashboard()

    const userRole = session?.role || "resident"
    const links = userRole === "manager" ? managerNavItems : residentNavItems

    // Check subscription status for managers
    const hasActiveSubscription = activeBuilding?.building.subscriptionStatus === 'active'

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 lg:hidden">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/20 backdrop-blur-[2px]"
                onClick={closeSidebar}
                aria-hidden="true"
            />

            {/* Drawer */}
            <div className="fixed inset-y-0 left-0 w-64 bg-[#F8F8F6] border-r border-[#E9ECEF] flex flex-col">
                {/* Header */}
                <div className="flex h-12 items-center justify-between px-3 border-b border-[#E9ECEF]">
                    <span className="text-[11px] font-semibold text-[#495057]">
                        {activeBuilding?.building.name || "GestMais"}
                    </span>
                    <button
                        onClick={closeSidebar}
                        className="flex h-7 w-7 items-center justify-center rounded text-[#6C757D] hover:bg-[#E9ECEF] transition-colors"
                        aria-label="Close menu"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto p-1.5">
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
                                        className="flex items-center gap-2 rounded px-2 py-2 text-[11px] text-[#ADB5BD] cursor-not-allowed"
                                        title={isSubscriptionRestricted
                                            ? "Subscrição ativa necessária"
                                            : "Complete a configuração para aceder"}
                                    >
                                        <Icon className="h-4 w-4 flex-shrink-0" />
                                        <span>{link.label}</span>
                                    </div>
                                )
                            }

                            return (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={cn(
                                        "flex items-center gap-2 rounded px-2 py-2 text-[11px] transition-colors",
                                        isActive
                                            ? "bg-[#E8F0EA] font-medium text-[#6A9B72]"
                                            : "text-[#6C757D] hover:bg-[#E9ECEF]"
                                    )}
                                    onClick={closeSidebar}
                                >
                                    <Icon className={cn(
                                        "h-4 w-4 flex-shrink-0",
                                        isActive && "text-[#6A9B72]"
                                    )} />
                                    <span>{link.label}</span>
                                </Link>
                            )
                        })}
                    </div>
                </nav>

                {/* Footer */}
                <div className="p-3 border-t border-[#E9ECEF]">
                    <p className="text-[9px] text-[#ADB5BD] text-center">
                        GestMais v1.0
                    </p>
                </div>
            </div>
        </div>
    )
}