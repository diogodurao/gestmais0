import { SelectHTMLAttributes, forwardRef, useId } from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { type Size } from "@/lib/ui-tokens"
import { useFormField } from "./Formfield"

export interface SelectOption {
    value: string
    label: string
    disabled?: boolean
}

export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, "size"> {
    options: SelectOption[]
    placeholder?: string
    size?: Size
    fullWidth?: boolean
    error?: string
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
    ({ className, options, placeholder, size = "md", fullWidth, id: propId, ...props }, ref) => {
        const formField = useFormField()
        const id = propId || formField?.id || useId()
        const isInvalid = !!(props.error || formField?.error || props["aria-invalid"])

        return (
            <div className={cn("relative", fullWidth && "w-full")}>
                <div className="relative">
                    <select
                        ref={ref}
                        id={id}
                        className={cn(
                            "appearance-none bg-white border rounded-sm font-bold uppercase tracking-tight transition-all cursor-pointer",
                            "focus:outline-none focus:ring-1 focus:ring-slate-400 focus:border-slate-400",
                            "disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-slate-50",
                            "pr-8", // Space for chevron
                            {
                                "border-slate-300 text-slate-700 hover:border-slate-400": !isInvalid,
                                "border-rose-400 text-rose-700 focus:ring-rose-400 focus:border-rose-400": isInvalid,
                                "h-6 px-2 text-label": size === "xs",
                                "h-7 px-2.5 text-body": size === "sm",
                                "h-9 px-3 text-content": size === "md",
                                "h-11 px-4 text-heading": size === "lg",
                                "w-full": fullWidth,
                            },
                            className
                        )}
                        aria-invalid={isInvalid}
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
            </div>
        )
    }
)
Select.displayName = "Select"

export { Select }
