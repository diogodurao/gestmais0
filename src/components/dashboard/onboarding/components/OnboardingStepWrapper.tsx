"use client"

import { cn } from "@/lib/utils"
import { Check } from "lucide-react"

interface OnboardingStepWrapperProps {
    title: string
    isActive: boolean
    isComplete: boolean
    icon: React.ComponentType<{ className?: string }>
    children: React.ReactNode
    disabled?: boolean
    onClick?: () => void
}

export function OnboardingStepWrapper({
    title,
    isActive,
    isComplete,
    icon: Icon,
    children,
    disabled,
    onClick
}: OnboardingStepWrapperProps) {
    return (
        <div
            className={cn(
                "tech-card transition-all duration-300 relative overflow-hidden",
                !isActive && !disabled && "cursor-pointer hover:border-gray-400 opacity-60 hover:opacity-100",
                disabled && "opacity-40 pointer-events-none grayscale"
            )}
            onClick={onClick}
        >
            {/* Status Indicator Line */}
            <div className={cn(
                "absolute top-0 left-0 w-1 h-full transition-colors",
                isActive ? "bg-info" : isComplete ? "bg-emerald-500" : "bg-gray-200"
            )}></div>

            <div className="flex items-center justify-between px-6 py-4 bg-gray-50/50 border-b border-gray-200">
                <div className="flex items-center gap-3">
                    <div className={cn(
                        "w-8 h-8 flex items-center justify-center border rounded-sm",
                        isActive ? "bg-info-light border-gray-200 text-info" : "bg-white border-gray-200 text-gray-400"
                    )}>
                        <Icon className="w-4 h-4" />
                    </div>
                    <span className={cn(
                        "font-mono font-bold text-sm uppercase tracking-wider",
                        isActive ? "text-gray-900" : "text-gray-500"
                    )}>
                        {title}
                    </span>
                </div>

                {isComplete && !isActive && (
                    <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-2 py-1 rounded-full border border-emerald-100">
                        <Check className="w-3 h-3" />
                        <span className="text-[10px] font-bold uppercase tracking-wide">Done</span>
                    </div>
                )}
            </div>

            {isActive && (
                <div className="animate-in fade-in zoom-in-95 duration-200">
                    {children}
                </div>
            )}
        </div>
    )
}
