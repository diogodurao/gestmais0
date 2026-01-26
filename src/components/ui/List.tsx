import { forwardRef, type HTMLAttributes, type ReactNode } from "react"
import { cn } from "@/lib/utils"
import { ChevronRight } from "lucide-react"

type ListVariant = "default" | "bordered" | "divided" | "card"

interface ListProps extends HTMLAttributes<HTMLUListElement> {
  variant?: ListVariant
}

const listVariantStyles: Record<ListVariant, string> = {
  default: "",
  bordered: "rounded-lg border border-gray-200",
  divided: "divide-y divide-gray-100",
  card: "rounded-lg border border-gray-200 divide-y divide-gray-100",
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
        title: "text-body",
        description: "text-label",
      },
      md: {
        padding: "px-1.5 py-1.5",
        title: "text-body",
        description: "text-body",
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
          isInteractive && "cursor-pointer transition-colors hover:bg-gray-50",
          active && "bg-primary-light",
          selected && "bg-gray-50 ring-1 ring-primary ring-inset",
          className
        )}
        {...props}
      >
        {leading && <div className="flex-shrink-0">{leading}</div>}
        <div className="min-w-0 flex-1">
          <p className={cn("font-medium text-gray-700 truncate", sizes.title)}>{title}</p>
          {description && (
            <p className={cn("text-secondary truncate", sizes.description)}>
              {description}
            </p>
          )}
        </div>
        {trailing && <div className="flex-shrink-0">{trailing}</div>}
        {showChevron && !trailing && (
          <ChevronRight className="h-4 w-4 text-gray-300 shrink-0" />
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
        "flex items-center justify-between px-1.5 py-1 bg-gray-50 border-b border-gray-200",
        className
      )}
      {...props}
    >
      <span className="text-body font-medium text-secondary uppercase tracking-wide">
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
        "px-1.5 py-1 bg-gray-50 border-t border-gray-200 text-center",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
)
ListFooter.displayName = "ListFooter"
