"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/Card"
import { TabButton } from "@/components/ui/TabButton"
import { User, Building, Key, CreditCard, Bell } from "lucide-react"

type SettingsTab = "profile" | "building" | "apartments" | "subscription" | "notifications"

interface SettingsLayoutProps {
    isManager: boolean
    children: {
        profile: React.ReactNode
        building?: React.ReactNode
        apartments?: React.ReactNode
        subscription?: React.ReactNode
        notifications: React.ReactNode
    }
    defaultTab?: SettingsTab
}

export function SettingsLayout({ isManager, children, defaultTab = "profile" }: SettingsLayoutProps) {
    const [activeTab, setActiveTab] = useState<SettingsTab>(defaultTab)

    const tabs = [
        { id: "profile" as const, label: "Perfil", icon: <User className="h-3.5 w-3.5" />, show: true },
        { id: "building" as const, label: "Edifício", icon: <Building className="h-3.5 w-3.5" />, show: isManager },
        { id: "apartments" as const, label: "Frações", icon: <Key className="h-3.5 w-3.5" />, show: isManager },
        { id: "subscription" as const, label: "Subscrição", icon: <CreditCard className="h-3.5 w-3.5" />, show: isManager },
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
            case "notifications":
                return children.notifications
            default:
                return children.profile
        }
    }

    return (
        <div className="grid gap-1.5 lg:grid-cols-4">
            {/* Sidebar - Desktop */}
            <Card className="hidden lg:block lg:col-span-1">
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
                </CardContent>
            </Card>

            {/* Horizontal tabs - Mobile/Tablet */}
            <div className="lg:hidden">
                <Card>
                    <CardContent className="p-1 overflow-x-auto">
                        <div className="flex gap-0.5 min-w-max">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center gap-1 px-2 py-1.5 rounded text-label font-medium transition-colors whitespace-nowrap ${
                                        activeTab === tab.id
                                            ? "bg-primary-light text-primary-dark"
                                            : "text-gray-600 hover:bg-gray-50"
                                    }`}
                                >
                                    {tab.icon}
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Content Area */}
            <div className="lg:col-span-3">
                {renderContent()}
            </div>
        </div>
    )
}