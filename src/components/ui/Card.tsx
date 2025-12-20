import { HTMLAttributes, forwardRef } from "react"
import { cn } from "./Button"

const Card = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
    ({ className, ...props }, ref) => {
        return (
            <div
                ref={ref}
                className={cn("bg-white tech-border shadow-sm overflow-hidden", className)}
                {...props}
            />
        )
    }
)
Card.displayName = "Card"

const CardHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
    ({ className, ...props }, ref) => {
        return (
            <div
                ref={ref}
                className={cn("bg-slate-50 border-b border-slate-300 px-3 py-2 flex items-center justify-between", className)}
                {...props}
            />
        )
    }
)
CardHeader.displayName = "CardHeader"

const CardTitle = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
    ({ className, ...props }, ref) => {
        return (
            <div
                ref={ref}
                className={cn("text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2", className)}
                {...props}
            />
        )
    }
)
CardTitle.displayName = "CardTitle"

const CardContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
    ({ className, ...props }, ref) => {
        return <div ref={ref} className={cn("p-4", className)} {...props} />
    }
)
CardContent.displayName = "CardContent"

const CardFooter = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
    ({ className, ...props }, ref) => {
        return (
            <div
                ref={ref}
                className={cn("bg-slate-50 border-t border-slate-300 px-3 py-1.5 text-[11px] text-slate-500", className)}
                {...props}
            />
        )
    }
)
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardTitle, CardContent, CardFooter }
