"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card"
import { PollCard } from "./PollCard"
import { PollModal } from "./PollModal"
import { Poll, PollStatus } from "@/lib/types"
import { cn } from "@/lib/utils"

interface Props {
    buildingId: string
    initialPolls: Poll[]
    userVotedPollIds: number[]
    isManager: boolean
}

const TABS: { value: PollStatus | "all"; label: string }[] = [
    { value: "all", label: "Todas" },
    { value: "open", label: "Abertas" },
    { value: "closed", label: "Encerradas" },
]

export function PollsList({ buildingId, initialPolls, userVotedPollIds, isManager }: Props) {
    const [activeTab, setActiveTab] = useState<PollStatus | "all">("all")
    const [modalOpen, setModalOpen] = useState(false)

    const filteredPolls = activeTab === "all"
        ? initialPolls
        : initialPolls.filter(p => p.status === activeTab)

    return (
        <>
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between w-full">
                        <CardTitle>Votações</CardTitle>
                        {isManager && (
                            <Button size="sm" onClick={() => setModalOpen(true)}>
                                <Plus className="w-4 h-4 mr-1" /> Nova Votação
                            </Button>
                        )}
                    </div>
                </CardHeader>
                <CardContent>
                    {/* Tabs */}
                    <div className="flex gap-1 mb-4 border-b border-gray-200">
                        {TABS.map((tab) => (
                            <button
                                key={tab.value}
                                onClick={() => setActiveTab(tab.value)}
                                className={cn(
                                    "px-3 py-2 text-body font-medium border-b-2 -mb-px transition-colors",
                                    activeTab === tab.value
                                        ? "border-info text-info"
                                        : "border-transparent text-gray-500 hover:text-gray-700"
                                )}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* List */}
                    {filteredPolls.length === 0 ? (
                        <p className="text-body text-gray-500 text-center py-8">
                            Nenhuma votação encontrada.
                        </p>
                    ) : (
                        <div className="grid gap-3">
                            {filteredPolls.map((poll) => (
                                <PollCard
                                    key={poll.id}
                                    poll={poll}
                                    hasVoted={userVotedPollIds.includes(poll.id)}
                                />
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {isManager && (
                <PollModal
                    isOpen={modalOpen}
                    onClose={() => setModalOpen(false)}
                    buildingId={buildingId}
                />
            )}
        </>
    )
}