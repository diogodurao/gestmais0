import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { ROUTES } from "@/lib/routes"
import { InvitationsPageClient } from "./InvitationsPageClient"
import { getMyPendingInvitations } from "@/lib/actions/collaborators"

export default async function InvitationsPage() {
    const session = await auth.api.getSession({
        headers: await headers()
    })

    if (!session) {
        return redirect("/sign-in")
    }

    // Fetch pending invitations for this user
    const result = await getMyPendingInvitations()
    const invitations = result.success ? result.data : []

    // Get token from URL if present (for direct link from email)
    // This will be handled client-side

    return (
        <InvitationsPageClient
            invitations={invitations}
        />
    )
}
