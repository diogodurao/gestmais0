import { forwardRef, memo, type LabelHTMLAttributes } from "react"
import { cn } from "@/lib/utils"

interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean
}

const LabelComponent = forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, required, children, ...props }, ref) => (
    <label
      ref={ref}
      className={cn("block text-body font-medium text-gray-600", className)}
      {...props}
    >
      {children}
      {required && <span className="ml-0.5 text-error">*</span>}
    </label>
  )
)

LabelComponent.displayName = "Label"

export const Label = memo(LabelComponent)