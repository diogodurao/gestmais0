import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getOrCreateManagerBuilding, getBuildingResidents, getResidentApartment, getUnclaimedApartments, getBuildingApartments } from "@/app/actions/building";
import { getApartmentDisplayName } from "@/lib/utils";
import { isProfileComplete, isBuildingComplete, isUnitsComplete } from "@/lib/validations";
import { isManager, isResident, can, features } from "@/lib/permissions";
import type { SessionUser } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { ResidentOnboardingFlow } from "@/features/dashboard/onboarding/ResidentOnboardingFlow";
import { ManagerOnboardingFlow } from "@/features/dashboard/onboarding/ManagerOnboardingFlow";
import { ResidentsList } from "@/features/dashboard/residents/ResidentsList";
import { SubscriptionSyncWrapper } from "@/features/dashboard/subscription/SubscriptionSyncWrapper";
import { PaymentStatusCard } from "@/features/dashboard/payments-quotas/PaymentStatusCard";
import { InviteCodePanel } from "@/features/dashboard/overview/InviteCodePanel";
import { SystemStatusPanel } from "@/features/dashboard/overview/SystemStatusPanel";
import { BuildingMetricsPanel } from "@/features/dashboard/overview/BuildingMetricsPanel";
import { Activity, Lock } from "lucide-react";

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

    // --- MANAGER LOGIC ---
    let buildingInfo = null;
    let buildingCode = "N/A";
    let residents: Array<{ user: { id: string; name: string; email: string }; apartment: { id: number; unit: string } | null }> = [];
    let unclaimedUnits: Array<{ id: number; unit: string }> = [];

    if (isManager(sessionUser)) {
        try {
            const building = await getOrCreateManagerBuilding();
            buildingInfo = building;
            buildingCode = building.code;

            const apartmentsData = await getBuildingApartments(building.id);

            // Check if onboarding is complete
            const profileDone = isProfileComplete(session.user)
            const buildingDone = isBuildingComplete(building)
            const unitsDone = isUnitsComplete(
                building.totalApartments,
                apartmentsData
            )

            if (!profileDone || !buildingDone || !unitsDone) {
                const initialStep = !profileDone ? 'personal' : !buildingDone ? 'building' : 'units'
                return (
                    <ManagerOnboardingFlow
                        user={{
                            id: session.user.id,
                            name: session.user.name,
                            email: session.user.email,
                            nif: session.user.nif || null,
                            iban: session.user.iban || null
                        }}
                        building={building}
                        apartments={apartmentsData.map(a => ({
                            id: a.apartment.id,
                            unit: a.apartment.unit,
                            permillage: a.apartment.permillage || 0
                        }))}
                        initialStep={initialStep}
                    />
                )
            }

            residents = await getBuildingResidents(building.id);
            unclaimedUnits = await getUnclaimedApartments(building.id);
        } catch (e) {
            console.error("Failed to load building", e);
        }
    }

    // --- RESIDENT LOGIC ---
    let residentBuildingInfo = null;
    let residentApartment = null;

    if (isResident(sessionUser)) {
        const hasBuildingId = !!session.user.buildingId
        const hasIban = !!session.user.iban

        try {
            residentApartment = await getResidentApartment()
            const hasApartment = !!residentApartment

            // Check if onboarding is complete
            if (!hasBuildingId || !hasApartment || !hasIban) {
                const initialStep = !hasBuildingId ? 'join' : !hasApartment ? 'claim' : 'iban'
                const unclaimed = hasBuildingId ? await getUnclaimedApartments(session.user.buildingId!) : []

                return (
                    <ResidentOnboardingFlow
                        user={{
                            id: session.user.id,
                            name: session.user.name,
                            email: session.user.email,
                            buildingId: session.user.buildingId,
                            nif: session.user.nif || null,
                            iban: session.user.iban || null
                        }}
                        initialStep={initialStep}
                        unclaimedApartments={unclaimed}
                    />
                )
            }

            // If HAS everything, load details
            const { getResidentBuildingDetails } = await import("@/app/actions/building");
            residentBuildingInfo = await getResidentBuildingDetails(session.user.buildingId!);
        } catch (error) {
            console.error("Failed check resident status", error)
        }
    }

    return (
        <div className="space-y-6">
            {/* Subscription Sync Handler - only for managers */}
            {isManager(sessionUser) && buildingInfo && (
                <SubscriptionSyncWrapper buildingId={buildingInfo.id} />
            )}

            {/* Payment Status Card - For both Resident and Manager */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    {/* 1. Personal Status (Resident perspective) */}
                    <PaymentStatusCard key="personal-status" userId={session.user.id} />

                    {/* 2. Building Status (Manager perspective) */}
                    {isManager(sessionUser) && buildingInfo && (
                        <PaymentStatusCard key="building-status" buildingId={buildingInfo.id} />
                    )}
                </div>
                <div className="lg:col-span-1 hidden lg:block">
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                {/* 1. Invite Code / Welcome Panel */}
                <div className="col-span-1">
                    <InviteCodePanel
                        isManager={isManager(sessionUser)}
                        sessionUser={sessionUser}
                        buildingInfo={buildingInfo}
                        buildingCode={buildingCode}
                        residentApartment={residentApartment}
                    />
                </div>

                {/* 2. System / Status Panel */}
                <div className="col-span-1">
                    <SystemStatusPanel sessionUser={sessionUser} />
                </div>

                {/* 3. Metrics / Building Panel */}
                <div className="col-span-1">
                    <BuildingMetricsPanel
                        isManager={isManager(sessionUser)}
                        residents={residents}
                        unclaimedUnits={unclaimedUnits}
                        residentBuildingInfo={residentBuildingInfo}
                        // If we had total apartments in buildingInfo, we'd pass it here
                        totalApartments={buildingInfo?.totalApartments ?? undefined}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Manager: Residents Registry - Protected by Subscription */}
                {can.manageResidents(sessionUser, buildingInfo) && (
                    <div className="lg:col-span-2">
                        <ResidentsList
                            residents={residents}
                            buildingId={buildingInfo?.id || ""}
                            unclaimedUnits={unclaimedUnits}
                        />
                    </div>
                )}

                {features.isResidentManagementLocked(sessionUser, buildingInfo) && (
                    <Card className="col-span-full">
                        <CardHeader>
                            <CardTitle>
                                <Lock className="w-3.5 h-3.5" />
                                Gestão de residentes bloqueada
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-col items-center justify-center p-12 bg-slate-50 tech-border border-dashed text-center h-[300px]">
                                <div className="p-4 bg-slate-200 rounded-full mb-4">
                                    <Lock className="w-6 h-6 text-slate-500" />
                                </div>
                                <h3 className="font-bold text-slate-900 uppercase text-sm mb-1">Subscrição necessária</h3>
                                <p className="text-xs text-slate-500 mb-6 uppercase tracking-tight">Subscreva para gerir residentes e registos financeiros.</p>
                                <a href="/dashboard/settings?tab=payments" className="px-6 py-2 bg-slate-900 text-white text-xs font-bold uppercase rounded-sm hover:bg-slate-800 transition-colors">
                                    Subscrever
                                </a>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}
