import { Suspense } from "react"
import { requireSession } from "@/lib/auth-helpers"
import { redirect } from "next/navigation"
import { CalendarView } from "@/components/dashboard/calendar/CalendarView"
import { ROUTES } from "@/lib/routes"
import { getCachedCalendarEvents } from "@/lib/cache/dashboard.cache"

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

    return (
        <div className="flex-1 overflow-y-auto p-1.5">
            <Suspense fallback={<CalendarSkeleton />}>
                <CalendarContent
                    buildingId={buildingId}
                    year={now.getFullYear()}
                    month={now.getMonth() + 1}
                    readOnly={!isManager}
                />
            </Suspense>
        </div>
    )
}

async function CalendarContent({
    buildingId,
    year,
    month,
    readOnly,
}: {
    buildingId: string
    year: number
    month: number
    readOnly: boolean
}) {
    const events = await getCachedCalendarEvents(buildingId, year, month)

    return (
        <CalendarView
            buildingId={buildingId}
            initialEvents={events}
            initialYear={year}
            initialMonth={month}
            readOnly={readOnly}
        />
    )
}

function CalendarSkeleton() {
    return (
        <div className="p-4">
            <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-4" />
            <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: 35 }).map((_, i) => (
                    <div key={i} className="h-24 bg-gray-100 rounded animate-pulse" />
                ))}
            </div>
        </div>
    )
}