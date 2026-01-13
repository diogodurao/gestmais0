"use client"

import { forwardRef, type ButtonHTMLAttributes } from "react"
import { cn } from "@/lib/utils"

// =============================================================================
// TAB BUTTON
// A button component for sidebar navigation and tab selection
// =============================================================================

interface TabButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Icon displayed before the label */
  icon?: React.ReactNode
  /** Text label for the button */
  label: string
  /** Whether this tab is currently active */
  active?: boolean
}

export const TabButton = forwardRef<HTMLButtonElement, TabButtonProps>(
  ({ className, icon, label, active = false, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled}
        className={cn(
          "flex items-center gap-1.5 px-1.5 py-1 rounded text-body font-medium transition-colors w-full text-left",
          active
            ? "bg-primary-light text-primary-dark"
            : "text-gray-600 hover:bg-gray-50",
          disabled && "cursor-not-allowed opacity-50",
          className
        )}
        {...props}
      >
        {icon}
        {label}
      </button>
    )
  }
)

TabButton.displayName = "TabButton"