"use client"

import React, { createContext, useContext, useState, useEffect } from "react"

type SidebarContextType = {
    isOpen: boolean
    isDesktopCollapsed: boolean
    toggleSidebar: () => void
    toggleDesktopCollapse: () => void
    closeSidebar: () => void
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined)

export function SidebarProvider({ children }: { children: React.ReactNode }) {
    const [isOpen, setIsOpen] = useState(false)
    const [isDesktopCollapsed, setIsDesktopCollapsed] = useState(false)

    // Load preference from localStorage
    useEffect(() => {
        const saved = localStorage.getItem("sidebar-collapsed")
        if (saved) {
            setIsDesktopCollapsed(saved === "true")
        }
    }, [])

    const toggleSidebar = () => setIsOpen(!isOpen)
    const closeSidebar = () => setIsOpen(false)
    const toggleDesktopCollapse = () => {
        const newState = !isDesktopCollapsed
        setIsDesktopCollapsed(newState)
        localStorage.setItem("sidebar-collapsed", String(newState))
    }

    return (
        <SidebarContext.Provider value={{ 
            isOpen, 
            isDesktopCollapsed, 
            toggleSidebar, 
            toggleDesktopCollapse,
            closeSidebar 
        }}>
            {children}
        </SidebarContext.Provider>
    )
}

export function useSidebar() {
    const context = useContext(SidebarContext)
    if (context === undefined) {
        throw new Error("useSidebar must be used within a SidebarProvider")
    }
    return context
}

