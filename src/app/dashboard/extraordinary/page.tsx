/**
 * Extraordinary Projects Page
 * 
 * Route: /dashboard/extraordinary
 * 
 * Shows building-wide projects for both Managers and Residents.
 * Residents see it in read-only mode.
 */

import { Suspense } from "react"
import { ExtraProjectsList } from "@/components/dashboard/extraordinary-projects/ExtraProjectsList"
import { requireSession } from "@/lib/session"
import { redirect } from "next/navigation"
import { getResidentApartment, getBuildingApartments } from "@/components/dashboard/settings/actions"
import { ROUTES } from "@/lib/routes"

export const metadata = {
    title: "Quotas Extraordinárias | GestMais",
    description: "Gestão de projetos e quotas extraordinárias",
}

export default async function ExtraordinaryProjectsPage() {
    const session = await requireSession()
    const isManager = session.user.role === 'manager'

    // Check for building association
    const buildingId = isManager ? session.user.activeBuildingId : session.user.buildingId

    if (!buildingId) {
        redirect(ROUTES.DASHBOARD.HOME)
    }

    // For residents, check if they have an apartment
    if (!isManager) {
        const apartment = await getResidentApartment()
        if (!apartment) {
            redirect(ROUTES.DASHBOARD.HOME)
        }
    }

    const rawApartments = isManager ? await getBuildingApartments(buildingId) : []
    const apartments = rawApartments.map(a => ({
        id: a.apartment.id,
        unit: a.apartment.unit,
        permillage: a.apartment.permillage || 0
    }))

    return (
        <div className="p-4 md:p-6">
            <Suspense fallback={<ProjectsListSkeleton />}>
                <ExtraProjectsList
                    buildingId={buildingId}
                    apartments={apartments}
                    readOnly={!isManager}
                />
            </Suspense>
        </div>
    )
}

function ProjectsListSkeleton() {
    return (
        <div className="space-y-4">
            <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                    <div className="h-6 w-48 bg-slate-200 rounded skeleton" />
                    <div className="h-4 w-64 bg-slate-100 rounded mt-1 skeleton" />
                </div>
            </header>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="tech-border bg-white">
                        <div className="p-4 border-b border-slate-100">
                            <div className="h-5 w-3/4 bg-slate-200 rounded skeleton" />
                        </div>
                        <div className="p-4">
                            <div className="h-8 w-32 bg-slate-200 rounded skeleton mb-3" />
                            <div className="h-2 w-full bg-slate-200 rounded skeleton" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
