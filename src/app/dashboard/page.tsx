import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { isManager } from "@/lib/permissions";
import type { SessionUser } from "@/lib/types";
import { ManagerDashboard } from "@/components/dashboard/ManagerDashboard";
import { ResidentDashboard } from "@/components/dashboard/ResidentDashboard";

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session) {
        return redirect("/sign-in");
    }

    // Cast session user for type safety
    const sessionUser = session.user as unknown as SessionUser

    if (isManager(sessionUser)) {
        return <ManagerDashboard session={session as any} />
    }

    return <ResidentDashboard session={session as any} />
}
