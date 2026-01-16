"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { createExtraordinaryProject } from "@/lib/actions/extraordinary-projects"
import { useAsyncAction } from "@/hooks/useAsyncAction"
import { ExtraProjectForm } from "./ExtraProjectForm"
import type { OnboardingApartment } from "@/lib/types"

// Schema
export const extraProjectSchema = z.object({
    name: z.string().min(1, "O nome do projeto é obrigatório"),
    description: z.string(),
    budget: z.coerce.number().min(0.01, "O orçamento deve ser maior que 0"),
    installments: z.coerce.number().int().min(1, "Mínimo 1 prestação").max(60, "Máximo 60 prestações"),
    startMonth: z.coerce.number().min(1).max(12),
    startYear: z.coerce.number().min(2024),
})

export type ExtraProjectSchema = z.infer<typeof extraProjectSchema>

interface ExtraProjectCreateProps {
    buildingId: string
    apartments: OnboardingApartment[]
    onCancel?: () => void
    onSuccess?: () => void
}

export function ExtraProjectCreate({ buildingId, apartments, onCancel, onSuccess }: ExtraProjectCreateProps) {
    const router = useRouter()

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

    const handleCancel = () => {
        if (onCancel) {
            onCancel()
        } else {
            router.back()
        }
    }

    const { execute: createProject, isPending } = useAsyncAction(async (data: {
        formData: ExtraProjectSchema,
        file: File | null
    }) => {
        let documentUrl: string | undefined

        if (data.file) {
            const uploadFormData = new FormData()
            uploadFormData.append('buildingId', buildingId)
            uploadFormData.append('category', 'projetos')
            uploadFormData.append('title', `Orçamento - ${data.formData.name}`)
            uploadFormData.append('files', data.file)

            const uploadRes = await fetch('/api/documents/upload', {
                method: 'POST',
                body: uploadFormData,
            })

            if (!uploadRes.ok) {
                const errorData = await uploadRes.json()
                throw new Error(errorData.error || "Erro ao carregar documento")
            }

            const uploadData = await uploadRes.json()
            const result = uploadData.results[0]

            if (!result.success) {
                throw new Error(result.error || "Erro ao carregar documento")
            }

            documentUrl = result.document.fileUrl
        }

        return await createExtraordinaryProject({
            buildingId,
            name: data.formData.name,
            description: data.formData.description || undefined,
            totalBudget: Math.round(data.formData.budget * 100),
            numInstallments: data.formData.installments,
            startMonth: data.formData.startMonth,
            startYear: data.formData.startYear,
            documentUrl
        })
    }, {
        successMessage: "Projeto criado com sucesso",
        onSuccess: () => {
            if (onSuccess) {
                onSuccess()
            } else {
                router.refresh()
                handleCancel()
            }
        }
    })

    const onSubmit = (data: ExtraProjectSchema) => {
        createProject({
            formData: data,
            file: selectedFile
        })
    }

    return (
        <ExtraProjectForm
            form={form}
            showPreview={showPreview}
            selectedFile={selectedFile}
            budgetCents={budgetCents}
            installmentCount={installmentCount}
            currentYear={currentYear}
            apartments={apartments}
            isPending={isPending}
            onFileChange={handleFileChange}
            onTogglePreview={() => setShowPreview(!showPreview)}
            onSubmit={form.handleSubmit(onSubmit)}
            onCancel={handleCancel}
        />
    )
}