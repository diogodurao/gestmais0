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
            {/* Mobile Trigger */}
            <div className="lg:hidden fixed top-4 left-4 z-50">
                <Button
                    variant="outline"
                    onClick={() => setIsOpen(!isOpen)}
                    className="p-2 h-auto"
                >
                    {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </Button>
            </div>

            {/* Sidebar Container */}
            <aside className={cn(
                "fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:h-screen",
                isOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                <div className="h-full flex flex-col">
                    {/* Header */}
                    <div className="h-16 flex items-center px-6 border-b border-gray-100">
                        <Building2 className="w-6 h-6 text-black mr-2" />
                        <span className="font-bold text-lg">GestMais</span>
                    </div>

                    {/* Building Selector (Manager Only) */}
                    {userRole === "manager" && managerBuildings.length > 0 && (
                        <div className="px-4 py-3 border-b border-gray-100">
                            <div className="relative">
                                <button
                                    onClick={() => setBuildingDropdownOpen(!buildingDropdownOpen)}
                                    className="w-full flex items-center justify-between px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded-md transition-colors"
                                    disabled={isPending}
                                >
                                    <div className="truncate text-left">
                                        <p className="text-xs text-gray-500">Building</p>
                                        <p className="text-sm font-medium truncate">
                                            {activeBuilding?.building.name || "Select..."}
                                        </p>
                                    </div>
                                    <ChevronDown className={cn(
                                        "w-4 h-4 text-gray-400 transition-transform",
                                        buildingDropdownOpen && "rotate-180"
                                    )} />
                                </button>

                                {/* Dropdown */}
                                {buildingDropdownOpen && (
                                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-50 max-h-60 overflow-y-auto">
                                        {managerBuildings.map(({ building, isOwner }) => (
                                            <button
                                                key={building.id}
                                                onClick={() => handleSwitchBuilding(building.id)}
                                                className={cn(
                                                    "w-full text-left px-3 py-2 hover:bg-gray-50 transition-colors",
                                                    building.id === activeBuildingId && "bg-gray-100"
                                                )}
                                            >
                                                <p className="text-sm font-medium truncate">{building.name}</p>
                                                <p className="text-xs text-gray-400">{building.code}</p>
                                            </button>
                                        ))}
                                        <Link
                                            href="/dashboard/settings?new=1"
                                            onClick={() => {
                                                setBuildingDropdownOpen(false)
                                                setIsOpen(false)
                                            }}
                                            className="flex items-center gap-2 w-full text-left px-3 py-2 hover:bg-gray-50 transition-colors border-t border-gray-100 text-sm text-gray-600"
                                        >
                                            <Plus className="w-4 h-4" />
                                            Add New Building
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Navigation */}
                    <nav className="flex-1 p-4 space-y-1">
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
                                        className="flex items-center px-3 py-2.5 rounded-md text-sm font-medium text-gray-300 cursor-not-allowed"
                                        title={isSubscriptionRestricted ? "Active subscription required" : "Complete setup to access this feature"}
                                    >
                                        <Icon className="w-5 h-5 mr-3 text-gray-300" />
                                        {link.label}
                                    </div>
                                )
                            }

                            return (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={cn(
                                        "flex items-center px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
                                        isActive
                                            ? "bg-gray-100 text-black"
                                            : "text-gray-900 hover:bg-gray-50 hover:text-black"
                                    )}
                                    onClick={() => setIsOpen(false)}
                                >
                                    <Icon className={cn("w-5 h-5 mr-3", isActive ? "text-black" : "text-gray-500")} />
                                    {link.label}
                                </Link>
                            )
                        })}
                    </nav>

                    {/* Setup Warning for Residents */}
                    {userRole === "resident" && !setupComplete && (
                        <div className="px-4 py-3 border-t border-gray-100 bg-amber-50">
                            <p className="text-xs text-amber-700">
                                Complete your setup to access all features.
                            </p>
                        </div>
                    )}

                    {/* Footer */}
                    <div className="p-4 border-t border-gray-100">
                        <div className="text-xs text-gray-400">
                            v0.2.0 MVP
                        </div>
                    </div>
                </div>
            </aside>

            {/* Overlay for mobile */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-30 bg-black/20 lg:hidden"
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
