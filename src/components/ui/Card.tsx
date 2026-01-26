import { forwardRef, type HTMLAttributes } from "react"
import { cn } from "@/lib/utils"

type CardVariant = "default" | "interactive" | "highlighted" | "success" | "warning" | "error"

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant
}

const variantStyles: Record<CardVariant, string> = {
  default: "border-gray-200 bg-white",
  interactive: "border-gray-200 bg-white transition-colors hover:bg-gray-50 hover:border-gray-300 cursor-pointer",
  highlighted: "border-primary-light bg-success-light",
  success: "border-primary-light bg-success-light",
  warning: "border-warning-light bg-warning-light",
  error: "border-error-light bg-error-light",
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = "default", ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "rounded-lg border",
        variantStyles[variant],
        className
      )}
      {...props}
    />
  )
)
Card.displayName = "Card"

export const CardHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("border-b border-gray-200 px-1.5 py-1.5", className)}
      {...props}
    />
  )
)
CardHeader.displayName = "CardHeader"

export const CardTitle = forwardRef<HTMLHeadingElement, HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn("text-body font-medium text-gray-800", className)}
      {...props}
    />
  )
)
CardTitle.displayName = "CardTitle"

export const CardDescription = forwardRef<HTMLParagraphElement, HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p
      ref={ref}
      className={cn("mt-0.5 text-label text-secondary", className)}
      {...props}
    />
  )
)
CardDescription.displayName = "CardDescription"

export const CardContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("p-1.5", className)} {...props} />
  )
)
CardContent.displayName = "CardContent"

export const CardFooter = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("border-t border-gray-200 px-1.5 py-1.5", className)}
      {...props}
    />
  )
)
CardFooter.displayName = "CardFooter"

// Clickable Card (shorthand for interactive)
interface ClickableCardProps extends CardProps {
  onClick?: () => void
}

export const ClickableCard = forwardRef<HTMLDivElement, ClickableCardProps>(
  ({ className, onClick, ...props }, ref) => (
    <Card
      ref={ref}
      variant="interactive"
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onClick?.()}
      className={className}
      {...props}
    />
  )
)
ClickableCard.displayName = "ClickableCard"
