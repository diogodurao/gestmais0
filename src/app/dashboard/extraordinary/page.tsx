/**
 * Extraordinary Projects List Page
 * 
 * Route: /dashboard/extraordinary
 */

import { Suspense } from "react"
import { ExtraProjectsList } from "@/features/dashboard/ExtraordinaryProjects/ExtraProjectsList"
import { requireSession } from "@/lib/auth-helpers"
import { redirect } from "next/navigation"

export const metadata = {
    title: "Quotas Extraordinárias | GestMais",
    description: "Gestão de projetos e quotas extraordinárias",
}

export default async function ExtraordinaryProjectsPage() {
    // Get session and active building
    const session = await requireSession()
    
    if (!session.user.activeBuildingId) {
        redirect("/dashboard")
    }

    const buildingId = session.user.activeBuildingId

    return (
        <div className="p-4 md:p-6">
            <Suspense fallback={<ProjectsListSkeleton />}>
                <ExtraProjectsList buildingId={buildingId} />
            </Suspense>
        </div>
    )
}

function ProjectsListSkeleton() {
    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="h-8 w-48 bg-slate-200 rounded skeleton" />
                <div className="h-9 w-32 bg-slate-200 rounded skeleton" />
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="tech-border h-48 bg-slate-50 skeleton" />
                ))}
            </div>
        </div>
    )
}