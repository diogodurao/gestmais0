"use client"

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from "react"

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

    const toggleSidebar = useCallback(() => setIsOpen(prev => !prev), [])
    const closeSidebar = useCallback(() => setIsOpen(false), [])
    const toggleDesktopCollapse = useCallback(() => {
        setIsDesktopCollapsed(prev => {
            const newState = !prev
            localStorage.setItem("sidebar-collapsed", String(newState))
            return newState
        })
    }, [])

    // Memoize context value to prevent unnecessary re-renders
    const contextValue = useMemo<SidebarContextType>(() => ({
        isOpen,
        isDesktopCollapsed,
        toggleSidebar,
        toggleDesktopCollapse,
        closeSidebar
    }), [isOpen, isDesktopCollapsed, toggleSidebar, toggleDesktopCollapse, closeSidebar])

    return (
        <SidebarContext.Provider value={contextValue}>
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

