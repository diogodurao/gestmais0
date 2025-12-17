import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { getBuilding, getBuildingApartments } from "@/app/actions/building"
import { BuildingSettingsForm } from "@/features/dashboard/BuildingSettingsForm"
import { ApartmentManager } from "@/features/dashboard/ApartmentManager"
import { NewBuildingForm } from "@/features/dashboard/NewBuildingForm"
import { SettingsTabs } from "@/features/dashboard/SettingsTabs"
import { ProfileSettings } from "@/features/dashboard/ProfileSettings"
import { User, Building, CreditCard } from "lucide-react"

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

    // Prepare User Data
    const userData = {
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        role: session.user.role || 'resident',
        nif: session.user.nif,
        iban: session.user.iban, 
    }

    // --- MANAGER LOGIC ---
    let building = null
    let apartmentsData: any[] = []

    if (session.user.role === 'manager' && session.user.activeBuildingId) {
        building = await getBuilding(session.user.activeBuildingId)
        if (building) {
            apartmentsData = await getBuildingApartments(session.user.activeBuildingId)
        }
    }

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
                            <BuildingSettingsForm building={building} />
                            <ApartmentManager
                                apartments={apartmentsData}
                                buildingId={building.id}
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
