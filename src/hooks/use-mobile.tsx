"use client"

import { useSyncExternalStore } from "react"

// Using Tailwind's sm breakpoint (640px) to match design system
const MOBILE_BREAKPOINT = 640

/**
 * Custom hook to detect if viewport is mobile size
 * Uses useSyncExternalStore to prevent hydration mismatches
 */

export function useIsMobile(): boolean {
    return useSyncExternalStore(
        subscribe,
        getSnapshot,
        getServerSnapshot
    )
}

function subscribe(callback: () => void): () => void {
    const mediaQuery = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)

    // Use the modern addEventListener API
    mediaQuery.addEventListener("change", callback)

    return () => {
        mediaQuery.removeEventListener("change", callback)
    }
}

function getSnapshot(): boolean {
    return window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`).matches
}

function getServerSnapshot(): boolean {
    // Always return false on server to prevent hydration mismatch
    // The client will update on mount if needed
    return false
}
