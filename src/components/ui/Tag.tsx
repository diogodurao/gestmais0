import { forwardRef, type HTMLAttributes } from "react"
import { cn } from "@/lib/utils"
import { X } from "lucide-react"

type TagVariant =
  | "default" | "success" | "warning" | "error" | "info"
  | "primary" | "secondary"

type TagSize = "sm" | "md"

interface TagProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: TagVariant
  size?: TagSize
  removable?: boolean
  onRemove?: () => void
}

const variantStyles: Record<TagVariant, string> = {
  default: "bg-gray-100 text-gray-700 border-gray-200",
  success: "bg-success-light text-primary-dark border-primary-light",
  warning: "bg-warning-light text-warning border-warning-light",
  error: "bg-error-light text-error border-error-light",
  info: "bg-secondary-light text-gray-600 border-gray-300",
  primary: "bg-success-light text-primary-dark border-primary-light",
  secondary: "bg-gray-50 text-gray-600 border-gray-200",
}

const sizeStyles: Record<TagSize, string> = {
  sm: "px-1 py-0.5 text-xs",
  md: "px-1.5 py-0.5 text-label",
}

const removeButtonStyles: Record<TagVariant, string> = {
  default: "hover:bg-gray-200",
  success: "hover:bg-primary-light",
  warning: "hover:bg-warning-light",
  error: "hover:bg-error-light",
  info: "hover:bg-gray-300",
  primary: "hover:bg-primary-light",
  secondary: "hover:bg-gray-200",
}

export const Tag = forwardRef<HTMLSpanElement, TagProps>(
  ({
    className,
    variant = "default",
    size = "md",
    removable,
    onRemove,
    children,
    ...props
  }, ref) => (
    <span
      ref={ref}
      className={cn(
        "inline-flex items-center gap-1 rounded border font-medium",
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {children}
      {removable && (
        <button
          type="button"
          onClick={onRemove}
          className={cn(
            "rounded p-0.5 transition-colors focus:outline-none",
            removeButtonStyles[variant]
          )}
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </span>
  )
)

Tag.displayName = "Tag"

// Tag Group
interface TagGroupProps extends HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

export const TagGroup = forwardRef<HTMLDivElement, TagGroupProps>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex flex-wrap gap-1", className)}
      {...props}
    >
      {children}
    </div>
  )
)

TagGroup.displayName = "TagGroup"
