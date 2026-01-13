"use client"

import { forwardRef, type InputHTMLAttributes } from "react"
import { cn } from "@/lib/utils"

interface RadioProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string
}

export const Radio = forwardRef<HTMLInputElement, RadioProps>(
  ({ className, label, id, ...props }, ref) => (
    <label htmlFor={id} className="inline-flex cursor-pointer items-center gap-1.5">
      <input
        ref={ref}
        type="radio"
        id={id}
        className={cn(
          "h-4 w-4 cursor-pointer appearance-none rounded-full border border-gray-300 bg-white transition-colors",
          "checked:border-[5px] checked:border-blue-600",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2",
          "disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        {...props}
      />
      {label && <span className="text-[13px] text-gray-700">{label}</span>}
    </label>
  )
)

Radio.displayName = "Radio"