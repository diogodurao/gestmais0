"use client"

import { createContext, useContext, useState, useEffect, ReactNode, useMemo, useCallback } from "react"
import { DashboardInitialData } from "@/lib/types"

type DashboardContextType = DashboardInitialData & {
    isLoading: boolean
    refresh: () => Promise<void>
}

const DashboardContext = createContext<DashboardContextType | null>(null)

export function DashboardProvider({
    children,
    initialData
}: {
    children: ReactNode
    initialData: DashboardInitialData
}) {
    const [data, setData] = useState<DashboardInitialData>(initialData)
    const [isLoading, setIsLoading] = useState(false)

    // Update local state when initialData changes (e.g. server revalidation)
    useEffect(() => {
        setData(initialData)
    }, [initialData])

    const refresh = useCallback(async () => {
        setIsLoading(true)
        try {
            const res = await fetch('/api/dashboard-context')
            if (!res.ok) throw new Error("Failed to refresh context")
            const newData = await res.json()
            setData(newData)
        } catch (error) {
            console.error("Dashboard context refresh failed:", error)
        } finally {
            setIsLoading(false)
        }
    }, [])

    // Memoize context value to prevent unnecessary re-renders
    const contextValue = useMemo<DashboardContextType>(() => ({
        ...data,
        isLoading,
        refresh
    }), [data, isLoading, refresh])

    return (
        <DashboardContext.Provider value={contextValue}>
            {children}
        </DashboardContext.Provider>
    )
}

export const useDashboard = () => {
    const ctx = useContext(DashboardContext)
    if (!ctx) throw new Error("useDashboard must be used within DashboardProvider")
    return ctx
}
