"use client"

import { forwardRef, type InputHTMLAttributes } from "react"
import { cn } from "@/lib/utils"

type ToggleSize = "sm" | "md"

interface ToggleProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "size"> {
  /** Label text displayed next to the toggle */
  label?: string
  /** Description text displayed below the label */
  description?: string
  /** Size of the toggle */
  size?: ToggleSize
}

export const Toggle = forwardRef<HTMLInputElement, ToggleProps>(
  ({ className, label, description, size = "sm", id, disabled, ...props }, ref) => {
    return (
      <label
        htmlFor={id}
        className={cn(
          "inline-flex cursor-pointer items-center gap-2",
          disabled && "cursor-not-allowed opacity-50",
          className
        )}
      >
        <span className="relative shrink-0">
          <input
            ref={ref}
            type="checkbox"
            role="switch"
            id={id}
            disabled={disabled}
            className="peer sr-only"
            {...props}
          />
          {/* Track */}
          <span
            className={cn(
              "block rounded-full transition-colors",
              "bg-gray-300 peer-checked:bg-primary",
              "peer-focus-visible:ring-2 peer-focus-visible:ring-primary peer-focus-visible:ring-offset-2",
              size === "sm" && "w-7 h-4",
              size === "md" && "w-9 h-5"
            )}
          />
          {/* Thumb */}
          <span
            className={cn(
              "absolute top-0.5 left-0.5 block rounded-full bg-white shadow-sm transition-transform",
              size === "sm" && "w-3 h-3 peer-checked:translate-x-3",
              size === "md" && "w-4 h-4 peer-checked:translate-x-4"
            )}
          />
        </span>
        {(label || description) && (
          <span className="flex flex-col">
            {label && (
              <span className="text-body font-medium text-gray-700">{label}</span>
            )}
            {description && (
              <span className="text-label text-gray-500">{description}</span>
            )}
          </span>
        )}
      </label>
    )
  }
)

Toggle.displayName = "Toggle"