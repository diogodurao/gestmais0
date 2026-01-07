"use client"

import { useState, useRef, useEffect, type ReactNode } from "react"
import { cn } from "@/lib/utils"

interface DropdownProps {
  trigger: ReactNode
  children: ReactNode
  align?: "left" | "right"
}

export function Dropdown({ trigger, children, align = "left" }: DropdownProps) {
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
    <div ref={ref} className="relative inline-block">
      <div onClick={() => setOpen(!open)}>{trigger}</div>
      {open && (
        <div
          className={cn(
            "absolute z-50 mt-1 min-w-[160px] rounded-md border border-gray-200 bg-white py-1 shadow-md",
            align === "right" ? "right-0" : "left-0"
          )}
        >
          {children}
        </div>
      )}
    </div>
  )
}

interface DropdownItemProps {
  onClick?: () => void
  disabled?: boolean
  destructive?: boolean
  children: ReactNode
}

export function DropdownItem({ onClick, disabled, destructive, children }: DropdownItemProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "flex w-full items-center px-3 py-1.5 text-left text-[13px] transition-colors",
        "hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50",
        destructive ? "text-red-600" : "text-gray-700"
      )}
    >
      {children}
    </button>
  )
}

export function DropdownDivider() {
  return <div className="my-1 h-px bg-gray-200" />
}
