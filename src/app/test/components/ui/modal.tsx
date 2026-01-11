"use client"

import { useEffect, type ReactNode } from "react"
import { cn } from "@/lib/utils"
import { X } from "lucide-react"

interface ModalProps {
  open: boolean
  onClose: () => void
  title?: string
  description?: string
  children: ReactNode
  footer?: ReactNode
  size?: "sm" | "md" | "lg"
}

const sizeStyles = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
}

export function Modal({ open, onClose, title, description, children, footer, size = "md" }: ModalProps) {
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-1.5">
      <div
        className="fixed inset-0 bg-black/20"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? "modal-title" : undefined}
        className={cn(
          "relative w-full rounded-md border border-gray-200 bg-white shadow-lg",
          sizeStyles[size]
        )}
      >
        {(title || description) && (
          <div className="border-b border-gray-200 px-1.5 py-1.5">
            <div className="flex items-start justify-between">
              <div>
                {title && (
                  <h2 id="modal-title" className="text-[14px] font-medium text-gray-900">
                    {title}
                  </h2>
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
        <div className="p-1.5">{children}</div>
        {footer && (
          <div className="border-t border-gray-200 px-1.5 py-1.5">{footer}</div>
        )}
      </div>
    </div>
  )
}