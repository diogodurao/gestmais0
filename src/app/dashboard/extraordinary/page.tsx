/**
 * Extraordinary Projects Page
 * 
 * Route: /dashboard/extraordinary
 * 
 * Shows different views based on user role:
 * - Manager: List of all projects for the building with management options
 * - Resident: Personal payment obligations across all projects
 */

import { Suspense } from "react"
import { ExtraProjectsList } from "@/features/dashboard/ExtraordinaryProjects/ExtraProjectsList"
import { ResidentExtraPayments } from "@/features/dashboard/ExtraordinaryProjects/ResidentExtraPayments"
import { requireSession } from "@/lib/auth-helpers"
import { redirect } from "next/navigation"
import { getResidentApartment } from "@/app/actions/building"

export const metadata = {
    title: "Quotas Extraordinárias | GestMais",
    description: "Gestão de projetos e quotas extraordinárias",
}

export default async function ExtraordinaryProjectsPage() {
    const session = await requireSession()
    const isManager = session.user.role === 'manager'
    
    // Manager view
    if (isManager) {
        if (!session.user.activeBuildingId) {
            redirect("/dashboard")
        }
        
        return (
            <div className="p-4 md:p-6">
                <Suspense fallback={<ProjectsListSkeleton />}>
                    <ExtraProjectsList buildingId={session.user.activeBuildingId} />
                </Suspense>
            </div>
        )
    }
    
    // Resident view
    if (!session.user.buildingId) {
        redirect("/dashboard")
    }
    
    // Check if resident has completed setup
    const apartment = await getResidentApartment(session.user.id)
    if (!apartment) {
        redirect("/dashboard")
    }

    return (
        <div className="p-4 md:p-6">
            <Suspense fallback={<ResidentPaymentsSkeleton />}>
                <ResidentExtraPayments userId={session.user.id} />
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

function ResidentPaymentsSkeleton() {
    return (
        <div className="space-y-4">
            <div className="h-8 w-56 bg-slate-200 rounded skeleton" />
            <div className="h-4 w-72 bg-slate-100 rounded skeleton" />
            <div className="space-y-4 mt-6">
                {[1, 2].map((i) => (
                    <div key={i} className="tech-border bg-white p-4">
                        <div className="h-6 w-48 bg-slate-200 skeleton mb-4" />
                        <div className="h-20 bg-slate-100 skeleton" />
                    </div>
                ))}
            </div>
        </div>
    )
}