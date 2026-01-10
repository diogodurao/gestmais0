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
    action?: {
        label: string
        onClick: () => void
    }
    duration?: number
    persistent?: boolean
}

interface ToastOptions {
    title: string
    description?: string
    variant?: "info" | "success" | "warning" | "error" | "destructive"
    action?: {
        label: string
        onClick: () => void
    }
    duration?: number
    persistent?: boolean
}

interface ToastContextValue {
    toasts: Toast[]
    toast: (options: ToastOptions) => string
    addToast: (toast: Omit<Toast, "id">) => string
    removeToast: (id: string) => void
    updateToast: (id: string, updates: Partial<Toast>) => void
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

    const removeToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id))
    }, [])

    const addToast = useCallback((toast: Omit<Toast, "id">): string => {
        // ✅ Modern pattern - crypto.randomUUID() for guaranteed unique, stable IDs
        // Generated once when toast is created, stored in state
        const id = crypto.randomUUID()
        const newToast = { ...toast, id }

        setToasts((prev) => [...prev, newToast])

        if (!toast.persistent) {
            const duration = toast.duration ?? 4000
            setTimeout(() => {
                removeToast(id)
            }, duration)
        }

        return id
    }, [removeToast])

    const updateToast = useCallback((id: string, updates: Partial<Toast>) => {
        setToasts((prev) =>
            prev.map((toast) =>
                toast.id === id ? { ...toast, ...updates } : toast
            )
        )
    }, [])

    const dismissAll = useCallback(() => {
        setToasts([])
    }, [])

    // Helper function that matches the expected API
    const toast = useCallback((options: ToastOptions): string => {
        // Map 'destructive' to 'error' for backward compatibility
        const variant = options.variant === "destructive" ? "error" : (options.variant ?? "info")

        return addToast({
            title: options.title,
            description: options.description,
            variant,
            action: options.action,
            duration: options.duration,
            persistent: options.persistent,
        })
    }, [addToast])

    return (
        <ToastContext.Provider
            value={{ toasts, toast, addToast, removeToast, updateToast, dismissAll }}
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
// CONTAINER - Displays all toasts
// ============================================================================

function ToastContainer() {
    const { toasts, removeToast } = useToast()

    return (
        <div className="fixed bottom-4 right-4 gap-2">
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
// STYLES - ALIGNED WITH DESIGN SYSTEM
// ============================================================================

const variantStyles = {
    success: {
        borderColor: "border-success",
        iconColor: "text-success",
    },
    warning: {
        borderColor: "border-warning",
        iconColor: "text-warning",
    },
    error: {
        borderColor: "border-error",
        iconColor: "text-error",
    },
    info: {
        borderColor: "border-info",
        iconColor: "text-info",
    },
}

const icons: Record<ToastVariant, typeof Info> = {
    info: Info,
    success: CheckCircle,
    warning: AlertTriangle,
    error: XCircle,
}

// ============================================================================
// ITEM COMPONENT - Individual toast
// ============================================================================

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
            className={cn("gap-3 p-3 border-l-4",
                styles.borderColor,
                "transition-all duration-fast"
            )}
        >
            <Icon className={cn("h-5 w-5 flex-shrink-0 mt-0.5", styles.iconColor)} />

            <div className="flex-1 min-w-0">
                <p className={cn("text-subtitle font-semibold leading-tight", styles.iconColor)}>
                    {toast.title}
                </p>

                {toast.description && (
                    <p className="mt-1 text-body leading-normal text-gray-600">
                        {toast.description}
                    </p>
                )}

                {toast.action && (
                    <button
                        onClick={() => {
                            toast.action?.onClick()
                            onDismiss()
                        }}
                        className={cn(
                            "mt-2 text-body font-medium underline",
                            "hover:opacity-80 transition-opacity",
                            styles.iconColor
                        )}
                    >
                        {toast.action.label}
                    </button>
                )}
            </div>

            <button
                onClick={onDismiss}
                className="flex-shrink-0 rounded p-1 text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Dismiss"
            >
                <X className="h-5 w-5" />
            </button>
        </div>
    )
}
