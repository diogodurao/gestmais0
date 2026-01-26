import { getOrCreateManagerBuilding, getBuildingResidents, getUnclaimedApartments, getBuildingApartments } from "@/lib/actions/building";
import { isProfileComplete, isBuildingComplete, isUnitsComplete } from "@/lib/validations";
import { features, can } from "@/lib/permissions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Alert } from "@/components/ui/Alert";
import { ManagerOnboardingFlow } from "@/components/dashboard/onboarding/ManagerOnboardingFlow";
import { ResidentsList } from "@/components/dashboard/widgets/manager/ResidentsList";
import { SubscriptionSyncWrapper } from "@/components/dashboard/subscription/SubscriptionSyncWrapper";
import { PaymentStatusCard } from "@/components/dashboard/payments-quotas/PaymentStatusCard";
import { MyUnitPanel } from "@/components/dashboard/widgets/MyUnitPanel";
import { BuildingStatusPanel } from "@/components/dashboard/widgets/BuildingStatusPanel";
import { getEvaluationStatus } from "@/lib/actions/evaluations";
import { getNextUpcomingEvent } from "@/lib/actions/calendar";
import { EvaluationWidget } from "@/components/dashboard/evaluations/EvaluationWidget";
import { Lock } from "lucide-react";
import { getNotifications } from "@/lib/actions/notification";
import { NotificationCard } from "@/components/dashboard/notifications/NotificationCard";
import { formatDate } from "@/lib/format";
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
    let managerApartment: { unit: string; permillage?: number | null } | null = null;
    let nextEvent: { title: string; startDate: string; startTime: string | null } | null = null;

    try {
        const building = await getOrCreateManagerBuilding();
        buildingInfo = building;
        buildingCode = building.code;

        // Parallel fetch: these queries are independent
        const [evaluationStatusResult, apartmentsResult] = await Promise.all([
            getEvaluationStatus(building.id),
            getBuildingApartments(building.id)
        ]);
        evaluationStatus = evaluationStatusResult;
        apartmentsData = apartmentsResult;

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

        // Parallel fetch: residents, unclaimed units, and next event are independent
        const [residentsResult, unclaimedResult, event] = await Promise.all([
            getBuildingResidents(building.id),
            getUnclaimedApartments(building.id),
            getNextUpcomingEvent(building.id)
        ]);
        residents = residentsResult;
        unclaimedUnits = unclaimedResult;

        // Get manager's apartment for MyUnitPanel (reuse managerApt from above)
        if (managerApt) {
            managerApartment = {
                unit: managerApt.apartment.unit,
                permillage: managerApt.apartment.permillage
            };
        }

        if (event) {
            nextEvent = {
                title: event.title,
                startDate: event.startDate,
                startTime: event.startTime
            };
        }
    } catch (e) {
        console.error("Failed to load building", e);
    }

    return (
        <div className="space-y-1.5">
            {/* Subscription Sync Handler */}
            {buildingInfo && (
                <SubscriptionSyncWrapper buildingId={buildingInfo.id} />
            )}

            {/* Upcoming Event Alert */}
            {nextEvent && (
                <Alert variant="info">
                    {nextEvent.title} agendado para {formatDate(nextEvent.startDate, "long")}
                    {nextEvent.startTime && ` às ${nextEvent.startTime}`}.
                </Alert>
            )}

            {/* Stats row */}
            <div className="grid grid-cols-1 gap-1.5 lg:grid-cols-3">
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
                                <div className="flex flex-col items-center justify-center p-6 bg-gray-100 border-2 border-dashed border-gray-200 rounded-lg text-center">
                                    <div className="p-3 bg-gray-200 rounded-full mb-3">
                                        <Lock className="w-5 h-5 text-secondary" />
                                    </div>
                                    <h3 className="font-medium text-gray-600 text-body uppercase mb-1">Subscrição necessária</h3>
                                    <p className="text-label text-secondary mb-4">Subscreva para gerir residentes e registos financeiros.</p>
                                    <a href="/dashboard/settings?tab=subscription" className="px-4 py-1.5 bg-gray-800 text-white text-label font-medium rounded hover:bg-gray-600 transition-colors">
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
                    <MyUnitPanel
                        apartment={managerApartment}
                        buildingInfo={buildingInfo ? {
                            building: {
                                name: buildingInfo.name,
                                street: buildingInfo.street,
                                number: buildingInfo.number,
                                city: buildingInfo.city,
                                monthlyQuota: buildingInfo.monthlyQuota
                            }
                        } : null}
                    />
                    <BuildingStatusPanel
                        sessionUser={sessionUser}
                        buildingInfo={buildingInfo}
                        buildingCode={buildingCode}
                        residents={residents}
                        unclaimedUnits={unclaimedUnits}
                    />
                </div>
            </div>
        </div>
    );
}
