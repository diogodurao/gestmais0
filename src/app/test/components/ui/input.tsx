import { forwardRef, type InputHTMLAttributes } from "react"
import { cn } from "@/lib/utils"

type InputSize = "sm" | "md"

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  size?: InputSize
  error?: boolean
}

const sizeStyles: Record<InputSize, string> = {
  sm: "h-8 px-2 text-[11px]",
  md: "h-9 px-3 text-[13px]",
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, size = "md", error, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "w-full rounded-md border bg-white text-gray-900 transition-colors",
        "placeholder:text-gray-400",
        "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-0",
        "disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500",
        error ? "border-red-300" : "border-gray-200",
        sizeStyles[size],
        className
      )}
      {...props}
    />
  )
)

Input.displayName = "Input"
