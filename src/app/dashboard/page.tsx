import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getOrCreateManagerBuilding, getBuildingResidents, getResidentApartment, getUnclaimedApartments } from "@/app/actions/building";
import { getApartmentDisplayName } from "@/lib/utils";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { JoinBuildingForm } from "@/features/dashboard/JoinBuildingForm";
import { ClaimApartmentForm } from "@/features/dashboard/ClaimApartmentForm";
import { ResidentsList } from "@/features/dashboard/ResidentsList";
import { checkSetupStatus } from "@/lib/setup-status";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Circle } from "lucide-react";
import { cn } from "@/lib/utils";

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session) {
        return redirect("/sign-in");
    }

    const setupStatus = await checkSetupStatus(session.user);

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
            {!setupStatus.isComplete && (
                <Card className="border-amber-200 bg-amber-50/50 max-w-2xl">
                    <CardHeader className="pb-2">
                        <h2 className="text-lg font-semibold text-amber-900">Configuração Pendente</h2>
                        <p className="text-sm text-amber-700">Complete estes passos para desbloquear todas as funcionalidades.</p>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-amber-100">
                                <div className="flex items-center gap-3">
                                    {setupStatus.personalInfoComplete ? (
                                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                                    ) : (
                                        <Circle className="w-5 h-5 text-amber-400" />
                                    )}
                                    <span className={cn("text-sm font-medium", setupStatus.personalInfoComplete ? "text-gray-500 line-through" : "text-gray-900")}>
                                        Informação Pessoal (NIF, IBAN)
                                    </span>
                                </div>
                                {!setupStatus.personalInfoComplete && (
                                    <Link href="/dashboard/settings" className="text-xs font-semibold text-amber-600 flex items-center gap-1 hover:underline">
                                        Ir para Profile <ArrowRight className="w-3 h-3" />
                                    </Link>
                                )}
                            </div>

                            {session.user.role === 'manager' ? (
                                <>
                                    <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-amber-100">
                                        <div className="flex items-center gap-3">
                                            {setupStatus.buildingComplete ? (
                                                <CheckCircle2 className="w-5 h-5 text-green-500" />
                                            ) : (
                                                <Circle className="w-5 h-5 text-amber-400" />
                                            )}
                                            <span className={cn("text-sm font-medium", setupStatus.buildingComplete ? "text-gray-500 line-through" : "text-gray-900")}>
                                                Dados do Edifício
                                            </span>
                                        </div>
                                        {!setupStatus.buildingComplete && (
                                            <Link href="/dashboard/settings" className="text-xs font-semibold text-amber-600 flex items-center gap-1 hover:underline">
                                                Configurar Edifício <ArrowRight className="w-3 h-3" />
                                            </Link>
                                        )}
                                    </div>

                                    <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-amber-100">
                                        <div className="flex items-center gap-3">
                                            {setupStatus.unitsCreated ? (
                                                <CheckCircle2 className="w-5 h-5 text-green-500" />
                                            ) : (
                                                <Circle className="w-5 h-5 text-amber-400" />
                                            )}
                                            <span className={cn("text-sm font-medium", setupStatus.unitsCreated ? "text-gray-500 line-through" : "text-gray-900")}>
                                                Criar Frações ({setupStatus.apartmentsCount}/{setupStatus.building?.totalApartments || 0})
                                            </span>
                                        </div>
                                        {!setupStatus.unitsCreated && setupStatus.buildingComplete && (
                                            <Link href="/dashboard/settings" className="text-xs font-semibold text-amber-600 flex items-center gap-1 hover:underline">
                                                Gerir Frações <ArrowRight className="w-3 h-3" />
                                            </Link>
                                        )}
                                    </div>
                                </>
                            ) : (
                                <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-amber-100">
                                    <div className="flex items-center gap-3">
                                        {setupStatus.hasBuilding ? (
                                            <CheckCircle2 className="w-5 h-5 text-green-500" />
                                        ) : (
                                            <Circle className="w-5 h-5 text-amber-400" />
                                        )}
                                        <span className={cn("text-sm font-medium", setupStatus.hasBuilding ? "text-gray-500 line-through" : "text-gray-900")}>
                                            Aderir a um Edifício
                                        </span>
                                    </div>
                                    {!setupStatus.hasBuilding && (
                                        <span className="text-xs font-medium text-amber-600">
                                            Aguardando código...
                                        </span>
                                    )}
                                </div>
                            )}

                            <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-amber-100">
                                <div className="flex items-center gap-3">
                                    {setupStatus.selfClaimed ? (
                                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                                    ) : (
                                        <Circle className="w-5 h-5 text-amber-400" />
                                    )}
                                    <span className={cn("text-sm font-medium", setupStatus.selfClaimed ? "text-gray-500 line-through" : "text-gray-900")}>
                                        Selecionar a sua Fração
                                    </span>
                                </div>
                                {!setupStatus.selfClaimed && (
                                    session.user.role === 'manager' ? (
                                        setupStatus.unitsCreated && (
                                            <Link href="/dashboard/settings" className="text-xs font-semibold text-amber-600 flex items-center gap-1 hover:underline">
                                                Claim Unit <ArrowRight className="w-3 h-3" />
                                            </Link>
                                        )
                                    ) : (
                                        setupStatus.hasBuilding && (
                                            <Link href="/dashboard" className="text-xs font-semibold text-amber-600 flex items-center gap-1 hover:underline">
                                                Claim Unit <ArrowRight className="w-3 h-3" />
                                            </Link>
                                        )
                                    )
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>
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
                                <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg flex justify-between items-center">
                                    <div>
                                        <p className="text-blue-800 font-medium text-sm">Valid Invite Code</p>
                                        <p className="text-2xl font-bold text-blue-900 tracking-wider font-mono lowercase">{buildingCode}</p>
                                    </div>
                                    <div className="text-right max-w-[150px]">
                                        <p className="text-xs text-blue-600 leading-tight">Share this code with residents to let them join.</p>
                                    </div>
                                </div>
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

                {/* Manager: Residents Card */}
                {session.user.role === 'manager' && (
                    <ResidentsList 
                        residents={residents}
                        buildingId={buildingInfo?.id || ""}
                        unclaimedUnits={unclaimedUnits}
                    />
                )}
            </div>
        </div>
    );
}
