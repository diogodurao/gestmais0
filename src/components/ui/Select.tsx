import { SelectHTMLAttributes, forwardRef } from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

export interface SelectOption {
    value: string
    label: string
    disabled?: boolean
}

export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, "size"> {
    options: SelectOption[]
    placeholder?: string
    size?: "xs" | "sm" | "md" | "lg"
    error?: boolean
    fullWidth?: boolean
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
    ({ className, options, placeholder, size = "md", error, fullWidth, ...props }, ref) => {
        return (
            <div className={cn("relative", fullWidth && "w-full")}>
                <select
                    ref={ref}
                    className={cn(
                        "appearance-none bg-white border rounded-sm font-bold uppercase tracking-tight transition-all cursor-pointer",
                        "focus:outline-none focus:ring-1 focus:ring-slate-400 focus:border-slate-400",
                        "disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-slate-50",
                        "pr-8", // Space for chevron
                        {
                            "border-slate-300 text-slate-700 hover:border-slate-400": !error,
                            "border-rose-400 text-rose-700 focus:ring-rose-400 focus:border-rose-400": error,
                            "h-6 px-2 text-[10px]": size === "xs",
                            "h-7 px-2.5 text-body": size === "sm",
                            "h-9 px-3 text-content": size === "md",
                            "h-11 px-4 text-[15px]": size === "lg",
                            "w-full": fullWidth,
                        },
                        className
                    )}
                    {...props}
                >
                    {placeholder && (
                        <option value="" disabled>
                            {placeholder}
                        </option>
                    )}
                    {options.map((option) => (
                        <option
                            key={option.value}
                            value={option.value}
                            disabled={option.disabled}
                        >
                            {option.label}
                        </option>
                    ))}
                </select>
                <ChevronDown
                    className={cn(
                        "absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400",
                        {
                            "w-3 h-3": size === "xs" || size === "sm",
                            "w-4 h-4": size === "md" || size === "lg",
                        }
                    )}
                />
            </div>
        )
    }
)
Select.displayName = "Select"

export { Select }