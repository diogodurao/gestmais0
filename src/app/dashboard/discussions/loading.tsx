import { Skeleton } from "@/components/ui/Skeleton"

export default function Loading() {
    return (
        <div className="p-4 md:p-6 space-y-4">
            <div className="flex items-center justify-between">
                <Skeleton className="h-8 w-36" />
                <Skeleton className="h-10 w-40" />
            </div>
            <Skeleton className="h-10 w-64" />
            <div className="grid gap-3">
                {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-32 w-full" />
                ))}
            </div>
        </div>
    )
}