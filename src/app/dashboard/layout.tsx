import { Suspense } from "react"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { Sidebar } from "@/components/layout/Sidebar"
import { Header } from "@/components/layout/Header"
import { MobileNav } from "@/components/layout/MobileNav"
import { SidebarProvider } from "@/components/layout/SidebarProvider"
import { getDashboardContext } from "@/lib/actions/dashboard"
import { DashboardProvider } from "@/contexts/DashboardContext"
import { DashboardSkeleton } from "@/components/performance/DashboardSkeleton"

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <Suspense fallback={<DashboardLayoutSkeleton />}>
            <DashboardLayoutContent>{children}</DashboardLayoutContent>
        </Suspense>
    );
}

async function DashboardLayoutContent({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth.api.getSession({
        headers: await headers()
    })

    // Fetch context data (user, building, etc.)
    const initialData = await getDashboardContext(session as any)

    return (
        <DashboardProvider initialData={initialData}>
            <SidebarProvider>
                <div className="h-screen w-screen overflow-hidden bg-white p-1.5 flex gap-1.5">
                    <MobileNav />
                    <Sidebar />
                    <div className="flex flex-1 flex-col gap-1.5 min-w-0 overflow-hidden">
                        <Header />
                        <main className="flex-1 overflow-y-auto rounded-lg border border-gray-200 bg-white p-1.5 relative shadow-sm">
                            {children}
                        </main>
                    </div>
                </div>
            </SidebarProvider>
        </DashboardProvider>
    );
}

function DashboardLayoutSkeleton() {
    return (
        <div className="h-screen w-screen overflow-hidden bg-white p-1.5 flex gap-1.5">
            {/* Sidebar skeleton */}
            <div className="hidden md:flex w-64 flex-col gap-2 p-3 bg-gray-50 rounded-lg">
                <div className="h-10 w-32 bg-gray-200 rounded animate-pulse" />
                <div className="space-y-2 mt-4">
                    {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} className="h-10 bg-gray-200 rounded animate-pulse" />
                    ))}
                </div>
            </div>
            {/* Main content skeleton */}
            <div className="flex flex-1 flex-col gap-1.5 min-w-0 overflow-hidden">
                {/* Header skeleton */}
                <div className="h-14 bg-gray-50 rounded-lg flex items-center px-4">
                    <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
                </div>
                {/* Content skeleton */}
                <main className="flex-1 overflow-y-auto rounded-lg border border-gray-200 bg-white p-4">
                    <DashboardSkeleton />
                </main>
            </div>
        </div>
    );
}