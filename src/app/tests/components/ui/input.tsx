import { forwardRef, type InputHTMLAttributes } from "react"
import { cn } from "@/lib/utils"

type InputSize = "sm" | "md"

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  size?: InputSize
  error?: boolean
}

const sizeStyles: Record<InputSize, string> = {
  sm: "h-7 px-2 text-[10px]",
  md: "h-8 px-2.5 text-[11px]",
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, size = "md", error, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "w-full rounded border bg-white text-[#343A40] transition-colors",
        "placeholder:text-[#ADB5BD]",
        "focus:outline-none focus:ring-1 focus:ring-[#8FB996] focus:border-[#8FB996]",
        "disabled:cursor-not-allowed disabled:bg-[#F8F9FA] disabled:text-[#ADB5BD]",
        error ? "border-[#D4848C]" : "border-[#E9ECEF]",
        sizeStyles[size],
        className
      )}
      {...props}
    />
  )
)

Input.displayName = "Input"
