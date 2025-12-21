"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import {
    ArrowLeft,
    Hammer,
    Calculator,
    Calendar,
    FileText,
    Upload,
    AlertCircle,
    Loader2,
    Euro,
} from "lucide-react"
import Link from "next/link"
import {
    calculateExtraordinaryPayments,
    formatCurrency,
    getMonthName,
    parseCurrency,
    validateProjectInput,
} from "@/lib/extraordinary-calculations"
import { createExtraordinaryProject } from "@/app/actions/extraordinary"
// import { useToast } from "@/components/ui/Toast"
// import { FileUpload } from "@/components/ui/FileUpload"

// ===========================================
// TYPES
// ===========================================

interface ExtraProjectCreateProps {
    buildingId: string
    apartments: Array<{
        id: number
        unit: string
        permillage: number | null
        residentName?: string | null
    }>
}

interface FormData {
    name: string
    description: string
    totalBudget: string // Euro string for input
    numInstallments: number
    startMonth: number
    startYear: number
    documentUrl: string
    documentName: string
}

// ===========================================
// COMPONENT
// ===========================================

export function ExtraProjectCreate({ buildingId, apartments }: ExtraProjectCreateProps) {
    const router = useRouter()
    // const toast = useToast()
    
    const currentDate = new Date()
    const currentMonth = currentDate.getMonth() + 1
    const currentYear = currentDate.getFullYear()
    
    const [formData, setFormData] = useState<FormData>({
        name: "",
        description: "",
        totalBudget: "",
        numInstallments: 12,
        startMonth: currentMonth,
        startYear: currentYear,
        documentUrl: "",
        documentName: "",
    })
    
    const [errors, setErrors] = useState<string[]>([])
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [showPreview, setShowPreview] = useState(false)

    // Parse budget to cents
    const budgetCents = parseCurrency(formData.totalBudget)

    // Calculate preview
    const preview = budgetCents > 0 && apartments.length > 0
        ? calculateExtraordinaryPayments(
            budgetCents,
            formData.numInstallments,
            formData.startMonth,
            formData.startYear,
            apartments
          )
        : null

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }))
        setErrors([])
    }

    const handleNumberChange = (name: keyof FormData, value: number) => {
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }))
        setErrors([])
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        
        // Validate
        const validation = validateProjectInput({
            name: formData.name,
            totalBudget: budgetCents,
            numInstallments: formData.numInstallments,
            startMonth: formData.startMonth,
            startYear: formData.startYear,
        })
        
        if (!validation.valid) {
            setErrors(validation.errors)
            return
        }
        
        if (apartments.length === 0) {
            setErrors(["Não existem frações definidas no edifício"])
            return
        }

        setIsSubmitting(true)
        
        const result = await createExtraordinaryProject({
            buildingId,
            name: formData.name.trim(),
            description: formData.description.trim() || undefined,
            totalBudget: budgetCents,
            numInstallments: formData.numInstallments,
            startMonth: formData.startMonth,
            startYear: formData.startYear,
            documentUrl: formData.documentUrl || undefined,
            documentName: formData.documentName || undefined,
        })
        
        setIsSubmitting(false)
        
        if (result.success) {
            // toast.success("Projeto criado", "As quotas foram calculadas para todas as frações.")
            router.push(`/dashboard/extraordinary/${result.data.projectId}`)
        } else {
            setErrors([result.error])
            // toast.error("Erro", result.error)
        }
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <header className="flex items-center gap-4">
                <Link
                    href="/dashboard/extraordinary"
                    className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div>
                    <h1 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                        <Hammer className="w-5 h-5 text-slate-600" />
                        Novo Projeto Extraordinário
                    </h1>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                        Defina o orçamento e as prestações para o projeto
                    </p>
                </div>
            </header>

            {/* Errors */}
            {errors.length > 0 && (
                <div className="tech-border border-rose-200 bg-rose-50 p-4">
                    <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                        <div>
                            <p className="text-[12px] font-bold text-rose-800 uppercase tracking-tight">
                                Erros de Validação
                            </p>
                            <ul className="mt-1 space-y-0.5">
                                {errors.map((error, i) => (
                                    <li key={i} className="text-[11px] text-rose-700">
                                        • {error}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Project Info */}
                <section className="tech-border bg-white p-4">
                    <h2 className="text-[12px] font-bold text-slate-800 uppercase tracking-tight mb-4 flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        Informação do Projeto
                    </h2>

                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="md:col-span-2">
                            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-tight mb-1">
                                Nome do Projeto *
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                placeholder="ex: Obras de Fachada 2024"
                                className="w-full px-3 py-2 border border-slate-200 text-[12px] focus:outline-none focus:border-slate-400"
                                required
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-tight mb-1">
                                Descrição
                            </label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                placeholder="Descrição opcional do projeto..."
                                rows={3}
                                className="w-full px-3 py-2 border border-slate-200 text-[12px] focus:outline-none focus:border-slate-400 resize-none"
                            />
                        </div>
                    </div>
                </section>

                {/* Budget & Installments */}
                <section className="tech-border bg-white p-4">
                    <h2 className="text-[12px] font-bold text-slate-800 uppercase tracking-tight mb-4 flex items-center gap-2">
                        <Calculator className="w-4 h-4" />
                        Orçamento e Prestações
                    </h2>

                    <div className="grid gap-4 md:grid-cols-3">
                        {/* Total Budget */}
                        <div>
                            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-tight mb-1">
                                Orçamento Total *
                            </label>
                            <div className="relative">
                                <Euro className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    type="text"
                                    name="totalBudget"
                                    value={formData.totalBudget}
                                    onChange={handleInputChange}
                                    placeholder="45773.10"
                                    className="w-full pl-9 pr-3 py-2 border border-slate-200 text-[12px] font-mono focus:outline-none focus:border-slate-400"
                                    required
                                />
                            </div>
                            {budgetCents > 0 && (
                                <p className="text-[10px] text-slate-500 mt-1">
                                    = {formatCurrency(budgetCents)}
                                </p>
                            )}
                        </div>

                        {/* Number of Installments */}
                        <div>
                            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-tight mb-1">
                                Nº de Prestações *
                            </label>
                            <select
                                name="numInstallments"
                                value={formData.numInstallments}
                                onChange={(e) => handleNumberChange("numInstallments", parseInt(e.target.value))}
                                className="w-full px-3 py-2 border border-slate-200 text-[12px] focus:outline-none focus:border-slate-400 bg-white"
                            >
                                {[1, 2, 3, 4, 6, 8, 10, 12, 18, 24, 36, 48, 60].map((n) => (
                                    <option key={n} value={n}>
                                        {n} {n === 1 ? "prestação" : "prestações"}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Average per installment */}
                        <div className="bg-slate-50 p-3 flex flex-col justify-center">
                            <p className="text-[10px] text-slate-500 uppercase tracking-tight">
                                Média por Prestação
                            </p>
                            <p className="text-lg font-bold text-slate-800 font-mono">
                                {budgetCents > 0
                                    ? formatCurrency(Math.round(budgetCents / formData.numInstallments))
                                    : "—"
                                }
                            </p>
                        </div>
                    </div>
                </section>

                {/* Start Date */}
                <section className="tech-border bg-white p-4">
                    <h2 className="text-[12px] font-bold text-slate-800 uppercase tracking-tight mb-4 flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        Data de Início
                    </h2>

                    <div className="grid gap-4 md:grid-cols-3">
                        <div>
                            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-tight mb-1">
                                Mês de Início *
                            </label>
                            <select
                                name="startMonth"
                                value={formData.startMonth}
                                onChange={(e) => handleNumberChange("startMonth", parseInt(e.target.value))}
                                className="w-full px-3 py-2 border border-slate-200 text-[12px] focus:outline-none focus:border-slate-400 bg-white"
                            >
                                {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                                    <option key={m} value={m}>
                                        {getMonthName(m)}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-tight mb-1">
                                Ano de Início *
                            </label>
                            <select
                                name="startYear"
                                value={formData.startYear}
                                onChange={(e) => handleNumberChange("startYear", parseInt(e.target.value))}
                                className="w-full px-3 py-2 border border-slate-200 text-[12px] focus:outline-none focus:border-slate-400 bg-white"
                            >
                                {Array.from({ length: 10 }, (_, i) => currentYear - 2 + i).map((y) => (
                                    <option key={y} value={y}>
                                        {y}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="bg-slate-50 p-3 flex flex-col justify-center">
                            <p className="text-[10px] text-slate-500 uppercase tracking-tight">
                                Período
                            </p>
                            <p className="text-[12px] font-medium text-slate-800">
                                {getMonthName(formData.startMonth, true)} {formData.startYear}
                                {" → "}
                                {(() => {
                                    const endMonth = ((formData.startMonth - 1 + formData.numInstallments - 1) % 12) + 1
                                    const endYear = formData.startYear + Math.floor((formData.startMonth - 1 + formData.numInstallments - 1) / 12)
                                    return `${getMonthName(endMonth, true)} ${endYear}`
                                })()}
                            </p>
                        </div>
                    </div>
                </section>

                {/* Document Upload */}
                <section className="tech-border bg-white p-4">
                    <h2 className="text-[12px] font-bold text-slate-800 uppercase tracking-tight mb-4 flex items-center gap-2">
                        <Upload className="w-4 h-4" />
                        Documento de Orçamento
                        <span className="text-slate-400 font-normal">(opcional)</span>
                    </h2>

                    <div className="border-2 border-dashed border-slate-200 rounded-sm p-6 text-center hover:border-slate-300 transition-colors cursor-pointer">
                        <Upload className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                        <p className="text-[11px] text-slate-500">
                            Arraste um PDF ou clique para selecionar
                        </p>
                        <p className="text-[10px] text-slate-400 mt-1">
                            O documento será guardado para consulta
                        </p>
                    </div>
                </section>

                {/* Preview Toggle */}
                {preview && preview.apartments.length > 0 && (
                    <section className="tech-border bg-slate-50 p-4">
                        <button
                            type="button"
                            onClick={() => setShowPreview(!showPreview)}
                            className="w-full flex items-center justify-between text-left"
                        >
                            <div className="flex items-center gap-2">
                                <Calculator className="w-4 h-4 text-slate-600" />
                                <span className="text-[12px] font-bold text-slate-800 uppercase tracking-tight">
                                    Pré-visualização das Quotas
                                </span>
                                <span className="text-[10px] text-slate-500">
                                    ({preview.apartments.length} frações)
                                </span>
                            </div>
                            <span className="text-[11px] text-blue-600 font-medium">
                                {showPreview ? "Ocultar" : "Mostrar"}
                            </span>
                        </button>

                        {showPreview && (
                            <div className="mt-4 overflow-x-auto">
                                {/* Warnings */}
                                {preview.warnings.length > 0 && (
                                    <div className="mb-4 p-3 bg-amber-50 border border-amber-200">
                                        {preview.warnings.map((w, i) => (
                                            <p key={i} className="text-[11px] text-amber-700">
                                                ⚠️ {w}
                                            </p>
                                        ))}
                                    </div>
                                )}

                                {/* Preview Table */}
                                <table className="w-full text-left border-collapse whitespace-nowrap text-xs">
                                    <thead>
                                        <tr>
                                            <th className="header-cell w-16 text-center">Fração</th>
                                            <th className="header-cell w-20 text-right">‰</th>
                                            <th className="header-cell w-28 text-right">Quota Total</th>
                                            <th className="header-cell w-28 text-right">Prestação</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {preview.apartments.slice(0, 10).map((apt) => (
                                            <tr key={apt.apartmentId}>
                                                <td className="data-cell text-center font-bold bg-slate-50">
                                                    {apt.unit}
                                                </td>
                                                <td className="data-cell text-right font-mono text-slate-500">
                                                    {apt.permillage.toFixed(2)}
                                                </td>
                                                <td className="data-cell text-right font-mono font-bold">
                                                    {formatCurrency(apt.totalShare)}
                                                </td>
                                                <td className="data-cell text-right font-mono">
                                                    {formatCurrency(apt.monthlyPayment)}
                                                </td>
                                            </tr>
                                        ))}
                                        {preview.apartments.length > 10 && (
                                            <tr>
                                                <td colSpan={4} className="data-cell text-center text-slate-400 italic">
                                                    ... e mais {preview.apartments.length - 10} frações
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                    <tfoot>
                                        <tr className="bg-slate-100">
                                            <td className="data-cell font-bold" colSpan={2}>
                                                TOTAL
                                            </td>
                                            <td className="data-cell text-right font-mono font-bold">
                                                {formatCurrency(
                                                    preview.apartments.reduce((sum, a) => sum + a.totalShare, 0)
                                                )}
                                            </td>
                                            <td className="data-cell text-right font-mono">
                                                —
                                            </td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        )}
                    </section>
                )}

                {/* Actions */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                    <Link
                        href="/dashboard/extraordinary"
                        className="px-4 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-600 hover:text-slate-800 border border-slate-300 hover:bg-slate-50 transition-colors"
                    >
                        Cancelar
                    </Link>
                    <button
                        type="submit"
                        disabled={isSubmitting || budgetCents === 0}
                        className={cn(
                            "px-6 py-2 text-[11px] font-bold uppercase tracking-wider text-white transition-colors flex items-center gap-2",
                            isSubmitting || budgetCents === 0
                                ? "bg-slate-400 cursor-not-allowed"
                                : "bg-slate-800 hover:bg-slate-700"
                        )}
                    >
                        {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                        {isSubmitting ? "A criar..." : "Criar Projeto"}
                    </button>
                </div>
            </form>
        </div>
    )
}

export default ExtraProjectCreate