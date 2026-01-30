import { Suspense } from "react"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { getInvitationByToken } from "@/lib/actions/invite"
import { getResidentInvitationByToken } from "@/lib/actions/resident-invitations"
import { InvitePageClient } from "./InvitePageClient"
import { ResidentInvitePageClient } from "./ResidentInvitePageClient"

interface InvitePageProps {
    params: Promise<{ token: string }>
}

export default function InvitePage({ params }: InvitePageProps) {
    return (
        <Suspense fallback={<InvitePageSkeleton />}>
            <InvitePageContent params={params} />
        </Suspense>
    )
}

async function InvitePageContent({ params }: InvitePageProps) {
    const { token } = await params

    // Polymorphic token lookup: try professional first, then resident
    const professionalResult = await getInvitationByToken(token)
    const residentResult = await getResidentInvitationByToken(token)

    // Get current session (optional)
    const session = await auth.api.getSession({
        headers: await headers()
    })

    // Determine which invitation type was found
    const professionalInvitation = professionalResult.success ? professionalResult.data : null
    const residentInvitation = residentResult.success ? residentResult.data : null

    if (!professionalInvitation && !residentInvitation) {
        return (
            <div className="min-h-screen bg-pearl flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-white rounded-lg border border-gray-200 p-6 text-center">
                    <h1 className="text-heading font-semibold text-gray-800 mb-2">
                        Convite Invalido
                    </h1>
                    <p className="text-body text-gray-600">
                        Este convite nao foi encontrado ou ja nao esta disponivel.
                    </p>
                </div>
            </div>
        )
    }

    const invitation = (professionalInvitation ?? residentInvitation)!

    // Check if expired
    const expiresAt = typeof invitation.expiresAt === 'string'
        ? new Date(invitation.expiresAt)
        : invitation.expiresAt
    const isExpired = new Date() > expiresAt

    // Check if already used
    const isUsed = invitation.status !== 'pending'

    if (isExpired || isUsed) {
        const message = isExpired
            ? "Este convite expirou. Peca ao gestor do edificio para enviar um novo convite."
            : `Este convite ja foi ${invitation.status === 'accepted' ? 'aceite' : 'cancelado'}.`

        return (
            <div className="min-h-screen bg-pearl flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-white rounded-lg border border-gray-200 p-6 text-center">
                    <h1 className="text-heading font-semibold text-gray-800 mb-2">
                        Convite Indisponivel
                    </h1>
                    <p className="text-body text-gray-600">
                        {message}
                    </p>
                </div>
            </div>
        )
    }

    // Render the appropriate client component
    if (professionalInvitation) {
        return (
            <InvitePageClient
                token={token}
                invitation={professionalInvitation}
                currentUserEmail={session?.user?.email || null}
                isLoggedIn={!!session?.user}
            />
        )
    }

    return (
        <ResidentInvitePageClient
            token={token}
            invitation={residentInvitation!}
        />
    )
}

function InvitePageSkeleton() {
    return (
        <div className="min-h-screen bg-pearl flex items-center justify-center p-4">
            <div className="max-w-lg w-full bg-white rounded-lg border border-gray-200 shadow-sm">
                <div className="p-6 border-b border-gray-200">
                    <div className="h-5 w-64 bg-gray-200 rounded animate-pulse mb-3" />
                    <div className="space-y-2">
                        <div className="h-4 w-48 bg-gray-100 rounded animate-pulse" />
                        <div className="h-4 w-40 bg-gray-100 rounded animate-pulse" />
                        <div className="h-4 w-36 bg-gray-100 rounded animate-pulse" />
                    </div>
                </div>
                <div className="p-6 space-y-3">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="h-9 bg-gray-100 rounded animate-pulse" />
                    ))}
                </div>
            </div>
        </div>
    )
}
