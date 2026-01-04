import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"

export const extraProjectSchema = z.object({
    name: z.string().min(1, "O nome do projeto é obrigatório"),
    description: z.string(),
    budget: z.coerce.number().min(0.01, "O orçamento deve ser maior que 0"),
    installments: z.coerce.number().int().min(1, "Mínimo 1 prestação").max(60, "Máximo 60 prestações"),
    startMonth: z.coerce.number().min(1).max(12),
    startYear: z.coerce.number().min(2024), // Adjust dynamically if needed, keeping simple for now
})

export type ExtraProjectSchema = z.infer<typeof extraProjectSchema>

export function useExtraProjectForm() {
    const currentYear = new Date().getFullYear()
    const currentMonth = new Date().getMonth() + 1

    const [showPreview, setShowPreview] = useState(false)
    const [selectedFile, setSelectedFile] = useState<File | null>(null)

    const form = useForm<ExtraProjectSchema>({
        resolver: zodResolver(extraProjectSchema) as any,
        defaultValues: {
            name: "",
            description: "",
            budget: 0,
            installments: 1,
            startMonth: currentMonth,
            startYear: currentYear
        }
    })

    const budget = form.watch("budget")
    const installments = form.watch("installments")

    const budgetCents = Math.round((Number(budget) || 0) * 100)
    const installmentCount = installments || 1

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file && file.type === "application/pdf") {
            setSelectedFile(file)
        }
    }

    return {
        form,
        showPreview,
        selectedFile,
        budgetCents,
        installmentCount,
        currentYear,
        handleFileChange,
        setShowPreview,
        setSelectedFile
    }
}
