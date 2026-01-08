import { requireSession } from "@/lib/session"
import { redirect } from "next/navigation"
import {
    getEvaluationStatus,
    getCurrentMonthAverages,
    getHistoricalAverages,
    getMonthEvaluations,
    getSubmissionStats,
} from "@/app/actions/evaluations"
import { ROUTES } from "@/lib/routes"
import { EvaluationPage } from "@/features/dashboard/evaluations/EvaluationPage"

export const dynamic = 'force-dynamic'

export default async function EvaluationsPage() {
    const session = await requireSession()
    const isManager = session.user.role === 'manager'

    const buildingId = isManager
        ? session.user.activeBuildingId
        : session.user.buildingId

    if (!buildingId) {
        redirect(ROUTES.DASHBOARD.HOME)
    }

    const status = await getEvaluationStatus(buildingId)
    const averages = await getCurrentMonthAverages(buildingId)
    const history = await getHistoricalAverages(buildingId, 6)

    // Manager-only data
    let evaluations
    let submissionStats

    if (isManager) {
        evaluations = await getMonthEvaluations(buildingId)
        // TODO: Get actual resident count from building
        const totalResidents = 20 // Replace with actual count
        submissionStats = await getSubmissionStats(buildingId, totalResidents)
    }

    return (
        <div className="p-4 md:p-6">
            <EvaluationPage
                buildingId={buildingId}
                status={status}
                averages={averages}
                history={history}
                evaluations={evaluations}
                submissionStats={submissionStats}
                isManager={isManager}
            />
        </div>
    )
}