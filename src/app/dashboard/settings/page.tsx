import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { getBuilding, getBuildingApartments, getResidentApartment, getUnclaimedApartments } from "@/app/actions/building"
import { BuildingSettingsForm } from "@/features/dashboard/settings/BuildingSettingsForm"
import { ApartmentManager } from "@/features/dashboard/settings/ApartmentManager"
import { ProfileSettings } from "@/features/dashboard/settings/ProfileSettings"
import { BillingSubscriptionCard } from "@/features/dashboard/cards/BillingSubscriptionCard"
import { LayoutGrid, Building2 } from "lucide-react"
import { getApartmentDisplayName } from "@/lib/utils"
import { isProfileComplete, isBuildingComplete, isUnitsComplete } from "@/lib/validations"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card"

export const dynamic = 'force-dynamic'

import { ROUTES } from "@/lib/routes"

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
            return redirect(ROUTES.DASHBOARD.HOME)
        }
    } else {
        // Resident setup check
        const apartment = await getResidentApartment()
        if (!session.user.buildingId || !apartment || !session.user.iban) {
            return redirect(ROUTES.DASHBOARD.HOME)
        }
    }

    let userApartment = null
    if (session.user.role === 'resident') {
        userApartment = await getResidentApartment()
    }
    const unitName = userApartment ? getApartmentDisplayName(userApartment) : null

    const userData = {
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        role: session.user.role || 'resident',
        nif: session.user.nif,
        iban: session.user.iban,
        unitName: unitName
    }

    const profileComplete = isProfileComplete(session.user)
    const managerActiveBuildingId = session.user.activeBuildingId ?? null
    let building = null
    let apartmentsData: Awaited<ReturnType<typeof getBuildingApartments>> = []
    let unclaimedUnits: Awaited<ReturnType<typeof getUnclaimedApartments>> = []

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
                        <h1 className="text-lg sm:text-xl font-bold tracking-tight text-slate-800">Definições</h1>
                        <p className="text-[9px] sm:text-[10px] font-mono text-slate-500 uppercase">Parametros do sistema</p>
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
                                        Frações
                                    </CardTitle>
                                    <span className="text-[10px] font-mono text-slate-400">{apartmentsData.length} / {building.totalApartments || 0}</span>
                                </CardHeader>
                                <div className="p-0">
                                    <ApartmentManager
                                        apartments={apartmentsData.map(a => ({
                                            id: a.apartment.id,
                                            unit: a.apartment.unit,
                                            permillage: a.apartment.permillage || 0,
                                            resident: a.resident ? { id: a.resident.id, name: a.resident.name } : null
                                        }))}
                                        buildingId={building.id}
                                        buildingComplete={buildingComplete}
                                        totalApartments={building.totalApartments}
                                    />
                                </div>
                            </Card>
                        </div>

                        {/* Section 3: Billing (Integrated) */}
                        <div id="billing" className="scroll-mt-6">
                            <BillingSubscriptionCard
                                subscriptionStatus={building.subscriptionStatus}
                                buildingId={building.id}
                                totalApartments={building.totalApartments || 0}
                                canSubscribe={canSubscribe}
                                profileComplete={profileComplete}
                                buildingComplete={buildingComplete}
                            />
                        </div>
                    </>
                )}

                {session.user.role !== 'manager' && !userApartment && (
                    <Card>
                        <CardHeader>
                            <CardTitle>
                                <Building2 className="w-3.5 h-3.5" />
                                Entrar na sua fração
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

