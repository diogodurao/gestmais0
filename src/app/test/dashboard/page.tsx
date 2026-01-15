"use client"

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../components/ui/Card"
import { Button } from "../components/ui/Button"
import { Badge } from "../components/ui/Badge"
import { Users, Building2, ChevronRight } from "lucide-react"

export default function DashboardSwitcherPage() {
  return (
    <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center p-4">
      <div className="max-w-lg w-full">
        {/* Header */}
        <div className="text-center mb-4">
          <p className="text-[9px] font-medium text-[#8E9AAF] uppercase tracking-widest mb-1">
            Design System Demo
          </p>
          <h1 className="text-[18px] font-bold text-[#343A40] uppercase tracking-wide">
            Dashboard
          </h1>
          <p className="text-[11px] text-[#8E9AAF] mt-1">
            Selecione o tipo de utilizador para visualizar o painel correspondente
          </p>
        </div>

        {/* Role Selection */}
        <div className="grid gap-2">
          {/* Manager Card */}
          <a href="/test/dashboard/manager">
            <Card className="hover:border-[#8FB996] hover:shadow-md transition-all cursor-pointer">
              <CardContent className="p-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-[#E8F0EA] flex items-center justify-center shrink-0">
                    <Building2 className="w-6 h-6 text-[#6A9B72]" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                      <h2 className="text-[13px] font-semibold text-[#343A40]">Painel do Gestor</h2>
                      <Badge variant="info" size="sm">Admin</Badge>
                    </div>
                    <p className="text-[10px] text-[#8E9AAF]">
                      Gerir pagamentos, residentes, documentos e configurações do edifício
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-[#ADB5BD]" />
                </div>

                {/* Features Preview */}
                <div className="mt-2 pt-2 border-t border-[#F1F3F5]">
                  <div className="flex flex-wrap gap-1">
                    <Badge size="sm" variant="default">Estado do Sistema</Badge>
                    <Badge size="sm" variant="default">Código de Convite</Badge>
                    <Badge size="sm" variant="default">Lista de Residentes</Badge>
                    <Badge size="sm" variant="default">Cobrança</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </a>

          {/* Resident Card */}
          <a href="/test/dashboard/resident">
            <Card className="hover:border-[#8FB996] hover:shadow-md transition-all cursor-pointer">
              <CardContent className="p-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-[#F0EBE8] flex items-center justify-center shrink-0">
                    <Users className="w-6 h-6 text-[#9B8A72]" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                      <h2 className="text-[13px] font-semibold text-[#343A40]">Painel do Residente</h2>
                      <Badge variant="default" size="sm">Utilizador</Badge>
                    </div>
                    <p className="text-[10px] text-[#8E9AAF]">
                      Consultar pagamentos, documentos, ocorrências e votações
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-[#ADB5BD]" />
                </div>

                {/* Features Preview */}
                <div className="mt-2 pt-2 border-t border-[#F1F3F5]">
                  <div className="flex flex-wrap gap-1">
                    <Badge size="sm" variant="default">A Minha Fração</Badge>
                    <Badge size="sm" variant="default">Meus Pagamentos</Badge>
                    <Badge size="sm" variant="default">Notificações</Badge>
                    <Badge size="sm" variant="default">Eventos</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </a>
        </div>

        {/* Other Test Pages */}
        <div className="mt-4 pt-4 border-t border-[#E9ECEF]">
          <p className="text-[9px] font-medium text-[#8E9AAF] uppercase tracking-wide mb-2 text-center">
            Outras Páginas de Teste
          </p>
          <div className="flex flex-wrap justify-center gap-1.5">
            <a href="/test/quotas">
              <Button variant="outline" size="sm">Quotas</Button>
            </a>
            <a href="/test/extraordinary">
              <Button variant="outline" size="sm">Extraordinárias</Button>
            </a>
            <a href="/test/onboarding/manager">
              <Button variant="outline" size="sm">Onboarding Gestor</Button>
            </a>
            <a href="/test/onboarding/resident">
              <Button variant="outline" size="sm">Onboarding Residente</Button>
            </a>
            <a href="/test/overview">
              <Button variant="outline" size="sm">Overview</Button>
            </a>
            <a href="/test/occurrences">
              <Button variant="outline" size="sm">Ocorrências</Button>
            </a>
            <a href="/test/polls">
              <Button variant="outline" size="sm">Votações</Button>
            </a>
            <a href="/test/documents">
              <Button variant="outline" size="sm">Documentos</Button>
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
