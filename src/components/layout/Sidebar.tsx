"use client"

import { Building2, CreditCard, LayoutDashboard, Menu, X } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { Button, cn } from "@/components/ui/Button" // Reusing cn and Button

export function Sidebar({ userRole }: { userRole: string }) {
    const [isOpen, setIsOpen] = useState(false)
    const pathname = usePathname()

    const links = [
        { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
        ...(userRole === "manager" ? [
            { href: "/dashboard/payments", label: "Payment Map", icon: CreditCard }
        ] : []),
        ...(userRole === "resident" ? [
            { href: "/dashboard/my-payments", label: "My Payments", icon: CreditCard }
        ] : [])
    ]

    return (
        <>
            {/* Mobile Trigger */}
            {/* Mobile Trigger */}
            <div className="lg:hidden fixed top-4 left-4 z-50">
                <Button
                    variant="outline"
                    onClick={() => setIsOpen(!isOpen)}
                    className="p-2 h-auto" // Override default height/padding for icon-only feel
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

                    {/* Navigation */}
                    <nav className="flex-1 p-4 space-y-1">
                        {links.map((link) => {
                            const Icon = link.icon
                            const isActive = pathname === link.href

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
                                    // Close menu on mobile click
                                    onClick={() => setIsOpen(false)}
                                >
                                    <Icon className={cn("w-5 h-5 mr-3", isActive ? "text-black" : "text-gray-500")} />
                                    {link.label}
                                </Link>
                            )
                        })}
                    </nav>

                    {/* Footer / User Info could go here */}
                    <div className="p-4 border-t border-gray-100">
                        <div className="text-xs text-gray-400">
                            v0.1.0 MVP
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
        </>
    )
}
