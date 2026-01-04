import { useState, useEffect, useCallback } from "react"

export function useOptimisticList<T>(
    initialData: T[],
    keySelector: (item: T) => string | number
) {
    const [data, setData] = useState<T[]>(initialData)

    // Sync with server data
    useEffect(() => {
        setData(initialData)
    }, [initialData])

    const optimisticUpdate = useCallback((
        id: string | number,
        updateFn: (item: T) => T
    ) => {
        setData(prev => prev.map(item => {
            if (keySelector(item) === id) {
                return updateFn(item)
            }
            return item
        }))
    }, [keySelector])

    const rollback = useCallback(() => {
        setData(initialData)
    }, [initialData])

    return {
        data,
        optimisticUpdate,
        rollback,
        setData // Expose for full rewrites (filtering etc) if needed, though filtered view usually derived
    }
}
