"use client"

import { Menu } from "lucide-react"
import { Avatar } from "@/components/ui/Avatar"
import { useSidebar } from "./SidebarProvider"
import { useDashboard } from "@/contexts/DashboardContext"
import { BuildingSelector } from "./BuildingSelector"
import { isManager } from "@/lib/permissions"

export function Header() {
  const { openMobile } = useSidebar()
  const { session, managerBuildings, activeBuilding } = useDashboard()

  const showBuildingSelector = session && isManager(session) && managerBuildings.length > 0

  return (
    <header className="flex h-10 items-center justify-between rounded-lg border border-gray-200 bg-white px-1.5">
      <div className="flex items-center gap-1.5">
        <button
          onClick={openMobile}
          className="flex h-7 w-7 items-center justify-center rounded text-gray-600 hover:bg-gray-200 transition-colors lg:hidden"
        >
          <Menu className="h-4 w-4" />
        </button>

        {showBuildingSelector ? (
          <BuildingSelector
            managerBuildings={managerBuildings}
            activeBuilding={activeBuilding}
            managerId={session.id}
          />
        ) : (
          <span className="text-body font-medium text-gray-700">Painel geral</span>
        )}
      </div>
      <div className="flex items-center gap-1.5">
        {/* TODO: Add NotificationButton here */}
        <Avatar size="sm" fallback="AD" alt="Admin" />
      </div>
    </header>
  )
}