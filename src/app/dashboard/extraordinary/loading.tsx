import { Skeleton } from "@/components/ui/Skeleton"

export default function Loading() {
    return (
        <div className="space-y-6 animate-in fade-in-50">
            <div className="flex items-center justify-between">
                <div className="space-y-2">
                    <Skeleton className="h-8 w-[200px]" />
                    <Skeleton className="h-4 w-[300px]" />
                </div>
                <Skeleton className="h-10 w-[140px]" />
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <Skeleton className="h-[250px]" />
                <Skeleton className="h-[250px]" />
                <Skeleton className="h-[250px]" />
                <Skeleton className="h-[250px]" />
            </div>
        </div>
    )
}
