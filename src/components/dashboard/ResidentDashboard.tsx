import { getResidentApartment, getUnclaimedApartments } from "@/lib/actions/building";
import { ResidentOnboardingFlow } from "@/components/dashboard/onboarding/ResidentOnboardingFlow";
import { PaymentStatusCard } from "@/components/dashboard/payments-quotas/PaymentStatusCard";
import { MyUnitPanel } from "@/components/dashboard/overview/MyUnitPanel";
import { getEvaluationStatus } from "@/lib/actions/evaluations";
import { EvaluationWidget } from "@/components/dashboard/evaluations/EvaluationWidget";
import { getNotifications } from "@/lib/actions/notification";
import { NotificationCard } from "@/components/dashboard/notifications/NotificationCard";
import type { SessionUser } from "@/lib/types";

interface ResidentDashboardProps {
    session: { user: SessionUser };
}

export async function ResidentDashboard({ session }: ResidentDashboardProps) {
    const notifications = await getNotifications(5);

    let residentBuildingInfo = null;
    let residentApartment = null;
    let evaluationStatus = null;

    const hasBuildingId = !!session.user.buildingId;
    const hasIban = !!session.user.iban;

    try {
        if (hasBuildingId) {
            evaluationStatus = await getEvaluationStatus(session.user.buildingId!);
        }

        residentApartment = await getResidentApartment();
        const hasApartment = !!residentApartment;

        // Check if onboarding is complete
        if (!hasBuildingId || !hasApartment || !hasIban) {
            const initialStep = !hasBuildingId ? 'join' : !hasApartment ? 'claim' : 'iban';
            const unclaimed = hasBuildingId ? await getUnclaimedApartments(session.user.buildingId!) : [];

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
            );
        }

        // If HAS everything, load details
        const { getResidentBuildingDetails } = await import("@/lib/actions/building");
        residentBuildingInfo = await getResidentBuildingDetails(session.user.buildingId!);
    } catch (error) {
        console.error("Failed check resident status", error);
    }

    return (
        <div className="space-y-1.5">
            {/* Stats row */}
            <div className="grid grid-cols-1 gap-1.5 lg:grid-cols-2">
                <PaymentStatusCard userId={session.user.id} />
                {evaluationStatus && <EvaluationWidget status={evaluationStatus} />}
            </div>

            {/* Main Content Grid - 3 columns */}
            <div className="grid gap-1.5 lg:grid-cols-3">
                {/* Left Column - Notifications (col-span-2) */}
                <div className="lg:col-span-2 space-y-1.5">
                    <NotificationCard notifications={notifications} />
                </div>

                {/* Right Column - Panels */}
                <div className="space-y-1.5">
                    <MyUnitPanel
                        apartment={residentApartment}
                        buildingInfo={residentBuildingInfo}
                    />
                </div>
            </div>
        </div>
    );
}
