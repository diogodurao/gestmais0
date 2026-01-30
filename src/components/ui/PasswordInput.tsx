"use client"

import { forwardRef, useState, type InputHTMLAttributes } from "react"
import { Eye, EyeOff } from "lucide-react"
import { cn } from "@/lib/utils"

type InputSize = "sm" | "md"

interface PasswordInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "size" | "type"> {
  size?: InputSize
  error?: boolean
}

const sizeStyles: Record<InputSize, string> = {
  sm: "h-7 px-1.5 text-label",
  md: "h-8 px-1.5 text-body",
}

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ className, size = "md", error, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false)

    return (
      <div className="relative">
        <input
          ref={ref}
          type={showPassword ? "text" : "password"}
          className={cn(
            "w-full rounded border bg-white text-gray-800 transition-colors",
            "placeholder:text-gray-400",
            "focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary",
            "disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-400",
            "pr-8",
            error ? "border-error" : "border-gray-200",
            sizeStyles[size],
            className
          )}
          {...props}
        />
        <button
          type="button"
          tabIndex={-1}
          onClick={() => setShowPassword((prev) => !prev)}
          className="absolute right-1.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
        >
          {showPassword ? (
            <EyeOff className="w-3.5 h-3.5" />
          ) : (
            <Eye className="w-3.5 h-3.5" />
          )}
        </button>
      </div>
    )
  }
)

PasswordInput.displayName = "PasswordInput"
