"use client"

import { useState, useMemo } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card"
import { DiscussionCard } from "./DiscussionCard"
import { DiscussionModal } from "./DiscussionModal"
import { Discussion } from "@/lib/types"
import { cn } from "@/lib/utils"

interface Props {
    buildingId: string
    initialDiscussions: Discussion[]
}

type FilterTab = "all" | "open" | "closed"

const TABS: { value: FilterTab; label: string }[] = [
    { value: "all", label: "Todas" },
    { value: "open", label: "Abertas" },
    { value: "closed", label: "Encerradas" },
]

export function DiscussionsList({ buildingId, initialDiscussions }: Props) {
    const [activeTab, setActiveTab] = useState<FilterTab>("all")
    const [modalOpen, setModalOpen] = useState(false)

    // Memoize filtered discussions to avoid recalculating on every render
    const filteredDiscussions = useMemo(() => {
        if (activeTab === "all") return initialDiscussions
        if (activeTab === "open") return initialDiscussions.filter(d => !d.isClosed)
        return initialDiscussions.filter(d => d.isClosed)
    }, [initialDiscussions, activeTab])

    return (
        <>
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between w-full">
                        <CardTitle>Discussões</CardTitle>
                        <Button size="sm" onClick={() => setModalOpen(true)}>
                            <Plus className="w-4 h-4 mr-1" /> Nova Discussão
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {/* Tabs */}
                    <div className="flex gap-1 mb-4 border-b border-slate-200">
                        {TABS.map((tab) => (
                            <button
                                key={tab.value}
                                onClick={() => setActiveTab(tab.value)}
                                className={cn(
                                    "px-3 py-2 text-body font-medium border-b-2 -mb-px transition-colors",
                                    activeTab === tab.value
                                        ? "border-blue-600 text-blue-600"
                                        : "border-transparent text-slate-500 hover:text-slate-700"
                                )}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* List */}
                    {filteredDiscussions.length === 0 ? (
                        <p className="text-body text-slate-500 text-center py-8">
                            Nenhuma discussão encontrada.
                        </p>
                    ) : (
                        <div className="grid gap-3">
                            {filteredDiscussions.map((discussion) => (
                                <DiscussionCard key={discussion.id} discussion={discussion} />
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            <DiscussionModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                buildingId={buildingId}
            />
        </>
    )
}