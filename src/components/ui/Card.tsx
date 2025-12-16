import { HTMLAttributes, forwardRef } from "react"
import { cn } from "./Button"

const Card = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
    ({ className, ...props }, ref) => {
        return (
            <div
                ref={ref}
                className={cn("bg-white rounded-lg border border-gray-100 shadow-sm", className)}
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
                className={cn("p-6 pb-4 border-b border-gray-50", className)}
                {...props}
            />
        )
    }
)
CardHeader.displayName = "CardHeader"

const CardContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
    ({ className, ...props }, ref) => {
        return <div ref={ref} className={cn("p-6 pt-4", className)} {...props} />
    }
)
CardContent.displayName = "CardContent"

export { Card, CardHeader, CardContent }
