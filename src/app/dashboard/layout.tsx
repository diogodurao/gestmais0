import { Suspense } from "react"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { Sidebar } from "@/components/layout/Sidebar"
import { Header} from "@/components/layout/Header"
import { MobileNav } from "@/components/layout/MobileNav"
import { SidebarProvider } from "@/components/layout/SidebarProvider"
import { getDashboardContext } from "@/lib/actions/dashboard"
import { DashboardProvider } from "@/contexts/DashboardContext"
import { DashboardSkeleton } from "@/components/performance/DashboardSkeleton"

export default async function DashboardLayout({
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
                            <Suspense fallback={<DashboardSkeleton />}>
                                {children}
                            </Suspense>
                        </main>
                    </div>
                </div>
            </SidebarProvider>
        </DashboardProvider>
    );
}