"use client"

import { usePathname } from "next/navigation"
import { useDashboard } from "@/contexts/DashboardContext"
import { isSubscriptionBlocked } from "@/lib/permissions"
import { SubscriptionBlockedOverlay } from "./SubscriptionBlockedOverlay"

export function SubscriptionBlockedCheck() {
    const { session, activeBuilding } = useDashboard()
    const pathname = usePathname()

    // Only check for managers (not residents or professionals)
    const isManager = session?.role === 'manager'
    if (!isManager) return null

    // Don't block settings page (so managers can update payment)
    if (pathname.startsWith('/dashboard/settings')) return null

    // Check if building is blocked
    const building = activeBuilding?.building
    if (!building) return null

    const shouldBlock = isSubscriptionBlocked(building)
    if (!shouldBlock) return null

    return <SubscriptionBlockedOverlay buildingId={building.id} />
}
