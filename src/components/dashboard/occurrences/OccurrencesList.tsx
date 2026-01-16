"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Plus, Clock, AlertTriangle, CheckCircle, Flame } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { Card } from "@/components/ui/Card"
import { StatCard } from "@/components/ui/Stat-Card"
import { EmptyState } from "@/components/ui/Empty-State"
import { OccurrenceCard } from "./OccurrenceCard"
import { OccurrenceModal } from "./OccurrenceModal"
import { OccurrenceDetailSheet } from "./OccurrenceDetailSheet"
import { Occurrence } from "@/lib/types"

interface Props {
    buildingId: string
    initialOccurrences: Occurrence[]
    currentUserId: string
    currentUserName: string
    isManager: boolean
}

export function OccurrencesList({
    buildingId,
    initialOccurrences,
    currentUserId,
    currentUserName,
    isManager,
}: Props) {
    const searchParams = useSearchParams()
    const router = useRouter()
    const [modalOpen, setModalOpen] = useState(false)
    const [selectedOccurrenceId, setSelectedOccurrenceId] = useState<number | null>(null)

    // Open sheet from URL param
    useEffect(() => {
        const id = searchParams.get("id")
        if (id) {
            setSelectedOccurrenceId(Number(id))
        }
    }, [searchParams])

    // Stats
    const openCount = initialOccurrences.filter(o => o.status === "open").length
    const inProgressCount = initialOccurrences.filter(o => o.status === "in_progress").length
    const resolvedCount = initialOccurrences.filter(o => o.status === "resolved").length
    const urgentCount = initialOccurrences.filter(o => o.priority === "urgent" && o.status !== "resolved").length

    const handleViewOccurrence = (occurrence: Occurrence) => {
        setSelectedOccurrenceId(occurrence.id)
    }

    const handleCloseSheet = () => {
        setSelectedOccurrenceId(null)
        // Clear URL param
        if (searchParams.get("id")) {
            router.replace("/dashboard/occurrences", { scroll: false })
        }
    }

    return (
        <>
            {/* Header */}
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-h3 font-semibold text-slate-900">Ocorrências</h1>
                    <p className="text-body text-slate-500">Gestão de problemas e incidentes do condomínio</p>
                </div>
                <Button size="sm" onClick={() => setModalOpen(true)}>
                    <Plus className="w-4 h-4 mr-1" />
                    <span className="hidden sm:inline">Nova Ocorrência</span>
                </Button>
            </div>

            {/* Stats */}
            <div className="mb-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
                <StatCard
                    label="Abertas"
                    value={openCount}
                    icon={<Clock className="h-4 w-4" />}
                />
                <StatCard
                    label="Em Progresso"
                    value={inProgressCount}
                    icon={<AlertTriangle className="h-4 w-4" />}
                />
                <StatCard
                    label="Resolvidas"
                    value={resolvedCount}
                    icon={<CheckCircle className="h-4 w-4" />}
                />
                <StatCard
                    label="Urgentes"
                    value={urgentCount}
                    icon={<Flame className="h-4 w-4" />}
                />
            </div>

            {/* Occurrences List */}
            {initialOccurrences.length === 0 ? (
                <Card>
                    <EmptyState
                        title="Sem ocorrências"
                        description="Não há ocorrências registadas."
                        action={
                            <Button size="sm" onClick={() => setModalOpen(true)}>
                                <Plus className="h-4 w-4 mr-1" />
                                Criar Ocorrência
                            </Button>
                        }
                    />
                </Card>
            ) : (
                <div className="space-y-3">
                    {initialOccurrences.map((occurrence) => (
                        <OccurrenceCard
                            key={occurrence.id}
                            occurrence={occurrence}
                            onClick={() => handleViewOccurrence(occurrence)}
                        />
                    ))}
                </div>
            )}

            {/* Detail Sheet */}
            <OccurrenceDetailSheet
                occurrenceId={selectedOccurrenceId}
                open={selectedOccurrenceId !== null}
                onClose={handleCloseSheet}
                currentUserId={currentUserId}
                currentUserName={currentUserName}
                isManager={isManager}
                buildingId={buildingId}
            />

            {/* Create Modal */}
            <OccurrenceModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                buildingId={buildingId}
            />
        </>
    )
}