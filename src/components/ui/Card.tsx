import { forwardRef, type HTMLAttributes } from "react"
import { cn } from "@/lib/utils"

type CardVariant = "default" | "neutral" | "success" | "warning" | "info" | "danger"

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant
}

const variantStyles: Record<CardVariant, string> = {
  default: "border-gray-200",
  neutral: "border-gray-200 bg-white",
  success: "border-gray-200 bg-success-light",
  warning: "border-gray-200 bg-warning-light",
  info: "border-gray-200 bg-info-light",
  danger: "border-gray-200 bg-error-light",
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = "default", ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "rounded-lg border bg-white",
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
      className={cn("border-b border-gray-200 px-3 py-2", className)}
      {...props}
    />
  )
)
CardHeader.displayName = "CardHeader"

export const CardTitle = forwardRef<HTMLHeadingElement, HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn("text-body font-medium leading-tight text-gray-800", className)}
      {...props}
    />
  )
)
CardTitle.displayName = "CardTitle"

export const CardDescription = forwardRef<HTMLParagraphElement, HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p
      ref={ref}
      className={cn("mt-0.5 text-label font-medium leading-tight text-gray-500", className)}
      {...props}
    />
  )
)
CardDescription.displayName = "CardDescription"

export const CardContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("p-3", className)} {...props} />
  )
)
CardContent.displayName = "CardContent"

export const CardFooter = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("border-t border-gray-200 px-3 py-2", className)}
      {...props}
    />
  )
)
CardFooter.displayName = "CardFooter"

interface StatCardProps {
  label: string
  value: string
  subValue?: string
  variant?: CardVariant
}

export function StatCard({ label, value, subValue, variant = "neutral" }: StatCardProps) {
  return (
    <Card variant={variant}>
      <CardContent>
        <div className="flex flex-col gap-1">
          <span className="text-label font-medium leading-tight text-gray-500">{label}</span>
          <span className="text-heading font-semibold leading-tight text-gray-900">{value}</span>
          {subValue && (
            <span className="text-label font-medium leading-tight text-gray-600">{subValue}</span>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
