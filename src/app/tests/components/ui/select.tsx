import { forwardRef, type SelectHTMLAttributes } from "react"
import { cn } from "@/lib/utils"
import { ChevronDown } from "lucide-react"

type SelectSize = "sm" | "md"

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  size?: SelectSize
  error?: boolean
}

const sizeStyles: Record<SelectSize, string> = {
  sm: "h-7 pl-2 pr-7 text-[10px]",
  md: "h-8 pl-2.5 pr-7 text-[11px]",
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, size = "md", error, children, ...props }, ref) => (
    <div className="relative">
      <select
        ref={ref}
        className={cn(
          "w-full appearance-none rounded border bg-white text-[#343A40] transition-colors",
          "focus:outline-none focus:ring-1 focus:ring-[#8FB996] focus:border-[#8FB996]",
          "disabled:cursor-not-allowed disabled:bg-[#F8F9FA] disabled:text-[#ADB5BD]",
          error ? "border-[#D4848C]" : "border-[#E9ECEF]",
          sizeStyles[size],
          className
        )}
        {...props}
      >
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#ADB5BD]" />
    </div>
  )
)

Select.displayName = "Select"
