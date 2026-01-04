/**
 * Navigation Configuration for Extraordinary Payments
 * 
 * Add this to your Sidebar.tsx navigation items
 */
import { ROUTES } from "@/lib/routes"

import {
    LayoutDashboard,
    CreditCard,
    Hammer,
    Settings,
    Calendar,
    type LucideIcon,
    AlertTriangle,
    Vote,
    MessageSquare,
    BarChart3,
    FolderOpen,
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
        href: ROUTES.DASHBOARD.HOME,
        label: "Painel",
        icon: LayoutDashboard,
        requiresSetup: true,
    },
    {
        href: ROUTES.DASHBOARD.PAYMENTS,
        label: "Quotas",
        icon: CreditCard,
        requiresSetup: true,
    },
    {
        href: ROUTES.DASHBOARD.EXTRAORDINARY,
        label: "Quotas Extra",
        icon: Hammer,
        requiresSetup: true,
        requiresSubscription: true,
    },
    {
        href: "/dashboard/calendar",
        label: "Agenda",
        icon: Calendar,
        requiresSetup: true,
    },
    {
        href: "/dashboard/occurrences",
        label: "Ocorrências",
        icon: AlertTriangle,
        requiresSetup: true,
    },
    {
        href: "/dashboard/polls",
        label: "Votações",
        icon: Vote,
        requiresSetup: true,
    },
    {
        href: "/dashboard/discussions",
        label: "Discussões",
        icon: MessageSquare,
        requiresSetup: true,
    },
    {
        href: "/dashboard/evaluations",
        label: "Avaliação Mensal",
        icon: BarChart3,
        requiresSetup: true,
    },
    {
        href: "/dashboard/documents",
        label: "Documentos",
        icon: FolderOpen,
        requiresSetup: true,
    },
    {
        href: ROUTES.DASHBOARD.SETTINGS,
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
        href: ROUTES.DASHBOARD.HOME,
        label: "Painel",
        icon: LayoutDashboard,
    },
    {
        href: "/dashboard/my-payments",
        label: "As Minhas Quotas",
        icon: CreditCard,
    },
    {
        href: ROUTES.DASHBOARD.EXTRAORDINARY,
        label: "Quotas Extra",
        icon: Hammer,

    },
    {
        href: "/dashboard/calendar",
        label: "Agenda",
        icon: Calendar,
    },
    {
        href: "/dashboard/occurrences",
        label: "Ocorrências",
        icon: AlertTriangle,
    },
    {
        href: "/dashboard/polls",
        label: "Votações",
        icon: Vote,
    },
    {
        href: "/dashboard/discussions",
        label: "Discussões",
        icon: MessageSquare,
    },
    {
        href: "/dashboard/evaluations",
        label: "Avaliação Mensal",
        icon: BarChart3,
    },
    {
        href: "/dashboard/documents",
        label: "Documentos",
        icon: FolderOpen,
    },
    {
        href: ROUTES.DASHBOARD.SETTINGS,
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