"use client"

import { useState } from "react"
import { Button } from "@/components/ui/Button"
import { castVote } from "@/app/actions/polls"
import { Poll, PollVote } from "@/lib/types"
import { YES_NO_OPTIONS } from "@/lib/constants"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

interface Props {
    poll: Poll
    existingVote: PollVote | null
    onVoted: () => void
}

export function VoteForm({ poll, existingVote, onVoted }: Props) {
    const { toast } = useToast()
    const [selected, setSelected] = useState<string | string[]>(() => {
        if (existingVote) return existingVote.vote
        return poll.type === "yes_no" ? "" : []
    })
    const [isLoading, setIsLoading] = useState(false)

    const handleYesNoSelect = (value: string) => {
        setSelected(value)
    }

    const handleChoiceSelect = (value: string) => {
        if (value === "abstain") {
            setSelected(["abstain"])
            return
        }

        const currentSelected = selected as string[]

        // Remove abstain if selecting an option
        const withoutAbstain = currentSelected.filter(v => v !== "abstain")

        if (poll.type === "single_choice") {
            setSelected([value])
        } else {
            // Multiple choice
            if (withoutAbstain.includes(value)) {
                setSelected(withoutAbstain.filter(v => v !== value))
            } else {
                setSelected([...withoutAbstain, value])
            }
        }
    }

    const handleSubmit = async () => {
        if (poll.type === "yes_no" && !selected) {
            toast({ title: "Erro", description: "Selecione uma opção", variant: "destructive" })
            return
        }

        if (poll.type !== "yes_no" && (selected as string[]).length === 0) {
            toast({ title: "Erro", description: "Selecione pelo menos uma opção", variant: "destructive" })
            return
        }

        setIsLoading(true)

        const result = await castVote({
            pollId: poll.id,
            vote: selected,
        })

        if (result.success) {
            toast({
                title: "Sucesso",
                description: existingVote ? "Voto atualizado" : "Voto registado"
            })
            onVoted()
        } else {
            toast({ title: "Erro", description: result.error, variant: "destructive" })
        }

        setIsLoading(false)
    }

    const isAbstain = poll.type !== "yes_no" && (selected as string[]).includes("abstain")

    return (
        <div className="space-y-4">
            <h3 className="text-body font-bold text-slate-700">
                {existingVote ? "Alterar o seu voto" : "Votar"}
            </h3>

            {poll.type === "yes_no" ? (
                <div className="grid grid-cols-3 gap-2">
                    {YES_NO_OPTIONS.map((option) => (
                        <button
                            key={option.value}
                            onClick={() => handleYesNoSelect(option.value)}
                            className={cn(
                                "p-3 rounded-lg border-2 text-body font-medium transition-colors",
                                selected === option.value
                                    ? "border-blue-600 bg-blue-50 text-blue-700"
                                    : "border-slate-200 hover:border-slate-300"
                            )}
                        >
                            {option.label}
                        </button>
                    ))}
                </div>
            ) : (
                <div className="space-y-2">
                    {poll.options?.map((option) => (
                        <button
                            key={option}
                            onClick={() => handleChoiceSelect(option)}
                            disabled={isAbstain}
                            className={cn(
                                "w-full p-3 rounded-lg border-2 text-left text-body transition-colors",
                                (selected as string[]).includes(option)
                                    ? "border-blue-600 bg-blue-50 text-blue-700 font-medium"
                                    : "border-slate-200 hover:border-slate-300",
                                isAbstain && "opacity-50 cursor-not-allowed"
                            )}
                        >
                            {option}
                        </button>
                    ))}
                    <button
                        onClick={() => handleChoiceSelect("abstain")}
                        className={cn(
                            "w-full p-3 rounded-lg border-2 text-left text-body transition-colors",
                            isAbstain
                                ? "border-slate-600 bg-slate-50 text-slate-700 font-medium"
                                : "border-slate-200 hover:border-slate-300"
                        )}
                    >
                        Abstenção
                    </button>
                    <p className="text-label text-slate-400">
                        {poll.type === "single_choice"
                            ? "Selecione uma opção"
                            : "Selecione uma ou mais opções"}
                    </p>
                </div>
            )}

            <Button
                onClick={handleSubmit}
                isLoading={isLoading}
                fullWidth
            >
                {existingVote ? "Alterar Voto" : "Confirmar Voto"}
            </Button>
        </div>
    )
}