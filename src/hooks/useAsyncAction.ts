"use client"

import { useTransition } from "react"
import { useToast } from "@/components/ui/toast"

type ActionFn<T, A> = (args: A) => Promise<{ success: boolean; data?: T; error?: string }>

interface Options<T> {
  onSuccess?: (data?: T) => void
  onError?: (error: string) => void
  successMessage?: string
  errorMessage?: string
}

export function useAsyncAction<T, A = any>(
  action: ActionFn<T, A>,
  options: Options<T> = {}
) {
  const [isPending, startTransition] = useTransition()
  const { addToast } = useToast()

  const execute = async (args: A) => {
    startTransition(async () => {
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
        } else {
          const message = result.error || options.errorMessage || "Ocorreu um erro"
          addToast({
            title: "Erro",
            description: message,
            variant: "error",
            duration: 8000,
          })
          options.onError?.(message)
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

  return { execute, isPending }
}
