import { getOrCreateManagerBuilding, getBuildingResidents, getUnclaimedApartments, getBuildingApartments } from "@/lib/actions/building";
import { isProfileComplete, isBuildingComplete, isUnitsComplete } from "@/lib/validations";
import { features, can } from "@/lib/permissions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { ManagerOnboardingFlow } from "@/components/dashboard/onboarding/ManagerOnboardingFlow";
import { ResidentsList } from "@/components/dashboard/residents/ResidentsList";
import { SubscriptionSyncWrapper } from "@/components/dashboard/subscription/SubscriptionSyncWrapper";
import { PaymentStatusCard } from "@/components/dashboard/payments-quotas/PaymentStatusCard";
import { InviteCodePanel } from "@/components/dashboard/overview/InviteCodePanel";
import { SystemStatusPanel } from "@/components/dashboard/overview/SystemStatusPanel";
import { BuildingMetricsPanel } from "@/components/dashboard/overview/BuildingMetricsPanel";
import { getEvaluationStatus } from "@/lib/actions/evaluations";
import { EvaluationWidget } from "@/components/dashboard/evaluations/EvaluationWidget";
import { Lock } from "lucide-react";
import { getNotifications } from "@/lib/actions/notification";
import { NotificationCard } from "@/components/dashboard/notifications/NotificationCard";
import type { SessionUser } from "@/lib/types";

interface ManagerDashboardProps {
    session: { user: SessionUser };
}

export async function ManagerDashboard({ session }: ManagerDashboardProps) {
    const sessionUser = session.user;

    let buildingInfo = null;
    let buildingCode = "N/A";
    let residents: Array<{ user: { id: string; name: string; email: string }; apartment: { id: number; unit: string } | null }> = [];
    let unclaimedUnits: Array<{ id: number; unit: string }> = [];
    const notifications = await getNotifications(5);

    let apartmentsData: Awaited<ReturnType<typeof getBuildingApartments>> = []; // Store for onboarding check
    let evaluationStatus = null;

    try {
        const building = await getOrCreateManagerBuilding();
        buildingInfo = building;
        buildingCode = building.code;

        const evaluationStatusResult = await getEvaluationStatus(building.id);
        evaluationStatus = evaluationStatusResult;

        apartmentsData = await getBuildingApartments(building.id);

        // Check if manager has claimed a unit
        // We need to check if the valid apartments list contains one assigned to the current user
        const managerApt = apartmentsData.find(a => a.resident?.id === session.user.id);
        const currentManagerUnitId = managerApt ? managerApt.apartment.id : null;
        const claimDone = !!currentManagerUnitId;

        // Check if onboarding is complete
        const profileDone = isProfileComplete(session.user);
        const buildingDone = isBuildingComplete(building);
        const unitsDone = isUnitsComplete(
            building.totalApartments,
            apartmentsData
        );

        if (!profileDone || !buildingDone || !unitsDone || !claimDone) {
            const initialStep = !profileDone ? 'personal' : !buildingDone ? 'building' : !unitsDone ? 'units' : 'claim';
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
                    currentManagerUnitId={currentManagerUnitId}
                />
            );
        }

        residents = await getBuildingResidents(building.id);
        unclaimedUnits = await getUnclaimedApartments(building.id);
    } catch (e) {
        console.error("Failed to load building", e);
    }

    return (
        <div className="space-y-1.5">
            {/* Subscription Sync Handler */}
            {buildingInfo && (
                <SubscriptionSyncWrapper buildingId={buildingInfo.id} />
            )}

            {/* Stats row */}
            <div className="grid grid-cols-2 gap-1.5 lg:grid-cols-3">
                <PaymentStatusCard key="personal-status" userId={session.user.id} />
                {buildingInfo && (
                    <PaymentStatusCard key="building-status" buildingId={buildingInfo.id} />
                )}
                {evaluationStatus && <EvaluationWidget status={evaluationStatus} />}
            </div>

            {/* Main Content Grid - 3 columns */}
            <div className="grid gap-1.5 lg:grid-cols-3">
                {/* Left Column - Residents (col-span-2) */}
                <div className="lg:col-span-2 space-y-1.5">
                    {can.manageResidents(sessionUser, buildingInfo) && (
                        <ResidentsList
                            residents={residents}
                            buildingId={buildingInfo?.id || ""}
                            unclaimedUnits={unclaimedUnits}
                        />
                    )}

                    {features.isResidentManagementLocked(sessionUser, buildingInfo) && (
                        <Card>
                            <CardHeader>
                                <CardTitle>
                                    <Lock className="w-4 h-4" />
                                    Gestão de residentes bloqueada
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-col items-center justify-center p-6 bg-[#F8F9FA] border-2 border-dashed border-[#E9ECEF] rounded-lg text-center">
                                    <div className="p-3 bg-[#E9ECEF] rounded-full mb-3">
                                        <Lock className="w-5 h-5 text-[#8E9AAF]" />
                                    </div>
                                    <h3 className="font-medium text-[#495057] text-[11px] uppercase mb-1">Subscrição necessária</h3>
                                    <p className="text-[10px] text-[#8E9AAF] mb-4">Subscreva para gerir residentes e registos financeiros.</p>
                                    <a href="/dashboard/settings?tab=payments" className="px-4 py-1.5 bg-[#343A40] text-white text-[10px] font-medium rounded hover:bg-[#495057] transition-colors">
                                        Subscrever
                                    </a>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    <NotificationCard notifications={notifications} />
                </div>

                {/* Right Column - Panels */}
                <div className="space-y-1.5">
                    <InviteCodePanel
                        isManager={true}
                        sessionUser={sessionUser}
                        buildingInfo={buildingInfo}
                        buildingCode={buildingCode}
                        residentApartment={null}
                    />
                    <SystemStatusPanel subscriptionStatus={buildingInfo?.subscriptionStatus} />
                    <BuildingMetricsPanel
                        isManager={true}
                        residents={residents}
                        unclaimedUnits={unclaimedUnits}
                        residentBuildingInfo={null}
                        totalApartments={buildingInfo?.totalApartments ?? undefined}
                    />
                </div>
            </div>
        </div>
    );
}
