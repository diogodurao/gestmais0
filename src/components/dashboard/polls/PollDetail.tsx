"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Trash2, Lock } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/Button"
import { Card, CardContent } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { VoteForm } from "./VoteForm"
import { PollResults } from "./PollResults"
import { Poll, PollVote, PollResults as PollResultsType } from "@/lib/types"
import { POLL_STATUS_CONFIG, POLL_TYPE_CONFIG, WEIGHT_MODE_CONFIG } from "@/lib/constants/ui"
import { closePoll, deletePoll } from "@/lib/actions/polls"
import { useToast } from "@/components/ui/Toast"
import { formatDistanceToNow } from "@/lib/format"

interface Props {
    poll: Poll
    votes: PollVote[]
    results: PollResultsType | { restricted: true; message: string } | null
    userVote: PollVote | null
    isManager: boolean
    buildingId: string
}

export function PollDetail({ poll, votes, results, userVote, isManager, buildingId }: Props) {
    const router = useRouter()
    const { toast } = useToast()
    const [showVoteForm, setShowVoteForm] = useState(!userVote && poll.status === "open")
    const [isClosing, setIsClosing] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)

    const canDelete = isManager && votes.length === 0
    const canClose = isManager && poll.status === "open"
    const canVote = poll.status === "open"
    const canSeeResults = isManager || userVote !== null || poll.status === "closed"
    const isRestricted = results && "restricted" in results

    const handleClose = async () => {
        if (!confirm("Encerrar esta votação? Esta ação não pode ser desfeita.")) return

        setIsClosing(true)
        const result = await closePoll(poll.id)

        if (result.success) {
            toast({ title: "Sucesso", description: "Votação encerrada" })
        } else {
            toast({ title: "Erro", description: result.error, variant: "destructive" })
        }
        setIsClosing(false)
    }

    const handleDelete = async () => {
        if (!confirm("Eliminar esta votação?")) return

        setIsDeleting(true)
        const result = await deletePoll(poll.id)

        if (result.success) {
            toast({ title: "Sucesso", description: "Votação eliminada" })
            router.push("/dashboard/polls")
        } else {
            toast({ title: "Erro", description: result.error, variant: "destructive" })
            setIsDeleting(false)
        }
    }

    const handleVoted = () => {
        setShowVoteForm(false)
        router.refresh()
    }

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center gap-3">
                <Link href="/dashboard/polls">
                    <Button variant="outline" size="sm">
                        <ArrowLeft className="w-4 h-4 mr-1" /> Voltar
                    </Button>
                </Link>
            </div>

            {/* Poll Info */}
            <Card>
                <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <Badge status={poll.status} config={POLL_STATUS_CONFIG} />
                            <span className="text-label text-gray-400">
                                {formatDistanceToNow(poll.createdAt)}
                            </span>
                        </div>

                        {isManager && (
                            <div className="flex gap-2">
                                {canClose && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleClose}
                                        isLoading={isClosing}
                                    >
                                        <Lock className="w-4 h-4 mr-1" /> Encerrar
                                    </Button>
                                )}
                                {canDelete && (
                                    <Button
                                        variant="danger"
                                        size="sm"
                                        onClick={handleDelete}
                                        isLoading={isDeleting}
                                    >
                                        <Trash2 className="w-4 h-4 mr-1" /> Eliminar
                                    </Button>
                                )}
                            </div>
                        )}
                    </div>

                    <h1 className="text-h3 font-bold text-gray-900 mb-2">
                        {poll.title}
                    </h1>

                    <p className="text-body text-gray-500 mb-4">
                        {POLL_TYPE_CONFIG[poll.type].label} • {WEIGHT_MODE_CONFIG[poll.weightMode].label}
                    </p>

                    {poll.description && (
                        <p className="text-body text-gray-700 whitespace-pre-wrap">
                            {poll.description}
                        </p>
                    )}
                </CardContent>
            </Card>

            {/* Vote Form or Results */}
            <Card>
                <CardContent className="p-6">
                    {canVote && showVoteForm ? (
                        <VoteForm
                            poll={poll}
                            existingVote={userVote}
                            onVoted={handleVoted}
                        />
                    ) : canSeeResults && !isRestricted && results ? (
                        <>
                            <PollResults
                                poll={poll}
                                results={results as PollResultsType}
                                votes={votes}
                            />
                            {canVote && userVote && (
                                <div className="mt-4 pt-4 border-t border-gray-200">
                                    <Button
                                        variant="outline"
                                        onClick={() => setShowVoteForm(true)}
                                    >
                                        Alterar o meu voto
                                    </Button>
                                </div>
                            )}
                        </>
                    ) : isRestricted ? (
                        <div className="text-center py-8">
                            <p className="text-body text-gray-500 mb-4">
                                {(results as { message: string }).message}
                            </p>
                            {canVote && (
                                <Button onClick={() => setShowVoteForm(true)}>
                                    Votar agora
                                </Button>
                            )}
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <p className="text-body text-gray-500">
                                Votação encerrada
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}