import { requireSession } from "@/lib/session"
import { redirect } from "next/navigation"
import { getDocuments } from "@/lib/actions/documents"
import { ROUTES } from "@/lib/routes"
import { DocumentsList } from "@/components/dashboard/documents/DocumentsList"

export const dynamic = 'force-dynamic'

export default async function DocumentsPage() {
    const session = await requireSession()
    const isManager = session.user.role === 'manager'

    const buildingId = isManager
        ? session.user.activeBuildingId
        : session.user.buildingId

    if (!buildingId) {
        redirect(ROUTES.DASHBOARD.HOME)
    }

    const documents = await getDocuments(buildingId)

    return (
        <div className="p-4 md:p-6">
            <DocumentsList
                buildingId={buildingId}
                documents={documents}
                isManager={isManager}
            />
        </div>
    )
}