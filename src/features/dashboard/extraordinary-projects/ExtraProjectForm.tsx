import { Button } from "@/components/ui/Button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card"
import { Plus, FileText, Upload, AlertTriangle } from "lucide-react"
import { MONTH_OPTIONS } from "@/lib/constants/timing"
import { formatCurrency } from "@/lib/format"
import { QuotaPreviewTable } from "./QuotaPreviewTable"
import { ExtraProjectSchema } from "./hooks/useExtraProjectForm"
import { UseFormReturn } from "react-hook-form"

type Apartment = {
    id: number
    unit: string
    permillage: number
}

interface ExtraProjectFormProps {
    form: UseFormReturn<ExtraProjectSchema>
    showPreview: boolean
    selectedFile: File | null
    budgetCents: number
    installmentCount: number
    currentYear: number
    apartments: Apartment[]
    isPending: boolean
    onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void
    onTogglePreview: () => void
    onSubmit: (e: React.FormEvent) => void
    onCancel: () => void
}

export function ExtraProjectForm({
    form,
    showPreview,
    selectedFile,
    budgetCents,
    installmentCount,
    currentYear,
    apartments,
    isPending,
    onFileChange,
    onTogglePreview,
    onSubmit,
    onCancel
}: ExtraProjectFormProps) {
    const { register, formState: { errors } } = form

    return (
        <Card>
            <CardHeader>
                <CardTitle>
                    <Plus className="w-4 h-4" />
                    Novo Projeto
                </CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={onSubmit} className="space-y-6">
                    {/* Project Info Section */}
                    <div className="space-y-4">
                        <h3 className="text-label font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">
                            Informação do Projeto
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                                <label className="block text-label font-bold text-slate-500 uppercase mb-1">
                                    Nome do Projeto *
                                </label>
                                <input
                                    type="text"
                                    {...register("name")}
                                    className="w-full px-3 py-2 text-body border border-slate-200 focus:outline-none focus:border-blue-400"
                                    placeholder="Nome do Projeto"
                                />
                                {errors.name && (
                                    <p className="text-xs text-rose-600 mt-1">{errors.name.message}</p>
                                )}
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-label font-bold text-slate-500 uppercase mb-1">
                                    Descrição
                                </label>
                                <textarea
                                    {...register("description")}
                                    rows={2}
                                    className="w-full px-3 py-2 text-body border border-slate-200 focus:outline-none focus:border-blue-400 resize-none"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Budget Section */}
                    <div className="space-y-4">
                        <h3 className="text-label font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">
                            Orçamento e Prestações
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-label font-bold text-slate-500 uppercase mb-1">
                                    Orçamento Total (€) *
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    {...register("budget")}
                                    className="w-full px-3 py-2 text-body border border-slate-200 focus:outline-none focus:border-blue-400 font-mono"
                                    placeholder="0.00"
                                />
                                {errors.budget && (
                                    <p className="text-xs text-rose-600 mt-1">{errors.budget.message}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-label font-bold text-slate-500 uppercase mb-1">
                                    Nº de Prestações *
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    max="60"
                                    {...register("installments")}
                                    className="w-full px-3 py-2 text-body border border-slate-200 focus:outline-none focus:border-blue-400 font-mono"
                                />
                                {errors.installments && (
                                    <p className="text-xs text-rose-600 mt-1">{errors.installments.message}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-label font-bold text-slate-500 uppercase mb-1">
                                    Média por Prestação
                                </label>
                                <div className="px-3 py-2 text-body bg-slate-50 border border-slate-200 font-mono font-bold text-slate-600">
                                    {budgetCents > 0
                                        ? formatCurrency(Math.round(budgetCents / installmentCount))
                                        : "€0.00"}
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-label font-bold text-slate-500 uppercase mb-1">
                                    Mês de Início
                                </label>
                                <select
                                    {...register("startMonth")}
                                    className="w-full px-3 py-2 text-body border border-slate-200 focus:outline-none focus:border-blue-400"
                                >
                                    {MONTH_OPTIONS.map(opt => (
                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-label font-bold text-slate-500 uppercase mb-1">
                                    Ano de Início
                                </label>
                                <select
                                    {...register("startYear")}
                                    className="w-full px-3 py-2 text-body border border-slate-200 focus:outline-none focus:border-blue-400"
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
                        <h3 className="text-label font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">
                            Documento do Orçamento
                        </h3>

                        <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-200 hover:border-blue-300 cursor-pointer transition-colors">
                            <input
                                type="file"
                                accept=".pdf"
                                onChange={onFileChange}
                                className="hidden"
                            />
                            {selectedFile ? (
                                <>
                                    <FileText className="w-8 h-8 text-blue-500 mb-2" />
                                    <span className="text-body font-bold text-slate-700">{selectedFile.name}</span>
                                    <span className="text-label text-slate-400 mt-1">
                                        Documento selecionado
                                    </span>
                                </>
                            ) : (
                                <>
                                    <Upload className="w-8 h-8 text-slate-300 mb-2" />
                                    <span className="text-body text-slate-500">
                                        Arraste o PDF ou clique para selecionar
                                    </span>
                                    <span className="text-label text-slate-400 mt-1">
                                        O documento será guardado com o projeto
                                    </span>
                                </>
                            )}
                        </label>
                    </div>

                    <QuotaPreviewTable
                        apartments={apartments}
                        budgetCents={budgetCents}
                        installmentCount={installmentCount}
                        isOpen={showPreview}
                        onToggle={onTogglePreview}
                    />

                    {/* Validation Errors */}
                    {apartments.length === 0 && (
                        <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 text-amber-700">
                            <AlertTriangle className="w-4 h-4" />
                            <span className="text-label font-bold uppercase">Nenhuma fração definida</span>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2 justify-end pt-4 border-t border-slate-100">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={onCancel}
                            disabled={isPending}
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            size="sm"
                            disabled={isPending || apartments.length === 0}
                        >
                            {isPending ? "A Criar..." : "Criar Projeto"}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    )
}
