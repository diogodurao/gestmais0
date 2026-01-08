"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"
import { useSidebar } from "./SidebarProvider"
import { useDashboard } from "@/contexts/DashboardContext"
import { managerNavItems, residentNavItems } from "@/config/navigation"

export function MobileNav() {
    const { isMobileOpen, closeMobile } = useSidebar()
    const pathname = usePathname()
    const { session, activeBuilding, setupComplete } = useDashboard()

    if (!isMobileOpen) return null

    // Reuse the same logic as Sidebar
    const userRole = session?.role || "resident"
    const allItems = userRole === "manager" ? managerNavItems : residentNavItems
    const hasActiveSubscription = activeBuilding?.building.subscriptionStatus === 'active'

    const filteredItems = allItems.filter((item) => {
        if (item.requiresSetup && !setupComplete) return false
        if (item.requiresSubscription && !hasActiveSubscription) return false
        if (item.roles && !item.roles.includes(userRole as any)) return false
        return true
    })

    return (
        <div className="fixed inset-0 z-50 lg:hidden">
            {/* Backdrop */}
            <div 
                className="fixed inset-0 bg-black/20 backdrop-blur-[1px]" 
                onClick={closeMobile} 
            />
            
            {/* Drawer */}
            <div className="fixed inset-y-0 left-0 w-64 bg-[#F8F8F6] border-r border-[#E9ECEF] p-1.5 shadow-xl">
                <div className="flex h-10 items-center justify-between px-1.5 mb-2">
                    <span className="text-[11px] font-semibold text-[#495057] pl-1.5">
                        Condominium
                    </span>
                    <button
                        onClick={closeMobile}
                        className="flex h-7 w-7 items-center justify-center rounded text-[#6C757D] hover:bg-[#E9ECEF]"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                <nav className="space-y-0.5">
                    {filteredItems.map((item) => {
                        const isActive = pathname === item.href

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={closeMobile}
                                className={cn(
                                    "flex items-center gap-2 rounded px-1.5 py-2 text-[11px] transition-colors",
                                    isActive
                                        ? "bg-[#E8F0EA] font-medium text-[#6A9B72]"
                                        : "text-[#6C757D] hover:bg-[#E9ECEF]"
                                )}
                            >
                                <item.icon className="h-4 w-4 flex-shrink-0" />
                                {item.label}
                            </Link>
                        )
                    })}
                </nav>
            </div>
        </div>
    )
}