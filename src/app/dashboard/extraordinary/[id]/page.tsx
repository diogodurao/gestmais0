/**
 * Extraordinary Project Detail Page
 * * Route: /dashboard/extraordinary/[id]
 */

import { Suspense } from "react"
import { notFound } from "next/navigation"
import { ExtraProjectDetail } from "@/components/dashboard/extraordinary-projects/ExtraProjectDetail"
import { requireSession } from "@/lib/auth-helpers"
import { getExtraordinaryProjectDetail } from "@/lib/actions/extraordinary-projects"

export const metadata = {
    title: "Projeto Extraordinário | GestMais",
    description: "Detalhes do projeto e mapa de pagamentos",
}

interface PageProps {
    params: Promise<{
        id: string
    }>
}

export default async function ExtraordinaryProjectDetailPage({ params }: PageProps) {
    const { id } = await params
    const projectId = parseInt(id, 10)

    if (isNaN(projectId)) {
        notFound()
    }

    // 1. Fetch Data on the Server
    // This runs on the backend, so it's fast and SEO friendly
    const [session, projectResponse] = await Promise.all([
        requireSession(),
        getExtraordinaryProjectDetail(projectId)
    ])

    // 2. Handle 404 / Errors
    if (!projectResponse.success || !projectResponse.data) {
        notFound()
    }

    const isManager = session.user.role === 'manager'

    return (
        <div className="p-4 md:p-6">
            <Suspense fallback={<ProjectDetailSkeleton />}>
                {/* 3. Pass the data directly to the client component */}
                <ExtraProjectDetail
                    initialProject={projectResponse.data}
                    readOnly={!isManager}
                />
            </Suspense>
        </div>
    )
}

function ProjectDetailSkeleton() {
    return (
        <div className="space-y-4">
            <div className="tech-border bg-white p-4">
                <div className="flex items-start gap-4">
                    <div className="w-9 h-9 bg-slate-200 animate-pulse rounded" />
                    <div>
                        <div className="h-6 w-48 bg-slate-200 animate-pulse rounded" />
                        <div className="h-3 w-24 bg-slate-100 animate-pulse rounded mt-2" />
                    </div>
                </div>
            </div>
            <div className="grid grid-cols-4 gap-3">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="tech-border p-3">
                        <div className="h-3 w-20 bg-slate-200 skeleton" />
                        <div className="h-6 w-24 bg-slate-200 skeleton mt-2" />
                    </div>
                ))}
            </div>

            <div className="tech-border bg-white p-4">
                <div className="h-96 bg-slate-100 skeleton" />
            </div>
        </div>
    )
}