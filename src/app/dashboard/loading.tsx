import { Skeleton } from "@/components/ui/Skeleton";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/Card";
import { Key, Activity, BarChart3 } from "lucide-react";

export default function DashboardLoading() {
    return (
        <div className="space-y-6">
            {/* Payment Status Card Skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <Card className="h-full border-slate-200 shadow-sm">
                        <CardHeader className="pb-2">
                            <Skeleton className="h-4 w-32 mb-2" />
                            <Skeleton className="h-8 w-64" />
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <Skeleton className="h-4 w-full" />
                                <div className="grid grid-cols-2 gap-4">
                                    <Skeleton className="h-24 w-full" />
                                    <Skeleton className="h-24 w-full" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
                <div className="lg:col-span-1 hidden lg:block">
                    <div className="h-full tech-border border-dashed bg-slate-50/50 flex items-center justify-center p-6">
                        <Skeleton className="h-4 w-32" />
                    </div>
                </div>
            </div>

            {/* Info Panels Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0 bg-white tech-border shadow-sm">
                {/* 1. Invite Code / Welcome Panel */}
                <div className="col-span-1 border-r border-slate-200 p-0">
                    <CardHeader>
                        <CardTitle>
                            <Key className="w-3.5 h-3.5 text-slate-400" />
                            <Skeleton className="h-3 w-24 inline-block ml-2" />
                        </CardTitle>
                    </CardHeader>
                    <div className="p-6 flex flex-col items-center justify-center bg-blue-50/30 h-32">
                        <Skeleton className="h-8 w-32 mb-2" />
                        <Skeleton className="h-3 w-20" />
                    </div>
                </div>

                {/* 2. System / Status Panel */}
                <div className="col-span-1 border-r border-slate-200 p-0">
                    <CardHeader>
                        <CardTitle>
                            <Activity className="w-3.5 h-3.5 text-slate-400" />
                            <Skeleton className="h-3 w-24 inline-block ml-2" />
                        </CardTitle>
                    </CardHeader>
                    <div className="p-4 space-y-3 h-32">
                        <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                            <Skeleton className="h-3 w-8" />
                            <Skeleton className="h-5 w-16 rounded-full" />
                        </div>
                        <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                            <Skeleton className="h-3 w-12" />
                            <Skeleton className="h-3 w-24" />
                        </div>
                        <div className="flex justify-between items-center">
                            <Skeleton className="h-3 w-8" />
                            <Skeleton className="h-3 w-12" />
                        </div>
                    </div>
                </div>

                {/* 3. Metrics / Building Panel */}
                <div className="col-span-1 p-0">
                    <CardHeader>
                        <CardTitle>
                            <BarChart3 className="w-3.5 h-3.5 text-slate-400" />
                            <Skeleton className="h-3 w-24 inline-block ml-2" />
                        </CardTitle>
                    </CardHeader>
                    <div className="p-4 h-32 flex flex-col justify-center">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="text-center border-r border-slate-100 flex flex-col items-center">
                                <Skeleton className="h-8 w-8 mb-1" />
                                <Skeleton className="h-2 w-12" />
                            </div>
                            <div className="text-center flex flex-col items-center">
                                <Skeleton className="h-8 w-8 mb-1" />
                                <Skeleton className="h-2 w-12" />
                            </div>
                        </div>
                    </div>
                    <CardFooter className="justify-center">
                        <Skeleton className="h-3 w-32" />
                    </CardFooter>
                </div>
            </div>

            {/* Residents List Skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-4">
                    <Skeleton className="h-4 w-32" />
                    <Card>
                        <CardContent className="p-0">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="p-4 border-b border-slate-100 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <Skeleton className="h-8 w-8 rounded-full" />
                                        <div className="space-y-1">
                                            <Skeleton className="h-3 w-32" />
                                            <Skeleton className="h-2 w-24" />
                                        </div>
                                    </div>
                                    <Skeleton className="h-4 w-12" />
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>

                {/* Quick Actions Skeleton */}
                <div className="space-y-4">
                    <Skeleton className="h-3 w-40" />
                    <div className="grid grid-cols-1 gap-3">
                        <div className="p-3 bg-white tech-border shadow-sm flex items-center gap-3">
                            <Skeleton className="h-8 w-8 rounded-sm" />
                            <div className="space-y-1">
                                <Skeleton className="h-3 w-24" />
                                <Skeleton className="h-2 w-32" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
