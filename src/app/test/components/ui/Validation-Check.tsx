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
    label: "text-[9px]",
    gap: "gap-1",
  },
  md: {
    circle: "w-5 h-5",
    icon: "w-3 h-3",
    label: "text-[10px]",
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
            isValid ? "bg-[#E8F0EA] text-[#6A9B72]" : "bg-[#F1F3F5] text-[#ADB5BD]"
          )}
        >
          <Check className={styles.icon} />
        </div>
        {label && (
          <span
            className={cn(
              styles.label,
              isValid ? "text-[#6A9B72]" : "text-[#ADB5BD]"
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
