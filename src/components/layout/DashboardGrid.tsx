import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface DashboardGridProps {
    children: ReactNode;
    variant?: "default" | "wide" | "full";
    gap?: "none" | "sm" | "md" | "lg";
    className?: string;
}

export function DashboardGrid({
    children,
    variant = "default",
    gap = "md",
    className
}: DashboardGridProps) {
    const layoutVariants = {
        default: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
        wide: "grid grid-cols-1 lg:grid-cols-2",
        full: "grid grid-cols-1",
    };

    const gapVariants = {
        none: "gap-0",
        sm: "gap-2",
        md: "gap-4",
        lg: "gap-6",
    };

    return (
        <div className={cn(layoutVariants[variant], gapVariants[gap], className)}>
            {children}
        </div>
    );
}
