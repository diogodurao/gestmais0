"use client"

import { useState, useMemo, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Plus, Vote, CheckCircle, Clock, BarChart3, Search } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { Card, CardContent } from "@/components/ui/Card"
import { Input } from "@/components/ui/Input"
import { StatCard } from "@/components/ui/Stat-Card"
import { EmptyState } from "@/components/ui/Empty-State"
import { PollCard } from "./PollCard"
import { PollModal } from "./PollModal"
import { PollDetailSheet } from "./PollDetailSheet"
import { Poll, PollStatus } from "@/lib/types"

type FilterStatus = PollStatus | "all"

interface Props {
    buildingId: string
    initialPolls: Poll[]
    userVotedPollIds: number[]
    isManager: boolean
}

export function PollsList({ buildingId, initialPolls, userVotedPollIds, isManager }: Props) {
    const searchParams = useSearchParams()
    const router = useRouter()
    const [modalOpen, setModalOpen] = useState(false)
    const [selectedPollId, setSelectedPollId] = useState<number | null>(null)
    const [searchTerm, setSearchTerm] = useState("")
    const [filterStatus, setFilterStatus] = useState<FilterStatus>("all")

    // Open sheet from URL param
    useEffect(() => {
        const id = searchParams.get("id")
        if (id) {
            setSelectedPollId(Number(id))
        }
    }, [searchParams])

    // Stats
    const activeCount = initialPolls.filter(p => p.status === "open").length
    const closedCount = initialPolls.filter(p => p.status === "closed").length
    const totalVotes = initialPolls.reduce((sum, p) => sum + (p.voteCount || 0), 0)
    const avgParticipation = initialPolls.length > 0
        ? Math.round(userVotedPollIds.length / initialPolls.length * 100)
        : 0

    // Filtered polls
    const filteredPolls = useMemo(() => {
        return initialPolls.filter((poll) => {
            // Search filter
            if (searchTerm && !poll.title.toLowerCase().includes(searchTerm.toLowerCase())) {
                return false
            }
            // Status filter
            if (filterStatus !== "all" && poll.status !== filterStatus) {
                return false
            }
            return true
        })
    }, [initialPolls, searchTerm, filterStatus])

    const handleViewPoll = (poll: Poll) => {
        setSelectedPollId(poll.id)
    }

    const handleCloseSheet = () => {
        setSelectedPollId(null)
        // Clear URL param
        if (searchParams.get("id")) {
            router.replace("/dashboard/polls", { scroll: false })
        }
    }

    const hasFilters = searchTerm || filterStatus !== "all"

    return (
        <>
            {/* Header */}
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-h3 font-semibold text-slate-900">Votações</h1>
                    <p className="text-body text-slate-500">Sistema de votação do condomínio</p>
                </div>
                {isManager && (
                    <Button size="sm" onClick={() => setModalOpen(true)}>
                        <Plus className="w-4 h-4 mr-1" />
                        <span className="hidden sm:inline">Nova Votação</span>
                    </Button>
                )}
            </div>

            {/* Stats */}
            <div className="mb-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
                <StatCard
                    label="Ativas"
                    value={activeCount}
                    icon={<Vote className="h-4 w-4" />}
                />
                <StatCard
                    label="Encerradas"
                    value={closedCount}
                    icon={<CheckCircle className="h-4 w-4" />}
                />
                <StatCard
                    label="Total Votos"
                    value={totalVotes}
                    icon={<BarChart3 className="h-4 w-4" />}
                />
                <StatCard
                    label="Participação"
                    value={`${avgParticipation}%`}
                    icon={<Clock className="h-4 w-4" />}
                />
            </div>

            {/* Search & Filter */}
            <Card className="mb-4">
                <CardContent className="flex flex-wrap items-center gap-2">
                    <div className="relative flex-1 min-w-[150px]">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                            type="text"
                            placeholder="Pesquisar votações..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9"
                        />
                    </div>
                    <div className="flex gap-1.5">
                        <Button
                            variant={filterStatus === "all" ? "primary" : "outline"}
                            size="sm"
                            onClick={() => setFilterStatus("all")}
                        >
                            Todas
                        </Button>
                        <Button
                            variant={filterStatus === "open" ? "primary" : "outline"}
                            size="sm"
                            onClick={() => setFilterStatus("open")}
                        >
                            Ativas
                        </Button>
                        <Button
                            variant={filterStatus === "closed" ? "primary" : "outline"}
                            size="sm"
                            onClick={() => setFilterStatus("closed")}
                        >
                            Encerradas
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Polls List */}
            {filteredPolls.length === 0 ? (
                <Card>
                    <EmptyState
                        title="Sem votações"
                        description={hasFilters
                            ? "Nenhuma votação corresponde aos filtros."
                            : "Não há votações registadas."
                        }
                        action={!hasFilters && isManager ? (
                            <Button size="sm" onClick={() => setModalOpen(true)}>
                                <Plus className="h-4 w-4 mr-1" />
                                Criar Votação
                            </Button>
                        ) : undefined}
                    />
                </Card>
            ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                    {filteredPolls.map((poll) => (
                        <PollCard
                            key={poll.id}
                            poll={poll}
                            hasVoted={userVotedPollIds.includes(poll.id)}
                            onClick={() => handleViewPoll(poll)}
                        />
                    ))}
                </div>
            )}

            {/* Detail Sheet */}
            <PollDetailSheet
                pollId={selectedPollId}
                open={selectedPollId !== null}
                onClose={handleCloseSheet}
                isManager={isManager}
            />

            {/* Create Modal */}
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