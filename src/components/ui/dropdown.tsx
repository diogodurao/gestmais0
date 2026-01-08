"use client"

import {
    createContext,
    useContext,
    useState,
    useRef,
    useEffect,
    ReactNode,
    HTMLAttributes,
    ButtonHTMLAttributes,
    forwardRef
} from "react"
import { cn } from "@/lib/utils"

// ===========================================
// CONTEXT
// ===========================================
type DropdownContextValue = {
    isOpen: boolean
    setIsOpen: (open: boolean) => void
    triggerRef: React.RefObject<HTMLButtonElement | null>
}

const DropdownContext = createContext<DropdownContextValue | null>(null)

function useDropdown() {
    const context = useContext(DropdownContext)
    if (!context) {
        throw new Error("Dropdown components must be used within a Dropdown")
    }
    return context
}

// ===========================================
// ROOT
// ===========================================
interface DropdownProps {
    children: ReactNode
    onOpenChange?: (open: boolean) => void
}

function Dropdown({ children, onOpenChange }: DropdownProps) {
    const [isOpen, setIsOpenState] = useState(false)
    const triggerRef = useRef<HTMLButtonElement>(null)

    const setIsOpen = (open: boolean) => {
        setIsOpenState(open)
        onOpenChange?.(open)
    }

    return (
        <DropdownContext.Provider value={{ isOpen, setIsOpen, triggerRef }}>
            <div className="relative inline-block">
                {children}
            </div>
        </DropdownContext.Provider>
    )
}

// ===========================================
// TRIGGER
// ===========================================
interface DropdownTriggerProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    asChild?: boolean
}

const DropdownTrigger = forwardRef<HTMLButtonElement, DropdownTriggerProps>(
    ({ className, children, asChild, ...props }, ref) => {
        const { isOpen, setIsOpen, triggerRef } = useDropdown()

        return (
            <button
                ref={triggerRef}
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={className}
                aria-expanded={isOpen}
                aria-haspopup="menu"
                {...props}
            >
                {children}
            </button>
        )
    }
)
DropdownTrigger.displayName = "DropdownTrigger"

// ===========================================
// CONTENT
// ===========================================
type Align = "start" | "center" | "end"
type Side = "top" | "bottom"

interface DropdownContentProps extends HTMLAttributes<HTMLDivElement> {
    align?: Align
    side?: Side
    sideOffset?: number
}

const DropdownContent = forwardRef<HTMLDivElement, DropdownContentProps>(
    ({ className, children, align = "start", side = "bottom", sideOffset = 4, ...props }, ref) => {
        const { isOpen, setIsOpen, triggerRef } = useDropdown()
        const contentRef = useRef<HTMLDivElement>(null)

        // Close on click outside
        useEffect(() => {
            if (!isOpen) return

            const handleClickOutside = (event: MouseEvent) => {
                const target = event.target as Node
                if (
                    contentRef.current &&
                    !contentRef.current.contains(target) &&
                    triggerRef.current &&
                    !triggerRef.current.contains(target)
                ) {
                    setIsOpen(false)
                }
            }

            const handleEscape = (event: KeyboardEvent) => {
                if (event.key === "Escape") {
                    setIsOpen(false)
                    triggerRef.current?.focus()
                }
            }

            document.addEventListener("mousedown", handleClickOutside)
            document.addEventListener("keydown", handleEscape)

            return () => {
                document.removeEventListener("mousedown", handleClickOutside)
                document.removeEventListener("keydown", handleEscape)
            }
        }, [isOpen, setIsOpen, triggerRef])

        if (!isOpen) return null

        return (
            <div
                ref={contentRef}
                role="menu"
                className={cn(
                    "absolute z-50 min-w-[160px] rounded-lg border border-[#E9ECEF] bg-white py-1 shadow-sm",
                    "animate-in fade-in-0 zoom-in-95 duration-100",
                    {
                        "top-full mt-1": side === "bottom",
                        "bottom-full mb-1": side === "top",
                        "left-0": align === "start",
                        "right-0": align === "end",
                        "left-1/2 -translate-x-1/2": align === "center",
                    },
                    className
                )}
                style={{ marginTop: side === "bottom" ? sideOffset : undefined, marginBottom: side === "top" ? sideOffset : undefined }}
                {...props}
            >
                {children}
            </div>
        )
    }
)
DropdownContent.displayName = "DropdownContent"

// ===========================================
// ITEM
// ===========================================
interface DropdownItemProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    destructive?: boolean
    icon?: React.ReactNode
}

const DropdownItem = forwardRef<HTMLButtonElement, DropdownItemProps>(
    ({ className, children, destructive, icon, disabled, onClick, ...props }, ref) => {
        const { setIsOpen } = useDropdown()

        const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
            if (disabled) return
            onClick?.(e)
            setIsOpen(false)
        }

        return (
            <button
                ref={ref}
                role="menuitem"
                type="button"
                disabled={disabled}
                onClick={handleClick}
                className={cn(
                    "w-full text-left px-3 py-1.5 text-[11px] font-medium transition-colors flex items-center gap-2",
                    "focus:outline-none focus:bg-[#F8F9FA]",
                    {
                        "text-[#495057] hover:bg-[#F8F9FA]": !destructive && !disabled,
                        "text-[#D4848C] hover:bg-[#F9ECEE]": destructive && !disabled,
                        "text-[#ADB5BD] cursor-not-allowed": disabled,
                    },
                    className
                )}
                {...props}
            >
                {icon && <span className="w-4 h-4 flex items-center justify-center shrink-0">{icon}</span>}
                {children}
            </button>
        )
    }
)
DropdownItem.displayName = "DropdownItem"

// ===========================================
// SEPARATOR
// ===========================================
const DropdownSeparator = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
    ({ className, ...props }, ref) => {
        return (
            <div
                ref={ref}
                role="separator"
                className={cn("h-px bg-[#E9ECEF] my-1", className)}
                {...props}
            />
        )
    }
)
DropdownSeparator.displayName = "DropdownSeparator"

// ===========================================
// LABEL
// ===========================================
const DropdownLabel = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
    ({ className, ...props }, ref) => {
        return (
            <div
                ref={ref}
                className={cn(
                    "px-3 py-1.5 text-[9px] font-medium text-[#8E9AAF] uppercase tracking-wider",
                    className
                )}
                {...props}
            />
        )
    }
)
DropdownLabel.displayName = "DropdownLabel"

export {
    Dropdown,
    DropdownTrigger,
    DropdownContent,
    DropdownItem,
    DropdownSeparator,
    DropdownLabel
}
