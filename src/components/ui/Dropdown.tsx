"use client"

import { createContext, useContext, useState, useRef, useEffect, type ReactNode, type ButtonHTMLAttributes } from "react"
import { cn } from "@/lib/utils"

// Context for compound component pattern
const DropdownContext = createContext<{
  open: boolean
  setOpen: (open: boolean) => void
} | null>(null)

function useDropdownContext() {
  const context = useContext(DropdownContext)
  if (!context) throw new Error("Dropdown compound components must be used within Dropdown")
  return context
}

// Root Dropdown component
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

// Trigger component
interface DropdownTriggerProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  className?: string
}

export function DropdownTrigger({ children, className, ...props }: DropdownTriggerProps) {
  const { open, setOpen } = useDropdownContext()

  return (
    <button
      type="button"
      onClick={() => setOpen(!open)}
      className={className}
      {...props}
    >
      {children}
    </button>
  )
}

// Content component
interface DropdownContentProps {
  children: ReactNode
  align?: "start" | "end"
  className?: string
}

export function DropdownContent({ children, align = "start", className }: DropdownContentProps) {
  const { open } = useDropdownContext()

  if (!open) return null

  return (
    <div
      className={cn(
        "absolute z-50 mt-1 min-w-[140px] rounded-lg border border-gray-200 bg-white py-1 shadow-sm",
        align === "end" ? "right-0" : "left-0",
        className
      )}
    >
      {children}
    </div>
  )
}

// Label component
interface DropdownLabelProps {
  children: ReactNode
  className?: string
}

export function DropdownLabel({ children, className }: DropdownLabelProps) {
  return (
    <div className={cn("px-2 py-1.5 text-label font-semibold text-gray-500", className)}>
      {children}
    </div>
  )
}

// Item component
interface DropdownItemProps {
  onClick?: () => void
  disabled?: boolean
  destructive?: boolean
  icon?: ReactNode
  children: ReactNode
  className?: string
}

export function DropdownItem({ onClick, disabled, destructive, icon, children, className }: DropdownItemProps) {
  const { setOpen } = useDropdownContext()

  const handleClick = () => {
    if (!disabled && onClick) {
      onClick()
      setOpen(false)
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled}
      className={cn(
        "flex w-full items-center gap-2 px-2 py-1 text-left text-label transition-colors",
        "hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50",
        destructive ? "text-error" : "text-gray-700",
        className
      )}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {children}
    </button>
  )
}

// Separator component
export function DropdownSeparator() {
  return <div className="my-1 h-px bg-gray-200" />
}

// Legacy: Keep DropdownDivider for backwards compatibility
export function DropdownDivider() {
  return <DropdownSeparator />
}