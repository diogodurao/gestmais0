"use client"

import { useState, useEffect, useTransition } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/Card"
import { TabButton } from "@/components/ui/TabButton"
import { Modal } from "@/components/ui/Modal"
import { Button } from "@/components/ui/Button"
import { User, Building, Key, CreditCard, Bell, Landmark, LogOut } from "lucide-react"
import { authClient } from "@/lib/auth-client"

type SettingsTab = "profile" | "building" | "apartments" | "subscription" | "banking" | "notifications"

const validTabs: SettingsTab[] = ["profile", "building", "apartments", "subscription", "banking", "notifications"]

interface SettingsLayoutProps {
    isManager: boolean
    children: {
        profile: React.ReactNode
        building?: React.ReactNode
        apartments?: React.ReactNode
        subscription?: React.ReactNode
        banking?: React.ReactNode
        notifications: React.ReactNode
    }
    defaultTab?: SettingsTab
}

export function SettingsLayout({ isManager, children, defaultTab = "profile" }: SettingsLayoutProps) {
    const searchParams = useSearchParams()
    const router = useRouter()
    const [activeTab, setActiveTab] = useState<SettingsTab>(defaultTab)
    const [isLoggingOut, startLogout] = useTransition()
    const [showLogoutModal, setShowLogoutModal] = useState(false)

    // Sync tab from URL after hydration to avoid mismatch
    useEffect(() => {
        const tabFromUrl = searchParams.get("tab")
        if (tabFromUrl && validTabs.includes(tabFromUrl as SettingsTab)) {
            setActiveTab(tabFromUrl as SettingsTab)
        }
    }, [searchParams])

    const handleLogout = () => {
        startLogout(async () => {
            await authClient.signOut()
            router.push("/sign-in")
        })
    }

    const tabs = [
        { id: "profile" as const, label: "Perfil", icon: <User className="h-3.5 w-3.5" />, show: true },
        { id: "building" as const, label: "Edifício", icon: <Building className="h-3.5 w-3.5" />, show: isManager },
        { id: "apartments" as const, label: "Frações", icon: <Key className="h-3.5 w-3.5" />, show: isManager },
        { id: "subscription" as const, label: "Subscrição", icon: <CreditCard className="h-3.5 w-3.5" />, show: isManager },
        { id: "banking" as const, label: "Open Banking", icon: <Landmark className="h-3.5 w-3.5" />, show: isManager },
        { id: "notifications" as const, label: "Notificações", icon: <Bell className="h-3.5 w-3.5" />, show: true },
    ].filter(tab => tab.show)

    const renderContent = () => {
        switch (activeTab) {
            case "profile":
                return children.profile
            case "building":
                return children.building
            case "apartments":
                return children.apartments
            case "subscription":
                return children.subscription
            case "banking":
                return children.banking
            case "notifications":
                return children.notifications
            default:
                return children.profile
        }
    }

    return (
        <div className="grid gap-1.5 lg:grid-cols-4">
            {/* Sidebar */}
            <Card className="lg:col-span-1">
                <CardContent className="p-1.5">
                    <div className="space-y-0.5">
                        {tabs.map((tab) => (
                            <TabButton
                                key={tab.id}
                                icon={tab.icon}
                                label={tab.label}
                                active={activeTab === tab.id}
                                onClick={() => setActiveTab(tab.id)}
                            />
                        ))}
                    </div>

                    {/* Logout */}
                    <div className="mt-3 pt-3 border-t border-gray-200">
                        <button
                            onClick={() => setShowLogoutModal(true)}
                            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-body text-red-600 hover:bg-red-50 transition-colors"
                        >
                            <LogOut className="h-3.5 w-3.5" />
                            Terminar Sessão
                        </button>
                    </div>
                </CardContent>
            </Card>

            {/* Logout Confirmation Modal */}
            <Modal
                open={showLogoutModal}
                onClose={() => setShowLogoutModal(false)}
                title="Terminar Sessão"
                description="Tem a certeza que deseja sair da sua conta?"
                size="sm"
                footer={
                    <div className="flex gap-2 justify-end">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowLogoutModal(false)}
                            disabled={isLoggingOut}
                        >
                            Cancelar
                        </Button>
                        <Button
                            variant="primary"
                            size="sm"
                            onClick={handleLogout}
                            disabled={isLoggingOut}
                        >
                            {isLoggingOut ? "A sair..." : "Terminar Sessão"}
                        </Button>
                    </div>
                }
            >
                <p className="text-body text-gray-600">
                    Será redirecionado para a página de login.
                </p>
            </Modal>

            {/* Content Area */}
            <div className="lg:col-span-3">
                {renderContent()}
            </div>
        </div>
    )
}