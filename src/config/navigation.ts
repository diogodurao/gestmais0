/**
 * Navigation Configuration for Extraordinary Payments
 * 
 * Add this to your Sidebar.tsx navigation items
 */

import {
    LayoutDashboard,
    CreditCard,
    Hammer,
    Settings,
    type LucideIcon,
} from "lucide-react"

// ===========================================
// NAVIGATION ITEM TYPE
// ===========================================

export interface NavItem {
    href: string
    label: string
    icon: LucideIcon
    /** Only show if building setup is complete */
    requiresSetup?: boolean
    /** Only show if subscription is active */
    requiresSubscription?: boolean
    /** Only show for specific roles */
    roles?: ("manager" | "resident")[]
    /** Badge content (e.g., notification count) */
    badge?: string | number
}

// ===========================================
// MANAGER NAVIGATION
// ===========================================

export const managerNavItems: NavItem[] = [
    {
        href: "/dashboard",
        label: "Painel",
        icon: LayoutDashboard,
        requiresSetup: true,
    },
    {
        href: "/dashboard/payments",
        label: "Quotas",
        icon: CreditCard,
        requiresSetup: true,
    },
    // =====================
    // ADD THIS ITEM ⬇️
    // =====================
    {
        href: "/dashboard/extraordinary",
        label: "Quotas Extra",
        icon: Hammer,
        requiresSetup: true,
        requiresSubscription: true,
    },
    // =====================
    {
        href: "/dashboard/settings",
        label: "Definições",
        icon: Settings,
        requiresSetup: true,
    },
]

// ===========================================
// RESIDENT NAVIGATION
// ===========================================

export const residentNavItems: NavItem[] = [
    {
        href: "/dashboard",
        label: "Painel",
        icon: LayoutDashboard,
    },
    {
        href: "/dashboard/my-payments",
        label: "As Minhas Quotas",
        icon: CreditCard,
    },
    {
        href: "/dashboard/extraordinary",
        label: "Quotas Extra",
        icon: Hammer,
    },
    {
        href: "/dashboard/settings",
        label: "Definições",
        icon: Settings,
    },
]

// ===========================================
// USAGE EXAMPLE IN SIDEBAR
// ===========================================

/*
// In your Sidebar.tsx:

import { managerNavItems, residentNavItems, type NavItem } from "@/config/navigation"

function Sidebar({ role, setupComplete, subscriptionActive }) {
    const items = role === "manager" ? managerNavItems : residentNavItems
    
    const filteredItems = items.filter((item) => {
        if (item.requiresSetup && !setupComplete) return false
        if (item.requiresSubscription && !subscriptionActive) return false
        if (item.roles && !item.roles.includes(role)) return false
        return true
    })
    
    return (
        <nav>
            {filteredItems.map((item) => (
                <NavLink key={item.href} item={item} />
            ))}
        </nav>
    )
}
*/