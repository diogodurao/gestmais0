"use client"

import { createContext, useContext, useState, useRef, useEffect, type ReactNode, type ButtonHTMLAttributes } from "react"
import { cn } from "@/lib/utils"

// Context for compound component pattern
interface DropdownContextValue {
  open: boolean
  setOpen: (open: boolean) => void
}

const DropdownContext = createContext<DropdownContextValue | null>(null)

function useDropdown() {
  const context = useContext(DropdownContext)
  if (!context) {
    throw new Error("Dropdown compound components must be used within a Dropdown")
  }
  return context
}

// Main Dropdown component
interface DropdownProps {
  children: ReactNode
}

export function Dropdown({ children }: DropdownProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <DropdownContext.Provider value={{ open, setOpen }}>
      <div ref={ref} className="relative inline-block">
        {children}
      </div>
    </DropdownContext.Provider>
  )
}

// DropdownTrigger component
interface DropdownTriggerProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
}

export function DropdownTrigger({ children, className, disabled, ...props }: DropdownTriggerProps) {
  const { open, setOpen } = useDropdown()

  return (
    <button
      type="button"
      onClick={() => !disabled && setOpen(!open)}
      disabled={disabled}
      className={className}
      {...props}
    >
      {children}
    </button>
  )
}

// DropdownContent component
interface DropdownContentProps {
  children: ReactNode
  align?: "start" | "end" | "left" | "right"
  className?: string
}

export function DropdownContent({ children, align = "start", className }: DropdownContentProps) {
  const { open } = useDropdown()

  if (!open) return null

  const alignRight = align === "end" || align === "right"

  return (
    <div
      className={cn(
        "absolute z-50 mt-1 min-w-[140px] rounded-lg border border-gray-200 bg-white py-1 shadow-sm",
        alignRight ? "right-0" : "left-0",
        className
      )}
    >
      {children}
    </div>
  )
}

// DropdownItem component
interface DropdownItemProps {
  onClick?: () => void
  disabled?: boolean
  destructive?: boolean
  icon?: ReactNode
  className?: string
  children: ReactNode
}

export function DropdownItem({ onClick, disabled, destructive, icon, className, children }: DropdownItemProps) {
  const { setOpen } = useDropdown()

  const handleClick = () => {
    if (disabled) return
    onClick?.()
    setOpen(false)
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled}
      className={cn(
        "flex w-full items-center gap-2 px-3 py-1.5 text-left text-body transition-colors",
        "hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50",
        destructive ? "text-error" : "text-gray-700",
        className
      )}
    >
      {icon}
      {children}
    </button>
  )
}

// DropdownLabel component
interface DropdownLabelProps {
  children: ReactNode
  className?: string
}

export function DropdownLabel({ children, className }: DropdownLabelProps) {
  return (
    <div className={cn("px-3 py-2 text-label font-semibold text-gray-500", className)}>
      {children}
    </div>
  )
}

// DropdownSeparator component
export function DropdownSeparator() {
  return <div className="my-1 h-px bg-gray-200" />
}

// Keep DropdownDivider as alias for backwards compatibility
export const DropdownDivider = DropdownSeparator