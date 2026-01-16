"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { StatCard } from "@/components/ui/Stat-Card"
import { Plus, ChevronRight, FileText, Layers, DollarSign, TrendingUp, Calendar } from "lucide-react"
import { getExtraordinaryProjects } from "@/lib/actions/extraordinary-projects"
import { type ExtraordinaryProjectSummary, type OnboardingApartment } from "@/lib/types"
import { formatCurrency, getMonthName } from "@/lib/format"
import dynamic from "next/dynamic"

// Dynamic Imports
const ExtraProjectCreate = dynamic(
    () => import("./ExtraProjectCreate").then(mod => mod.ExtraProjectCreate),
    {
        ssr: false,
        loading: () => <div className="p-8 text-center text-gray-400">A carregar formulário...</div>
    }
)
import { useToast } from "@/components/ui/Toast"
import { Skeleton } from "@/components/ui/Skeleton"

interface ExtraProjectsListProps {
    buildingId: string
    apartments?: OnboardingApartment[]
    readOnly?: boolean
}

export function ExtraProjectsList({ buildingId, apartments = [], readOnly = false }: ExtraProjectsListProps) {
    const isManager = !readOnly
    const router = useRouter()
    const [projects, setProjects] = useState<ExtraordinaryProjectSummary[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [showCreate, setShowCreate] = useState(false)
    const { addToast } = useToast()

    const fetchProjects = async () => {
        try {
            setIsLoading(true)
            const result = await getExtraordinaryProjects(buildingId)
            if (result.success && result.data) {
                setProjects(result.data)
            }
        } catch (error) {
            addToast({
                variant: "error",
                title: "Erro",
                description: "Falha ao carregar lista de projetos."
            })
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchProjects()
    }, [buildingId])

    const handleCreateSuccess = () => {
        setShowCreate(false)
        fetchProjects()
        router.refresh()
    }

    if (showCreate && isManager) {
        return (
            <ExtraProjectCreate
                buildingId={buildingId}
                apartments={apartments}
                onCancel={() => setShowCreate(false)}
                onSuccess={handleCreateSuccess}
            />
        )
    }

    // Calculate totals for stats
    const totalBudget = projects.reduce((sum, p) => sum + p.totalBudget, 0)
    const activeCount = projects.filter(p => p.status === "active").length

    // Format currency short
    const formatCurrencyShort = (cents: number) => `€${(cents / 100).toFixed(0)}`

    return (
        <div className="flex-1 overflow-y-auto p-1.5">
            {/* Header */}
            <div className="mb-1.5 flex items-center justify-between">
                <div>
                    <h1 className="text-heading font-semibold text-gray-800">Quotas Extraordinárias</h1>
                    <p className="text-label text-gray-500">Gestão de projetos e obras especiais</p>
                </div>
                {isManager && (
                    <Button size="sm" onClick={() => setShowCreate(true)}>
                        <Plus className="h-3 w-3" />
                        <span className="hidden sm:inline ml-1">Novo Projeto</span>
                    </Button>
                )}
            </div>

            {/* Stats */}
            <div className="mb-1.5 grid grid-cols-2 gap-1.5 lg:grid-cols-4">
                <StatCard
                    label="Total Projetos"
                    value={projects.length.toString()}
                    icon={<Layers className="h-4 w-4" />}
                />
                <StatCard
                    label="Orçamento Total"
                    value={formatCurrencyShort(totalBudget)}
                    icon={<DollarSign className="h-4 w-4" />}
                />
                <StatCard
                    label="Cobrado"
                    value="€0"
                    change={{ value: "0%", positive: true }}
                    icon={<TrendingUp className="h-4 w-4" />}
                />
                <StatCard
                    label="Em Curso"
                    value={activeCount.toString()}
                    icon={<Calendar className="h-4 w-4" />}
                />
            </div>

            {/* Projects Card */}
            <Card>
                <CardHeader>
                    <CardTitle>Projetos Ativos</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                {isLoading ? (
                    <div className="p-4 space-y-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="flex justify-between items-center">
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-32" />
                                    <Skeleton className="h-3 w-48" />
                                </div>
                                <Skeleton className="h-4 w-4" />
                            </div>
                        ))}
                    </div>
                ) : projects.length === 0 ? (
                    <div className="p-8 text-center">
                        <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-body font-medium text-gray-700 mb-2">
                            Sem projetos extraordinários
                        </h3>
                        <p className="text-label text-gray-500 max-w-xs mx-auto mb-4">
                            {isManager
                                ? "Crie o primeiro projeto para começar a gerir quotas extraordinárias para obras ou fundos de reserva."
                                : "Não existem projetos extraordinários ativos ou passados neste condomínio."}
                        </p>
                        {isManager && (
                            <Button
                                size="sm"
                                onClick={() => setShowCreate(true)}
                            >
                                <Plus className="w-3 h-3 mr-1" />
                                Criar Projeto
                            </Button>
                        )}
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {projects.map((project) => (
                            <Link
                                key={project.id}
                                href={`/dashboard/extraordinary/${project.id}`}
                                className="flex items-center justify-between p-1.5 hover:bg-gray-50 transition-colors cursor-pointer group"
                            >
                                <div className="min-w-0 flex-1">
                                    <h3 className="text-body font-medium text-gray-700 truncate">
                                        {project.name}
                                    </h3>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <span className="text-label text-gray-500 font-mono">
                                            {formatCurrency(project.totalBudget)}
                                        </span>
                                        <span className="text-label text-gray-300">•</span>
                                        <span className="text-label text-gray-500">
                                            {project.numInstallments} prestações
                                        </span>
                                        <span className="text-label text-gray-300">•</span>
                                        <span className="text-label text-gray-500">
                                            {getMonthName(project.startMonth, true)}/{project.startYear}
                                        </span>
                                    </div>
                                </div>
                                <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition-colors shrink-0" />
                            </Link>
                        ))}
                    </div>
                )}
            </CardContent>
            </Card>
        </div>
    )
}
