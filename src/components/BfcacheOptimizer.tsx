"use client"

import { useEffect } from "react"

// Global registry to track all WebSocket connections
const webSocketRegistry = new Set<WebSocket>()

/**
 * BfcacheOptimizer - Enables back/forward cache by cleaning up blocking resources
 *
 * This component:
 * 1. Intercepts WebSocket constructor to track all connections
 * 2. Closes WebSocket connections on pagehide (allows bfcache)
 * 3. Handles page restoration from bfcache
 *
 * Common bfcache blockers this addresses:
 * - Open WebSocket connections (from auth, real-time features, etc.)
 * - Next.js HMR WebSocket in development
 */
export function BfcacheOptimizer() {
    useEffect(() => {
        // Intercept WebSocket constructor to track all connections
        const OriginalWebSocket = window.WebSocket

        // @ts-ignore - extending WebSocket
        window.WebSocket = function(url: string | URL, protocols?: string | string[]) {
            const ws = new OriginalWebSocket(url, protocols)

            // Track this WebSocket
            webSocketRegistry.add(ws)

            // Remove from registry when closed
            ws.addEventListener('close', () => {
                webSocketRegistry.delete(ws)
            })

            return ws
        } as typeof WebSocket

        // Copy static properties
        window.WebSocket.prototype = OriginalWebSocket.prototype
        window.WebSocket.CONNECTING = OriginalWebSocket.CONNECTING
        window.WebSocket.OPEN = OriginalWebSocket.OPEN
        window.WebSocket.CLOSING = OriginalWebSocket.CLOSING
        window.WebSocket.CLOSED = OriginalWebSocket.CLOSED

        const handlePageHide = () => {
            // Close all tracked WebSocket connections to allow bfcache
            webSocketRegistry.forEach((ws) => {
                if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
                    ws.close(1000, 'Page entering bfcache')
                }
            })
        }

        const handlePageShow = (event: PageTransitionEvent) => {
            // Page was restored from bfcache
            if (event.persisted) {
                // WebSockets were closed - components will need to reconnect
                // Most libraries handle this automatically on next interaction
                console.log('[BfcacheOptimizer] Page restored from bfcache')
            }
        }

        // Use pagehide instead of unload (unload blocks bfcache)
        window.addEventListener('pagehide', handlePageHide)
        window.addEventListener('pageshow', handlePageShow)

        return () => {
            // Restore original WebSocket constructor
            window.WebSocket = OriginalWebSocket
            window.removeEventListener('pagehide', handlePageHide)
            window.removeEventListener('pageshow', handlePageShow)
        }
    }, [])

    return null
}
