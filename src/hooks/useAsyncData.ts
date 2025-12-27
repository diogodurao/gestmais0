"use client"

import { useState, useEffect, useCallback, DependencyList } from "react"

export function useAsyncData<T>(
    fetcher: () => Promise<T>,
    deps: DependencyList = []
) {
    const [data, setData] = useState<T | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchData = useCallback(async () => {
        setIsLoading(true)
        setError(null)
        try {
            const result = await fetcher()
            setData(result)
        } catch (e: any) {
            setError(e.message || "An unexpected error occurred")
        } finally {
            setIsLoading(false)
        }
    }, [fetcher])

    useEffect(() => {
        fetchData()
    }, deps)

    return {
        data,
        isLoading,
        error,
        refetch: fetchData,
        setData // Allow manual updates if needed (e.g. optimistic updates)
    }
}
