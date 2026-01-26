import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { getBuilding, getBuildingApartments, getResidentApartment } from "@/lib/actions/building"
import { getBankConnectionStatus } from "@/lib/actions/banking"
import { BuildingSettingsForm } from "@/components/dashboard/settings/BuildingSettingsForm"
import { ApartmentManager } from "@/components/dashboard/settings/ApartmentManager"
import { ProfileSettings } from "@/components/dashboard/settings/ProfileSettings"
import { NotificationSettings } from "@/components/dashboard/settings/NotificationSettings"
import { SettingsLayout } from "@/components/dashboard/settings/SettingsLayout"
import { BillingSubscriptionCard } from "@/components/dashboard/subscription/BillingSubscriptionCard"
import { BankingSection } from "@/components/dashboard/banking/BankingSection"
import { Building2 } from "lucide-react"
import { getApartmentDisplayName } from "@/lib/utils"
import { isProfileComplete, isBuildingComplete, isUnitsComplete } from "@/lib/validations"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card"
import { ROUTES } from "@/lib/routes"

export default async function SettingsPage() {
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

    let bankConnectionStatus = null

    if (session.user.role === 'manager' && managerActiveBuildingId) {
        building = await getBuilding(managerActiveBuildingId)
        if (building) {
            apartmentsData = await getBuildingApartments(managerActiveBuildingId)
            // Fetch bank connection status
            const bankResult = await getBankConnectionStatus(managerActiveBuildingId)
            if (bankResult.success) {
                bankConnectionStatus = bankResult.data
            }
        }
    }

    const buildingComplete = building ? isBuildingComplete(building) : false
    const unitsComplete = isUnitsComplete(
        building?.totalApartments,
        apartmentsData
    )
    const canSubscribe = profileComplete && buildingComplete && unitsComplete
    const isManager = session.user.role === 'manager'

    return (
        <div className="flex-1 overflow-y-auto p-1.5">
            {/* Header */}
            <div className="mb-1.5">
                <h1 className="text-heading font-semibold text-gray-800">
                    Definições
                </h1>
                <p className="text-label text-gray-500">
                    Configurações da conta e do condomínio
                </p>
            </div>

            {/* Tabbed Layout */}
            <SettingsLayout isManager={isManager}>
                {{
                    profile: <ProfileSettings user={userData} />,

                    building: building ? (
                        <BuildingSettingsForm building={building} />
                    ) : null,

                    apartments: building ? (
                        <ApartmentManager
                            apartments={apartmentsData.map(a => ({
                                id: a.apartment.id,
                                unit: a.apartment.unit,
                                permillage: a.apartment.permillage || 0,
                                resident: a.resident ? { id: a.resident.id, name: a.resident.name } : null
                            }))}
                        />
                    ) : null,

                    subscription: building ? (
                        <BillingSubscriptionCard
                            subscriptionStatus={building.subscriptionStatus}
                            subscriptionPastDueAt={building.subscriptionPastDueAt}
                            buildingId={building.id}
                            totalApartments={building.totalApartments || 0}
                            canSubscribe={canSubscribe}
                            profileComplete={profileComplete}
                            buildingComplete={buildingComplete}
                        />
                    ) : null,

                    banking: building ? (
                        <BankingSection
                            buildingId={building.id}
                            connectionStatus={bankConnectionStatus}
                            apartments={apartmentsData.map(a => ({
                                id: a.apartment.id,
                                unit: a.apartment.unit,
                                residentName: a.resident?.name ?? null
                            }))}
                        />
                    ) : null,

                    notifications: <NotificationSettings />,
                }}
            </SettingsLayout>

            {/* Resident without apartment card */}
            {!isManager && !userApartment && (
                <Card className="mt-6">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-1.5">
                            <Building2 className="w-4 h-4" />
                            Entrar na sua fração
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-label text-gray-500 mb-4">
                            Ainda não está associado a uma fração.
                        </p>
                        <div className="p-4 rounded-lg border-2 border-dashed border-gray-200 bg-gray-50 text-center">
                            <span className="text-label font-medium text-gray-400">
                                Contacte o administrador para obter um código de convite
                            </span>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}