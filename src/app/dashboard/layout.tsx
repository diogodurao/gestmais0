import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { Sidebar } from "@/components/layout/Sidebar"
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
    const initialData = await getDashboardContext(session)

    return (
        <DashboardProvider initialData={initialData}>
            <SidebarProvider>
                <div className="h-screen bg-slate-100 flex flex-col overflow-hidden">
                    {/* Header - now reads from context */}
                    <DashboardHeader />

                    <div className="flex flex-1 overflow-hidden">
                        {/* Sidebar - now reads from context */}
                        <Sidebar />

                        {/* Main Content */}
                        <main className="flex-1 overflow-y-auto bg-slate-100 border-l border-slate-300 p-4 lg:p-6 flex flex-col">
                            {children}
                        </main>
                    </div>
                </div>
            </SidebarProvider>
        </DashboardProvider>
    );
}
