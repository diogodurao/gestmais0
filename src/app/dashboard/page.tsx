import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getOrCreateManagerBuilding, getBuildingResidents, getResidentApartment, getUnclaimedApartments } from "@/app/actions/building";
import { getApartmentDisplayName } from "@/lib/utils";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { JoinBuildingForm } from "@/features/dashboard/JoinBuildingForm";
import { ClaimApartmentForm } from "@/features/dashboard/ClaimApartmentForm";
import { ResidentsList } from "@/features/dashboard/ResidentsList";
import { SubscriptionSyncWrapper } from "@/features/dashboard/SubscriptionSyncWrapper";

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session) {
        return redirect("/sign-in");
    }

    // --- MANAGER LOGIC ---
    let buildingInfo = null;
    let buildingCode = "N/A";
    let residents: any[] = [];
    let unclaimedUnits: any[] = [];

    if (session.user.role === 'manager') {
        try {
            const building = await getOrCreateManagerBuilding(session.user.id, session.user.nif || "");
            buildingInfo = building;
            buildingCode = building.code;
            residents = await getBuildingResidents(building.id);
            unclaimedUnits = await getUnclaimedApartments(building.id);
        } catch (e) {
            console.error("Failed to load building", e);
        }
    }

    // --- RESIDENT LOGIC ---
    let residentBuildingInfo = null;
    let residentApartment = null;

    if (session.user.role === 'resident') {
        if (!session.user.buildingId) {
            return <JoinBuildingForm userId={session.user.id} />
        } else {
            // Already joined building. Now check if they have an apartment
            try {
                residentApartment = await getResidentApartment(session.user.id)
                // If NO apartment, show Claim Form with unclaimed apartments dropdown
                if (!residentApartment) {
                    const unclaimed = await getUnclaimedApartments(session.user.buildingId)
                    return (
                        <ClaimApartmentForm
                            buildingId={session.user.buildingId}
                            unclaimedApartments={unclaimed}
                        />
                    )
                }

                // If HAS apartment, load details
                const { getResidentBuildingDetails } = await import("@/app/actions/building");
                residentBuildingInfo = await getResidentBuildingDetails(session.user.buildingId);
            } catch (error) {
                console.error("Failed check resident status", error)
            }
        }
    }

    return (
        <div className="space-y-6">
            {/* Subscription Sync Handler - only for managers */}
            {session.user.role === 'manager' && buildingInfo && (
                <SubscriptionSyncWrapper buildingId={buildingInfo.id} />
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Welcome / Info Card */}
                <Card className="col-span-1 md:col-span-2">
                    <CardHeader>
                        <h2 className="text-xl font-semibold">Welcome, {session.user.name}!</h2>
                    </CardHeader>
                    <CardContent>
                        <div className="text-sm text-gray-500 space-y-3">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p><span className="font-medium text-gray-700">Role:</span> {session.user.role}</p>
                                    <p><span className="font-medium text-gray-700">Email:</span> {session.user.email}</p>
                                </div>
                                {session.user.role === 'resident' && residentApartment && (
                                    <div className="text-right">
                                        <p className="text-gray-400 text-xs uppercase tracking-wider">Unit</p>
                                        <p className="text-3xl font-bold text-gray-900">
                                            {getApartmentDisplayName(residentApartment)}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {session.user.role === 'manager' && (
                                buildingInfo?.subscriptionStatus === 'active' ? (
                                    <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg flex justify-between items-center">
                                        <div>
                                            <p className="text-blue-800 font-medium text-sm">Valid Invite Code</p>
                                            <p className="text-2xl font-bold text-blue-900 tracking-wider font-mono lowercase">{buildingCode}</p>
                                        </div>
                                        <div className="text-right max-w-[150px]">
                                            <p className="text-xs text-blue-600 leading-tight">Share this code with residents to let them join.</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="p-4 bg-amber-50 border border-amber-100 rounded-lg flex justify-between items-center">
                                        <div>
                                            <p className="text-amber-800 font-medium text-sm">Subscription Needed</p>
                                            <p className="text-sm text-amber-700">Invite code is hidden until you subscribe.</p>
                                        </div>
                                        <a href="/dashboard/settings?tab=payments" className="text-sm bg-white text-amber-800 px-3 py-1.5 rounded-md border border-amber-200 shadow-sm font-medium hover:bg-amber-50">
                                            Go to Payment
                                        </a>
                                    </div>
                                )
                            )}

                            {session.user.role === 'resident' && residentBuildingInfo && (
                                <div className="p-4 bg-gray-50 border border-gray-100 rounded-md">
                                    <h3 className="font-medium text-black mb-2">Building Details</h3>
                                    <div className="text-sm space-y-1">
                                        <p><span className="text-gray-500">Name:</span> <span className="font-medium">{residentBuildingInfo.building.name}</span></p>
                                        <p><span className="text-gray-500">Manager:</span> <span className="font-medium">{residentBuildingInfo.manager.name}</span></p>
                                        <p><span className="text-gray-500">Contact:</span> <span className="font-medium">{residentBuildingInfo.manager.email}</span></p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Manager: Residents Card - Protected by Subscription */}
                {session.user.role === 'manager' && buildingInfo?.subscriptionStatus === 'active' && (
                    <ResidentsList
                        residents={residents}
                        buildingId={buildingInfo?.id || ""}
                        unclaimedUnits={unclaimedUnits}
                    />
                )}

                {session.user.role === 'manager' && buildingInfo?.subscriptionStatus !== 'active' && (
                    <Card className="col-span-1">
                        <CardHeader>
                            <h2 className="text-xl font-semibold">Residents</h2>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-col items-center justify-center p-6 bg-gray-50 border border-gray-100 rounded-lg text-center h-[300px]">
                                <div className="p-3 bg-gray-200 rounded-full mb-3">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                                </div>
                                <h3 className="font-semibold text-gray-900 mb-1">Feature Locked</h3>
                                <p className="text-sm text-gray-500 mb-4">Complete your subscription to manage residents.</p>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}