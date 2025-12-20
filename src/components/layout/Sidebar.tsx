"use client"

import { Building2, CreditCard, LayoutDashboard, Menu, Settings, X, ChevronDown, Plus } from "lucide-react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import { Button, cn } from "@/components/ui/Button"
import { switchActiveBuilding } from "@/app/actions/building"

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
    setupComplete = true,
    managerBuildings = [],
    activeBuildingId
}: SidebarProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [buildingDropdownOpen, setBuildingDropdownOpen] = useState(false)
    const [isPending, startTransition] = useTransition()
    const pathname = usePathname()
    const router = useRouter()

    const activeBuilding = managerBuildings.find(b => b.building.id === activeBuildingId)

    const links = [
        { href: "/dashboard", label: "Overview", icon: LayoutDashboard, requiresSetup: false, requiresSubscription: false },
        ...(userRole === "manager" ? [
            { href: "/dashboard/payments", label: "Payment Map", icon: CreditCard, requiresSetup: true, requiresSubscription: true },
        ] : []),
        ...(userRole === "resident" ? [
            { href: "/dashboard/my-payments", label: "My Payments", icon: CreditCard, requiresSetup: true, requiresSubscription: false }
        ] : []),
        { href: "/dashboard/settings", label: "Settings", icon: Settings, requiresSetup: false, requiresSubscription: false }
    ]

    const handleSwitchBuilding = (buildingId: string) => {
        startTransition(async () => {
            try {
                await switchActiveBuilding(buildingId)
                setBuildingDropdownOpen(false)
                router.refresh()
            } catch (error) {
                console.error("Failed to switch building", error)
            }
        })
    }

    return (
        <>
            {/* Mobile Trigger - positioned inside sidebar when open */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "lg:hidden fixed z-[60] p-2 rounded-sm transition-all duration-200",
                    "border border-slate-300 shadow-sm",
                    isOpen 
                        ? "top-3 left-[176px] bg-slate-100 text-slate-600 hover:bg-slate-200" 
                        : "top-14 left-3 bg-white text-slate-600 hover:bg-slate-50"
                )}
                aria-label={isOpen ? "Close menu" : "Open menu"}
            >
                {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            {/* Sidebar Container */}
            <aside className={cn(
                "fixed inset-y-0 left-0 z-50 w-52 bg-slate-50 border-r border-slate-300 transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:h-screen flex flex-col py-3",
                isOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                <div className="px-4 mb-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Workspace</div>

                <nav className="flex-1 space-y-0">
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
                                    <Icon className="w-4 h-4 mr-3" />
                                    <span className="text-xs font-medium">{link.label}</span>
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
                                onClick={() => setIsOpen(false)}
                            >
                                <Icon className={cn("w-4 h-4 mr-3", isActive ? "text-blue-600" : "text-slate-400")} />
                                <span className="text-xs">{link.label}</span>
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
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Close building dropdown when clicking outside */}
            {buildingDropdownOpen && (
                <div
                    className="fixed inset-0 z-30"
                    onClick={() => setBuildingDropdownOpen(false)}
                />
            )}
        </>
    )
}
