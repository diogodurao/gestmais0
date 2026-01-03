import { cn } from "@/lib/utils"

type StatusConfig = { label: string; color: string }

interface StatusBadgeProps<T extends string> {
    status: T
    config: Record<T, StatusConfig> | Record<string, StatusConfig>
    size?: "xs" | "sm" | "md"
    className?: string
}

const sizes = {
    xs: "px-1.5 py-0.5 text-micro",
    sm: "px-2 py-0.5 text-micro",
    md: "px-2.5 py-1 text-[10px]",
}

export function StatusBadge<T extends string>({
    status,
    config,
    size = "sm",
    className
}: StatusBadgeProps<T>) {
    const statusConfig = config[status] || { label: status, color: "bg-slate-100 text-slate-500 border-slate-200" }
    const { label, color } = statusConfig

    return (
        <span className={cn(
            "inline-block font-bold uppercase tracking-wider border rounded-sm",
            sizes[size],
            color,
            className
        )}>
            {label}
        </span>
    )
}

export default StatusBadge