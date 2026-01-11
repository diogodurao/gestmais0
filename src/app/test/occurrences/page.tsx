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
import { Select } from "../components/ui/select"
import { Dropdown, DropdownItem, DropdownDivider } from "../components/ui/dropdown"
import { StatCard } from "../components/ui/stat-card"
import { EmptyState } from "../components/ui/empty-state"
import { Divider } from "../components/ui/divider"
import { ToastProvider, useToast } from "../components/ui/toast"
import { cn } from "@/lib/utils"
import {
  Plus, Search, Filter, MoreVertical, AlertTriangle,
  CheckCircle, Clock, XCircle, MessageSquare, Image,
  ChevronRight, Edit, Trash2, Eye, Send, User,
  Calendar, MapPin, ArrowLeft,
} from "lucide-react"

// Types
type OccurrenceStatus = "open" | "in_progress" | "resolved" | "closed"
type OccurrencePriority = "low" | "medium" | "high" | "urgent"
type OccurrenceCategory = "maintenance" | "security" | "noise" | "cleaning" | "other"

interface Comment {
  id: number
  author: string
  authorUnit: string
  content: string
  createdAt: string
  isManager: boolean
}

interface Occurrence {
  id: number
  title: string
  description: string
  category: OccurrenceCategory
  status: OccurrenceStatus
  priority: OccurrencePriority
  reporter: string
  reporterUnit: string
  createdAt: string
  updatedAt: string
  location?: string
  images: string[]
  comments: Comment[]
}

// Mock data
const mockOccurrences: Occurrence[] = [
  {
    id: 1,
    title: "Elevador com barulho estranho",
    description: "O elevador do bloco A está a fazer um barulho metálico durante a subida. Parece vir do mecanismo superior.",
    category: "maintenance",
    status: "in_progress",
    priority: "high",
    reporter: "Maria Silva",
    reporterUnit: "1A",
    createdAt: "2025-01-10T14:30:00",
    updatedAt: "2025-01-11T09:15:00",
    location: "Elevador Bloco A",
    images: ["/placeholder-1.jpg", "/placeholder-2.jpg"],
    comments: [
      { id: 1, author: "Administração", authorUnit: "", content: "Já contactámos a empresa de manutenção. Técnico previsto para amanhã.", createdAt: "2025-01-10T16:00:00", isManager: true },
      { id: 2, author: "Maria Silva", authorUnit: "1A", content: "Obrigada pela resposta rápida!", createdAt: "2025-01-10T16:30:00", isManager: false },
    ],
  },
  {
    id: 2,
    title: "Lâmpada fundida no corredor",
    description: "A lâmpada do corredor do 2º andar está fundida há 3 dias.",
    category: "maintenance",
    status: "open",
    priority: "low",
    reporter: "João Santos",
    reporterUnit: "1B",
    createdAt: "2025-01-09T10:00:00",
    updatedAt: "2025-01-09T10:00:00",
    location: "Corredor 2º Andar",
    images: [],
    comments: [],
  },
  {
    id: 3,
    title: "Ruído excessivo à noite",
    description: "Há ruído excessivo proveniente do apartamento 3B após as 23h, dificultando o descanso.",
    category: "noise",
    status: "open",
    priority: "medium",
    reporter: "Ana Costa",
    reporterUnit: "2A",
    createdAt: "2025-01-08T23:45:00",
    updatedAt: "2025-01-08T23:45:00",
    images: [],
    comments: [
      { id: 3, author: "Ana Costa", authorUnit: "2A", content: "Aconteceu novamente ontem à noite.", createdAt: "2025-01-09T08:00:00", isManager: false },
    ],
  },
  {
    id: 4,
    title: "Infiltração na garagem",
    description: "Há uma infiltração de água no tecto da garagem, junto ao lugar 5.",
    category: "maintenance",
    status: "resolved",
    priority: "urgent",
    reporter: "Pedro Lima",
    reporterUnit: "2B",
    createdAt: "2025-01-05T18:20:00",
    updatedAt: "2025-01-08T14:00:00",
    location: "Garagem - Lugar 5",
    images: ["/placeholder-3.jpg"],
    comments: [
      { id: 4, author: "Administração", authorUnit: "", content: "Problema identificado e reparado. Era uma fissura na impermeabilização.", createdAt: "2025-01-08T14:00:00", isManager: true },
    ],
  },
  {
    id: 5,
    title: "Porta da entrada não fecha bem",
    description: "A porta principal do edifício não está a fechar correctamente, comprometendo a segurança.",
    category: "security",
    status: "in_progress",
    priority: "high",
    reporter: "Clara Reis",
    reporterUnit: "3B",
    createdAt: "2025-01-07T09:00:00",
    updatedAt: "2025-01-10T11:00:00",
    location: "Entrada Principal",
    images: [],
    comments: [],
  },
]

// Utilities
function getStatusConfig(status: OccurrenceStatus) {
  const config = {
    open: { label: "Aberto", variant: "warning" as const, icon: Clock },
    in_progress: { label: "Em Progresso", variant: "info" as const, icon: AlertTriangle },
    resolved: { label: "Resolvido", variant: "success" as const, icon: CheckCircle },
    closed: { label: "Fechado", variant: "default" as const, icon: XCircle },
  }
  return config[status]
}

function getPriorityConfig(priority: OccurrencePriority) {
  const config = {
    low: { label: "Baixa", color: "text-[#6C757D]", bg: "bg-[#F1F3F5]" },
    medium: { label: "Média", color: "text-[#B8963E]", bg: "bg-[#FBF6EC]" },
    high: { label: "Alta", color: "text-[#B86B73]", bg: "bg-[#F9ECEE]" },
    urgent: { label: "Urgente", color: "text-white", bg: "bg-[#B86B73]" },
  }
  return config[priority]
}

function getCategoryLabel(category: OccurrenceCategory) {
  const labels = {
    maintenance: "Manutenção",
    security: "Segurança",
    noise: "Ruído",
    cleaning: "Limpeza",
    other: "Outro",
  }
  return labels[category]
}

function formatDateTime(dateStr: string) {
  const date = new Date(dateStr)
  return date.toLocaleDateString("pt-PT", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function formatRelativeTime(dateStr: string) {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMins < 60) return `Há ${diffMins} min`
  if (diffHours < 24) return `Há ${diffHours}h`
  return `Há ${diffDays}d`
}

// Occurrence Card Component
function OccurrenceCard({
  occurrence,
  onClick,
}: {
  occurrence: Occurrence
  onClick: () => void
}) {
  const statusConfig = getStatusConfig(occurrence.status)
  const priorityConfig = getPriorityConfig(occurrence.priority)
  const StatusIcon = statusConfig.icon

  return (
    <div
      onClick={onClick}
      className="rounded-lg border border-[#E9ECEF] bg-white p-1.5 transition-colors hover:bg-[#F8F9FA] hover:border-[#DEE2E6] cursor-pointer"
    >
      <div className="flex items-start justify-between gap-1.5 mb-1">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1 mb-0.5">
            <Badge variant={statusConfig.variant}>{statusConfig.label}</Badge>
            <span className={cn("px-1 py-0.5 rounded text-[8px] font-medium", priorityConfig.bg, priorityConfig.color)}>
              {priorityConfig.label}
            </span>
          </div>
          <h3 className="text-[11px] font-medium text-[#495057] truncate">{occurrence.title}</h3>
        </div>
        <ChevronRight className="h-4 w-4 text-[#DEE2E6] shrink-0" />
      </div>

      <p className="text-[10px] text-[#8E9AAF] line-clamp-2 mb-1.5">{occurrence.description}</p>

      <div className="flex items-center justify-between text-[9px] text-[#ADB5BD]">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-0.5">
            <User className="h-3 w-3" />
            {occurrence.reporter} - {occurrence.reporterUnit}
          </span>
          {occurrence.location && (
            <span className="flex items-center gap-0.5">
              <MapPin className="h-3 w-3" />
              {occurrence.location}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {occurrence.images.length > 0 && (
            <span className="flex items-center gap-0.5">
              <Image className="h-3 w-3" />
              {occurrence.images.length}
            </span>
          )}
          {occurrence.comments.length > 0 && (
            <span className="flex items-center gap-0.5">
              <MessageSquare className="h-3 w-3" />
              {occurrence.comments.length}
            </span>
          )}
          <span>{formatRelativeTime(occurrence.createdAt)}</span>
        </div>
      </div>
    </div>
  )
}

// Occurrence Detail Sheet
function OccurrenceDetail({
  occurrence,
  open,
  onClose,
  onStatusChange,
  onAddComment,
}: {
  occurrence: Occurrence | null
  open: boolean
  onClose: () => void
  onStatusChange: (status: OccurrenceStatus) => void
  onAddComment: (content: string) => void
}) {
  const [newComment, setNewComment] = useState("")

  if (!occurrence) return null

  const statusConfig = getStatusConfig(occurrence.status)
  const priorityConfig = getPriorityConfig(occurrence.priority)

  const handleSubmitComment = () => {
    if (newComment.trim()) {
      onAddComment(newComment)
      setNewComment("")
    }
  }

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title={occurrence.title}
      description={`Reportado por ${occurrence.reporter} - ${occurrence.reporterUnit}`}
    >
      <div className="space-y-1.5">
        {/* Status & Priority */}
        <div className="flex items-center gap-1.5">
          <Badge variant={statusConfig.variant}>{statusConfig.label}</Badge>
          <span className={cn("px-1.5 py-0.5 rounded text-[9px] font-medium", priorityConfig.bg, priorityConfig.color)}>
            {priorityConfig.label}
          </span>
          <Badge variant="default">{getCategoryLabel(occurrence.category)}</Badge>
        </div>

        <Divider />

        {/* Description */}
        <div>
          <p className="text-[9px] font-medium text-[#8E9AAF] uppercase tracking-wide mb-0.5">Descrição</p>
          <p className="text-[11px] text-[#495057]">{occurrence.description}</p>
        </div>

        {/* Details */}
        <div className="grid grid-cols-2 gap-1.5">
          <div>
            <p className="text-[9px] font-medium text-[#8E9AAF] uppercase tracking-wide mb-0.5">Local</p>
            <p className="text-[10px] text-[#495057]">{occurrence.location || "Não especificado"}</p>
          </div>
          <div>
            <p className="text-[9px] font-medium text-[#8E9AAF] uppercase tracking-wide mb-0.5">Data</p>
            <p className="text-[10px] text-[#495057]">{formatDateTime(occurrence.createdAt)}</p>
          </div>
        </div>

        {/* Images */}
        {occurrence.images.length > 0 && (
          <div>
            <p className="text-[9px] font-medium text-[#8E9AAF] uppercase tracking-wide mb-0.5">Imagens</p>
            <div className="flex gap-1">
              {occurrence.images.map((img, idx) => (
                <div key={idx} className="w-16 h-16 rounded bg-[#F1F3F5] border border-[#E9ECEF] flex items-center justify-center">
                  <Image className="h-6 w-6 text-[#ADB5BD]" />
                </div>
              ))}
            </div>
          </div>
        )}

        <Divider />

        {/* Status Change */}
        <div>
          <p className="text-[9px] font-medium text-[#8E9AAF] uppercase tracking-wide mb-0.5">Alterar Estado</p>
          <div className="flex gap-1">
            {(["open", "in_progress", "resolved", "closed"] as OccurrenceStatus[]).map((status) => {
              const config = getStatusConfig(status)
              return (
                <Button
                  key={status}
                  variant={occurrence.status === status ? "primary" : "outline"}
                  size="sm"
                  onClick={() => onStatusChange(status)}
                >
                  {config.label}
                </Button>
              )
            })}
          </div>
        </div>

        <Divider />

        {/* Comments */}
        <div>
          <p className="text-[9px] font-medium text-[#8E9AAF] uppercase tracking-wide mb-1">
            Comentários ({occurrence.comments.length})
          </p>
          <div className="space-y-1.5 max-h-48 overflow-y-auto">
            {occurrence.comments.length === 0 ? (
              <p className="text-[10px] text-[#ADB5BD] italic">Sem comentários</p>
            ) : (
              occurrence.comments.map((comment) => (
                <div key={comment.id} className={cn(
                  "rounded-lg p-1.5",
                  comment.isManager ? "bg-[#E8F0EA]" : "bg-[#F8F9FA]"
                )}>
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-[10px] font-medium text-[#495057]">
                      {comment.author}
                      {comment.authorUnit && ` - ${comment.authorUnit}`}
                      {comment.isManager && <Badge variant="success" className="ml-1">Admin</Badge>}
                    </span>
                    <span className="text-[9px] text-[#ADB5BD]">{formatRelativeTime(comment.createdAt)}</span>
                  </div>
                  <p className="text-[10px] text-[#6C757D]">{comment.content}</p>
                </div>
              ))
            )}
          </div>

          {/* Add Comment */}
          <div className="flex gap-1 mt-1.5">
            <Input
              placeholder="Adicionar comentário..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmitComment()}
              className="flex-1"
            />
            <IconButton
              icon={<Send className="h-3 w-3" />}
              label="Enviar"
              onClick={handleSubmitComment}
              disabled={!newComment.trim()}
            />
          </div>
        </div>
      </div>
    </Sheet>
  )
}

// Main Content
function OccurrencesContent() {
  const { addToast } = useToast()
  const [occurrences, setOccurrences] = useState(mockOccurrences)
  const [selectedOccurrence, setSelectedOccurrence] = useState<Occurrence | null>(null)
  const [showDetailSheet, setShowDetailSheet] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showMobileDrawer, setShowMobileDrawer] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState<OccurrenceStatus | "all">("all")

  // Stats
  const openCount = occurrences.filter(o => o.status === "open").length
  const inProgressCount = occurrences.filter(o => o.status === "in_progress").length
  const resolvedCount = occurrences.filter(o => o.status === "resolved").length
  const urgentCount = occurrences.filter(o => o.priority === "urgent" || o.priority === "high").length

  // Filter occurrences
  const filteredOccurrences = occurrences.filter((o) => {
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      if (!o.title.toLowerCase().includes(term) && !o.description.toLowerCase().includes(term)) {
        return false
      }
    }
    if (filterStatus !== "all" && o.status !== filterStatus) {
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

  const handleViewOccurrence = (occurrence: Occurrence) => {
    setSelectedOccurrence(occurrence)
    setShowDetailSheet(true)
  }

  const handleStatusChange = (status: OccurrenceStatus) => {
    if (selectedOccurrence) {
      setOccurrences(prev => prev.map(o =>
        o.id === selectedOccurrence.id ? { ...o, status, updatedAt: new Date().toISOString() } : o
      ))
      setSelectedOccurrence(prev => prev ? { ...prev, status } : null)
      addToast({
        variant: "success",
        title: "Estado atualizado",
        description: `Ocorrência marcada como "${getStatusConfig(status).label}".`,
      })
    }
  }

  const handleAddComment = (content: string) => {
    if (selectedOccurrence) {
      const newComment: Comment = {
        id: Date.now(),
        author: "Administração",
        authorUnit: "",
        content,
        createdAt: new Date().toISOString(),
        isManager: true,
      }
      setOccurrences(prev => prev.map(o =>
        o.id === selectedOccurrence.id
          ? { ...o, comments: [...o.comments, newComment] }
          : o
      ))
      setSelectedOccurrence(prev =>
        prev ? { ...prev, comments: [...prev.comments, newComment] } : null
      )
      addToast({
        variant: "success",
        title: "Comentário adicionado",
        description: "O seu comentário foi publicado.",
      })
    }
  }

  const handleSaveOccurrence = () => {
    setShowCreateModal(false)
    setShowMobileDrawer(false)
    addToast({
      variant: "success",
      title: "Ocorrência criada",
      description: "A nova ocorrência foi registada com sucesso.",
    })
  }

  // Form
  const OccurrenceForm = () => (
    <div className="space-y-1.5">
      <FormField label="Título" required>
        <Input placeholder="Descrição breve do problema" />
      </FormField>
      <FormField label="Descrição" required>
        <Textarea placeholder="Descreva o problema em detalhe..." />
      </FormField>
      <div className="grid grid-cols-2 gap-1.5">
        <FormField label="Categoria" required>
          <Select>
            <option value="maintenance">Manutenção</option>
            <option value="security">Segurança</option>
            <option value="noise">Ruído</option>
            <option value="cleaning">Limpeza</option>
            <option value="other">Outro</option>
          </Select>
        </FormField>
        <FormField label="Prioridade" required>
          <Select>
            <option value="low">Baixa</option>
            <option value="medium">Média</option>
            <option value="high">Alta</option>
            <option value="urgent">Urgente</option>
          </Select>
        </FormField>
      </div>
      <FormField label="Local">
        <Input placeholder="Onde está o problema? (opcional)" />
      </FormField>
      <FormField label="Imagens">
        <div className="border-2 border-dashed border-[#DEE2E6] rounded-lg p-4 text-center">
          <Image className="h-6 w-6 text-[#ADB5BD] mx-auto mb-1" />
          <p className="text-[10px] text-[#8E9AAF]">Clique ou arraste imagens</p>
        </div>
      </FormField>
    </div>
  )

  return (
    <div className="flex-1 overflow-y-auto p-1.5">
      {/* Header */}
      <div className="mb-1.5 flex flex-col gap-1.5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-[14px] font-semibold text-[#343A40]">Ocorrências</h1>
          <p className="text-[10px] text-[#8E9AAF]">Gestão de problemas e incidentes do condomínio</p>
        </div>
        <Button size="sm" onClick={handleCreate}>
          <Plus className="h-3 w-3" />
          <span className="hidden sm:inline ml-1">Nova Ocorrência</span>
        </Button>
      </div>

      {/* Stats */}
      <div className="mb-1.5 grid grid-cols-2 gap-1.5 lg:grid-cols-4">
        <StatCard
          label="Abertas"
          value={openCount.toString()}
          icon={<Clock className="h-4 w-4" />}
        />
        <StatCard
          label="Em Progresso"
          value={inProgressCount.toString()}
          icon={<AlertTriangle className="h-4 w-4" />}
        />
        <StatCard
          label="Resolvidas"
          value={resolvedCount.toString()}
          change={{ value: "este mês", positive: true }}
          icon={<CheckCircle className="h-4 w-4" />}
        />
        <StatCard
          label="Urgentes"
          value={urgentCount.toString()}
          change={urgentCount > 0 ? { value: "atenção", positive: false } : undefined}
          icon={<AlertTriangle className="h-4 w-4" />}
        />
      </div>

      {/* Toolbar */}
      <Card className="mb-1.5">
        <CardContent className="flex flex-wrap items-center gap-1.5">
          <div className="relative flex-1 min-w-[150px]">
            <Search className="absolute left-1.5 top-1/2 -translate-y-1/2 h-3 w-3 text-[#8E9AAF]" />
            <Input
              type="text"
              placeholder="Pesquisar ocorrências..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-6"
            />
          </div>
          <Dropdown
            trigger={
              <Button variant="outline" size="sm">
                <Filter className="h-3 w-3" />
                <span className="hidden sm:inline ml-1">
                  {filterStatus === "all" ? "Todos" : getStatusConfig(filterStatus).label}
                </span>
              </Button>
            }
          >
            <DropdownItem onClick={() => setFilterStatus("all")}>Todos</DropdownItem>
            <DropdownDivider />
            <DropdownItem onClick={() => setFilterStatus("open")}>Abertas</DropdownItem>
            <DropdownItem onClick={() => setFilterStatus("in_progress")}>Em Progresso</DropdownItem>
            <DropdownItem onClick={() => setFilterStatus("resolved")}>Resolvidas</DropdownItem>
            <DropdownItem onClick={() => setFilterStatus("closed")}>Fechadas</DropdownItem>
          </Dropdown>
        </CardContent>
      </Card>

      {/* Occurrences List */}
      {filteredOccurrences.length === 0 ? (
        <Card>
          <EmptyState
            title="Sem ocorrências"
            description={searchTerm || filterStatus !== "all"
              ? "Nenhuma ocorrência corresponde aos filtros."
              : "Não há ocorrências registadas."
            }
            action={
              <Button size="sm" onClick={handleCreate}>
                <Plus className="h-3 w-3 mr-1" />
                Criar Ocorrência
              </Button>
            }
          />
        </Card>
      ) : (
        <div className="space-y-1.5">
          {filteredOccurrences.map((occurrence) => (
            <OccurrenceCard
              key={occurrence.id}
              occurrence={occurrence}
              onClick={() => handleViewOccurrence(occurrence)}
            />
          ))}
        </div>
      )}

      {/* Detail Sheet */}
      <OccurrenceDetail
        occurrence={selectedOccurrence}
        open={showDetailSheet}
        onClose={() => { setShowDetailSheet(false); setSelectedOccurrence(null) }}
        onStatusChange={handleStatusChange}
        onAddComment={handleAddComment}
      />

      {/* Create Modal */}
      <Modal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Nova Ocorrência"
        description="Registe um novo problema ou incidente."
        footer={
          <div className="flex justify-end gap-1.5">
            <Button variant="outline" onClick={() => setShowCreateModal(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveOccurrence}>
              Criar Ocorrência
            </Button>
          </div>
        }
      >
        <OccurrenceForm />
      </Modal>

      {/* Mobile Drawer */}
      <Drawer
        open={showMobileDrawer}
        onClose={() => setShowMobileDrawer(false)}
        title="Nova Ocorrência"
        description="Registe um novo problema ou incidente."
      >
        <OccurrenceForm />
        <div className="mt-4 flex gap-1.5">
          <Button variant="outline" className="flex-1" onClick={() => setShowMobileDrawer(false)}>
            Cancelar
          </Button>
          <Button className="flex-1" onClick={handleSaveOccurrence}>
            Criar Ocorrência
          </Button>
        </div>
      </Drawer>
    </div>
  )
}

export default function OccurrencesPage() {
  return (
    <ToastProvider>
      <div className="h-full bg-white">
        <OccurrencesContent />
      </div>
    </ToastProvider>
  )
}
