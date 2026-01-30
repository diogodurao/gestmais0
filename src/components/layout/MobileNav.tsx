"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"
import { useSidebar } from "./SidebarProvider"
import { useDashboard } from "@/contexts/DashboardContext"
import { managerNavItems, residentNavItems, professionalNavItems } from "@/config/navigation"

export function MobileNav() {
    const { isMobileOpen, closeMobile } = useSidebar()
    const pathname = usePathname()
    const { session, activeBuilding, setupComplete } = useDashboard()
    const [pendingHref, setPendingHref] = useState<string | null>(null)

    // Reset pending state when navigation completes
    useEffect(() => {
        setPendingHref(null)
    }, [pathname])

    // Reuse the same logic as Sidebar
    const userRole = session?.role || "resident"
    const allItems = userRole === "manager"
        ? managerNavItems
        : userRole === "professional"
            ? professionalNavItems
            : residentNavItems
    const hasActiveSubscription = activeBuilding?.building.subscriptionStatus === 'active'

    const filteredItems = allItems.filter((item) => {
        if (item.requiresSetup && !setupComplete) return false
        if (item.requiresSubscription && !hasActiveSubscription) return false
        if (item.roles && !item.roles.includes(userRole as any)) return false
        return true
    })

    return (
        <div className={cn("fixed inset-0 z-50 lg:hidden transition-opacity duration-normal", isMobileOpen ? "opacity-100" : "opacity-0 pointer-events-none")}>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/20 backdrop-blur-[1px]"
                onClick={closeMobile}
            />

            {/* Drawer - matches desktop spacing and animation */}
            <div className={cn(
                "fixed top-1.5 bottom-1.5 left-1.5 w-48 bg-pearl border border-gray-200 rounded-lg shadow-xl transition-transform duration-normal flex flex-col",
                isMobileOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                <div className="flex h-10 items-center justify-between px-1.5 mb-2">
                    <span className="text-body font-semibold text-gray-700 pl-1.5">
                        Condominium
                    </span>
                    <button
                        onClick={closeMobile}
                        className="flex h-7 w-7 items-center justify-center rounded text-gray-600 hover:bg-gray-200 transition-colors"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                <nav className="flex-1 px-1.5 py-1.5 space-y-0.5">
                    {filteredItems.map((item) => {
                        // Show as active if: actually active OR pending navigation to this item
                        const isActive = pathname === item.href || pendingHref === item.href

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => {
                                    setPendingHref(item.href)
                                    closeMobile()
                                }}
                                className={cn(
                                    "flex items-center gap-2 rounded px-1.5 py-1.5 text-label transition-colors",
                                    isActive
                                        ? "bg-primary-light font-medium text-primary-dark"
                                        : "text-gray-600 hover:bg-gray-200"
                                )}
                            >
                                <item.icon className="h-3.5 w-3.5 flex-shrink-0" />
                                <span>{item.label}</span>
                            </Link>
                        )
                    })}
                </nav>
            </div>
        </div>
    )
}
