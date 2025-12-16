import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { Sidebar } from "@/components/layout/Sidebar"

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth.api.getSession({
        headers: await headers()
    })

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Sidebar */}
            <Sidebar userRole={session?.user.role || "resident"} />

            {/* Main Content */}
            <main className="flex-1 min-w-0"> {/* min-w-0 prevents flex overflow issues */}
                <div className="p-4 lg:p-8 max-w-7xl mx-auto mt-14 lg:mt-0">
                    {children}
                </div>
            </main>
        </div>
    );
}
