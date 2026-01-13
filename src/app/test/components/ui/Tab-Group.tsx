"use client"

import { forwardRef, type HTMLAttributes, type ButtonHTMLAttributes } from "react"
import { cn } from "@/lib/utils"

interface TabGroupProps extends HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  variant?: "default" | "pills" | "underline"
}

export const TabGroup = forwardRef<HTMLDivElement, TabGroupProps>(
  ({ className, children, variant = "default", ...props }, ref) => {
    const variantStyles = {
      default: "flex gap-0.5 border-b border-[#E9ECEF]",
      pills: "flex gap-1 p-0.5 bg-[#F1F3F5] rounded-lg",
      underline: "flex gap-2",
    }

    return (
      <div
        ref={ref}
        role="tablist"
        className={cn(variantStyles[variant], className)}
        {...props}
      >
        {children}
      </div>
    )
  }
)

TabGroup.displayName = "TabGroup"

interface TabButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean
  icon?: React.ReactNode
  variant?: "default" | "pills" | "underline"
}

export const TabButton = forwardRef<HTMLButtonElement, TabButtonProps>(
  ({
    className,
    children,
    active = false,
    icon,
    variant = "default",
    ...props
  }, ref) => {
    const variantStyles = {
      default: cn(
        "px-2 py-1.5 text-[10px] font-medium transition-colors relative",
        "hover:text-[#495057]",
        active
          ? "text-[#6A9B72] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#8FB996]"
          : "text-[#8E9AAF]"
      ),
      pills: cn(
        "px-2 py-1 text-[10px] font-medium rounded transition-colors",
        active
          ? "bg-white text-[#495057] shadow-sm"
          : "text-[#8E9AAF] hover:text-[#495057]"
      ),
      underline: cn(
        "px-1 py-1.5 text-[10px] font-medium transition-colors relative",
        "hover:text-[#495057]",
        active
          ? "text-[#495057] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#495057]"
          : "text-[#8E9AAF]"
      ),
    }

    return (
      <button
        ref={ref}
        type="button"
        role="tab"
        aria-selected={active}
        className={cn(
          "flex items-center gap-1",
          variantStyles[variant],
          className
        )}
        {...props}
      >
        {icon}
        {children}
      </button>
    )
  }
)

TabButton.displayName = "TabButton"

// Tab Panel
interface TabPanelProps extends HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

export const TabPanel = forwardRef<HTMLDivElement, TabPanelProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        role="tabpanel"
        className={cn("", className)}
        {...props}
      >
        {children}
      </div>
    )
  }
)

TabPanel.displayName = "TabPanel"

// Tab Container (groups TabGroup + TabPanels)
interface Tab {
  id: string
  label: string
  icon?: React.ReactNode
  content: React.ReactNode
}

interface TabsProps extends HTMLAttributes<HTMLDivElement> {
  tabs: Tab[]
  activeTab: string
  onTabChange: (tabId: string) => void
  variant?: "default" | "pills" | "underline"
}

export function Tabs({
  className,
  tabs,
  activeTab,
  onTabChange,
  variant = "default",
  ...props
}: TabsProps) {
  return (
    <div className={cn("", className)} {...props}>
      <TabGroup variant={variant} className="mb-1.5">
        {tabs.map((tab) => (
          <TabButton
            key={tab.id}
            active={activeTab === tab.id}
            icon={tab.icon}
            variant={variant}
            onClick={() => onTabChange(tab.id)}
          >
            {tab.label}
          </TabButton>
        ))}
      </TabGroup>
      {tabs.map((tab) => (
        <TabPanel key={tab.id} className={activeTab !== tab.id ? "hidden" : ""}>
          {tab.content}
        </TabPanel>
      ))}
    </div>
  )
}
