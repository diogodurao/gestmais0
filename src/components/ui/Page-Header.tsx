import { forwardRef, type HTMLAttributes } from "react"
import { cn } from "@/lib/utils"

interface PageHeaderProps extends HTMLAttributes<HTMLDivElement> {
  title: string
  description?: string
  actions?: React.ReactNode
  backAction?: React.ReactNode
}

export const PageHeader = forwardRef<HTMLDivElement, PageHeaderProps>(
  ({
    className,
    title,
    description,
    actions,
    backAction,
    ...props
  }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "mb-1.5 flex flex-col gap-1.5 sm:flex-row sm:items-center sm:justify-between",
          className
        )}
        {...props}
      >
        <div className="flex items-center gap-1.5">
          {backAction && <div>{backAction}</div>}
          <div>
            <h1 className="text-heading font-semibold text-gray-800">{title}</h1>
            {description && (
              <p className="text-label text-secondary">{description}</p>
            )}
          </div>
        </div>
        {actions && (
          <div className="flex items-center gap-1.5">
            {actions}
          </div>
        )}
      </div>
    )
  }
)

PageHeader.displayName = "PageHeader"

// Page Title (simpler version without actions)
interface PageTitleProps extends HTMLAttributes<HTMLDivElement> {
  title: string
  description?: string
}

export const PageTitle = forwardRef<HTMLDivElement, PageTitleProps>(
  ({ className, title, description, ...props }, ref) => {
    return (
      <div ref={ref} className={cn("mb-1.5", className)} {...props}>
        <h1 className="text-heading font-semibold text-gray-800">{title}</h1>
        {description && (
          <p className="text-label text-secondary">{description}</p>
        )}
      </div>
    )
  }
)

PageTitle.displayName = "PageTitle"
