import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { getBuilding, getBuildingApartments, getResidentApartment, getUnclaimedApartments, claimApartment } from "@/app/actions/building"
import { BuildingSettingsForm } from "@/features/dashboard/BuildingSettingsForm"
import { ApartmentManager } from "@/features/dashboard/ApartmentManager"
import { ProfileSettings } from "@/features/dashboard/ProfileSettings"
import { SubscribeButton, SyncSubscriptionButton } from "@/features/dashboard/SubscribeButton"
import { CreditCard, Save, Lock, LayoutGrid, Building2, User } from "lucide-react"
import { getApartmentDisplayName } from "@/lib/utils"
import { isProfileComplete, isBuildingComplete, isUnitsComplete } from "@/lib/validations"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"

export const dynamic = 'force-dynamic'

export default async function SettingsPage({
    searchParams
}: {
    searchParams: Promise<{ new?: string, tab?: string }>
}) {
    const session = await auth.api.getSession({
        headers: await headers()
    })

    if (!session) {
        return redirect("/sign-in")
    }

    // MANDATORY SETUP CHECK
    const profileDone = isProfileComplete(session.user)
    let buildingDone = false
    
    if (session.user.role === 'manager') {
        if (session.user.activeBuildingId) {
            const b = await getBuilding(session.user.activeBuildingId)
            buildingDone = b ? isBuildingComplete(b) : false
        }
        if (!profileDone || !buildingDone) {
            return redirect("/dashboard")
        }
    } else {
        // Resident setup check
        const apartment = await getResidentApartment(session.user.id)
        if (!session.user.buildingId || !apartment || !session.user.iban) {
            return redirect("/dashboard")
        }
    }

    const userApartment = await getResidentApartment(session.user.id)
    const unitName = userApartment ? getApartmentDisplayName(userApartment) : null

    const userData = {
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        role: session.user.role || 'resident',
        nif: session.user.nif,
        iban: session.user.iban,
        unitName: unitName,
    }

    const profileComplete = isProfileComplete(session.user)
    const managerActiveBuildingId = session.user.activeBuildingId ?? null
    let building = null
    let apartmentsData: any[] = []
    let unclaimedUnits: any[] = []

    if (session.user.role === 'manager' && managerActiveBuildingId) {
        building = await getBuilding(managerActiveBuildingId)
        if (building) {
            apartmentsData = await getBuildingApartments(managerActiveBuildingId)
            unclaimedUnits = await getUnclaimedApartments(managerActiveBuildingId)
        }
    }

    const buildingComplete = building ? isBuildingComplete(building) : false
    const unitsComplete = isUnitsComplete(
        building?.totalApartments, 
        apartmentsData
    )
    const canSubscribe = profileComplete && buildingComplete && unitsComplete

    return (
        <div className="flex-1 overflow-y-auto bg-slate-100 p-3 sm:p-4 lg:p-6">
            <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6 lg:space-y-8 pb-20">
                
                {/* Header bar within content for quick save simulation */}
                <div className="flex items-center justify-between mb-2">
                    <div>
                        <h1 className="text-lg sm:text-xl font-bold tracking-tight text-slate-800">System_Configuration</h1>
                        <p className="text-[9px] sm:text-[10px] font-mono text-slate-500 uppercase">Operational_Parameters_v0.2</p>
                    </div>
                </div>

                {/* Section 1: Profile */}
                <div className="scroll-mt-6">
                    <ProfileSettings user={userData} />
                </div>

                {/* Section 2: Building (Manager Only) */}
                {session.user.role === 'manager' && building && (
                    <>
                        <div className="scroll-mt-6">
                            <BuildingSettingsForm building={building} />
                        </div>

                        <div className="scroll-mt-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>
                                        <LayoutGrid className="w-3.5 h-3.5" />
                                        UNIT_INVENTORY_MANAGER
                                    </CardTitle>
                                    <span className="text-[10px] font-mono text-slate-400">{apartmentsData.length} / {building.totalApartments || 0}</span>
                                </CardHeader>
                                <div className="p-0">
                                    <ApartmentManager apartments={apartmentsData} buildingId={building.id} buildingComplete={buildingComplete} totalApartments={building.totalApartments} />
                                </div>
                            </Card>
                        </div>

                        {/* Section 3: Billing (Integrated) */}
                        <div id="billing" className="scroll-mt-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>
                                        <CreditCard className="w-3.5 h-3.5" />
                                        BILLING_SERVICE_SUBSCRIPTION
                                    </CardTitle>
                                    {building.subscriptionStatus === 'active' ? (
                                        <span className="status-badge status-active">Live_Subscription</span>
                                    ) : (
                                        <span className="status-badge status-alert">Awaiting_Sync</span>
                                    )}
                                </CardHeader>
                                <div className="p-0">
                                    <div className="grid grid-cols-1 sm:grid-cols-[120px_1fr] md:grid-cols-[140px_1fr] border-b border-slate-100">
                                        <div className="label-col border-none text-[10px] sm:text-xs">Status</div>
                                        <div className="value-col border-none px-3 py-2">
                                            <span className={`text-[11px] font-bold uppercase ${building.subscriptionStatus === 'active' ? 'text-emerald-600' : 'text-rose-600'}`}>
                                                {building.subscriptionStatus || 'Incomplete'}
                                            </span>
                                        </div>
                                    </div>
                                    
                                    <div className="p-4 bg-slate-50/50">
                                        {building.subscriptionStatus === 'active' ? (
                                            <div className="space-y-2">
                                                <p className="text-xs text-slate-600 uppercase font-bold tracking-tight">Subscription_Active</p>
                                                <p className="text-[11px] text-slate-500">Your building features are fully unlocked. Billing cycle is managed via Stripe.</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-4">
                                                <div className="bg-amber-50 border border-amber-100 p-3">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <Lock className="w-3.5 h-3.5 text-amber-600" />
                                                        <span className="text-[11px] font-bold text-amber-800 uppercase">Feature_Lock_Active</span>
                                                    </div>
                                                    <p className="text-[10px] text-amber-700 uppercase leading-tight">Complete subscription to unlock resident management and financials.</p>
                                                </div>

                                                {canSubscribe ? (
                                                    <div className="flex flex-col gap-4">
                                                        <SubscribeButton buildingId={building.id} quantity={building.totalApartments || 1} pricePerUnit={300} />
                                                        <SyncSubscriptionButton buildingId={building.id} />
                                                    </div>
                                                ) : (
                                                    <div className="p-3 tech-border border-dashed text-center">
                                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                                                            [ {!profileComplete ? "VALIDATE_PROFILE" : !buildingComplete ? "VALIDATE_BUILDING" : "INSERT_ALL_UNITS"} TO_ENABLE_BILLING ]
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <CardFooter>
                                    POWERED_BY_STRIPE_CONNECT
                                </CardFooter>
                            </Card>
                        </div>
                    </>
                )}

                {session.user.role !== 'manager' && !userApartment && (
                    <Card>
                        <CardHeader>
                            <CardTitle>
                                <Building2 className="w-3.5 h-3.5" />
                                JOIN_BUILDING_SESSION
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-xs text-slate-500 mb-4 uppercase tracking-tight">You are currently not associated with a specific unit.</p>
                            <div className="p-4 tech-border border-dashed bg-slate-50 text-center">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">[ CONTACT_MANAGER_FOR_INVITE_CODE ]</span>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    )
}
