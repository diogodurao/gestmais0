"use client"

import { useState } from "react"
import { Button } from "../components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "../components/ui/card"
import { Badge } from "../components/ui/badge"
import { Avatar } from "../components/ui/avatar"
import { IconButton } from "../components/ui/icon-button"
import { Input } from "../components/ui/input"
import { Modal } from "../components/ui/modal"
import { Drawer } from "../components/ui/drawer"
import { Sheet } from "../components/ui/sheet"
import { FormField } from "../components/ui/form-field"
import { Textarea } from "../components/ui/textarea"
import { Progress } from "../components/ui/progress"
import { StatCard } from "../components/ui/stat-card"
import { EmptyState } from "../components/ui/empty-state"
import { Divider } from "../components/ui/divider"
import { ToastProvider, useToast } from "../components/ui/toast"
import { cn } from "@/lib/utils"
import {
  Plus, Search, Filter, Vote, Clock, CheckCircle,
  Users, ChevronRight, Calendar, Check, ArrowLeft,
  BarChart3, Eye, Edit, Trash2, MoreVertical,
} from "lucide-react"

// Types
type PollStatus = "active" | "ended" | "scheduled"

interface PollOption {
  id: number
  text: string
  votes: number
  voters: string[]
}

interface Poll {
  id: number
  title: string
  description: string
  status: PollStatus
  options: PollOption[]
  totalVotes: number
  totalVoters: number
  eligibleVoters: number
  startDate: string
  endDate: string
  createdBy: string
  userVote?: number
}

// Mock data
const mockPolls: Poll[] = [
  {
    id: 1,
    title: "Pintura Exterior do Edifício",
    description: "Votação para aprovação do orçamento de pintura exterior. O orçamento apresentado é de €15.000 dividido em 6 prestações.",
    status: "active",
    options: [
      { id: 1, text: "Aprovar orçamento", votes: 8, voters: ["Maria Silva", "João Santos", "Ana Costa", "Pedro Lima", "Clara Reis", "Miguel Ferreira", "Sofia Oliveira", "Rui Pereira"] },
      { id: 2, text: "Rejeitar e pedir novos orçamentos", votes: 3, voters: ["Bruno Almeida", "Teresa Martins", "Paulo Sousa"] },
      { id: 3, text: "Adiar decisão", votes: 1, voters: ["Carla Nunes"] },
    ],
    totalVotes: 12,
    totalVoters: 12,
    eligibleVoters: 15,
    startDate: "2025-01-10",
    endDate: "2025-01-20",
    createdBy: "Administração",
    userVote: 1,
  },
  {
    id: 2,
    title: "Horário de Utilização do Jardim",
    description: "Definição do horário permitido para utilização do jardim comum durante a semana.",
    status: "active",
    options: [
      { id: 1, text: "08h - 22h", votes: 5, voters: ["Maria Silva", "João Santos", "Ana Costa", "Pedro Lima", "Clara Reis"] },
      { id: 2, text: "09h - 21h", votes: 4, voters: ["Bruno Almeida", "Teresa Martins", "Paulo Sousa", "Miguel Ferreira"] },
      { id: 3, text: "10h - 20h", votes: 2, voters: ["Sofia Oliveira", "Rui Pereira"] },
    ],
    totalVotes: 11,
    totalVoters: 11,
    eligibleVoters: 15,
    startDate: "2025-01-08",
    endDate: "2025-01-18",
    createdBy: "Administração",
  },
  {
    id: 3,
    title: "Instalação de Carregadores Elétricos",
    description: "Aprovação para instalação de 4 carregadores elétricos na garagem comum.",
    status: "ended",
    options: [
      { id: 1, text: "Aprovar instalação", votes: 10, voters: [] },
      { id: 2, text: "Rejeitar proposta", votes: 4, voters: [] },
      { id: 3, text: "Aprovar apenas 2 carregadores", votes: 1, voters: [] },
    ],
    totalVotes: 15,
    totalVoters: 15,
    eligibleVoters: 15,
    startDate: "2024-12-01",
    endDate: "2024-12-15",
    createdBy: "Administração",
    userVote: 1,
  },
  {
    id: 4,
    title: "Mudança de Empresa de Limpeza",
    description: "Votação sobre a proposta de mudança da empresa de limpeza das áreas comuns.",
    status: "scheduled",
    options: [
      { id: 1, text: "Manter empresa atual", votes: 0, voters: [] },
      { id: 2, text: "Mudar para Empresa A (€200/mês)", votes: 0, voters: [] },
      { id: 3, text: "Mudar para Empresa B (€180/mês)", votes: 0, voters: [] },
    ],
    totalVotes: 0,
    totalVoters: 0,
    eligibleVoters: 15,
    startDate: "2025-01-25",
    endDate: "2025-02-05",
    createdBy: "Administração",
  },
]

// Utilities
function getStatusConfig(status: PollStatus) {
  const config = {
    active: { label: "Ativa", variant: "success" as const, icon: Vote },
    ended: { label: "Terminada", variant: "default" as const, icon: CheckCircle },
    scheduled: { label: "Agendada", variant: "info" as const, icon: Clock },
  }
  return config[status]
}

function formatDate(dateStr: string) {
  const date = new Date(dateStr)
  return date.toLocaleDateString("pt-PT", { day: "numeric", month: "short", year: "numeric" })
}

function getDaysRemaining(endDate: string) {
  const end = new Date(endDate)
  const now = new Date()
  const diffTime = end.getTime() - now.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays
}

// Poll Card Component
function PollCard({
  poll,
  onClick,
}: {
  poll: Poll
  onClick: () => void
}) {
  const statusConfig = getStatusConfig(poll.status)
  const participationRate = Math.round((poll.totalVoters / poll.eligibleVoters) * 100)
  const daysRemaining = poll.status === "active" ? getDaysRemaining(poll.endDate) : 0

  return (
    <Card className="cursor-pointer hover:border-[#DEE2E6] transition-colors" onClick={onClick}>
      <CardHeader>
        <div className="flex items-start justify-between gap-1.5">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1 mb-0.5">
              <Badge variant={statusConfig.variant}>{statusConfig.label}</Badge>
              {poll.status === "active" && daysRemaining > 0 && (
                <span className="text-[9px] text-[#8E9AAF]">{daysRemaining} dias restantes</span>
              )}
              {poll.userVote && poll.status !== "scheduled" && (
                <Badge variant="success">Votou</Badge>
              )}
            </div>
            <CardTitle className="truncate">{poll.title}</CardTitle>
          </div>
          <ChevronRight className="h-4 w-4 text-[#DEE2E6] shrink-0" />
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-[10px] text-[#8E9AAF] line-clamp-2 mb-1.5">{poll.description}</p>

        {/* Options preview */}
        {poll.status !== "scheduled" && (
          <div className="space-y-1 mb-1.5">
            {poll.options.slice(0, 2).map((option) => {
              const percentage = poll.totalVotes > 0 ? Math.round((option.votes / poll.totalVotes) * 100) : 0
              const isWinning = poll.options.every(o => option.votes >= o.votes)

              return (
                <div key={option.id}>
                  <div className="flex items-center justify-between mb-0.5">
                    <span className={cn(
                      "text-[10px] truncate flex-1",
                      poll.userVote === option.id ? "font-medium text-[#6A9B72]" : "text-[#495057]"
                    )}>
                      {poll.userVote === option.id && <Check className="h-3 w-3 inline mr-0.5" />}
                      {option.text}
                    </span>
                    <span className="text-[10px] font-medium text-[#495057] ml-1.5">{percentage}%</span>
                  </div>
                  <Progress
                    value={percentage}
                    size="sm"
                    className={cn(isWinning && poll.status === "ended" && "[&>div]:bg-[#8FB996]")}
                  />
                </div>
              )
            })}
            {poll.options.length > 2 && (
              <p className="text-[9px] text-[#ADB5BD]">+{poll.options.length - 2} opções</p>
            )}
          </div>
        )}
      </CardContent>
      <CardFooter>
        <div className="flex items-center justify-between w-full text-[9px] text-[#8E9AAF]">
          <span className="flex items-center gap-0.5">
            <Users className="h-3 w-3" />
            {poll.totalVoters}/{poll.eligibleVoters} votaram ({participationRate}%)
          </span>
          <span className="flex items-center gap-0.5">
            <Calendar className="h-3 w-3" />
            {poll.status === "scheduled" ? `Inicia ${formatDate(poll.startDate)}` : `Termina ${formatDate(poll.endDate)}`}
          </span>
        </div>
      </CardFooter>
    </Card>
  )
}

// Poll Detail View
function PollDetail({
  poll,
  open,
  onClose,
  onVote,
}: {
  poll: Poll | null
  open: boolean
  onClose: () => void
  onVote: (pollId: number, optionId: number) => void
}) {
  const [selectedOption, setSelectedOption] = useState<number | null>(null)

  if (!poll) return null

  const statusConfig = getStatusConfig(poll.status)
  const participationRate = Math.round((poll.totalVoters / poll.eligibleVoters) * 100)
  const canVote = poll.status === "active" && !poll.userVote

  const handleVote = () => {
    if (selectedOption) {
      onVote(poll.id, selectedOption)
      setSelectedOption(null)
    }
  }

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title={poll.title}
      description={`Criado por ${poll.createdBy}`}
    >
      <div className="space-y-1.5">
        {/* Status */}
        <div className="flex items-center gap-1.5">
          <Badge variant={statusConfig.variant}>{statusConfig.label}</Badge>
          {poll.userVote && <Badge variant="success">Já votou</Badge>}
        </div>

        {/* Description */}
        <p className="text-[11px] text-[#495057]">{poll.description}</p>

        <Divider />

        {/* Dates */}
        <div className="grid grid-cols-2 gap-1.5">
          <div>
            <p className="text-[9px] font-medium text-[#8E9AAF] uppercase tracking-wide mb-0.5">Início</p>
            <p className="text-[10px] text-[#495057]">{formatDate(poll.startDate)}</p>
          </div>
          <div>
            <p className="text-[9px] font-medium text-[#8E9AAF] uppercase tracking-wide mb-0.5">Fim</p>
            <p className="text-[10px] text-[#495057]">{formatDate(poll.endDate)}</p>
          </div>
        </div>

        {/* Participation */}
        <div>
          <div className="flex items-center justify-between mb-0.5">
            <span className="text-[9px] font-medium text-[#8E9AAF] uppercase tracking-wide">Participação</span>
            <span className="text-[10px] font-medium text-[#495057]">{participationRate}%</span>
          </div>
          <Progress value={participationRate} />
          <p className="text-[9px] text-[#8E9AAF] mt-0.5">
            {poll.totalVoters} de {poll.eligibleVoters} condóminos votaram
          </p>
        </div>

        <Divider />

        {/* Options */}
        <div>
          <p className="text-[9px] font-medium text-[#8E9AAF] uppercase tracking-wide mb-1">
            {canVote ? "Selecione a sua opção" : "Resultados"}
          </p>
          <div className="space-y-1.5">
            {poll.options.map((option) => {
              const percentage = poll.totalVotes > 0 ? Math.round((option.votes / poll.totalVotes) * 100) : 0
              const isWinning = poll.options.every(o => option.votes >= o.votes) && poll.totalVotes > 0
              const isUserVote = poll.userVote === option.id
              const isSelected = selectedOption === option.id

              return (
                <div
                  key={option.id}
                  onClick={() => canVote && setSelectedOption(option.id)}
                  className={cn(
                    "rounded-lg border p-1.5 transition-colors",
                    canVote && "cursor-pointer hover:border-[#8FB996]",
                    isSelected && "border-[#8FB996] bg-[#E8F0EA]",
                    isUserVote && !canVote && "border-[#D4E5D7] bg-[#E8F0EA]",
                    !isSelected && !isUserVote && "border-[#E9ECEF]"
                  )}
                >
                  <div className="flex items-center justify-between mb-0.5">
                    <span className={cn(
                      "text-[11px] flex items-center gap-1",
                      isUserVote ? "font-medium text-[#6A9B72]" : "text-[#495057]"
                    )}>
                      {canVote && (
                        <span className={cn(
                          "w-3 h-3 rounded-full border-2 flex items-center justify-center",
                          isSelected ? "border-[#8FB996] bg-[#8FB996]" : "border-[#DEE2E6]"
                        )}>
                          {isSelected && <Check className="h-2 w-2 text-white" />}
                        </span>
                      )}
                      {isUserVote && <Check className="h-3 w-3 text-[#6A9B72]" />}
                      {option.text}
                    </span>
                    <span className={cn(
                      "text-[11px] font-medium",
                      isWinning && poll.status === "ended" ? "text-[#6A9B72]" : "text-[#495057]"
                    )}>
                      {option.votes} votos ({percentage}%)
                    </span>
                  </div>
                  {!canVote && (
                    <Progress
                      value={percentage}
                      size="sm"
                      className={cn(isWinning && poll.status === "ended" && "[&>div]:bg-[#8FB996]")}
                    />
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Vote Button */}
        {canVote && (
          <Button
            className="w-full mt-1.5"
            disabled={!selectedOption}
            onClick={handleVote}
          >
            <Vote className="h-3 w-3 mr-1" />
            Confirmar Voto
          </Button>
        )}

        {/* Results Summary */}
        {poll.status === "ended" && (
          <div className="rounded-lg bg-[#F8F9FA] border border-[#E9ECEF] p-1.5">
            <p className="text-[9px] font-medium text-[#8E9AAF] uppercase tracking-wide mb-0.5">Resultado Final</p>
            <p className="text-[11px] font-medium text-[#495057]">
              {poll.options.reduce((max, opt) => opt.votes > max.votes ? opt : max, poll.options[0]).text}
            </p>
            <p className="text-[9px] text-[#8E9AAF]">Opção vencedora com maioria dos votos</p>
          </div>
        )}
      </div>
    </Sheet>
  )
}

// Main Content
function PollsContent() {
  const { addToast } = useToast()
  const [polls, setPolls] = useState(mockPolls)
  const [selectedPoll, setSelectedPoll] = useState<Poll | null>(null)
  const [showDetailSheet, setShowDetailSheet] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showMobileDrawer, setShowMobileDrawer] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState<PollStatus | "all">("all")

  // Stats
  const activeCount = polls.filter(p => p.status === "active").length
  const endedCount = polls.filter(p => p.status === "ended").length
  const scheduledCount = polls.filter(p => p.status === "scheduled").length
  const avgParticipation = Math.round(
    polls.filter(p => p.status !== "scheduled").reduce((sum, p) => sum + (p.totalVoters / p.eligibleVoters) * 100, 0) /
    polls.filter(p => p.status !== "scheduled").length
  )

  // Filter polls
  const filteredPolls = polls.filter((p) => {
    if (searchTerm && !p.title.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false
    }
    if (filterStatus !== "all" && p.status !== filterStatus) {
      return false
    }
    return true
  })

  // Handlers
  const handleCreate = () => {
    if (window.innerWidth < 640) {
      setShowMobileDrawer(true)
    } else {
      setShowCreateModal(true)
    }
  }

  const handleViewPoll = (poll: Poll) => {
    setSelectedPoll(poll)
    setShowDetailSheet(true)
  }

  const handleVote = (pollId: number, optionId: number) => {
    setPolls(prev => prev.map(p => {
      if (p.id !== pollId) return p
      return {
        ...p,
        userVote: optionId,
        totalVoters: p.totalVoters + 1,
        totalVotes: p.totalVotes + 1,
        options: p.options.map(o =>
          o.id === optionId ? { ...o, votes: o.votes + 1 } : o
        ),
      }
    }))
    setSelectedPoll(prev => {
      if (!prev || prev.id !== pollId) return prev
      return {
        ...prev,
        userVote: optionId,
        totalVoters: prev.totalVoters + 1,
        totalVotes: prev.totalVotes + 1,
        options: prev.options.map(o =>
          o.id === optionId ? { ...o, votes: o.votes + 1 } : o
        ),
      }
    })
    addToast({
      variant: "success",
      title: "Voto registado",
      description: "O seu voto foi contabilizado com sucesso.",
    })
  }

  const handleSavePoll = () => {
    setShowCreateModal(false)
    setShowMobileDrawer(false)
    addToast({
      variant: "success",
      title: "Votação criada",
      description: "A nova votação foi criada com sucesso.",
    })
  }

  // Form
  const PollForm = () => (
    <div className="space-y-1.5">
      <FormField label="Título" required>
        <Input placeholder="Título da votação" />
      </FormField>
      <FormField label="Descrição" required>
        <Textarea placeholder="Descreva o objetivo desta votação..." />
      </FormField>
      <div className="grid grid-cols-2 gap-1.5">
        <FormField label="Data Início" required>
          <Input type="date" />
        </FormField>
        <FormField label="Data Fim" required>
          <Input type="date" />
        </FormField>
      </div>
      <FormField label="Opções de Voto" required>
        <div className="space-y-1">
          <Input placeholder="Opção 1" />
          <Input placeholder="Opção 2" />
          <Input placeholder="Opção 3 (opcional)" />
          <Button variant="outline" size="sm" className="w-full">
            <Plus className="h-3 w-3 mr-1" /> Adicionar opção
          </Button>
        </div>
      </FormField>
    </div>
  )

  return (
    <div className="flex-1 overflow-y-auto p-1.5">
      {/* Header */}
      <div className="mb-1.5 flex flex-col gap-1.5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-[14px] font-semibold text-[#343A40]">Votações</h1>
          <p className="text-[10px] text-[#8E9AAF]">Sistema de votação do condomínio</p>
        </div>
        <Button size="sm" onClick={handleCreate}>
          <Plus className="h-3 w-3" />
          <span className="hidden sm:inline ml-1">Nova Votação</span>
        </Button>
      </div>

      {/* Stats */}
      <div className="mb-1.5 grid grid-cols-2 gap-1.5 lg:grid-cols-4">
        <StatCard
          label="Ativas"
          value={activeCount.toString()}
          icon={<Vote className="h-4 w-4" />}
        />
        <StatCard
          label="Terminadas"
          value={endedCount.toString()}
          icon={<CheckCircle className="h-4 w-4" />}
        />
        <StatCard
          label="Agendadas"
          value={scheduledCount.toString()}
          icon={<Clock className="h-4 w-4" />}
        />
        <StatCard
          label="Participação Média"
          value={`${avgParticipation}%`}
          change={{ value: "+5%", positive: true }}
          icon={<BarChart3 className="h-4 w-4" />}
        />
      </div>

      {/* Toolbar */}
      <Card className="mb-1.5">
        <CardContent className="flex flex-wrap items-center gap-1.5">
          <div className="relative flex-1 min-w-[150px]">
            <Search className="absolute left-1.5 top-1/2 -translate-y-1/2 h-3 w-3 text-[#8E9AAF]" />
            <Input
              type="text"
              placeholder="Pesquisar votações..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-6"
            />
          </div>
          <div className="flex gap-1">
            <Button
              variant={filterStatus === "all" ? "primary" : "outline"}
              size="sm"
              onClick={() => setFilterStatus("all")}
            >
              Todas
            </Button>
            <Button
              variant={filterStatus === "active" ? "primary" : "outline"}
              size="sm"
              onClick={() => setFilterStatus("active")}
            >
              Ativas
            </Button>
            <Button
              variant={filterStatus === "ended" ? "primary" : "outline"}
              size="sm"
              onClick={() => setFilterStatus("ended")}
            >
              Terminadas
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Polls List */}
      {filteredPolls.length === 0 ? (
        <Card>
          <EmptyState
            title="Sem votações"
            description={searchTerm || filterStatus !== "all"
              ? "Nenhuma votação corresponde aos filtros."
              : "Não há votações registadas."
            }
            action={
              <Button size="sm" onClick={handleCreate}>
                <Plus className="h-3 w-3 mr-1" />
                Criar Votação
              </Button>
            }
          />
        </Card>
      ) : (
        <div className="grid gap-1.5 sm:grid-cols-2">
          {filteredPolls.map((poll) => (
            <PollCard
              key={poll.id}
              poll={poll}
              onClick={() => handleViewPoll(poll)}
            />
          ))}
        </div>
      )}

      {/* Detail Sheet */}
      <PollDetail
        poll={selectedPoll}
        open={showDetailSheet}
        onClose={() => { setShowDetailSheet(false); setSelectedPoll(null) }}
        onVote={handleVote}
      />

      {/* Create Modal */}
      <Modal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Nova Votação"
        description="Crie uma nova votação para os condóminos."
        footer={
          <div className="flex justify-end gap-1.5">
            <Button variant="outline" onClick={() => setShowCreateModal(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSavePoll}>
              Criar Votação
            </Button>
          </div>
        }
      >
        <PollForm />
      </Modal>

      {/* Mobile Drawer */}
      <Drawer
        open={showMobileDrawer}
        onClose={() => setShowMobileDrawer(false)}
        title="Nova Votação"
        description="Crie uma nova votação para os condóminos."
      >
        <PollForm />
        <div className="mt-4 flex gap-1.5">
          <Button variant="outline" className="flex-1" onClick={() => setShowMobileDrawer(false)}>
            Cancelar
          </Button>
          <Button className="flex-1" onClick={handleSavePoll}>
            Criar Votação
          </Button>
        </div>
      </Drawer>
    </div>
  )
}

export default function PollsPage() {
  return (
    <ToastProvider>
      <div className="h-full bg-white">
        <PollsContent />
      </div>
    </ToastProvider>
  )
}
