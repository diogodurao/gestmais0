import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { getBuilding, getBuildingApartments, getResidentApartment, getUnclaimedApartments } from "@/app/actions/building"
import { BuildingSettingsForm } from "@/features/dashboard/BuildingSettingsForm"
import { ApartmentManager } from "@/features/dashboard/ApartmentManager"
import { NewBuildingForm } from "@/features/dashboard/NewBuildingForm"
import { SettingsTabs } from "@/features/dashboard/SettingsTabs"
import { ProfileSettings } from "@/features/dashboard/ProfileSettings"
import { ClaimApartmentForm } from "@/features/dashboard/ClaimApartmentForm"
import { User, Building, CreditCard } from "lucide-react"
import { getApartmentDisplayName } from "@/lib/utils"

export const dynamic = 'force-dynamic'

export default async function SettingsPage({
    searchParams
}: {
    searchParams: Promise<{ new?: string }>
}) {
    const session = await auth.api.getSession({
        headers: await headers()
    })

    if (!session) {
        return redirect("/sign-in")
    }

    const params = await searchParams
    const isCreatingNew = params.new === "1"

    // Show "New Building" form if ?new=1
    if (isCreatingNew) {
        return (
            <div className="space-y-8 max-w-4xl">
                <div>
                    <h1 className="text-2xl font-bold">Create New Building</h1>
                    <p className="text-gray-500 text-sm mt-1">Add a new building to your management portfolio</p>
                </div>
                <NewBuildingForm />
            </div>
        )
    }

    // Fetch Unit Info (for both Residents and Managers)
    const userApartment = await getResidentApartment(session.user.id)
    const unitName = userApartment ? getApartmentDisplayName(userApartment) : null

    // Prepare User Data
    const userData = {
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        role: session.user.role || 'resident',
        nif: session.user.nif,
        iban: session.user.iban, 
        unitName: unitName,
    }

    // --- MANAGER LOGIC ---
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

    // Gate unit creation until building has real details (not defaults)
    const isValidIban = (iban?: string | null) => {
        if (!iban) return false
        const normalized = iban.replace(/\s+/g, "")
        return /^[A-Za-z0-9]{25}$/.test(normalized)
    }

    const buildingComplete = Boolean(
        building?.name &&
        building?.nif &&
        building?.city &&
        building?.street &&
        building?.number &&
        building?.totalApartments &&
        building?.monthlyQuota !== null &&
        building?.monthlyQuota > 0 &&
        isValidIban(building?.iban) &&
        building?.name !== "My Condominium" &&
        building?.nif !== "N/A"
    )

    const unitsCreated = building?.totalApartments ? apartmentsData.length >= building.totalApartments : false
    const selfClaimed = Boolean(userApartment)
    
    const hasResidents = apartmentsData.some(a => a.resident && a.resident.id !== session.user.id)

    // Checklist remains visible until all critical steps are done AND no residents have joined yet
    const showSetupGuide = session.user.role === 'manager' && building && !hasResidents && (!buildingComplete || !unitsCreated || !selfClaimed)

    // Define Tabs
    const tabs: Array<{ label: string, value: string, icon: 'user' | 'building' | 'payments' }> = [
        { label: "Profile", value: "profile", icon: 'user' },
    ]

    // Only add Building/Billing tabs for managers
    if (session.user.role === 'manager') {
        tabs.push(
            { label: "Building", value: "building", icon: 'building' },
            { label: "Payments", value: "payments", icon: 'payments' }
        )
    }

    return (
        <div className="space-y-8 max-w-5xl">
            <div>
                <h1 className="text-2xl font-bold">Settings</h1>
                <p className="text-gray-500 text-sm mt-1">Manage your account and building preferences</p>
            </div>

            <SettingsTabs tabs={tabs}>
                {/* 1. Profile Tab */}
                <ProfileSettings user={userData} />

                {/* 2. Building Tab (Manager Only) */}
                {session.user.role === 'manager' ? (
                    building ? (
                        <div className="space-y-8">
                                {showSetupGuide && (
                                    <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg max-w-2xl">
                                        <h3 className="text-lg font-semibold text-blue-900 mb-2">Guia rápido de configuração:</h3>
                                        <ul className="space-y-1 text-sm text-blue-900">
                                            <li className="flex items-center gap-2">
                                                <div className={`w-1.5 h-1.5 rounded-full ${buildingComplete ? 'bg-green-500' : 'bg-blue-400'}`} />
                                                <span className={buildingComplete ? 'line-through text-blue-600/60' : ''}>Preencher os dados do edifício abaixo.</span>
                                            </li>
                                            <li className="flex items-center gap-2">
                                                <div className={`w-1.5 h-1.5 rounded-full ${unitsCreated ? 'bg-green-500' : 'bg-blue-400'}`} />
                                                <span className={unitsCreated ? 'line-through text-blue-600/60' : ''}>
                                                    Criar todas as frações do edifício abaixo ({apartmentsData.length}/{building?.totalApartments || 0}).
                                                </span>
                                            </li>
                                            <li className="flex items-center gap-2">
                                                <div className={`w-1.5 h-1.5 rounded-full ${selfClaimed ? 'bg-green-500' : 'bg-blue-400'}`} />
                                                <span className={selfClaimed ? 'line-through text-blue-600/60' : ''}>Selecione a sua fração para conectar com a sua conta.</span>
                                            </li>
                                            <li className="flex items-center gap-2 text-blue-600/80">
                                                <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                                                <span>Compartilhar o código de convite com os residentes assim que todas as frações existirem.</span>
                                            </li>
                                        </ul>
                                    </div>
                                )}

                                {/* Manager self-claim of a unit with the same confirmation flow as residents */}
                                {!userApartment && managerActiveBuildingId ? (
                                    <div className="p-4 bg-white border border-gray-200 rounded-lg">
                                        <h3 className="text-lg font-semibold mb-2">Claim Your Unit</h3>
                                        {unitsCreated ? (
                                            <>
                                                <p className="text-sm text-gray-500 mb-4">
                                                    Select your apartment to link your data. You&apos;ll see a confirmation step before claiming.
                                                </p>
                                                <ClaimApartmentForm
                                                    buildingId={managerActiveBuildingId}
                                                    unclaimedApartments={unclaimedUnits}
                                                />
                                            </>
                                        ) : (
                                            <div className="p-3 bg-amber-50 border border-amber-100 rounded-md text-amber-800 text-sm">
                                                Please finish creating all {building?.totalApartments || 0} units first to be able to claim your unit.
                                            </div>
                                        )}
                                    </div>
                                ) : null}

                            <BuildingSettingsForm building={building} />
                            <ApartmentManager
                                apartments={apartmentsData}
                                buildingId={building.id}
                                buildingComplete={buildingComplete}
                            />
                        </div>
                    ) : (
                        <div className="text-center py-12 bg-gray-50 rounded-lg">
                            <p className="text-gray-500">No active building selected.</p>
                        </div>
                    )
                ) : null}

                {/* 3. Payments Tab (Manager Only) */}
                {session.user.role === 'manager' ? (
                    <div className="p-8 text-center bg-gray-50 rounded-lg border border-dashed border-gray-200">
                        <CreditCard className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                        <h3 className="text-lg font-medium text-gray-900">Subscription & Billing</h3>
                        <p className="text-gray-500 text-sm mt-1">Stripe integration coming soon...</p>
                    </div>
                ) : null}
            </SettingsTabs>
        </div>
    )
}
