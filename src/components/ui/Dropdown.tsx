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
            "absolute z-50 mt-1 min-w-[140px] rounded-lg border border-[#E9ECEF] bg-white py-1 shadow-sm",
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
        "flex w-full items-center px-1.5 py-1 text-left text-[10px] transition-colors",
        "hover:bg-[#F8F9FA] disabled:cursor-not-allowed disabled:opacity-50",
        destructive ? "text-[#D4848C]" : "text-[#495057]"
      )}
    >
      {children}
    </button>
  )
}

export function DropdownDivider() {
  return <div className="my-1 h-px bg-[#E9ECEF]" />
}