"use client"

import { useState, useEffect } from "react"
import dynamic from "next/dynamic"
import { useSearchParams, useRouter } from "next/navigation"
import { Plus, MessageSquare, Pin } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { Card } from "@/components/ui/Card"
import { StatCard } from "@/components/ui/Stat-Card"
import { EmptyState } from "@/components/ui/Empty-State"
import { DiscussionCard } from "./DiscussionCard"
import { DiscussionModal } from "./DiscussionModal"
import { Discussion } from "@/lib/types"
import { cn } from "@/lib/utils"

const DiscussionDetailSheet = dynamic(
    () => import("./DiscussionDetailSheet").then(mod => mod.DiscussionDetailSheet),
    { ssr: false }
)

interface Props {
    buildingId: string
    initialDiscussions: Discussion[]
    currentUserId: string
    currentUserName: string
    isManager: boolean
}

type FilterTab = "all" | "open" | "closed"

const TABS: { value: FilterTab; label: string }[] = [
    { value: "all", label: "Todas" },
    { value: "open", label: "Abertas" },
    { value: "closed", label: "Encerradas" },
]

export function DiscussionsList({
    buildingId,
    initialDiscussions,
    currentUserId,
    currentUserName,
    isManager,
}: Props) {
    const searchParams = useSearchParams()
    const router = useRouter()
    const [activeTab, setActiveTab] = useState<FilterTab>("all")
    const [modalOpen, setModalOpen] = useState(false)
    const [selectedDiscussionId, setSelectedDiscussionId] = useState<number | null>(null)

    // Open sheet from URL param
    useEffect(() => {
        const id = searchParams.get("id")
        if (id) {
            setSelectedDiscussionId(Number(id))
        }
    }, [searchParams])

    // Stats
    const totalDiscussions = initialDiscussions.length
    const openCount = initialDiscussions.filter(d => !d.isClosed).length
    const closedCount = initialDiscussions.filter(d => d.isClosed).length
    const pinnedCount = initialDiscussions.filter(d => d.isPinned).length

    // Filter discussions
    const filteredDiscussions = activeTab === "all"
        ? initialDiscussions
        : activeTab === "open"
            ? initialDiscussions.filter(d => !d.isClosed)
            : initialDiscussions.filter(d => d.isClosed)

    // Sort: pinned first, then by last activity
    const sortedDiscussions = [...filteredDiscussions].sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1
        if (!a.isPinned && b.isPinned) return 1
        return new Date(b.lastActivityAt).getTime() - new Date(a.lastActivityAt).getTime()
    })

    const handleViewDiscussion = (discussion: Discussion) => {
        setSelectedDiscussionId(discussion.id)
    }

    const handleCloseSheet = () => {
        setSelectedDiscussionId(null)
        // Clear URL param
        if (searchParams.get("id")) {
            router.replace("/dashboard/discussions", { scroll: false })
        }
    }

    return (
        <>
            {/* Header */}
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-h3 font-semibold text-slate-900">Discussões</h1>
                    <p className="text-body text-slate-500">Fórum de discussão do condomínio</p>
                </div>
                <Button size="sm" onClick={() => setModalOpen(true)}>
                    <Plus className="w-4 h-4 mr-1" />
                    <span className="hidden sm:inline">Nova Discussão</span>
                </Button>
            </div>

            {/* Stats */}
            <div className="mb-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
                <StatCard
                    label="Total"
                    value={totalDiscussions}
                    icon={<MessageSquare className="h-4 w-4" />}
                />
                <StatCard
                    label="Abertas"
                    value={openCount}
                    icon={<MessageSquare className="h-4 w-4" />}
                />
                <StatCard
                    label="Encerradas"
                    value={closedCount}
                    icon={<MessageSquare className="h-4 w-4" />}
                />
                <StatCard
                    label="Fixadas"
                    value={pinnedCount}
                    icon={<Pin className="h-4 w-4" />}
                />
            </div>

            {/* Tabs */}
            <div className="flex gap-1 mb-4 border-b border-gray-200">
                {TABS.map((tab) => (
                    <button
                        key={tab.value}
                        onClick={() => setActiveTab(tab.value)}
                        className={cn(
                            "px-3 py-2 text-body font-medium border-b-2 -mb-px transition-colors",
                            activeTab === tab.value
                                ? "border-[#8FB996] text-[#6A9B72]"
                                : "border-transparent text-gray-500 hover:text-gray-700"
                        )}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Discussions List */}
            {sortedDiscussions.length === 0 ? (
                <Card>
                    <EmptyState
                        title="Sem discussões"
                        description={activeTab !== "all"
                            ? "Nenhuma discussão corresponde ao filtro."
                            : "Não há discussões registadas."
                        }
                        action={
                            <Button size="sm" onClick={() => setModalOpen(true)}>
                                <Plus className="h-4 w-4 mr-1" />
                                Criar Discussão
                            </Button>
                        }
                    />
                </Card>
            ) : (
                <div className="space-y-3">
                    {sortedDiscussions.map((discussion) => (
                        <DiscussionCard
                            key={discussion.id}
                            discussion={discussion}
                            onClick={() => handleViewDiscussion(discussion)}
                        />
                    ))}
                </div>
            )}

            {/* Detail Sheet */}
            <DiscussionDetailSheet
                discussionId={selectedDiscussionId}
                open={selectedDiscussionId !== null}
                onClose={handleCloseSheet}
                currentUserId={currentUserId}
                currentUserName={currentUserName}
                isManager={isManager}
                buildingId={buildingId}
            />

            {/* Create Modal */}
            <DiscussionModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                buildingId={buildingId}
            />
        </>
    )
}