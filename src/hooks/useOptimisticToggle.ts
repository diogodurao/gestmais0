"use client"

import { useOptimistic, useTransition } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/Toast"

type ToggleActionFn = (id: string) => Promise<{ success: boolean; error?: string }>

interface ToggleOptions {
  successMessage?: (newValue: boolean) => string
  errorMessage?: string
}

/**
 * Hook for boolean toggle actions with optimistic UI
 *
 * @example
 * const [isPinned, togglePin, isToggling] = useOptimisticToggle(
 *   discussion.isPinned,
 *   () => toggleDiscussionPin(discussion.id),
 *   {
 *     successMessage: (pinned) => pinned ? "Discussão fixada" : "Discussão desafixada"
 *   }
 * )
 */
export function useOptimisticToggle(
  initialValue: boolean,
  action: ToggleActionFn,
  options: ToggleOptions = {}
) {
  const router = useRouter()
  const { addToast } = useToast()
  const [isPending, startTransition] = useTransition()

  const [optimisticValue, setOptimisticValue] = useOptimistic(
    initialValue,
    (_state: boolean, newValue: boolean) => newValue
  )

  const toggle = async () => {
    const newValue = !optimisticValue

    startTransition(async () => {
      // Update UI immediately
      setOptimisticValue(newValue)

      try {
        const result = await action()

        if (result.success) {
          if (options.successMessage) {
            addToast({
              title: "Sucesso",
              description: options.successMessage(newValue),
              variant: "success",
            })
          }
          // Refresh to sync with server
          router.refresh()
        } else {
          const message = result.error || options.errorMessage || "Ocorreu um erro"
          addToast({
            title: "Erro",
            description: message,
            variant: "error",
            duration: 8000,
          })
          // Optimistic state auto-reverts
        }
      } catch (err) {
        const message = options.errorMessage || "Erro inesperado"
        addToast({
          title: "Erro",
          description: message,
          variant: "error",
          duration: 8000,
        })
      }
    })
  }

  return [optimisticValue, toggle, isPending] as const
}
