import { forwardRef, type HTMLAttributes } from "react"
import { cn } from "@/lib/utils"
import { Check } from "lucide-react"

type ValidationCheckSize = "sm" | "md"

interface ValidationCheckProps extends HTMLAttributes<HTMLDivElement> {
  isValid: boolean
  label?: string
  size?: ValidationCheckSize
}

const sizeStyles: Record<ValidationCheckSize, {
  circle: string
  icon: string
  label: string
  gap: string
}> = {
  sm: {
    circle: "w-4 h-4",
    icon: "w-2.5 h-2.5",
    label: "text-label",
    gap: "gap-1",
  },
  md: {
    circle: "w-5 h-5",
    icon: "w-3 h-3",
    label: "text-body",
    gap: "gap-1.5",
  },
}

export const ValidationCheck = forwardRef<HTMLDivElement, ValidationCheckProps>(
  ({ className, isValid, label, size = "md", ...props }, ref) => {
    const styles = sizeStyles[size]

    return (
      <div
        ref={ref}
        className={cn("flex items-center shrink-0", styles.gap, className)}
        {...props}
      >
        <div
          className={cn(
            "rounded-full flex items-center justify-center",
            styles.circle,
            isValid ? "bg-primary-light text-primary-dark" : "bg-gray-100 text-gray-400"
          )}
        >
          <Check className={styles.icon} />
        </div>
        {label && (
          <span
            className={cn(
              styles.label,
              isValid ? "text-primary-dark" : "text-gray-400"
            )}
          >
            {label}
          </span>
        )}
      </div>
    )
  }
)

ValidationCheck.displayName = "ValidationCheck"
