import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getOrCreateManagerBuilding, getBuildingResidents, getResidentApartment, getUnclaimedApartments } from "@/app/actions/building";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { JoinBuildingForm } from "@/features/dashboard/JoinBuildingForm";
import { ClaimApartmentForm } from "@/features/dashboard/ClaimApartmentForm";
import { Users } from "lucide-react";

export const dynamic = 'force-dynamic'

function getFloorLabel(floor: string): string {
    if (floor === "0") return "R/C"
    if (floor === "-1") return "Cave"
    return `${floor}º`
}

function getApartmentDisplayName(apt: { floor: string; identifier: string }): string {
    return `${getFloorLabel(apt.floor)} ${apt.identifier}`
}

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

    if (session.user.role === 'manager') {
        try {
            const building = await getOrCreateManagerBuilding(session.user.id, session.user.nif || "");
            buildingInfo = building;
            buildingCode = building.code;
            residents = await getBuildingResidents(building.id);
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
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <h3 className="text-sm font-medium">Residents</h3>
                            <Users className="h-4 w-4 text-gray-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{residents.length}</div>
                            <p className="text-xs text-gray-500 mb-4">
                                {residents.length === 1 ? '1 resident joined' : `${residents.length} residents joined`}
                            </p>
                            <div className="space-y-3 max-h-[200px] overflow-y-auto">
                                {residents.map((r, i) => (
                                    <div key={i} className="flex items-center justify-between text-sm">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-medium">
                                                {r.user.name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-medium truncate max-w-[100px]">{r.user.name}</p>
                                                <p className="text-xs text-gray-400 truncate max-w-[120px]">{r.user.email}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            {r.apartment ? (
                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                                                    {getApartmentDisplayName(r.apartment)}
                                                </span>
                                            ) : (
                                                <span className="text-xs text-orange-500">No Unit</span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                                {residents.length === 0 && (
                                    <p className="text-sm text-gray-400 italic">No residents yet.</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}
