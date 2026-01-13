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
  default: "border border-[#E9ECEF] bg-white hover:bg-[#F8F9FA] active:bg-[#F1F3F5]",
  ghost: "bg-transparent hover:bg-[#F8F9FA] active:bg-[#F1F3F5]",
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
        "inline-flex items-center justify-center rounded text-[#6C757D] transition-colors",
        "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#8FB996] focus-visible:ring-offset-1",
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