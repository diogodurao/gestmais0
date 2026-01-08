import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { Sidebar } from "@/components/layout/Sidebar"
import { MobileNav } from "@/components/layout/MobileNav"
import { DashboardHeader } from "@/components/layout/DashboardHeader"
import { SidebarProvider } from "@/components/layout/SidebarProvider"
import { getDashboardContext } from "@/app/actions/dashboard"
import { DashboardProvider } from "@/contexts/DashboardContext"

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth.api.getSession({
        headers: await headers()
    })

    // Fetch ONCE, pass to context
    const initialData = await getDashboardContext(session as any)

    return (
        <DashboardProvider initialData={initialData}>
            <SidebarProvider>
                <div className="h-screen bg-white flex flex-col overflow-hidden p-1.5">
                    {/* Mobile Navigation Drawer */}
                    <MobileNav />

                    {/* Header */}
                    <DashboardHeader />

                    <div className="flex flex-1 gap-1.5 overflow-hidden mt-1.5">
                        {/* Desktop Sidebar */}
                        <Sidebar />

                        {/* Main Content */}
                        <main className="flex-1 overflow-y-auto rounded-lg border border-[#E9ECEF] bg-white p-1.5 flex flex-col">
                            {children}
                        </main>
                    </div>
                </div>
            </SidebarProvider>
        </DashboardProvider>
    );
}
