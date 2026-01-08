"use client"

import React, { createContext, useContext, useState, useEffect } from "react"

interface SidebarContextType {
  // Desktop State
  isCollapsed: boolean
  toggleCollapsed: () => void
  
  // Mobile State
  isMobileOpen: boolean
  openMobile: () => void
  closeMobile: () => void
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined)

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  // Optional: Persist desktop state
  useEffect(() => {
    const saved = localStorage.getItem("sidebar-collapsed")
    if (saved) setIsCollapsed(JSON.parse(saved))
  }, [])

  const toggleCollapsed = () => {
    setIsCollapsed((prev) => {
      const newState = !prev
      localStorage.setItem("sidebar-collapsed", JSON.stringify(newState))
      return newState
    })
  }

  return (
    <SidebarContext.Provider
      value={{
        isCollapsed,
        toggleCollapsed,
        isMobileOpen,
        openMobile: () => setIsMobileOpen(true),
        closeMobile: () => setIsMobileOpen(false),
      }}
    >
      {children}
    </SidebarContext.Provider>
  )
}

export function useSidebar() {
  const context = useContext(SidebarContext)
  if (!context) throw new Error("useSidebar must be used within a SidebarProvider")
  return context
}