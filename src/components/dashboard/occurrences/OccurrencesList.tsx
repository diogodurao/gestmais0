"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card"
import { OccurrenceCard } from "./OccurrenceCard"
import { OccurrenceModal } from "./OccurrenceModal"
import { Occurrence, OccurrenceStatus } from "@/lib/types"
import { cn } from "@/lib/utils"

interface Props {
    buildingId: string
    initialOccurrences: Occurrence[]
}

const TABS: { value: OccurrenceStatus | "all"; label: string }[] = [
    { value: "all", label: "Todas" },
    { value: "open", label: "Abertas" },
    { value: "in_progress", label: "Em Progresso" },
    { value: "resolved", label: "Resolvidas" },
]

export function OccurrencesList({ buildingId, initialOccurrences }: Props) {
    const [activeTab, setActiveTab] = useState<OccurrenceStatus | "all">("all")
    const [modalOpen, setModalOpen] = useState(false)

    const filteredOccurrences = activeTab === "all"
        ? initialOccurrences
        : initialOccurrences.filter(o => o.status === activeTab)

    return (
        <>
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between w-full">
                        <CardTitle>Ocorrências</CardTitle>
                        <Button size="sm" onClick={() => setModalOpen(true)}>
                            <Plus className="w-4 h-4 mr-1" /> Nova Ocorrência
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
                    {filteredOccurrences.length === 0 ? (
                        <p className="text-body text-slate-500 text-center py-8">
                            Nenhuma ocorrência encontrada.
                        </p>
                    ) : (
                        <div className="grid gap-3">
                            {filteredOccurrences.map((occurrence) => (
                                <OccurrenceCard key={occurrence.id} occurrence={occurrence} />
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            <OccurrenceModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                buildingId={buildingId}
            />
        </>
    )
}