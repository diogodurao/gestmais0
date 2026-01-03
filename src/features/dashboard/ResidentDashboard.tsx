import { getResidentApartment, getUnclaimedApartments } from "@/app/actions/building";
import { ResidentOnboardingFlow } from "@/features/dashboard/onboarding/ResidentOnboardingFlow";
import { PaymentStatusCard } from "@/features/dashboard/payments-quotas/PaymentStatusCard";
import { BuildingMetricsPanel } from "@/features/dashboard/overview/BuildingMetricsPanel";
import { SystemStatusPanel } from "@/features/dashboard/overview/SystemStatusPanel";
import { getEvaluationStatus } from "@/app/actions/evaluations";
import { EvaluationWidget } from "@/features/dashboard/evaluations/EvaluationWidget";
import { getNotifications } from "@/app/actions/notification";
import { NotificationCard } from "@/features/dashboard/notifications/NotificationCard";
import type { SessionUser } from "@/lib/types";

interface ResidentDashboardProps {
    session: { user: SessionUser };
}

export async function ResidentDashboard({ session }: ResidentDashboardProps) {
    const sessionUser = session.user;
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
        const { getResidentBuildingDetails } = await import("@/app/actions/building");
        residentBuildingInfo = await getResidentBuildingDetails(session.user.buildingId!);
    } catch (error) {
        console.error("Failed check resident status", error);
    }

    return (
        <div className="space-y-4 max-w-4xl">
            {evaluationStatus && <EvaluationWidget status={evaluationStatus} />}

            {/* Full-width payment status - their main concern */}
            <PaymentStatusCard userId={session.user.id} />

            {/* Two-column layout for secondary info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <BuildingMetricsPanel
                    isManager={false}
                    residents={[]}
                    unclaimedUnits={[]}
                    residentBuildingInfo={residentBuildingInfo}
                />

                {/* Quick Links Card (Mapped to SystemStatusPanel for now as "Quick Features" isn't fully defined but System Status is relevant) */}
                <SystemStatusPanel sessionUser={sessionUser} />

                <NotificationCard notifications={notifications} />
            </div>

            {/* Extraordinary projects (if any) - Placeholder for now as requested by user in future vision */}
            {/* <ExtraordinaryPaymentsPreview /> */}
        </div>
    );
}
