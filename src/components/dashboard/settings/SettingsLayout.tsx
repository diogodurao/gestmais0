"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent } from "@/components/ui/Card"
import { TabButton } from "@/components/ui/TabButton"
import { User, Building, Key, CreditCard, Bell, Landmark } from "lucide-react"

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
    const [activeTab, setActiveTab] = useState<SettingsTab>(defaultTab)

    // Sync tab from URL after hydration to avoid mismatch
    useEffect(() => {
        const tabFromUrl = searchParams.get("tab")
        if (tabFromUrl && validTabs.includes(tabFromUrl as SettingsTab)) {
            setActiveTab(tabFromUrl as SettingsTab)
        }
    }, [searchParams])

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
                </CardContent>
            </Card>

            {/* Content Area */}
            <div className="lg:col-span-3">
                {renderContent()}
            </div>
        </div>
    )
}