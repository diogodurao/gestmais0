"use client"

import { useDashboard } from "@/contexts/DashboardContext"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card"
import { CreditCard, Hammer, FolderOpen } from "lucide-react"
import Link from "next/link"
import { ROUTES } from "@/lib/routes"

export function ProfessionalDashboard() {
    const { activeBuilding } = useDashboard()

    const buildingName = activeBuilding?.building.name || "Edifício"

    return (
        <div className="p-4 md:p-6 space-y-6">
            <div>
                <h1 className="text-heading font-semibold text-gray-800">
                    Painel Profissional
                </h1>
                <p className="text-body text-gray-600 mt-1">
                    Acesso de consulta ao edifício <strong>{buildingName}</strong>
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Link href={ROUTES.DASHBOARD.PAYMENTS}>
                    <Card className="hover:border-primary transition-colors cursor-pointer">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-1.5">
                                <CreditCard className="w-4 h-4 text-primary" />
                                Quotas
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-label text-gray-500">
                                Consultar o mapa de pagamentos de quotas do edifício.
                            </p>
                        </CardContent>
                    </Card>
                </Link>

                <Link href={ROUTES.DASHBOARD.EXTRAORDINARY}>
                    <Card className="hover:border-primary transition-colors cursor-pointer">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-1.5">
                                <Hammer className="w-4 h-4 text-primary" />
                                Quotas Extra
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-label text-gray-500">
                                Consultar projetos e quotas extraordinárias.
                            </p>
                        </CardContent>
                    </Card>
                </Link>

                <Link href={ROUTES.DASHBOARD.DOCUMENTS}>
                    <Card className="hover:border-primary transition-colors cursor-pointer">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-1.5">
                                <FolderOpen className="w-4 h-4 text-primary" />
                                Documentos
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-label text-gray-500">
                                Aceder aos documentos do edifício.
                            </p>
                        </CardContent>
                    </Card>
                </Link>
            </div>
        </div>
    )
}
