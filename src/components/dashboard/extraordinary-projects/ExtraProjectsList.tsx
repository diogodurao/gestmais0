"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Layers, Plus, ChevronRight, FileText } from "lucide-react"
import { getExtraordinaryProjects } from "@/lib/actions/extraordinary-projects"
import { type ExtraordinaryProjectSummary } from "@/lib/types"
import { formatCurrency } from "@/lib/format"
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

type Apartment = {
    id: number
    unit: string
    permillage: number
}

interface ExtraProjectsListProps {
    buildingId: string
    apartments?: Apartment[]
    readOnly?: boolean
}

export function ExtraProjectsList({ buildingId, apartments = [], readOnly = false }: ExtraProjectsListProps) {
    const isManager = !readOnly
    const router = useRouter()
    const [projects, setProjects] = useState<ExtraordinaryProjectSummary[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [showCreate, setShowCreate] = useState(false)
    const { toast } = useToast()

    const fetchProjects = async () => {
        try {
            setIsLoading(true)
            const result = await getExtraordinaryProjects(buildingId)
            if (result.success && result.data) {
                setProjects(result.data)
            }
        } catch (error) {
            toast({
                variant: "destructive",
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
        router.refresh() // Keep this to update server components if needed
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

    return (
        <Card>
            <CardHeader>
                <CardTitle>
                    <Layers className="w-4 h-4" />
                    Quotas Extraordinárias
                </CardTitle>
                {isManager && (
                    <Button
                        size="xs"
                        onClick={() => setShowCreate(true)}
                    >
                        <Plus className="w-3 h-3 mr-1" />
                        NOVO PROJETO
                    </Button>
                )}
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
                        <FileText className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                        <h3 className="text-body font-bold text-gray-600 uppercase mb-2">
                            Sem projetos extraordinários
                        </h3>
                        <p className="text-body text-gray-400 max-w-xs mx-auto mb-4">
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
                                <span className="hidden sm:inline">Criar Primeiro Projeto</span>
                                <span className="sm:hidden">Criar</span>
                            </Button>
                        )}
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {projects.map((project) => (
                            <Link
                                key={project.id}
                                href={`/dashboard/extraordinary/${project.id}`}
                                className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors group"
                            >
                                <div className="min-w-0">
                                    <h3 className="text-body font-bold text-gray-700 uppercase truncate">
                                        {project.name}
                                    </h3>
                                    <div className="flex items-center gap-3 mt-1">
                                        <span className="text-body text-gray-400 font-mono">
                                            {formatCurrency(project.totalBudget)}
                                        </span>
                                        <span className="text-micro text-gray-300">•</span>
                                        <span className="text-body text-gray-400">
                                            {project.numInstallments} prestações
                                        </span>
                                        <span className="text-micro text-gray-300">•</span>
                                        <span className="text-body text-gray-400">
                                            {project.startMonth}/{project.startYear}
                                        </span>
                                    </div>
                                </div>
                                <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition-colors" />
                            </Link>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}