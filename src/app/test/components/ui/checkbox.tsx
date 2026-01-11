"use client"

import { forwardRef, type InputHTMLAttributes } from "react"
import { cn } from "@/lib/utils"
import { Check } from "lucide-react"

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, id, ...props }, ref) => (
    <label htmlFor={id} className="inline-flex cursor-pointer items-center gap-1.5">
      <div className="relative">
        <input
          ref={ref}
          type="checkbox"
          id={id}
          className={cn(
            "peer h-4 w-4 cursor-pointer appearance-none rounded border border-gray-300 bg-white transition-colors",
            "checked:border-blue-600 checked:bg-blue-600",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2",
            "disabled:cursor-not-allowed disabled:opacity-50",
            className
          )}
          {...props}
        />
        <Check className="pointer-events-none absolute left-0.5 top-0.5 h-3 w-3 text-white opacity-0 peer-checked:opacity-100" />
      </div>
      {label && <span className="text-[13px] text-gray-700">{label}</span>}
    </label>
  )
)

Checkbox.displayName = "Checkbox"