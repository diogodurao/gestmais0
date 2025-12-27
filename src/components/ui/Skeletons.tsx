
import { Skeleton } from "@/components/ui/Skeleton"
import { cn } from "@/lib/utils"

export function SkeletonHeader({ className }: { className?: string }) {
    return (
        <div className={cn("flex flex-col gap-1", className)}>
            <Skeleton className="h-6 w-48 bg-slate-200" />
            <Skeleton className="h-4 w-64 bg-slate-100" />
        </div>
    )
}

export function SkeletonCard({ className, hasHeader = true }: { className?: string, hasHeader?: boolean }) {
    return (
        <div className={cn("tech-border bg-white overflow-hidden", className)}>
            {hasHeader && (
                <div className="p-4 border-b border-slate-100">
                    <div className="flex items-start justify-between gap-4">
                        <div className="space-y-2 flex-1">
                            <Skeleton className="h-5 w-3/4 bg-slate-200" />
                            <Skeleton className="h-3 w-1/4 bg-slate-100" />
                        </div>
                        <Skeleton className="h-8 w-8 rounded-full bg-slate-100" />
                    </div>
                </div>
            )}
            <div className="p-4 space-y-3">
                <Skeleton className="h-4 w-full bg-slate-100" />
                <Skeleton className="h-4 w-2/3 bg-slate-100" />
                <Skeleton className="h-10 w-full bg-slate-50 mt-2" />
            </div>
        </div>
    )
}

export function SkeletonGrid({ count = 3, className }: { count?: number, className?: string }) {
    return (
        <div className={cn("grid gap-4 md:grid-cols-2 lg:grid-cols-3", className)}>
            {Array.from({ length: count }).map((_, i) => (
                <SkeletonCard key={i} />
            ))}
        </div>
    )
}

export function SkeletonRow({ className }: { className?: string }) {
    return (
        <div className={cn("flex items-center gap-4 p-4 border-b border-slate-100", className)}>
            <Skeleton className="h-4 w-8 bg-slate-200" />
            <Skeleton className="h-4 w-32 bg-slate-100" />
            <div className="flex-1" />
            <Skeleton className="h-4 w-16 bg-slate-100" />
            <Skeleton className="h-4 w-16 bg-slate-100" />
        </div>
    )
}

export function SkeletonList({ count = 5, className }: { count?: number, className?: string }) {
    return (
        <div className={cn("tech-border bg-white", className)}>
            {Array.from({ length: count }).map((_, i) => (
                <SkeletonRow key={i} />
            ))}
        </div>
    )
}

export function SkeletonCompactCard({ className }: { className?: string }) {
    return (
        <div className={cn("tech-border bg-slate-50 p-3 sm:p-4", className)}>
            <div className="flex items-center gap-3">
                <Skeleton className="w-6 h-6 bg-slate-200" />
                <div className="flex-1">
                    <Skeleton className="h-4 w-3/4 bg-slate-200" />
                    <Skeleton className="h-3 w-1/3 bg-slate-100 mt-1" />
                </div>
            </div>
        </div>
    )
}
