import { forwardRef, type SelectHTMLAttributes } from "react"
import { cn } from "@/lib/utils"
import { ChevronDown } from "lucide-react"

type SelectSize = "sm" | "md"

interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, "size"> {
  size?: SelectSize
  error?: boolean
}

const sizeStyles: Record<SelectSize, string> = {
  sm: "h-7 pl-1.5 pr-6 text-label",
  md: "h-8 pl-1.5 pr-6 text-body",
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, size = "md", error, children, ...props }, ref) => (
    <div className="relative">
      <select
        ref={ref}
        className={cn(
          "w-full appearance-none rounded border bg-white text-gray-800 transition-colors",
          "focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary",
          "disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-400",
          error ? "border-error" : "border-gray-200",
          sizeStyles[size],
          className
        )}
        {...props}
      >
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-1.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
    </div>
  )
)

Select.displayName = "Select"
