import { type ReactNode } from "react"
import { cn } from "@/lib/utils"
import { Label } from "./Label"

interface FormFieldProps {
  label?: string
  required?: boolean
  error?: string
  description?: string
  children: ReactNode
  className?: string
}

export function FormField({ label, required, error, description, children, className }: FormFieldProps) {
  return (
    <div className={cn("space-y-1", className)}>
      {label && (
        <Label required={required}>{label}</Label>
      )}
      {children}
      {description && !error && (
        <p className="text-[11px] text-gray-500">{description}</p>
      )}
      {error && (
        <p className="text-[11px] text-red-600">{error}</p>
      )}
    </div>
  )
}