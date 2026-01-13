import { forwardRef, type HTMLAttributes, type ReactNode } from "react"
import { cn } from "@/lib/utils"
import { ChevronRight } from "lucide-react"

type ListVariant = "default" | "bordered" | "divided" | "card"

interface ListProps extends HTMLAttributes<HTMLUListElement> {
  variant?: ListVariant
}

const listVariantStyles: Record<ListVariant, string> = {
  default: "",
  bordered: "rounded-lg border border-[#E9ECEF]",
  divided: "divide-y divide-[#F1F3F5]",
  card: "rounded-lg border border-[#E9ECEF] divide-y divide-[#F1F3F5]",
}

export const List = forwardRef<HTMLUListElement, ListProps>(
  ({ className, variant = "card", ...props }, ref) => (
    <ul
      ref={ref}
      className={cn(listVariantStyles[variant], className)}
      {...props}
    />
  )
)
List.displayName = "List"

interface ListItemProps extends HTMLAttributes<HTMLLIElement> {
  interactive?: boolean
  active?: boolean
  selected?: boolean
  leading?: ReactNode
  trailing?: ReactNode
  title: string
  description?: string
  showChevron?: boolean
  size?: "sm" | "md"
  // Legacy prop support
  clickable?: boolean
}

export const ListItem = forwardRef<HTMLLIElement, ListItemProps>(
  ({
    className,
    interactive,
    clickable,
    active,
    selected,
    leading,
    trailing,
    title,
    description,
    showChevron,
    size = "md",
    onClick,
    ...props
  }, ref) => {
    const isInteractive = interactive || clickable

    const sizeStyles = {
      sm: {
        padding: "px-1.5 py-1",
        title: "text-[10px]",
        description: "text-[9px]",
      },
      md: {
        padding: "px-1.5 py-1.5",
        title: "text-[11px]",
        description: "text-[10px]",
      },
    }

    const sizes = sizeStyles[size]

    return (
      <li
        ref={ref}
        onClick={onClick}
        role={isInteractive ? "button" : undefined}
        tabIndex={isInteractive ? 0 : undefined}
        onKeyDown={isInteractive ? (e) => (e.key === "Enter" || e.key === " ") && onClick?.(e as any) : undefined}
        className={cn(
          "flex items-center gap-1.5 bg-white",
          sizes.padding,
          isInteractive && "cursor-pointer transition-colors hover:bg-[#F8F9FA]",
          active && "bg-[#E8F0EA]",
          selected && "bg-[#F8F9FA] ring-1 ring-[#8FB996] ring-inset",
          className
        )}
        {...props}
      >
        {leading && <div className="flex-shrink-0">{leading}</div>}
        <div className="min-w-0 flex-1">
          <p className={cn("font-medium text-[#495057] truncate", sizes.title)}>{title}</p>
          {description && (
            <p className={cn("text-[#8E9AAF] truncate", sizes.description)}>
              {description}
            </p>
          )}
        </div>
        {trailing && <div className="flex-shrink-0">{trailing}</div>}
        {showChevron && !trailing && (
          <ChevronRight className="h-4 w-4 text-[#DEE2E6] shrink-0" />
        )}
      </li>
    )
  }
)
ListItem.displayName = "ListItem"

// Clickable List Item (shorthand)
interface ClickableListItemProps extends Omit<ListItemProps, "interactive" | "clickable"> {
  onClick: () => void
}

export const ClickableListItem = forwardRef<HTMLLIElement, ClickableListItemProps>(
  ({ onClick, showChevron = true, ...props }, ref) => (
    <ListItem
      ref={ref}
      interactive
      showChevron={showChevron}
      onClick={onClick}
      {...props}
    />
  )
)
ClickableListItem.displayName = "ClickableListItem"

// List Header
interface ListHeaderProps extends HTMLAttributes<HTMLDivElement> {
  title: string
  action?: ReactNode
}

export const ListHeader = forwardRef<HTMLDivElement, ListHeaderProps>(
  ({ className, title, action, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "flex items-center justify-between px-1.5 py-1 bg-[#F8F9FA] border-b border-[#E9ECEF]",
        className
      )}
      {...props}
    >
      <span className="text-[10px] font-medium text-[#8E9AAF] uppercase tracking-wide">
        {title}
      </span>
      {action}
    </div>
  )
)
ListHeader.displayName = "ListHeader"

// List Footer
export const ListFooter = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "px-1.5 py-1 bg-[#F8F9FA] border-t border-[#E9ECEF] text-center",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
)
ListFooter.displayName = "ListFooter"
