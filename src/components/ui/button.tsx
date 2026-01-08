"use client"

import { forwardRef, type ButtonHTMLAttributes } from "react"
import { cn } from "@/lib/utils"
import { Loader2 } from "lucide-react"

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "danger"
type ButtonSize = "sm" | "md"

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
  fullWidth?: boolean
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: "bg-[#8FB996] text-white hover:bg-[#7AAE82] active:bg-[#6A9B72]",
  secondary: "bg-[#8E9AAF] text-white hover:bg-[#7A8699] active:bg-[#6C757D]",
  outline: "border border-[#E9ECEF] bg-white text-[#495057] hover:bg-[#F8F9FA] active:bg-[#F1F3F5]",
  ghost: "bg-transparent text-[#495057] hover:bg-[#F8F9FA] active:bg-[#F1F3F5]",
  danger: "bg-[#D4848C] text-white hover:bg-[#C47880] active:bg-[#B86B73]",
}

const sizeStyles: Record<ButtonSize, string> = {
  sm: "h-7 px-2 text-[10px]",
  md: "h-8 px-3 text-[11px]",
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", loading, disabled, fullWidth, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          "inline-flex items-center justify-center gap-1.5 rounded font-medium transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8FB996] focus-visible:ring-offset-1",
          "disabled:cursor-not-allowed disabled:opacity-50",
          variantStyles[variant],
          sizeStyles[size],
          fullWidth && "w-full",
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
