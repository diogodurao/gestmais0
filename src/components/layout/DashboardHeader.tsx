"use client"

import { Menu } from "lucide-react"
import { Avatar } from "@/components/ui/avatar"
import { useSidebar } from "./SidebarProvider"

export function Header() {
  const { openMobile } = useSidebar()

  return (
    <header className="flex h-10 items-center justify-between rounded-lg border border-[#E9ECEF] bg-[#F8F8F6] px-1.5">
      <div className="flex items-center gap-1.5">
        <button
          onClick={openMobile}
          className="flex h-7 w-7 items-center justify-center rounded text-[#6C757D] hover:bg-[#E9ECEF] lg:hidden"
        >
          <Menu className="h-4 w-4" />
        </button>
        <span className="text-[12px] font-medium text-[#495057]">Painel geral</span>
      </div>
      <div className="flex items-center gap-1.5">
        <Avatar size="sm" fallback="AD" alt="Admin" />
      </div>
    </header>
  )
}