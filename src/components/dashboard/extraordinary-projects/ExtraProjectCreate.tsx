"use client"

import { useRouter } from "next/navigation"
import { createExtraordinaryProject } from "@/lib/actions/extraordinary-projects"
import { useAsyncAction } from "@/hooks/useAsyncAction"
import { useToast } from "@/components/ui/Toast"
import { useExtraProjectForm, ExtraProjectSchema } from "./hooks/useExtraProjectForm"
import { ExtraProjectForm } from "./ExtraProjectForm"

type Apartment = {
    id: number
    unit: string
    permillage: number
}

interface ExtraProjectCreateProps {
    buildingId: string
    apartments: Apartment[]
    onCancel?: () => void
    onSuccess?: () => void
}

export function ExtraProjectCreate({ buildingId, apartments, onCancel, onSuccess }: ExtraProjectCreateProps) {
    const router = useRouter()
    const { toast } = useToast()

    const {
        form,
        showPreview,
        selectedFile,
        budgetCents,
        installmentCount,
        currentYear,
        handleFileChange,
        setShowPreview
    } = useExtraProjectForm()

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
        },
        onError: (msg) => toast({
            variant: "destructive",
            title: "Erro",
            description: msg
        })
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