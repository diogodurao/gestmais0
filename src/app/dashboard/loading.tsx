import { Skeleton } from "@/components/ui/Skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";

export default function DashboardLoading() {
    return (
        <div className="space-y-1.5">
            {/* Stats Row Skeleton */}
            <div className="grid grid-cols-2 gap-1.5 lg:grid-cols-3">
                <Card>
                    <CardHeader>
                        <Skeleton className="h-4 w-24" />
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-8 w-32" />
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <Skeleton className="h-4 w-24" />
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-8 w-32" />
                    </CardContent>
                </Card>
                <Card className="hidden lg:block">
                    <CardHeader>
                        <Skeleton className="h-4 w-24" />
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-8 w-32" />
                    </CardContent>
                </Card>
            </div>

            {/* Main Content Grid - 3 columns */}
            <div className="grid gap-1.5 lg:grid-cols-3">
                {/* Left Column (col-span-2) */}
                <div className="lg:col-span-2 space-y-1.5">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-1.5">
                                <Skeleton className="h-8 w-8 rounded-lg" />
                                <div>
                                    <Skeleton className="h-4 w-24" />
                                    <Skeleton className="h-3 w-16 mt-1" />
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="py-1.5 flex items-center justify-between border-b border-[#F1F3F5] last:border-0">
                                    <div className="flex items-center gap-1.5">
                                        <Skeleton className="h-6 w-6 rounded-full" />
                                        <div>
                                            <Skeleton className="h-3 w-24" />
                                            <Skeleton className="h-2 w-16 mt-0.5" />
                                        </div>
                                    </div>
                                    <Skeleton className="h-4 w-12 rounded" />
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-1.5">
                                <Skeleton className="h-8 w-8 rounded-lg" />
                                <div>
                                    <Skeleton className="h-4 w-24" />
                                    <Skeleton className="h-3 w-20 mt-1" />
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {[1, 2].map((i) => (
                                <div key={i} className="py-1.5 border-b border-[#F1F3F5] last:border-0">
                                    <Skeleton className="h-3 w-full" />
                                    <Skeleton className="h-2 w-24 mt-1" />
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column */}
                <div className="space-y-1.5">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-1.5">
                                <Skeleton className="h-8 w-8 rounded-lg" />
                                <div>
                                    <Skeleton className="h-4 w-24" />
                                    <Skeleton className="h-3 w-16 mt-1" />
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-16 w-full rounded-lg" />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-1.5">
                                <Skeleton className="h-8 w-8 rounded-lg" />
                                <div>
                                    <Skeleton className="h-4 w-24" />
                                    <Skeleton className="h-3 w-20 mt-1" />
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-1">
                                <Skeleton className="h-3 w-full" />
                                <Skeleton className="h-3 w-full" />
                                <Skeleton className="h-3 w-full" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-1.5">
                                <Skeleton className="h-8 w-8 rounded-lg" />
                                <div>
                                    <Skeleton className="h-4 w-20" />
                                    <Skeleton className="h-3 w-16 mt-1" />
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 gap-2">
                                <Skeleton className="h-12 w-full rounded-lg" />
                                <Skeleton className="h-12 w-full rounded-lg" />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}