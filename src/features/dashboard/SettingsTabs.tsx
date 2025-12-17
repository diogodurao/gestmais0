"use client"

import { useState } from "react"
import { LucideIcon, User, Building, CreditCard } from "lucide-react"
import { cn } from "@/components/ui/Button"

const iconMap = {
    user: User,
    building: Building,
    payments: CreditCard,
} as const

type Tab = {
    label: string
    value: string
    icon: keyof typeof iconMap
}

export function SettingsTabs({
    tabs,
    children
}: {
    tabs: Tab[]
    children: React.ReactNode // We expect children to be an array corresponding to tabs order
}) {
    const [activeTab, setActiveTab] = useState(tabs[0].value)

    // Convert children to array to access by index
    const childrenArray = Array.isArray(children) ? children : [children]

    return (
        <div className="space-y-6">
            {/* Tabs List */}
            <div className="flex border-b border-gray-200">
                {tabs.map((tab) => {
                    const isActive = activeTab === tab.value
                    const Icon = iconMap[tab.icon]
                    return (
                        <button
                            key={tab.value}
                            onClick={() => setActiveTab(tab.value)}
                            className={cn(
                                "flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors -mb-px",
                                isActive 
                                    ? "border-black text-black" 
                                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                            )}
                        >
                            <Icon className="w-4 h-4" />
                            {tab.label}
                        </button>
                    )
                })}
            </div>

            {/* Tab Content */}
            <div className="min-h-[400px]">
                {tabs.map((tab, index) => {
                    if (tab.value !== activeTab) return null
                    return (
                        <div key={tab.value} className="animate-in fade-in slide-in-from-bottom-2 duration-200">
                            {childrenArray[index]}
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
