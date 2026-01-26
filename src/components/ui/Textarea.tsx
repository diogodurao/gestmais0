import { forwardRef, type TextareaHTMLAttributes } from "react"
import { cn } from "@/lib/utils"

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        "min-h-[80px] w-full rounded-md border bg-white px-1.5 py-1.5 text-subtitle text-gray-900 transition-colors",
        "placeholder:text-gray-400",
        "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-0",
        "disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500",
        error ? "border-error" : "border-gray-200",
        className
      )}
      {...props}
    />
  )
)

Textarea.displayName = "Textarea"