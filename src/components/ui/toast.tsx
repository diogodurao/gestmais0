"use client"

import { useState, createContext, useContext, useCallback, type ReactNode } from "react"
import { cn } from "@/lib/utils"
import { X, CheckCircle, AlertTriangle, XCircle, Info } from "lucide-react"

// ============================================================================
// TYPES
// ============================================================================

type ToastVariant = "info" | "success" | "warning" | "error"

interface Toast {
    id: string
    variant: ToastVariant
    title: string
    description?: string
    // NEW: Action button (for retry, undo, etc)
    action?: {
        label: string
        onClick: () => void
    }
    // NEW: Custom duration per toast
    duration?: number
    // NEW: Don't auto-dismiss
    persistent?: boolean
}

interface ToastContextValue {
    toasts: Toast[]
    // Now returns ID so you can update/remove it later
    addToast: (toast: Omit<Toast, "id">) => string
    removeToast: (id: string) => void
    // NEW: Update existing toast
    updateToast: (id: string, updates: Partial<Toast>) => void
    // NEW: Clear all toasts
    dismissAll: () => void
}

// ============================================================================
// CONTEXT
// ============================================================================

const ToastContext = createContext<ToastContextValue | null>(null)

// ============================================================================
// PROVIDER
// ============================================================================

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([])

    // ADD TOAST
    const addToast = useCallback((toast: Omit<Toast, "id">): string => {
        const id = Math.random().toString(36).substring(2)
        const newToast = { ...toast, id }
        
        setToasts((prev) => [...prev, newToast])

        // Only auto-dismiss if not persistent
        if (!toast.persistent) {
            const duration = toast.duration ?? 4000
            setTimeout(() => {
                removeToast(id)
            }, duration)
        }

        return id
    }, [])

    // REMOVE TOAST
    const removeToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id))
    }, [])

    // UPDATE TOAST
    const updateToast = useCallback((id: string, updates: Partial<Toast>) => {
        setToasts((prev) =>
            prev.map((toast) =>
                toast.id === id ? { ...toast, ...updates } : toast
            )
        )
    }, [])

    // DISMISS ALL
    const dismissAll = useCallback(() => {
        setToasts([])
    }, [])

    return (
        <ToastContext.Provider
            value={{ toasts, addToast, removeToast, updateToast, dismissAll }}
        >
            {children}
            <ToastContainer />
        </ToastContext.Provider>
    )
}

// ============================================================================
// HOOK
// ============================================================================

export function useToast() {
    const context = useContext(ToastContext)
    if (!context) {
        throw new Error("useToast must be used within ToastProvider")
    }
    return context
}

// ============================================================================
// CONTAINER
// ============================================================================

function ToastContainer() {
    const { toasts, removeToast } = useToast()

    return (
        <div className="fixed bottom-1.5 right-1.5 z-50 flex flex-col gap-1.5">
            {toasts.map((toast) => (
                <ToastItem
                    key={toast.id}
                    toast={toast}
                    onDismiss={() => removeToast(toast.id)}
                />
            ))}
        </div>
    )
}

// ============================================================================
// ITEM COMPONENT
// ============================================================================

const variantStyles = {
    success: {
        borderColor: "border-success",  // ✅ #8FB996 (Spring Rain)
        iconColor: "text-success",      // ✅ #8FB996
    },
    warning: {
        borderColor: "border-warning",  // ✅ #E5C07B (Warm Yellow)
        iconColor: "text-warning",      // ✅ #E5C07B
    },
    error: {
        borderColor: "border-error",    // ✅ #D4848C (Dusty Rose)
        iconColor: "text-error",        // ✅ #D4848C
    },
    info: {
        borderColor: "border-info",     // ✅ #8E9AAF (Cool Gray)
        iconColor: "text-info",         // ✅ #8E9AAF
    },
}


const icons: Record<ToastVariant, typeof Info> = {
    info: Info,
    success: CheckCircle,
    warning: AlertTriangle,
    error: XCircle,
}

function ToastItem({
    toast,
    onDismiss,
}: {
    toast: Toast
    onDismiss: () => void
}) {
    const Icon = icons[toast.variant]
    const styles = variantStyles[toast.variant]

    return (
        <div
            className={cn(
                "flex items-start gap-1.5 rounded-md border border-gray-200 p-1.5 shadow-md",
                styles.bg
            )}
            style={{ minWidth: 240, maxWidth: 320 }}
        >
            <Icon className={cn("h-4 w-4 flex-shrink-0 mt-0.5", styles.icon)} />

            <div className="flex-1 min-w-0">
                <p className="text-[13px] font-medium text-gray-900">
                    {toast.title}
                </p>

                {toast.description && (
                    <p className="mt-0.5 text-[11px] text-gray-500">
                        {toast.description}
                    </p>
                )}

                {/* NEW: Action button */}
                {toast.action && (
                    <button
                        onClick={() => {
                            toast.action?.onClick()
                            onDismiss()
                        }}
                        className="mt-2 text-[11px] font-medium text-blue-600 hover:text-blue-700 underline"
                    >
                        {toast.action.label}
                    </button>
                )}
            </div>

            <button
                onClick={onDismiss}
                className="flex-shrink-0 rounded p-0.5 text-gray-400 hover:text-gray-600"
                aria-label="Dismiss"
            >
                <X className="h-4 w-4" />
            </button>
        </div>
    )
}
