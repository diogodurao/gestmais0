import { cn } from "@/lib/utils"
import { type ComponentSize } from "@/lib/types"

interface ProgressBarProps {
    value: number
    max: number
    showPercentage?: boolean
    size?: ComponentSize
    variant?: "default" | "success" | "warning" | "danger" | "auto"
    animated?: boolean
    className?: string
}

export function ProgressBar({
    value,
    max,
    showPercentage = false,
    size = "md",
    variant = "default",
    animated = false,
    className,
}: ProgressBarProps) {
    const percentage = Math.min(Math.max(0, (value / max) * 100), 100)

    let barColor = "bg-slate-600"
    if (variant === "success") barColor = "bg-emerald-600"
    if (variant === "warning") barColor = "bg-amber-600"
    if (variant === "danger") barColor = "bg-rose-600"
    if (variant === "auto") {
        if (percentage >= 100) barColor = "bg-emerald-600"
        else if (percentage >= 50) barColor = "bg-slate-800"
        else if (percentage >= 25) barColor = "bg-slate-600"
        else barColor = "bg-slate-400"
    }

    const sizeClasses = {
        xs: "h-1",
        sm: "h-1.5",
        md: "h-2.5",
        lg: "h-4",
    }

    return (
        <div className={cn("w-full", className)}>
            {showPercentage && (
                <div className="flex justify-end mb-1">
                    <span className="text-[10px] font-bold text-slate-600 font-mono">
                        {Math.round(percentage)}%
                    </span>
                </div>
            )}
            <div className={cn("w-full bg-slate-100 border border-slate-200 overflow-hidden", sizeClasses[size])}>
                <div
                    className={cn(
                        "h-full transition-all duration-500 ease-out",
                        barColor,
                        animated && "animate-pulse"
                    )}
                    style={{ width: `${percentage}%` }}
                />
            </div>
        </div>
    )
}

