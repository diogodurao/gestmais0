import { cn } from "@/lib/utils"
import { ReactNode } from "react"

interface DashboardCardProps {
    children: ReactNode
    className?: string
}

export function DashboardCard({ children, className }: DashboardCardProps) {
    return (
        <div className={cn(
            "bg-white border border-slate-300 shadow-[4px_4px_0px_#cbd5e1] p-0", // p-0 because headers/content usually have their own padding, or we might want p-4 default?
            className
        )}>
            {children}
        </div>
    )
}
