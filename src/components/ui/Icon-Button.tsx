"use client"

import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react"
import { cn } from "@/lib/utils"

type IconButtonVariant = "default" | "ghost"
type IconButtonSize = "sm" | "md"

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: IconButtonVariant
  size?: IconButtonSize
  icon: ReactNode
  label: string
}

const variantStyles: Record<IconButtonVariant, string> = {
  default: "border border-gray-200 bg-white hover:bg-gray-50 active:bg-gray-100",
  ghost: "bg-transparent hover:bg-gray-50 active:bg-gray-100",
}

const sizeStyles: Record<IconButtonSize, string> = {
  sm: "h-6 w-6",
  md: "h-7 w-7",
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ className, variant = "default", size = "md", icon, label, ...props }, ref) => (
    <button
      ref={ref}
      aria-label={label}
      className={cn(
        "inline-flex items-center justify-center rounded text-gray-600 transition-colors",
        "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary focus-visible:ring-offset-1",
        "disabled:cursor-not-allowed disabled:opacity-50",
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {icon}
    </button>
  )
)

IconButton.displayName = "IconButton"
