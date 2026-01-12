import { forwardRef, type HTMLAttributes } from "react"
import { cn } from "@/lib/utils"

type CardVariant = "default" | "interactive" | "highlighted" | "success" | "warning" | "error"

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant
}

const variantStyles: Record<CardVariant, string> = {
  default: "border-[#E9ECEF] bg-white",
  interactive: "border-[#E9ECEF] bg-white transition-colors hover:bg-[#F8F9FA] hover:border-[#DEE2E6] cursor-pointer",
  highlighted: "border-[#D4E5D7] bg-[#F8FAF8]",
  success: "border-[#D4E5D7] bg-[#F8FAF8]",
  warning: "border-[#F0E4C8] bg-[#FDFBF6]",
  error: "border-[#EFCDD1] bg-[#FDF8F8]",
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
      className={cn("border-b border-[#E9ECEF] px-1.5 py-1.5", className)}
      {...props}
    />
  )
)
CardHeader.displayName = "CardHeader"

export const CardTitle = forwardRef<HTMLHeadingElement, HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn("text-[11px] font-medium text-[#343A40]", className)}
      {...props}
    />
  )
)
CardTitle.displayName = "CardTitle"

export const CardDescription = forwardRef<HTMLParagraphElement, HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p
      ref={ref}
      className={cn("mt-0.5 text-[10px] text-[#8E9AAF]", className)}
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
      className={cn("border-t border-[#E9ECEF] px-1.5 py-1.5", className)}
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
