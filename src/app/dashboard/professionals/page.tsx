import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { db } from "@/db"
import { managerBuildings } from "@/db/schema"
import { eq, and } from "drizzle-orm"
import { ROUTES } from "@/lib/routes"
import { ProfessionalsPageClient } from "./ProfessionalsPageClient"
import {
    getBuildingProfessionals,
    getBuildingPendingProfessionalInvitations
} from "@/lib/actions/professionals"

export default async function ProfessionalsPage() {
    const session = await auth.api.getSession({
        headers: await headers()
    })

    if (!session) {
        return redirect("/sign-in")
    }

    // Only managers can access this page
    if (session.user.role !== 'manager') {
        return redirect(ROUTES.DASHBOARD.HOME)
    }

    const buildingId = session.user.activeBuildingId
    if (!buildingId) {
        return redirect(ROUTES.DASHBOARD.HOME)
    }

    // Verify building access
    const access = await db.query.managerBuildings.findFirst({
        where: and(
            eq(managerBuildings.buildingId, buildingId),
            eq(managerBuildings.managerId, session.user.id)
        )
    })

    if (!access) {
        return redirect(ROUTES.DASHBOARD.HOME)
    }

    // Fetch data
    const [professionalsResult, pendingResult] = await Promise.all([
        getBuildingProfessionals(buildingId),
        getBuildingPendingProfessionalInvitations(buildingId),
    ])

    const professionals = professionalsResult.success ? professionalsResult.data : []
    const pendingInvitations = pendingResult.success ? pendingResult.data : []

    return (
        <ProfessionalsPageClient
            buildingId={buildingId}
            professionals={professionals}
            pendingInvitations={pendingInvitations}
        />
    )
}
