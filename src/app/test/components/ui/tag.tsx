import { forwardRef, type HTMLAttributes } from "react"
import { cn } from "@/lib/utils"
import { X } from "lucide-react"

interface TagProps extends HTMLAttributes<HTMLSpanElement> {
  removable?: boolean
  onRemove?: () => void
}

export const Tag = forwardRef<HTMLSpanElement, TagProps>(
  ({ className, removable, onRemove, children, ...props }, ref) => (
    <span
      ref={ref}
      className={cn(
        "inline-flex items-center gap-1 rounded bg-gray-100 px-2 py-0.5 text-[11px] text-gray-700",
        className
      )}
      {...props}
    >
      {children}
      {removable && (
        <button
          type="button"
          onClick={onRemove}
          className="rounded hover:bg-gray-200 focus:outline-none"
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </span>
  )
)

Tag.displayName = "Tag"
