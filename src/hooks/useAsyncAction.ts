"use client"

import { useState } from "react"
import { useToast } from "@/hooks/use-toast"

interface AsyncActionOptions<T> {
    onSuccess?: (data: T) => void
    onError?: (error: string) => void
    successMessage?: string
    errorMessage?: string
}

export function useAsyncAction<T, Args extends any[]>(
    action: (...args: Args) => Promise<{ success: boolean; data?: T; error?: string }>,
    options: AsyncActionOptions<T> = {}
) {
    const [isPending, setIsPending] = useState(false)
    const { toast } = useToast()

    const execute = async (...args: Args) => {
        setIsPending(true)
        try {
            const result = await action(...args)
            if (result.success) {
                if (options.successMessage) {
                    toast({
                        title: "Sucesso",
                        description: options.successMessage,
                    })
                }
                if (options.onSuccess && result.data !== undefined) {
                    options.onSuccess(result.data as T)
                } else if (options.onSuccess) {
                    options.onSuccess(null as any)
                }
                return { success: true, data: result.data }
            } else {
                const errorMsg = result.error || options.errorMessage || "Ocorreu um erro"
                toast({
                    title: "Erro",
                    description: errorMsg,
                    variant: "destructive",
                })
                options.onError?.(errorMsg)
                return { success: false, error: errorMsg }
            }
        } catch (e: any) {
            const errorMsg = e.message || options.errorMessage || "Erro inesperado"
            toast({
                title: "Erro",
                description: errorMsg,
                variant: "destructive",
            })
            options.onError?.(errorMsg)
            return { success: false, error: errorMsg }
        } finally {
            setIsPending(false)
        }
    }

    return { execute, isPending }
}
