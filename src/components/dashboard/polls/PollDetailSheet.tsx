"use client"

import { useState, useEffect, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Vote, Lock, Trash2, Calendar, Check, Edit2 } from "lucide-react"
import { Sheet } from "@/components/ui/Sheet"
import { Button } from "@/components/ui/Button"
import { Badge } from "@/components/ui/Badge"
import { Divider } from "@/components/ui/Divider"
import { Spinner } from "@/components/ui/Spinner"
import { Progress } from "@/components/ui/Progress"
import { ConfirmModal } from "@/components/ui/ConfirmModal"
import {
    getPoll,
    getPollVotes,
    getPollResults,
    getUserVote,
    castVote,
    closePoll,
    deletePoll,
} from "@/lib/actions/polls"
import { Poll, PollVote, PollResults as PollResultsType, PollStatus } from "@/lib/types"
import { POLL_STATUS_CONFIG, POLL_TYPE_CONFIG, WEIGHT_MODE_CONFIG, YES_NO_OPTIONS } from "@/lib/constants/ui"
import { useToast } from "@/components/ui/Toast"
import { formatDate } from "@/lib/format"
import { cn } from "@/lib/utils"

interface Props {
    pollId: number | null
    open: boolean
    onClose: () => void
    isManager: boolean
}

export function PollDetailSheet({ pollId, open, onClose, isManager }: Props) {
    const router = useRouter()
    const { addToast } = useToast()
    const [poll, setPoll] = useState<Poll | null>(null)
    const [userVote, setUserVote] = useState<PollVote | null>(null)
    const [results, setResults] = useState<PollResultsType | { restricted: true; message: string } | null>(null)
    const [votes, setVotes] = useState<PollVote[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [selectedOption, setSelectedOption] = useState<string | string[] | null>(null)
    const [isPending, startTransition] = useTransition()
    const [showVoteForm, setShowVoteForm] = useState(false)
    const [confirmModal, setConfirmModal] = useState<{ type: "close" | "delete" } | null>(null)

    // Fetch data when sheet opens
    useEffect(() => {
        if (open && pollId) {
            setIsLoading(true)
            Promise.all([
                getPoll(pollId),
                getUserVote(pollId),
                getPollResults(pollId),
                getPollVotes(pollId),
            ])
                .then(([p, uv, r, v]) => {
                    setPoll(p)
                    setUserVote(uv)
                    setResults(r)
                    setVotes(v)
                    setSelectedOption(null)
                    setShowVoteForm(false)
                })
                .finally(() => setIsLoading(false))
        }
    }, [open, pollId])

    // Reset state when sheet closes
    useEffect(() => {
        if (!open) {
            setPoll(null)
            setUserVote(null)
            setResults(null)
            setVotes([])
            setSelectedOption(null)
            setShowVoteForm(false)
        }
    }, [open])

    if (!open) return null

    const statusConfig = poll ? POLL_STATUS_CONFIG[poll.status as PollStatus] : null
    const canVote = poll?.status === "open"
    const canClose = isManager && poll?.status === "open"
    const canDelete = isManager && votes.length === 0
    const isRestricted = results && "restricted" in results
    const shouldShowVoting = canVote && (!userVote || showVoteForm)

    const handleVote = () => {
        if (!selectedOption || !poll) return

        startTransition(async () => {
            const result = await castVote({
                pollId: poll.id,
                vote: selectedOption,
            })

            if (result.success) {
                addToast({
                    title: userVote ? "Voto alterado" : "Voto registado",
                    description: "O seu voto foi contabilizado com sucesso.",
                    variant: "success",
                })
                // Refresh data
                const [uv, r, v] = await Promise.all([
                    getUserVote(poll.id),
                    getPollResults(poll.id),
                    getPollVotes(poll.id),
                ])
                setUserVote(uv)
                setResults(r)
                setVotes(v)
                setSelectedOption(null)
                setShowVoteForm(false)
                router.refresh()
            } else {
                addToast({ title: "Erro", description: result.error, variant: "error" })
            }
        })
    }

    const handleCloseAction = () => {
        if (!poll) return
        setConfirmModal({ type: "close" })
    }

    const confirmClosePoll = () => {
        if (!poll) return

        startTransition(async () => {
            const result = await closePoll(poll.id)
            if (result.success) {
                addToast({ title: "Sucesso", description: "Votação encerrada", variant: "success" })
                const updatedPoll = await getPoll(poll.id)
                setPoll(updatedPoll)
                router.refresh()
            } else {
                addToast({ title: "Erro", description: result.error, variant: "error" })
            }
            setConfirmModal(null)
        })
    }

    const handleDelete = () => {
        if (!poll) return
        setConfirmModal({ type: "delete" })
    }

    const confirmDelete = () => {
        if (!poll) return

        startTransition(async () => {
            const result = await deletePoll(poll.id)
            if (result.success) {
                addToast({ title: "Sucesso", description: "Votação eliminada", variant: "success" })
                router.refresh()
                onClose()
            } else {
                addToast({ title: "Erro", description: result.error, variant: "error" })
            }
            setConfirmModal(null)
        })
    }

    const getOptions = () => {
        if (!poll) return []
        if (poll.type === "yes_no") {
            return YES_NO_OPTIONS.map(o => ({ value: o.value, label: o.label }))
        }
        return [...(poll.options || []).map(o => ({ value: o, label: o })), { value: "abstain", label: "Abstenção" }]
    }

    const handleOptionSelect = (value: string) => {
        if (!poll || !canVote) return

        if (poll.type === "yes_no") {
            setSelectedOption(value)
        } else if (poll.type === "single_choice") {
            setSelectedOption([value])
        } else {
            // Multiple choice
            const current = (selectedOption as string[]) || []
            if (value === "abstain") {
                setSelectedOption(["abstain"])
            } else {
                const withoutAbstain = current.filter(v => v !== "abstain")
                if (withoutAbstain.includes(value)) {
                    setSelectedOption(withoutAbstain.filter(v => v !== value))
                } else {
                    setSelectedOption([...withoutAbstain, value])
                }
            }
        }
    }

    const isOptionSelected = (value: string) => {
        if (!selectedOption) return false
        if (typeof selectedOption === "string") return selectedOption === value
        return selectedOption.includes(value)
    }

    const getPercentage = (value: number) => {
        if (!results || "restricted" in results || results.totalWeight === 0) return 0
        return Math.round((value / results.totalWeight) * 100)
    }

    const participationRate = poll ? Math.round((votes.length / (poll.voteCount || 1)) * 100) || 0 : 0

    // Group votes by option for voter details
    const getVotesByOption = () => {
        if (!poll) return {}
        const options = poll.type === "yes_no"
            ? YES_NO_OPTIONS.map(o => o.value)
            : [...(poll.options || []), "abstain"]

        const votesByOption: Record<string, PollVote[]> = {}
        for (const option of options) {
            votesByOption[option] = votes.filter(v => {
                if (poll.type === "yes_no") {
                    return v.vote === option
                } else {
                    return (v.vote as string[]).includes(option)
                }
            })
        }
        return votesByOption
    }

    return (
        <>
        <Sheet
            open={open}
            onClose={onClose}
            title={poll?.title || "Carregando..."}
            description={poll ? `${POLL_TYPE_CONFIG[poll.type].label} • ${WEIGHT_MODE_CONFIG[poll.weightMode].label}` : undefined}
        >
            {isLoading ? (
                <div className="flex items-center justify-center py-8">
                    <Spinner />
                </div>
            ) : poll ? (
                <div className="space-y-1.5">
                    {/* Status Badges */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                        <Badge variant={statusConfig?.variant}>{statusConfig?.label}</Badge>
                        {userVote && <Badge variant="success">Votou</Badge>}
                    </div>

                    {/* Description */}
                    {poll.description && (
                        <p className="text-[11px] text-[#495057]">{poll.description}</p>
                    )}

                    <Divider />

                    {/* Dates */}
                    <div className="flex items-center gap-1 text-[10px] text-[#6C757D]">
                        <Calendar className="h-3 w-3" />
                        <span>Criada {formatDate(poll.createdAt)}</span>
                        {poll.closedAt && (
                            <span className="text-[#ADB5BD]">• Encerrada {formatDate(poll.closedAt)}</span>
                        )}
                    </div>

                    {/* Participation */}
                    <div>
                        <div className="flex items-center justify-between mb-0.5">
                            <span className="text-[9px] font-medium text-[#ADB5BD] uppercase tracking-wide">Participação</span>
                            <span className="text-[10px] font-medium text-[#495057]">{votes.length} votos</span>
                        </div>
                        <Progress value={participationRate} size="sm" />
                    </div>

                    <Divider />

                    {/* Voting / Results */}
                    <div>
                        <p className="text-[9px] font-medium text-[#ADB5BD] uppercase tracking-wide mb-1">
                            {shouldShowVoting ? (userVote ? "Alterar o seu voto" : "Selecione a sua opção") : "Resultados"}
                        </p>

                        {shouldShowVoting ? (
                            // Voting UI
                            <div className="space-y-1.5">
                                {getOptions().map((option) => (
                                    <div
                                        key={option.value}
                                        onClick={() => handleOptionSelect(option.value)}
                                        className={cn(
                                            "rounded-lg border p-1.5 transition-colors cursor-pointer hover:border-[#8FB996]",
                                            isOptionSelected(option.value) && "border-[#8FB996] bg-[#E8F0EA]",
                                            !isOptionSelected(option.value) && "border-[#E9ECEF]"
                                        )}
                                    >
                                        <span className="text-[11px] flex items-center gap-1 text-[#495057]">
                                            <span className={cn(
                                                "w-3 h-3 rounded-full border-2 flex items-center justify-center",
                                                isOptionSelected(option.value) ? "border-[#8FB996] bg-[#8FB996]" : "border-[#DEE2E6]"
                                            )}>
                                                {isOptionSelected(option.value) && <Check className="h-2 w-2 text-white" />}
                                            </span>
                                            {option.label}
                                        </span>
                                    </div>
                                ))}
                                <div className="flex gap-1.5 mt-1.5">
                                    {showVoteForm && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setShowVoteForm(false)}
                                            disabled={isPending}
                                        >
                                            Cancelar
                                        </Button>
                                    )}
                                    <Button
                                        className="flex-1"
                                        size="sm"
                                        disabled={!selectedOption || (Array.isArray(selectedOption) && selectedOption.length === 0) || isPending}
                                        onClick={handleVote}
                                    >
                                        <Vote className="h-3 w-3 mr-1" />
                                        {userVote ? "Alterar Voto" : "Confirmar Voto"}
                                    </Button>
                                </div>
                            </div>
                        ) : isRestricted ? (
                            // Restricted results - show vote button
                            <div className="text-center py-4">
                                <p className="text-[11px] text-[#6C757D] mb-2">{(results as { message: string }).message}</p>
                                {canVote && (
                                    <Button size="sm" onClick={() => setShowVoteForm(true)}>
                                        <Vote className="h-3 w-3 mr-1" />
                                        Votar agora
                                    </Button>
                                )}
                            </div>
                        ) : results && !("restricted" in results) ? (
                            // Results UI
                            <div className="space-y-1.5">
                                {getOptions().map((option) => {
                                    const value = results.results[option.value] || 0
                                    const percentage = getPercentage(value)
                                    const isUserVote = userVote?.vote === option.value ||
                                        (Array.isArray(userVote?.vote) && userVote.vote.includes(option.value))

                                    return (
                                        <div
                                            key={option.value}
                                            className={cn(
                                                "rounded-lg border p-1.5",
                                                isUserVote ? "border-[#D4E5D7] bg-[#E8F0EA]" : "border-[#E9ECEF]"
                                            )}
                                        >
                                            <div className="flex items-center justify-between mb-0.5">
                                                <span className={cn(
                                                    "text-[11px] flex items-center gap-1",
                                                    isUserVote ? "font-medium text-[#6A9B72]" : "text-[#495057]"
                                                )}>
                                                    {isUserVote && <Check className="h-3 w-3" />}
                                                    {option.label}
                                                </span>
                                                <span className="text-[10px] font-medium text-[#495057]">
                                                    {poll.weightMode === "permilagem" ? `${value.toFixed(1)}‰` : value} ({percentage}%)
                                                </span>
                                            </div>
                                            <Progress value={percentage} size="sm" />
                                        </div>
                                    )
                                })}

                                {/* Change vote button */}
                                {canVote && userVote && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setShowVoteForm(true)}
                                        className="w-full mt-1.5"
                                    >
                                        <Edit2 className="h-3 w-3 mr-1" />
                                        Alterar o meu voto
                                    </Button>
                                )}

                                {/* Individual voter details (transparency) */}
                                {votes.length > 0 && (
                                    <div className="pt-2 mt-2 border-t border-[#E9ECEF]">
                                        <p className="text-[9px] font-medium text-[#ADB5BD] uppercase tracking-wide mb-1">
                                            Votos individuais
                                        </p>
                                        <div className="space-y-1.5">
                                            {getOptions().map((option) => {
                                                const optionVotes = getVotesByOption()[option.value] || []
                                                if (optionVotes.length === 0) return null

                                                return (
                                                    <div key={option.value}>
                                                        <p className="text-[10px] font-medium text-[#6C757D] mb-0.5">
                                                            {option.label} ({optionVotes.length})
                                                        </p>
                                                        <div className="flex flex-wrap gap-1">
                                                            {optionVotes.map((vote) => (
                                                                <span
                                                                    key={vote.id}
                                                                    className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-[#F1F3F5] rounded text-[9px] text-[#495057]"
                                                                >
                                                                    {vote.userName}
                                                                    {poll.weightMode === "permilagem" && vote.apartmentPermillage && (
                                                                        <span className="text-[#ADB5BD]">
                                                                            ({vote.apartmentPermillage}‰)
                                                                        </span>
                                                                    )}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : null}
                    </div>

                    {/* Manager Actions */}
                    {isManager && (canClose || canDelete) && (
                        <>
                            <Divider />
                            <div className="flex gap-1.5">
                                {canClose && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleCloseAction}
                                        disabled={isPending}
                                        className="text-[10px]"
                                    >
                                        <Lock className="w-3 h-3 mr-1" /> Encerrar
                                    </Button>
                                )}
                                {canDelete && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleDelete}
                                        disabled={isPending}
                                        className="text-[10px] text-red-600 border-red-200 hover:bg-red-50"
                                    >
                                        <Trash2 className="w-3 h-3 mr-1" /> Eliminar
                                    </Button>
                                )}
                            </div>
                        </>
                    )}
                </div>
            ) : (
                <p className="text-[11px] text-[#ADB5BD] text-center py-4">
                    Votação não encontrada.
                </p>
            )}
        </Sheet>

        {/* Confirmation Modals */}
        <ConfirmModal
            isOpen={confirmModal?.type === "close"}
            title="Encerrar votação"
            message="Tem a certeza que deseja encerrar esta votação? Esta ação não pode ser desfeita."
            variant="warning"
            confirmText="Encerrar"
            onConfirm={confirmClosePoll}
            onCancel={() => setConfirmModal(null)}
            loading={isPending}
        />

        <ConfirmModal
            isOpen={confirmModal?.type === "delete"}
            title="Eliminar votação"
            message="Tem a certeza que deseja eliminar esta votação?"
            variant="danger"
            confirmText="Eliminar"
            onConfirm={confirmDelete}
            onCancel={() => setConfirmModal(null)}
            loading={isPending}
        />
        </>
    )
}