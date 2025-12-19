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
import { CreditCard, AlertCircle, CheckCircle } from "lucide-react"
import { getApartmentDisplayName } from "@/lib/utils"
import { isProfileComplete, isBuildingComplete } from "@/lib/validations"

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

    // Use centralized validation
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

    // Use centralized validation
    const buildingComplete = building ? isBuildingComplete(building) : false
    const unitsCreated = building?.totalApartments ? apartmentsData.length >= building.totalApartments : false
    const selfClaimed = Boolean(userApartment)
    const hasResidents = apartmentsData.some(a => a.resident && a.resident.id !== session.user.id)
    const showSetupGuide = session.user.role === 'manager' && building && !hasResidents && (!buildingComplete || !unitsCreated || !selfClaimed)
    const canSubscribe = profileComplete && buildingComplete

    const tabs: Array<{ label: string, value: string, icon: 'user' | 'building' | 'payments' }> = [
        { label: "Profile", value: "profile", icon: 'user' },
    ]

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

                            {!userApartment && managerActiveBuildingId ? (
                                <div className="p-4 bg-white border border-gray-200 rounded-lg">
                                    <h3 className="text-lg font-semibold mb-2">Claim Your Unit</h3>
                                    {unitsCreated ? (
                                        <>
                                            <p className="text-sm text-gray-500 mb-4">Select your apartment to link your data.</p>
                                            <ClaimApartmentForm buildingId={managerActiveBuildingId} unclaimedApartments={unclaimedUnits} />
                                        </>
                                    ) : (
                                        <div className="p-3 bg-amber-50 border border-amber-100 rounded-md text-amber-800 text-sm">
                                            Please finish creating all {building?.totalApartments || 0} units first to be able to claim your unit.
                                        </div>
                                    )}
                                </div>
                            ) : null}

                            <BuildingSettingsForm building={building} />
                            <ApartmentManager apartments={apartmentsData} buildingId={building.id} buildingComplete={buildingComplete} />
                        </div>
                    ) : (
                        <div className="text-center py-12 bg-gray-50 rounded-lg">
                            <p className="text-gray-500">No active building selected.</p>
                        </div>
                    )
                ) : null}

                {/* 3. Payments Tab (Manager Only) */}
                {session.user.role === 'manager' && building ? (
                    <div className="space-y-6 max-w-2xl">
                        {!canSubscribe && (
                            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                                <div className="flex items-start gap-3">
                                    <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
                                    <div>
                                        <h3 className="font-semibold text-amber-900 mb-2">Complete Setup Before Subscribing</h3>
                                        <p className="text-sm text-amber-800 mb-3">You need to complete the following steps before you can subscribe:</p>
                                        <ul className="space-y-2 text-sm">
                                            <li className="flex items-center gap-2">
                                                {profileComplete ? <CheckCircle className="w-4 h-4 text-green-600" /> : <div className="w-4 h-4 rounded-full border-2 border-amber-400" />}
                                                <span className={profileComplete ? 'text-green-800' : 'text-amber-800'}>Fill in your profile (Name, NIF, IBAN)</span>
                                                {!profileComplete && <span className="text-xs text-amber-600 bg-amber-100 px-2 py-0.5 rounded">Go to Profile tab</span>}
                                            </li>
                                            <li className="flex items-center gap-2">
                                                {buildingComplete ? <CheckCircle className="w-4 h-4 text-green-600" /> : <div className="w-4 h-4 rounded-full border-2 border-amber-400" />}
                                                <span className={buildingComplete ? 'text-green-800' : 'text-amber-800'}>Complete building details</span>
                                                {!buildingComplete && <span className="text-xs text-amber-600 bg-amber-100 px-2 py-0.5 rounded">Go to Building tab</span>}
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-blue-50 rounded-lg">
                                    <CreditCard className="w-6 h-6 text-blue-600" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-semibold">Subscription Status</h2>
                                    <p className="text-sm text-gray-500">Manage your building's subscription plans</p>
                                </div>
                            </div>

                            {building.subscriptionStatus === 'active' ? (
                                <div className="p-4 bg-green-50 border border-green-200 rounded-md flex justify-between items-center">
                                    <div>
                                        <p className="font-semibold text-green-900">Active Subscription</p>
                                        <p className="text-sm text-green-700">Your building features are fully unlocked.</p>
                                    </div>
                                    <div className="px-3 py-1 bg-white rounded-full text-xs font-medium text-green-700 border border-green-200">Active</div>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    <div className="p-4 bg-amber-50 border border-amber-200 rounded-md">
                                        <h3 className="font-semibold text-amber-900 mb-1">Subscription Required</h3>
                                        <p className="text-sm text-amber-800 mb-3">To activate your building and unlock all features, please complete the subscription.</p>
                                        <ul className="list-disc pl-5 text-sm text-amber-800 space-y-1">
                                            <li>Unlimited Residents</li>
                                            <li>Financial Management</li>
                                            <li>Document Storage</li>
                                        </ul>
                                    </div>

                                    {canSubscribe ? (
                                        (() => {
                                            const { SubscribeButton, SyncSubscriptionButton } = require("@/features/dashboard/SubscribeButton")
                                            return (
                                                <>
                                                    <SubscribeButton buildingId={building.id} quantity={building.totalApartments || 1} pricePerUnit={300} />
                                                    <SyncSubscriptionButton buildingId={building.id} />
                                                </>
                                            )
                                        })()
                                    ) : (
                                        <div className="p-4 bg-gray-100 border border-gray-200 rounded-md">
                                            <p className="text-sm text-gray-600 text-center">Complete the setup requirements above to enable subscription.</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                ) : null}
            </SettingsTabs>
        </div>
    )
}