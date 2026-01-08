"use client"

import { useTransition } from "react"
import { useToast } from "@/hooks/use-toast"

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
  const { toast } = useToast()

  const execute = async (args: A) => {
    startTransition(async () => {
      try {
        const result = await action(args)

        if (result.success) {
          if (options.successMessage) {
            toast({
              title: "Sucesso",
              description: options.successMessage,
              variant: "default",
            })
          }
          options.onSuccess?.(result.data)
        } else {
          const message = result.error || options.errorMessage || "Ocorreu um erro"
          toast({
            title: "Erro",
            description: message,
            variant: "destructive",
          })
          options.onError?.(message)
        }
      } catch (err) {
        const message = options.errorMessage || "Erro inesperado"
        toast({
          title: "Erro",
          description: message,
          variant: "destructive",
        })
        options.onError?.(message)
      }
    })
  }

  return { execute, isPending }
}