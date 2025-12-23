import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getOrCreateManagerBuilding, getBuildingResidents, getResidentApartment, getUnclaimedApartments, getBuilding, getBuildingApartments } from "@/app/actions/building";
import { getApartmentDisplayName } from "@/lib/utils";
import { isProfileComplete, isBuildingComplete, isUnitsComplete } from "@/lib/validations";
import { isManager, isResident, can, features } from "@/lib/permissions";
import type { SessionUser } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/Card";
import { ResidentOnboardingFlow } from "@/features/dashboard/ResidentOnboardingFlow";
import { ManagerOnboardingFlow } from "@/features/dashboard/ManagerOnboardingFlow";
import { ResidentsList } from "@/features/dashboard/ResidentsList";
import { SubscriptionSyncWrapper } from "@/features/dashboard/SubscriptionSyncWrapper";
import { PaymentStatusCard } from "@/features/dashboard/PaymentStatusCard";
import { Key, Activity, BarChart3, Lock } from "lucide-react";

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session) {
        return redirect("/sign-in");
    }

    // Cast session user for type safety
    const sessionUser = session.user as SessionUser

    // --- MANAGER LOGIC ---
    let buildingInfo = null;
    let buildingCode = "N/A";
    let residents: Array<{ user: { id: string; name: string; email: string }; apartment: { id: number; unit: string } | null }> = [];
    let unclaimedUnits: Array<{ id: number; unit: string }> = [];

    if (isManager(sessionUser)) {
        try {
            const building = await getOrCreateManagerBuilding(session.user.id);
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
                            nif: session.user.nif,
                            iban: session.user.iban
                        }}
                        building={building}
                        apartments={apartmentsData}
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
            residentApartment = await getResidentApartment(session.user.id)
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
                            iban: session.user.iban
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

            {/* Payment Status Card - For both Resident and Manager (if resident) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <PaymentStatusCard userId={session.user.id} />
                </div>
                <div className="lg:col-span-1 hidden lg:block">
                    {/* Placeholder for future context-aware info or ads */}
                    <div className="h-full tech-border border-dashed bg-slate-50/50 flex items-center justify-center p-6 text-center">
                        <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">
                            {isManager(sessionUser) ? 'MANAGER_CONSOLE_ACTIVE' : 'RESIDENT_PORTAL_ACTIVE'}
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0 bg-white tech-border shadow-sm">
                
                {/* 1. Invite Code / Welcome Panel */}
                <div className="col-span-1 border-r border-slate-200 p-0">
                    <CardHeader>
                        <CardTitle>
                            <Key className="w-3.5 h-3.5 text-slate-400" />
                            {isManager(sessionUser) ? 'BUILDING_INVITE_CODE' : 'RESIDENT_ACCESS'}
                        </CardTitle>
                    </CardHeader>
                    <div className="p-6 flex flex-col items-center justify-center bg-blue-50/30 h-32">
                        {isManager(sessionUser) ? (
                            can.viewInviteCode(sessionUser, buildingInfo) ? (
                                <>
                                    <div className="text-3xl font-mono font-bold text-blue-700 tracking-widest mb-2 select-all uppercase">
                                        {buildingCode}
                                    </div>
                                    <div className="text-[10px] uppercase font-bold text-blue-600/70">
                                        Active Invite Code
                                    </div>
                                </>
                            ) : (
                                <div className="text-center">
                                    <Lock className="w-6 h-6 text-slate-300 mx-auto mb-2" />
                                    <span className="text-[10px] uppercase font-bold text-slate-400">Subscription Required</span>
                                </div>
                            )
                        ) : residentApartment ? (
                            <>
                                <div className="text-3xl font-mono font-bold text-slate-800 tracking-tight mb-1">
                                    {getApartmentDisplayName(residentApartment)}
                                </div>
                                <div className="text-[10px] uppercase font-bold text-slate-400">Assigned_Unit</div>
                            </>
                        ) : null}
                    </div>
                    <CardFooter className="text-center">
                        {isManager(sessionUser) 
                            ? "SHARE CODE WITH NEW RESIDENTS" 
                            : "ACTIVE_RESIDENT_SESSION"}
                    </CardFooter>
                </div>

                {/* 2. System / Status Panel */}
                <div className="col-span-1 border-r border-slate-200 p-0">
                    <CardHeader>
                        <CardTitle>
                            <Activity className="w-3.5 h-3.5 text-slate-400" />
                            SYSTEM_STATUS
                        </CardTitle>
                    </CardHeader>
                    <div className="p-4 space-y-3 h-32">
                        <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                            <span className="text-[11px] text-slate-500 font-bold uppercase">Role</span>
                            <span className="status-badge status-active">{session.user.role}</span>
                        </div>
                        <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                            <span className="text-[11px] text-slate-500 font-bold uppercase">Account</span>
                            <div className="flex items-center gap-1 text-[11px] font-mono text-slate-700">
                                {session.user.email.split('@')[0]}...
                            </div>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-[11px] text-slate-500 font-bold uppercase">Sync</span>
                            <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 uppercase">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                                Live
                            </div>
                        </div>
                    </div>
                </div>

                {/* 3. Metrics / Building Panel */}
                <div className="col-span-1 p-0">
                    <CardHeader>
                        <CardTitle>
                            <BarChart3 className="w-3.5 h-3.5 text-slate-400" />
                            {isManager(sessionUser) ? 'BUILDING_METRICS' : 'BUILDING_INFO'}
                        </CardTitle>
                    </CardHeader>
                    <div className="p-4 h-32 flex flex-col justify-center">
                        {isManager(sessionUser) ? (
                            <div className="grid grid-cols-2 gap-4">
                                <div className="text-center border-r border-slate-100">
                                    <div className="text-2xl font-bold text-slate-700">{residents.length}</div>
                                    <div className="text-[9px] text-slate-400 uppercase font-bold mt-1 tracking-tighter">Residents</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-amber-600">{unclaimedUnits.length}</div>
                                    <div className="text-[9px] text-amber-600/70 uppercase font-bold mt-1 tracking-tighter">Unclaimed</div>
                                </div>
                            </div>
                        ) : residentBuildingInfo ? (
                            <div className="space-y-1">
                                <p className="text-[11px] font-bold text-slate-800 truncate uppercase">{residentBuildingInfo.building.name}</p>
                                <p className="text-[10px] font-medium text-slate-500 uppercase tracking-tighter">Manager: {residentBuildingInfo.manager.name}</p>
                            </div>
                        ) : null}
                    </div>
                    <CardFooter className="text-center uppercase">
                        {isManager(sessionUser) 
                            ? "88% OCCUPANCY_RATE" 
                            : "BUILDING_METADATA_LOADED"}
                    </CardFooter>
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

                {/* Quick Actions simulation for Dashboard */}
                {can.manageResidents(sessionUser, buildingInfo) && (
                    <div className="space-y-4">
                        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">Operational_Quick_Actions</div>
                        <div className="grid grid-cols-1 gap-3">
                            <button className="p-3 bg-white tech-border shadow-sm flex items-center gap-3 hover:bg-slate-50 group transition-colors text-left">
                                <div className="p-1.5 bg-emerald-50 border border-emerald-100 rounded-sm group-hover:bg-emerald-100">
                                    <Activity className="w-3.5 h-3.5 text-emerald-600" />
                                </div>
                                <div>
                                    <div className="font-bold text-slate-700 text-[11px] uppercase tracking-tighter">Export Financials</div>
                                    <div className="text-[9px] text-slate-400 uppercase">Generate CSV/PDF Ledger</div>
                                </div>
                            </button>
                        </div>
                    </div>
                )}

                {features.isResidentManagementLocked(sessionUser, buildingInfo) && (
                    <Card className="col-span-full">
                        <CardHeader>
                            <CardTitle>
                                <Lock className="w-3.5 h-3.5" />
                                FEATURE_LOCKED: RESIDENT_MANAGEMENT
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-col items-center justify-center p-12 bg-slate-50 tech-border border-dashed text-center h-[300px]">
                                <div className="p-4 bg-slate-200 rounded-full mb-4">
                                    <Lock className="w-6 h-6 text-slate-500" />
                                </div>
                                <h3 className="font-bold text-slate-900 uppercase text-sm mb-1">Subscription_Required</h3>
                                <p className="text-xs text-slate-500 mb-6 uppercase tracking-tight">Complete your subscription to manage residents and financial records.</p>
                                <a href="/dashboard/settings?tab=payments" className="px-6 py-2 bg-slate-900 text-white text-xs font-bold uppercase rounded-sm hover:bg-slate-800 transition-colors">
                                    Upgrade_Account
                                </a>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}
