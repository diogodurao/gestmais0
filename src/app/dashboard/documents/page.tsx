import { Suspense } from "react"
import { requireSession } from "@/lib/auth-helpers"
import { redirect } from "next/navigation"
import { ROUTES } from "@/lib/routes"
import { DocumentsList } from "@/components/dashboard/documents/DocumentsList"
import { getCachedDocuments } from "@/lib/cache/dashboard.cache"

export default async function DocumentsPage() {
    const session = await requireSession()
    const isManager = session.user.role === 'manager'

    const buildingId = isManager
        ? session.user.activeBuildingId
        : session.user.buildingId

    if (!buildingId) {
        redirect(ROUTES.DASHBOARD.HOME)
    }

    return (
        <div className="p-4 md:p-6">
            <Suspense fallback={<DocumentsListSkeleton />}>
                <DocumentsContent buildingId={buildingId} isManager={isManager} />
            </Suspense>
        </div>
    )
}

async function DocumentsContent({
    buildingId,
    isManager,
}: {
    buildingId: string
    isManager: boolean
}) {
    const documents = await getCachedDocuments(buildingId)

    return (
        <DocumentsList
            buildingId={buildingId}
            documents={documents}
            isManager={isManager}
        />
    )
}

function DocumentsListSkeleton() {
    return (
        <div className="space-y-4">
            <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
            <div className="flex gap-2 mb-4">
                {[1, 2, 3, 4].map(i => (
                    <div key={i} className="h-8 w-24 bg-gray-100 rounded animate-pulse" />
                ))}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3, 4, 5, 6].map(i => (
                    <div key={i} className="h-32 bg-gray-100 rounded-lg animate-pulse" />
                ))}
            </div>
        </div>
    )
}