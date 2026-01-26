import { forwardRef, type HTMLAttributes } from "react"
import { cn } from "@/lib/utils"

interface SectionHeaderProps extends HTMLAttributes<HTMLDivElement> {
  title: string
  description?: string
  action?: React.ReactNode
  size?: "sm" | "md" | "lg"
  uppercase?: boolean
}

const sizeStyles = {
  sm: {
    title: "text-xs",
    description: "text-micro",
    gap: "gap-0.5",
  },
  md: {
    title: "text-label",
    description: "text-xs",
    gap: "gap-0.5",
  },
  lg: {
    title: "text-body",
    description: "text-label",
    gap: "gap-1",
  },
}

export const SectionHeader = forwardRef<HTMLDivElement, SectionHeaderProps>(
  ({
    className,
    title,
    description,
    action,
    size = "md",
    uppercase = true,
    ...props
  }, ref) => {
    const sizes = sizeStyles[size]

    return (
      <div
        ref={ref}
        className={cn(
          "flex items-center justify-between",
          sizes.gap,
          className
        )}
        {...props}
      >
        <div>
          <h3
            className={cn(
              "font-medium text-secondary",
              sizes.title,
              uppercase && "uppercase tracking-wide"
            )}
          >
            {title}
          </h3>
          {description && (
            <p className={cn("text-gray-400", sizes.description)}>
              {description}
            </p>
          )}
        </div>
        {action && <div>{action}</div>}
      </div>
    )
  }
)

SectionHeader.displayName = "SectionHeader"

// Section Wrapper (header + content)
interface SectionProps extends HTMLAttributes<HTMLElement> {
  title: string
  description?: string
  action?: React.ReactNode
  headerSize?: "sm" | "md" | "lg"
  uppercase?: boolean
  children: React.ReactNode
}

export const Section = forwardRef<HTMLElement, SectionProps>(
  ({
    className,
    title,
    description,
    action,
    headerSize = "md",
    uppercase = true,
    children,
    ...props
  }, ref) => {
    return (
      <section ref={ref} className={cn("", className)} {...props}>
        <SectionHeader
          title={title}
          description={description}
          action={action}
          size={headerSize}
          uppercase={uppercase}
          className="mb-1"
        />
        {children}
      </section>
    )
  }
)

Section.displayName = "Section"
