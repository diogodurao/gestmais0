import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface DashboardGridProps {
    children: ReactNode;
    variant?: "default" | "wide" | "full";
    className?: string;
}

export function DashboardGrid({ children, variant = "default", className }: DashboardGridProps) {
    const variants = {
        default: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-1.5 md:gap-4",
        wide: "grid grid-cols-1 lg:grid-cols-2 gap-1.5 md:gap-4",
        full: "grid grid-cols-1 gap-1.5 md:gap-4",
    };

    return (
        <div className={cn(variants[variant], className)}>
            {children}
        </div>
    );
}
