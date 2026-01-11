/**
 * Dashboard Loading Skeleton
 * Provides a consistent loading UI for dashboard pages to prevent CLS
 */
export function DashboardSkeleton() {
    return (
        <div className="p-6 space-y-6 animate-pulse">
            {/* Header skeleton */}
            <div className="flex justify-between items-center">
                <div className="h-8 w-64 bg-slate-200 rounded"></div>
                <div className="h-10 w-32 bg-slate-200 rounded"></div>
            </div>

            {/* Stats cards skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="p-6 bg-white border border-slate-200 rounded">
                        <div className="h-4 w-24 bg-slate-200 rounded mb-4"></div>
                        <div className="h-8 w-32 bg-slate-200 rounded"></div>
                    </div>
                ))}
            </div>

            {/* Content area skeleton */}
            <div className="bg-white border border-slate-200 rounded p-6">
                <div className="h-6 w-48 bg-slate-200 rounded mb-6"></div>
                <div className="space-y-4">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="h-16 bg-slate-100 rounded"></div>
                    ))}
                </div>
            </div>
        </div>
    )
}

/**
 * Compact Loading Skeleton
 * For smaller components or secondary views
 */
export function CompactSkeleton() {
    return (
        <div className="p-4 space-y-3 animate-pulse">
            <div className="h-4 w-3/4 bg-slate-200 rounded"></div>
            <div className="h-4 w-1/2 bg-slate-200 rounded"></div>
            <div className="h-4 w-5/6 bg-slate-200 rounded"></div>
        </div>
    )
}
