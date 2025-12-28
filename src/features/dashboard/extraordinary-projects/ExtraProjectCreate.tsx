"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Plus, FileText, Upload, ChevronDown, ChevronUp, AlertTriangle } from "lucide-react"
import { createExtraordinaryProject } from "@/app/actions/extraordinary"

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

    const handleCancel = () => {
        if (onCancel) {
            onCancel()
        } else {
            router.back()
        }
    }
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState("")
    const [showPreview, setShowPreview] = useState(false)
    const [selectedFile, setSelectedFile] = useState<File | null>(null)

    const currentYear = new Date().getFullYear()
    const currentMonth = new Date().getMonth() + 1

    const [formData, setFormData] = useState({
        name: "",
        description: "",
        budget: "",
        installments: "1",
        startMonth: currentMonth.toString(),
        startYear: currentYear.toString()
    })

    const budgetCents = Math.round(parseFloat(formData.budget || "0") * 100)
    const installmentCount = parseInt(formData.installments) || 1

    const handleChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }))
        if (error) setError("")
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file && file.type === "application/pdf") {
            setSelectedFile(file)
        }
    }

    const calculateQuotaPreview = useCallback(() => {
        if (!budgetCents || apartments.length === 0) return []

        return apartments.map(apt => {
            const share = (apt.permillage / 1000) * budgetCents
            const perInstallment = share / installmentCount
            return {
                unit: apt.unit,
                permillage: apt.permillage,
                totalShare: share,
                perInstallment
            }
        })
    }, [budgetCents, apartments, installmentCount])

    const quotaPreview = calculateQuotaPreview()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")

        if (!formData.name.trim()) {
            setError("O nome do projeto é obrigatório")
            return
        }

        if (!budgetCents || budgetCents <= 0) {
            setError("Campo obrigatório")
            return
        }

        if (apartments.length === 0) {
            setError("Nenhuma fração definida")
            return
        }

        setIsLoading(true)

        try {
            // TODO: Implement real file upload
            const documentUrl = selectedFile ? `mock-url-${Date.now()}` : undefined

            const result = await createExtraordinaryProject({
                buildingId,
                name: formData.name,
                description: formData.description || undefined,
                totalBudget: budgetCents,
                numInstallments: installmentCount,
                startMonth: parseInt(formData.startMonth),
                startYear: parseInt(formData.startYear),
                documentUrl
            })

            if (result.success) {
                if (onSuccess) {
                    onSuccess()
                } else {
                    router.refresh()
                    handleCancel()
                }
            } else {
                setError(result.error || "Ocorreu um erro inesperado")
            }
        } catch (err) {
            setError("Ocorreu um erro inesperado")
        } finally {
            setIsLoading(false)
        }
    }

    const monthOptions = [
        { value: "1", label: "Janeiro" },
        { value: "2", label: "Fevereiro" },
        { value: "3", label: "Março" },
        { value: "4", label: "Abril" },
        { value: "5", label: "Maio" },
        { value: "6", label: "Junho" },
        { value: "7", label: "Julho" },
        { value: "8", label: "Agosto" },
        { value: "9", label: "Setembro" },
        { value: "10", label: "Outubro" },
        { value: "11", label: "Novembro" },
        { value: "12", label: "Dezembro" }
    ]

    return (
        <Card>
            <CardHeader>
                <CardTitle>
                    <Plus className="w-3.5 h-3.5" />
                    Novo Projeto
                </CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Project Info Section */}
                    <div className="space-y-4">
                        <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">
                            Informação do Projeto
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                                    Nome do Projeto *
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => handleChange("name", e.target.value)}
                                    className="w-full px-3 py-2 text-sm border border-slate-200 focus:outline-none focus:border-blue-400"
                                    placeholder="Nome do Projeto"
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                                    Descrição
                                </label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => handleChange("description", e.target.value)}
                                    rows={2}
                                    className="w-full px-3 py-2 text-sm border border-slate-200 focus:outline-none focus:border-blue-400 resize-none"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Budget Section */}
                    <div className="space-y-4">
                        <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">
                            Orçamento e Prestações
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                                    Orçamento Total (€) *
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={formData.budget}
                                    onChange={(e) => handleChange("budget", e.target.value)}
                                    className="w-full px-3 py-2 text-sm border border-slate-200 focus:outline-none focus:border-blue-400 font-mono"
                                    placeholder="0.00"
                                />
                            </div>

                            <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                                    Nº de Prestações *
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    max="60"
                                    value={formData.installments}
                                    onChange={(e) => handleChange("installments", e.target.value)}
                                    className="w-full px-3 py-2 text-sm border border-slate-200 focus:outline-none focus:border-blue-400 font-mono"
                                />
                            </div>

                            <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                                    Média por Prestação
                                </label>
                                <div className="px-3 py-2 text-sm bg-slate-50 border border-slate-200 font-mono font-bold text-slate-600">
                                    {budgetCents > 0
                                        ? ((budgetCents / 100) / installmentCount).toLocaleString("pt-PT", {
                                            style: "currency",
                                            currency: "EUR"
                                        })
                                        : "€0.00"}
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                                    Mês de Início
                                </label>
                                <select
                                    value={formData.startMonth}
                                    onChange={(e) => handleChange("startMonth", e.target.value)}
                                    className="w-full px-3 py-2 text-sm border border-slate-200 focus:outline-none focus:border-blue-400"
                                >
                                    {monthOptions.map(opt => (
                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                                    Ano de Início
                                </label>
                                <select
                                    value={formData.startYear}
                                    onChange={(e) => handleChange("startYear", e.target.value)}
                                    className="w-full px-3 py-2 text-sm border border-slate-200 focus:outline-none focus:border-blue-400"
                                >
                                    {[currentYear, currentYear + 1, currentYear + 2].map(year => (
                                        <option key={year} value={year}>{year}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Document Upload */}
                    <div className="space-y-4">
                        <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">
                            Documento do Orçamento
                        </h3>

                        <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-200 hover:border-blue-300 cursor-pointer transition-colors">
                            <input
                                type="file"
                                accept=".pdf"
                                onChange={handleFileChange}
                                className="hidden"
                            />
                            {selectedFile ? (
                                <>
                                    <FileText className="w-8 h-8 text-blue-500 mb-2" />
                                    <span className="text-xs font-bold text-slate-700">{selectedFile.name}</span>
                                    <span className="text-[10px] text-slate-400 mt-1">
                                        Documento selecionado
                                    </span>
                                </>
                            ) : (
                                <>
                                    <Upload className="w-8 h-8 text-slate-300 mb-2" />
                                    <span className="text-xs text-slate-500">
                                        Arraste o PDF ou clique para selecionar
                                    </span>
                                    <span className="text-[10px] text-slate-400 mt-1">
                                        O documento será guardado com o projeto
                                    </span>
                                </>
                            )}
                        </label>
                    </div>

                    {/* Quota Preview */}
                    {apartments.length > 0 && budgetCents > 0 && (
                        <div className="space-y-2">
                            <button
                                type="button"
                                onClick={() => setShowPreview(!showPreview)}
                                className="flex items-center gap-2 text-[10px] font-bold text-blue-600 uppercase hover:text-blue-800"
                            >
                                {showPreview ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                                {showPreview ? "Ocultar" : "Mostrar"} Previsão de Quotas ({apartments.length} frações)
                            </button>

                            {showPreview && (
                                <div className="bg-slate-50 border border-slate-200 max-h-48 overflow-y-auto">
                                    <table className="w-full text-xs">
                                        <thead className="bg-slate-100 sticky top-0">
                                            <tr>
                                                <th className="text-left p-2 font-bold text-slate-500 uppercase">Fração</th>
                                                <th className="text-right p-2 font-bold text-slate-500 uppercase">Permilagem</th>
                                                <th className="text-right p-2 font-bold text-slate-500 uppercase">Quota Total</th>
                                                <th className="text-right p-2 font-bold text-slate-500 uppercase">/Prestação</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {quotaPreview.map((row, idx) => (
                                                <tr key={idx} className="border-t border-slate-100">
                                                    <td className="p-2 font-mono font-bold">{row.unit}</td>
                                                    <td className="p-2 text-right font-mono">{row.permillage}‰</td>
                                                    <td className="p-2 text-right font-mono">
                                                        {(row.totalShare / 100).toLocaleString("pt-PT", { style: "currency", currency: "EUR" })}
                                                    </td>
                                                    <td className="p-2 text-right font-mono text-blue-600">
                                                        {(row.perInstallment / 100).toLocaleString("pt-PT", { style: "currency", currency: "EUR" })}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Validation Errors */}
                    {apartments.length === 0 && (
                        <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 text-amber-700">
                            <AlertTriangle className="w-4 h-4" />
                            <span className="text-xs font-bold uppercase">Nenhuma fração definida</span>
                        </div>
                    )}

                    {error && (
                        <p className="text-[10px] text-rose-600 font-bold uppercase">{error}</p>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2 justify-end pt-4 border-t border-slate-100">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handleCancel}
                            disabled={isLoading}
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            size="sm"
                            disabled={isLoading || apartments.length === 0}
                        >
                            {isLoading ? "A Criar..." : "Criar Projeto"}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    )
}