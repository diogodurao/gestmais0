import { forwardRef, type InputHTMLAttributes } from "react"
import { cn } from "@/lib/utils"

type InputSize = "sm" | "md"

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "size"> {
  size?: InputSize
  error?: boolean
}

const sizeStyles: Record<InputSize, string> = {
  sm: "h-7 px-1.5 text-label",
  md: "h-8 px-1.5 text-body",
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, size = "md", error, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "w-full rounded border bg-white text-gray-800 transition-colors",
        "placeholder:text-gray-400",
        "focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary",
        "disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-400",
        error ? "border-error" : "border-gray-200",
        sizeStyles[size],
        className
      )}
      {...props}
    />
  )
)

Input.displayName = "Input"