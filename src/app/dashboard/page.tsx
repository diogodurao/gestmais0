import { Suspense } from "react";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { isManager } from "@/lib/permissions";
import type { SessionUser } from "@/lib/types";
import { ManagerDashboard } from "@/components/dashboard/ManagerDashboard";
import { ResidentDashboard } from "@/components/dashboard/ResidentDashboard";

export default async function DashboardPage() {
    return (
        <Suspense fallback={<DashboardSkeleton />}>
            <DashboardContent />
        </Suspense>
    );
}

async function DashboardContent() {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session) {
        return redirect("/sign-in");
    }

    // Cast session user for type safety
    const sessionUser = session.user as unknown as SessionUser

    if (isManager(sessionUser)) {
        return <ManagerDashboard session={session as any} />
    }

    return <ResidentDashboard session={session as any} />
}

function DashboardSkeleton() {
    return (
        <div className="p-4 md:p-6 space-y-6">
            <div className="h-8 w-64 bg-gray-200 rounded animate-pulse" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map(i => (
                    <div key={i} className="h-24 bg-gray-100 rounded-lg animate-pulse" />
                ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="h-64 bg-gray-100 rounded-lg animate-pulse" />
                <div className="h-64 bg-gray-100 rounded-lg animate-pulse" />
            </div>
        </div>
    );
}
