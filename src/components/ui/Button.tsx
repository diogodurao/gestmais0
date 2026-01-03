import { ButtonHTMLAttributes, forwardRef } from "react"
import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "secondary" | "outline" | "ghost" | "danger"
    size?: "xs" | "sm" | "md" | "lg"
    fullWidth?: boolean
    isLoading?: boolean
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = "primary", size = "md", fullWidth, isLoading, children, disabled, ...props }, ref) => {
        return (
            <button
                ref={ref}
                disabled={disabled || isLoading}
                className={cn(
                    "inline-flex items-center justify-center rounded-sm font-bold transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-400 disabled:opacity-50 disabled:pointer-events-none uppercase tracking-tight gap-2",
                    {
                        "bg-slate-900 text-white hover:bg-slate-800 border border-slate-900": variant === "primary",
                        "bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200": variant === "secondary",
                        "border border-slate-300 bg-white text-slate-600 hover:bg-slate-50 shadow-sm": variant === "outline",
                        "hover:bg-slate-100 text-slate-600": variant === "ghost",
                        "bg-rose-600 text-white hover:bg-rose-700 border border-rose-600": variant === "danger",
                        "h-6 px-2 text-label": size === "xs",
                        "h-7 px-3 text-body": size === "sm",
                        "h-9 px-4 text-content": size === "md",
                        "h-11 px-6 text-heading": size === "lg",
                        "w-full": fullWidth,
                    },
                    className
                )}
                {...props}
            >
                {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                {children}
            </button>
        )
    }
)
Button.displayName = "Button"

export { Button }