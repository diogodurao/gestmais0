"use client"

import { useState, createContext, useContext, useCallback, type ReactNode } from "react"
import { cn } from "@/lib/utils"
import { X, CheckCircle, AlertTriangle, XCircle, Info } from "lucide-react"

type ToastVariant = "info" | "success" | "warning" | "error"

interface Toast {
  id: string
  variant: ToastVariant
  title: string
  description?: string
}

interface ToastContextValue {
  toasts: Toast[]
  addToast: (toast: Omit<Toast, "id">) => void
  removeToast: (id: string) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error("useToast must be used within ToastProvider")
  }
  return context
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = useCallback((toast: Omit<Toast, "id">) => {
    const id = Math.random().toString(36).substring(2)
    setToasts((prev) => [...prev, { ...toast, id }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 4000)
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  )
}

function ToastContainer() {
  const { toasts, removeToast } = useToast()

  return (
    <div className="fixed bottom-1.5 right-1.5 z-50 flex flex-col gap-1.5">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={() => removeToast(toast.id)} />
      ))}
    </div>
  )
}

const variantStyles: Record<ToastVariant, { bg: string; icon: string }> = {
  info: { bg: "bg-white", icon: "text-secondary" },
  success: { bg: "bg-white", icon: "text-primary" },
  warning: { bg: "bg-white", icon: "text-warning" },
  error: { bg: "bg-white", icon: "text-error" },
}

const icons: Record<ToastVariant, typeof Info> = {
  info: Info,
  success: CheckCircle,
  warning: AlertTriangle,
  error: XCircle,
}

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) {
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
        <p className="text-subtitle font-medium text-gray-900">{toast.title}</p>
        {toast.description && (
          <p className="mt-0.5 text-body text-gray-500">{toast.description}</p>
        )}
      </div>
      <button
        onClick={onDismiss}
        className="flex-shrink-0 rounded p-0.5 text-gray-400 hover:text-gray-600"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}