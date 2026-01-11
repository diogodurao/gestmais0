"use client"

import { Poll, PollVote, PollResults as PollResultsType } from "@/lib/types"
import { YES_NO_OPTIONS, WEIGHT_MODE_CONFIG } from "@/lib/constants/ui"
import { cn } from "@/lib/utils"

interface Props {
    poll: Poll
    results: PollResultsType
    votes: PollVote[]
    showVoterDetails?: boolean
}

export function PollResults({ poll, results, votes, showVoterDetails = true }: Props) {
    const options = poll.type === "yes_no"
        ? YES_NO_OPTIONS.map(o => o.value)
        : [...(poll.options || []), "abstain"]

    const optionLabels: Record<string, string> = {
        yes: "Sim",
        no: "Não",
        abstain: "Abstenção",
    }

    const getLabel = (option: string) => optionLabels[option] || option

    const getPercentage = (value: number) => {
        if (results.totalWeight === 0) return 0
        return Math.round((value / results.totalWeight) * 100)
    }

    const getBarColor = (option: string, index: number) => {
        if (option === "yes") return "bg-success"
        if (option === "no") return "bg-error"
        if (option === "abstain") return "bg-gray-400"
        // For custom options, cycle through colors
        const colors = ["bg-primary", "bg-secondary", "bg-warning", "bg-info", "bg-primary-dark"]
        return colors[index % colors.length]
    }

    // Group votes by option for voter details
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

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-body font-semibold text-gray-700">Resultados</h3>
                <span className="text-label text-gray-500">
                    {results.voteCount} voto{results.voteCount !== 1 ? "s" : ""} •{" "}
                    {WEIGHT_MODE_CONFIG[poll.weightMode].label}
                </span>
            </div>

            {/* Results Bars */}
            <div className="space-y-3">
                {options.map((option, index) => {
                    const value = results.results[option] || 0
                    const percentage = getPercentage(value)

                    return (
                        <div key={option} className="space-y-1">
                            <div className="flex items-center justify-between text-body">
                                <span className="font-medium">{getLabel(option)}</span>
                                <span className="text-gray-600">
                                    {poll.weightMode === "permilagem"
                                        ? `${value.toFixed(1)}‰`
                                        : value}{" "}
                                    ({percentage}%)
                                </span>
                            </div>
                            <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                    className={cn("h-full rounded-full transition-all", getBarColor(option, index))}
                                    style={{ width: `${percentage}%` }}
                                />
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* Voter Details (Transparent voting) */}
            {showVoterDetails && votes.length > 0 && (
                <div className="pt-4 border-t border-gray-200">
                    <h4 className="text-body font-semibold text-gray-700 mb-3">Votos individuais</h4>
                    <div className="space-y-4">
                        {options.map((option) => {
                            const optionVotes = votesByOption[option]
                            if (optionVotes.length === 0) return null

                            return (
                                <div key={option}>
                                    <p className="text-label font-medium text-gray-600 mb-1">
                                        {getLabel(option)} ({optionVotes.length})
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        {optionVotes.map((vote) => (
                                            <span
                                                key={vote.id}
                                                className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-sm text-label"
                                            >
                                                {vote.userName}
                                                {poll.weightMode === "permilagem" && vote.apartmentPermillage && (
                                                    <span className="text-gray-400">
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
    )
}