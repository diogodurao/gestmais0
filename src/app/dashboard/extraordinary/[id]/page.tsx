/**
 * Extraordinary Project Detail Page
 * 
 * Route: /dashboard/extraordinary/[id]
 */

import { Suspense } from "react"
import { notFound } from "next/navigation"
import { ExtraProjectDetail } from "@/features/dashboard/ExtraordinaryProjects/ExtraProjectDetail"
import { requireSession } from "@/lib/auth-helpers"

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

    await requireSession()

    return (
        <div className="p-4 md:p-6">
            <Suspense fallback={<ProjectDetailSkeleton />}>
                <ExtraProjectDetail projectId={projectId} />
            </Suspense>
        </div>
    )
}

function ProjectDetailSkeleton() {
    return (
        <div className="space-y-4">
            <div className="tech-border bg-white p-4">
                <div className="flex items-start gap-4">
                    <div className="w-9 h-9 bg-slate-200 skeleton" />
                    <div>
                        <div className="h-6 w-48 bg-slate-200 skeleton" />
                        <div className="h-3 w-24 bg-slate-100 skeleton mt-2" />
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