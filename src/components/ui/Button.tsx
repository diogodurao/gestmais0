"use client"

import { forwardRef, type ButtonHTMLAttributes } from "react"
import { cn } from "@/lib/utils"
import { Loader2 } from "lucide-react"

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost"
type ButtonSize = "sm" | "md"

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: "bg-primary text-white hover:bg-primary-hover active:bg-primary-dark",
  secondary: "bg-secondary text-white hover:bg-secondary-hover active:bg-gray-600",
  outline: "border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 active:bg-gray-100",
  ghost: "bg-transparent text-gray-700 hover:bg-gray-50 active:bg-gray-100",
}

const sizeStyles: Record<ButtonSize, string> = {
  sm: "h-7 px-1.5 text-label",
  md: "h-8 px-1.5 text-body",
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", loading, disabled, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          "inline-flex items-center justify-center gap-1.5 rounded font-medium transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1",
          "disabled:cursor-not-allowed disabled:opacity-50",
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        {...props}
      >
        {loading && <Loader2 className="h-3 w-3 animate-spin" />}
        {children}
      </button>
    )
  }
)

Button.displayName = "Button"