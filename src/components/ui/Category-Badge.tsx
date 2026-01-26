import { forwardRef, type HTMLAttributes } from "react"
import { cn } from "@/lib/utils"

type CategoryType =
  | "maintenance" | "security" | "noise" | "cleaning" | "other"  // Occurrences
  | "meeting" | "deadline" | "general"  // Events
  | "regulations" | "contracts" | "finances" | "minutes" | "notices"  // Documents
  | "owner" | "tenant" | "representative"  // Residents

interface CategoryBadgeProps extends HTMLAttributes<HTMLSpanElement> {
  category: CategoryType
  size?: "sm" | "md"
}

const categoryConfig: Record<CategoryType, { label: string; bg: string; text: string; border: string }> = {
  // Occurrences
  maintenance: {
    label: "Manutenção",
    bg: "bg-warning-light",
    text: "text-warning",
    border: "border-warning-light",
  },
  security: {
    label: "Segurança",
    bg: "bg-error-light",
    text: "text-error",
    border: "border-error-light",
  },
  noise: {
    label: "Ruído",
    bg: "bg-secondary-light",
    text: "text-gray-600",
    border: "border-gray-300",
  },
  cleaning: {
    label: "Limpeza",
    bg: "bg-primary-light",
    text: "text-primary-dark",
    border: "border-primary-light",
  },
  other: {
    label: "Outro",
    bg: "bg-gray-100",
    text: "text-gray-600",
    border: "border-gray-200",
  },
  // Events
  meeting: {
    label: "Reunião",
    bg: "bg-primary-light",
    text: "text-primary-dark",
    border: "border-primary-light",
  },
  deadline: {
    label: "Prazo",
    bg: "bg-error-light",
    text: "text-error",
    border: "border-error-light",
  },
  general: {
    label: "Geral",
    bg: "bg-secondary-light",
    text: "text-gray-600",
    border: "border-gray-300",
  },
  // Documents
  regulations: {
    label: "Regulamentos",
    bg: "bg-primary-light",
    text: "text-primary-dark",
    border: "border-primary-light",
  },
  contracts: {
    label: "Contratos",
    bg: "bg-warning-light",
    text: "text-warning",
    border: "border-warning-light",
  },
  finances: {
    label: "Finanças",
    bg: "bg-secondary-light",
    text: "text-gray-600",
    border: "border-gray-300",
  },
  minutes: {
    label: "Atas",
    bg: "bg-gray-100",
    text: "text-gray-700",
    border: "border-gray-200",
  },
  notices: {
    label: "Avisos",
    bg: "bg-error-light",
    text: "text-error",
    border: "border-error-light",
  },
  // Residents
  owner: {
    label: "Proprietário",
    bg: "bg-primary-light",
    text: "text-primary-dark",
    border: "border-primary-light",
  },
  tenant: {
    label: "Inquilino",
    bg: "bg-gray-100",
    text: "text-gray-600",
    border: "border-gray-200",
  },
  representative: {
    label: "Representante",
    bg: "bg-warning-light",
    text: "text-warning",
    border: "border-warning-light",
  },
}

const sizeStyles = {
  sm: "px-1 py-0.5 text-micro",
  md: "px-1.5 py-0.5 text-xs",
}

export const CategoryBadge = forwardRef<HTMLSpanElement, CategoryBadgeProps>(
  ({ className, category, size = "md", ...props }, ref) => {
    const config = categoryConfig[category]

    return (
      <span
        ref={ref}
        className={cn(
          "inline-flex items-center rounded border font-medium",
          config.bg,
          config.text,
          config.border,
          sizeStyles[size],
          className
        )}
        {...props}
      >
        {config.label}
      </span>
    )
  }
)

CategoryBadge.displayName = "CategoryBadge"

// Get category config for external use
export function getCategoryConfig(category: CategoryType) {
  return categoryConfig[category]
}

// Get category label
export function getCategoryLabel(category: CategoryType) {
  return categoryConfig[category]?.label || category
}
