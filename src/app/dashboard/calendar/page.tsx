import { requireSession } from "@/lib/auth-helpers"
import { redirect } from "next/navigation"
import { getCalendarEvents } from "@/lib/actions/calendar"
import { CalendarView } from "@/components/dashboard/calendar/CalendarView"
import { ROUTES } from "@/lib/routes"

export const dynamic = 'force-dynamic'

export default async function CalendarPage() {
    const session = await requireSession()
    const isManager = session.user.role === 'manager'

    const buildingId = isManager
        ? session.user.activeBuildingId
        : session.user.buildingId

    if (!buildingId) {
        redirect(ROUTES.DASHBOARD.HOME)
    }

    const now = new Date()
    const events = await getCalendarEvents(buildingId, now.getFullYear(), now.getMonth() + 1)

    return (
        <div className="flex-1 overflow-y-auto p-1.5">
            <CalendarView
                buildingId={buildingId}
                initialEvents={events}
                initialYear={now.getFullYear()}
                initialMonth={now.getMonth() + 1}
                readOnly={!isManager}
            />
        </div>
    )
}