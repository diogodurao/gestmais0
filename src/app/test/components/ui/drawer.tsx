"use client"

import { useEffect, type ReactNode } from "react"
import { X } from "lucide-react"

interface DrawerProps {
  open: boolean
  onClose: () => void
  title?: string
  description?: string
  children: ReactNode
  footer?: ReactNode
}

export function Drawer({ open, onClose, title, description, children, footer }: DrawerProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    if (open) {
      document.addEventListener("keydown", handleEscape)
      document.body.style.overflow = "hidden"
    }
    return () => {
      document.removeEventListener("keydown", handleEscape)
      document.body.style.overflow = ""
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50">
      <div
        className="fixed inset-0 bg-black/20"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        className="fixed inset-x-0 bottom-0 flex max-h-[85vh] flex-col rounded-t-lg border-t border-gray-200 bg-white shadow-lg"
      >
        <div className="flex justify-center py-1.5">
          <div className="h-1 w-10 rounded-full bg-gray-300" />
        </div>
        {(title || description) && (
          <div className="border-b border-gray-200 px-1.5 pb-1.5">
            <div className="flex items-start justify-between">
              <div>
                {title && (
                  <h2 className="text-[14px] font-medium text-gray-900">{title}</h2>
                )}
                {description && (
                  <p className="mt-1 text-[11px] text-gray-500">{description}</p>
                )}
              </div>
              <button
                onClick={onClose}
                className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
        <div className="flex-1 overflow-y-auto p-1.5">{children}</div>
        {footer && (
          <div className="border-t border-gray-200 px-1.5 py-1.5">{footer}</div>
        )}
      </div>
    </div>
  )
}