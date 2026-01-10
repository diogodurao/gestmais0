import { forwardRef, memo, type HTMLAttributes, type ReactNode } from "react"
import { cn } from "@/lib/utils"

const ListComponent = forwardRef<HTMLUListElement, HTMLAttributes<HTMLUListElement>>(
  ({ className, ...props }, ref) => (
    <ul
      ref={ref}
      className={cn("divide-y divide-gray-100 rounded-md border border-gray-200", className)}
      {...props}
    />
  )
)
ListComponent.displayName = "List"

export const List = memo(ListComponent)

interface ListItemProps extends HTMLAttributes<HTMLLIElement> {
  clickable?: boolean
  active?: boolean
  leading?: ReactNode
  trailing?: ReactNode
  title: string
  description?: string
}

const ListItemComponent = forwardRef<HTMLLIElement, ListItemProps>(
  ({ className, clickable, active, leading, trailing, title, description, ...props }, ref) => (
    <li
      ref={ref}
      className={cn(
        "flex items-center gap-1.5 px-1.5 py-1.5",
        clickable && "cursor-pointer transition-colors hover:bg-gray-50",
        active && "bg-primary-light",
        className
      )}
      {...props}
    >
      {leading && <div className="flex-shrink-0">{leading}</div>}
      <div className="min-w-0 flex-1">
        <p className="text-subtitle font-medium text-gray-800 truncate">{title}</p>
        {description && (
          <p className="text-body text-gray-500 truncate">{description}</p>
        )}
      </div>
      {trailing && <div className="flex-shrink-0">{trailing}</div>}
    </li>
  )
)
ListItemComponent.displayName = "ListItem"

export const ListItem = memo(ListItemComponent)