import { ButtonHTMLAttributes, forwardRef } from "react"
import { cn } from "@/lib/utils"

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "secondary" | "outline" | "ghost" | "danger"
    size?: "xs" | "sm" | "md" | "lg"
    fullWidth?: boolean
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = "primary", size = "md", fullWidth, ...props }, ref) => {
        return (
            <button
                ref={ref}
                className={cn(
                    "inline-flex items-center justify-center rounded-sm font-bold transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-400 disabled:opacity-50 disabled:pointer-events-none uppercase tracking-tight",
                    {
                        "bg-slate-900 text-white hover:bg-slate-800 border border-slate-900": variant === "primary",
                        "bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200": variant === "secondary",
                        "border border-slate-300 bg-white text-slate-600 hover:bg-slate-50 shadow-sm": variant === "outline",
                        "hover:bg-slate-100 text-slate-600": variant === "ghost",
                        "bg-rose-600 text-white hover:bg-rose-700 border border-rose-600": variant === "danger",
                        "h-6 px-2 text-[10px]": size === "xs",
                        "h-7 px-3 text-[11px]": size === "sm",
                        "h-9 px-4 text-[13px]": size === "md",
                        "h-11 px-6 text-[15px]": size === "lg",
                        "w-full": fullWidth,
                    },
                    className
                )}
                {...props}
            />
        )
    }
)
Button.displayName = "Button"

// Re-export cn for backward compatibility during migration
// TODO: Remove this re-export once all imports are updated
export { Button, cn }