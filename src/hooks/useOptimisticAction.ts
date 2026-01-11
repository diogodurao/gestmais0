"use client"

import { useOptimistic, useTransition } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/Toast"

type ActionFn<T, A> = (args: A) => Promise<{ success: boolean; data?: T; error?: string }>

interface Options<T, S> {
  onSuccess?: (data?: T) => void
  onError?: (error: string) => void
  successMessage?: string
  errorMessage?: string
  // Optional: custom optimistic update function
  optimisticUpdate?: (currentState: S, args: any) => S
  // Whether to refresh after success (default: true)
  refreshOnSuccess?: boolean
}

/**
 * Hook for server actions with optimistic UI updates
 *
 * @example
 * const [optimisticDiscussion, updateDiscussion] = useOptimisticAction(
 *   discussion,
 *   toggleDiscussionPin,
 *   {
 *     optimisticUpdate: (state) => ({ ...state, isPinned: !state.isPinned }),
 *     successMessage: "Discussão atualizada"
 *   }
 * )
 */
export function useOptimisticAction<T, A, S>(
  initialState: S,
  action: ActionFn<T, A>,
  options: Options<T, S> = {}
) {
  const router = useRouter()
  const { addToast } = useToast()
  const [isPending, startTransition] = useTransition()

  const [optimisticState, setOptimisticState] = useOptimistic(
    initialState,
    (state: S, newState: S) => newState
  )

  const execute = async (args: A) => {
    startTransition(async () => {
      // Apply optimistic update if provided
      if (options.optimisticUpdate) {
        const optimisticNewState = options.optimisticUpdate(optimisticState, args)
        setOptimisticState(optimisticNewState)
      }

      try {
        const result = await action(args)

        if (result.success) {
          if (options.successMessage) {
            addToast({
              title: "Sucesso",
              description: options.successMessage,
              variant: "success",
            })
          }
          options.onSuccess?.(result.data)

          // Refresh to get real data from server (optimistic state auto-discarded)
          if (options.refreshOnSuccess !== false) {
            router.refresh()
          }
        } else {
          const message = result.error || options.errorMessage || "Ocorreu um erro"
          addToast({
            title: "Erro",
            description: message,
            variant: "error",
            duration: 8000,
          })
          options.onError?.(message)
          // Optimistic state automatically reverts on error
        }
      } catch (err) {
        const message = options.errorMessage || "Erro inesperado"
        addToast({
          title: "Erro",
          description: message,
          variant: "error",
          duration: 8000,
        })
        options.onError?.(message)
      }
    })
  }

  return {
    state: optimisticState,
    execute,
    isPending,
  }
}
