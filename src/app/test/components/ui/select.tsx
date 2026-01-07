import { forwardRef, type SelectHTMLAttributes } from "react"
import { cn } from "@/lib/utils"
import { ChevronDown } from "lucide-react"

type SelectSize = "sm" | "md"

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  size?: SelectSize
  error?: boolean
}

const sizeStyles: Record<SelectSize, string> = {
  sm: "h-8 pl-2 pr-8 text-[11px]",
  md: "h-9 pl-3 pr-8 text-[13px]",
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, size = "md", error, children, ...props }, ref) => (
    <div className="relative">
      <select
        ref={ref}
        className={cn(
          "w-full appearance-none rounded-md border bg-white text-gray-900 transition-colors",
          "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-0",
          "disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500",
          error ? "border-red-300" : "border-gray-200",
          sizeStyles[size],
          className
        )}
        {...props}
      >
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
    </div>
  )
)

Select.displayName = "Select"
