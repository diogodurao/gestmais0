import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { db } from "@/db"
import { managerBuildings } from "@/db/schema"
import { eq, and } from "drizzle-orm"
import { ROUTES } from "@/lib/routes"
import { CollaboratorsPageClient } from "./CollaboratorsPageClient"
import {
    getBuildingCollaborators,
    getBuildingPendingInvitations,
    getEligibleResidentsForInvitation
} from "@/lib/actions/collaborators"

export default async function CollaboratorsPage() {
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

    // Check if user is an owner of this building
    const access = await db.query.managerBuildings.findFirst({
        where: and(
            eq(managerBuildings.buildingId, buildingId),
            eq(managerBuildings.managerId, session.user.id)
        )
    })

    if (!access) {
        return redirect(ROUTES.DASHBOARD.HOME)
    }

    const isOwner = access.role === 'owner'

    // Fetch data
    const [collaboratorsResult, pendingResult, eligibleResult] = await Promise.all([
        getBuildingCollaborators(buildingId),
        isOwner ? getBuildingPendingInvitations(buildingId) : Promise.resolve({ success: true, data: [] }),
        isOwner ? getEligibleResidentsForInvitation(buildingId) : Promise.resolve({ success: true, data: [] }),
    ])

    const collaborators = collaboratorsResult.success ? collaboratorsResult.data : []
    const pendingInvitations = pendingResult.success ? pendingResult.data : []
    const eligibleResidents = eligibleResult.success ? eligibleResult.data : []

    return (
        <CollaboratorsPageClient
            buildingId={buildingId}
            isOwner={isOwner}
            collaborators={collaborators}
            pendingInvitations={pendingInvitations}
            eligibleResidents={eligibleResidents}
        />
    )
}
