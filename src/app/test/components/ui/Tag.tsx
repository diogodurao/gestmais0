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
  default: "bg-[#F1F3F5] text-[#495057] border-[#E9ECEF]",
  success: "bg-[#E8F0EA] text-[#6A9B72] border-[#D4E5D7]",
  warning: "bg-[#FBF6EC] text-[#B8963E] border-[#F0E4C8]",
  error: "bg-[#F9ECEE] text-[#B86B73] border-[#EFCDD1]",
  info: "bg-[#E9ECF0] text-[#6C757D] border-[#DEE2E6]",
  primary: "bg-[#E8F0EA] text-[#6A9B72] border-[#D4E5D7]",
  secondary: "bg-[#F8F9FA] text-[#6C757D] border-[#E9ECEF]",
}

const sizeStyles: Record<TagSize, string> = {
  sm: "px-1 py-0.5 text-[9px]",
  md: "px-1.5 py-0.5 text-[10px]",
}

const removeButtonStyles: Record<TagVariant, string> = {
  default: "hover:bg-[#E9ECEF]",
  success: "hover:bg-[#D4E5D7]",
  warning: "hover:bg-[#F0E4C8]",
  error: "hover:bg-[#EFCDD1]",
  info: "hover:bg-[#DEE2E6]",
  primary: "hover:bg-[#D4E5D7]",
  secondary: "hover:bg-[#E9ECEF]",
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
