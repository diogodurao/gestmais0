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
    bg: "bg-[#FBF6EC]",
    text: "text-[#B8963E]",
    border: "border-[#F0E4C8]",
  },
  security: {
    label: "Segurança",
    bg: "bg-[#F9ECEE]",
    text: "text-[#B86B73]",
    border: "border-[#EFCDD1]",
  },
  noise: {
    label: "Ruído",
    bg: "bg-[#E9ECF0]",
    text: "text-[#6C757D]",
    border: "border-[#DEE2E6]",
  },
  cleaning: {
    label: "Limpeza",
    bg: "bg-[#E8F0EA]",
    text: "text-[#6A9B72]",
    border: "border-[#D4E5D7]",
  },
  other: {
    label: "Outro",
    bg: "bg-[#F1F3F5]",
    text: "text-[#6C757D]",
    border: "border-[#E9ECEF]",
  },
  // Events
  meeting: {
    label: "Reunião",
    bg: "bg-[#E8F0EA]",
    text: "text-[#6A9B72]",
    border: "border-[#D4E5D7]",
  },
  deadline: {
    label: "Prazo",
    bg: "bg-[#F9ECEE]",
    text: "text-[#B86B73]",
    border: "border-[#EFCDD1]",
  },
  general: {
    label: "Geral",
    bg: "bg-[#E9ECF0]",
    text: "text-[#6C757D]",
    border: "border-[#DEE2E6]",
  },
  // Documents
  regulations: {
    label: "Regulamentos",
    bg: "bg-[#E8F0EA]",
    text: "text-[#6A9B72]",
    border: "border-[#D4E5D7]",
  },
  contracts: {
    label: "Contratos",
    bg: "bg-[#FBF6EC]",
    text: "text-[#B8963E]",
    border: "border-[#F0E4C8]",
  },
  finances: {
    label: "Finanças",
    bg: "bg-[#E9ECF0]",
    text: "text-[#6C757D]",
    border: "border-[#DEE2E6]",
  },
  minutes: {
    label: "Atas",
    bg: "bg-[#F1F3F5]",
    text: "text-[#495057]",
    border: "border-[#E9ECEF]",
  },
  notices: {
    label: "Avisos",
    bg: "bg-[#F9ECEE]",
    text: "text-[#B86B73]",
    border: "border-[#EFCDD1]",
  },
  // Residents
  owner: {
    label: "Proprietário",
    bg: "bg-[#E8F0EA]",
    text: "text-[#6A9B72]",
    border: "border-[#D4E5D7]",
  },
  tenant: {
    label: "Inquilino",
    bg: "bg-[#F1F3F5]",
    text: "text-[#6C757D]",
    border: "border-[#E9ECEF]",
  },
  representative: {
    label: "Representante",
    bg: "bg-[#FBF6EC]",
    text: "text-[#B8963E]",
    border: "border-[#F0E4C8]",
  },
}

const sizeStyles = {
  sm: "px-1 py-0.5 text-[8px]",
  md: "px-1.5 py-0.5 text-[9px]",
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
