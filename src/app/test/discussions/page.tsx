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
import { StatCard } from "../components/ui/stat-card"
import { EmptyState } from "../components/ui/empty-state"
import { Divider } from "../components/ui/divider"
import { ToastProvider, useToast } from "../components/ui/toast"
import { cn } from "@/lib/utils"
import {
  Plus, Search, Filter, MessageSquare, Clock,
  Users, ChevronRight, ThumbsUp, Reply, Pin,
  Eye, Edit, Trash2, MoreVertical, Send, Hash,
} from "lucide-react"

// Types
type DiscussionCategory = "general" | "maintenance" | "finance" | "events" | "suggestions"

interface Comment {
  id: number
  author: string
  authorUnit: string
  content: string
  createdAt: string
  likes: number
  isLiked: boolean
}

interface Discussion {
  id: number
  title: string
  content: string
  category: DiscussionCategory
  author: string
  authorUnit: string
  createdAt: string
  views: number
  commentsCount: number
  isPinned: boolean
  comments: Comment[]
}

// Mock data
const mockDiscussions: Discussion[] = [
  {
    id: 1,
    title: "Proposta de instalação de painéis solares",
    content: "Gostava de propor a instalação de painéis solares no telhado do edifício. Com o aumento dos custos de energia, esta pode ser uma forma de reduzir as despesas comuns. Alguém tem experiência com este tipo de projecto?",
    category: "suggestions",
    author: "Maria Silva",
    authorUnit: "1A",
    createdAt: "2025-01-10T14:30:00",
    views: 45,
    commentsCount: 8,
    isPinned: true,
    comments: [
      { id: 1, author: "João Santos", authorUnit: "1B", content: "Excelente ideia! No meu anterior condomínio fizeram isso e as poupanças foram significativas.", createdAt: "2025-01-10T15:00:00", likes: 5, isLiked: true },
      { id: 2, author: "Ana Costa", authorUnit: "2A", content: "Temos de ver os custos de instalação e manutenção. Alguém sabe valores?", createdAt: "2025-01-10T16:30:00", likes: 3, isLiked: false },
      { id: 3, author: "Pedro Lima", authorUnit: "2B", content: "Posso pedir orçamentos a algumas empresas que conheço.", createdAt: "2025-01-10T18:00:00", likes: 7, isLiked: true },
    ],
  },
  {
    id: 2,
    title: "Horário das obras no edifício ao lado",
    content: "As obras no edifício vizinho estão a começar muito cedo (7h da manhã). Alguém sabe se podemos fazer alguma coisa em relação ao barulho?",
    category: "general",
    author: "Clara Reis",
    authorUnit: "3B",
    createdAt: "2025-01-09T08:15:00",
    views: 32,
    commentsCount: 5,
    isPinned: false,
    comments: [
      { id: 4, author: "Bruno Almeida", authorUnit: "3A", content: "Também me tem incomodado. Vou verificar o regulamento municipal.", createdAt: "2025-01-09T09:00:00", likes: 2, isLiked: false },
    ],
  },
  {
    id: 3,
    title: "Orçamento do condomínio 2025 - Discussão",
    content: "Partilho aqui o orçamento provisório para 2025 para discussão antes da assembleia. Os principais pontos são: manutenção do elevador, pintura das áreas comuns e fundo de reserva.",
    category: "finance",
    author: "Administração",
    authorUnit: "",
    createdAt: "2025-01-08T10:00:00",
    views: 67,
    commentsCount: 12,
    isPinned: true,
    comments: [],
  },
  {
    id: 4,
    title: "Proposta de churrasqueira comum",
    content: "Que tal instalarmos uma zona de churrasqueira no jardim? Seria óptimo para convívios entre vizinhos.",
    category: "suggestions",
    author: "Miguel Ferreira",
    authorUnit: "2A",
    createdAt: "2025-01-07T17:45:00",
    views: 28,
    commentsCount: 6,
    isPinned: false,
    comments: [],
  },
  {
    id: 5,
    title: "Manutenção do portão da garagem",
    content: "O portão da garagem está a fazer um barulho estranho quando abre. Já reportei à administração mas queria saber se mais alguém notou.",
    category: "maintenance",
    author: "Sofia Oliveira",
    authorUnit: "1B",
    createdAt: "2025-01-06T11:20:00",
    views: 19,
    commentsCount: 3,
    isPinned: false,
    comments: [],
  },
]

// Utilities
function getCategoryConfig(category: DiscussionCategory) {
  const config = {
    general: { label: "Geral", color: "text-[#6C757D]", bg: "bg-[#F1F3F5]" },
    maintenance: { label: "Manutenção", color: "text-[#B8963E]", bg: "bg-[#FBF6EC]" },
    finance: { label: "Finanças", color: "text-[#6A9B72]", bg: "bg-[#E8F0EA]" },
    events: { label: "Eventos", color: "text-[#6C757D]", bg: "bg-[#E9ECF0]" },
    suggestions: { label: "Sugestões", color: "text-[#8E9AAF]", bg: "bg-[#F8F9FA]" },
  }
  return config[category]
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
  if (diffDays < 7) return `Há ${diffDays}d`
  return date.toLocaleDateString("pt-PT", { day: "numeric", month: "short" })
}

// Discussion Card Component
function DiscussionCard({
  discussion,
  onClick,
}: {
  discussion: Discussion
  onClick: () => void
}) {
  const categoryConfig = getCategoryConfig(discussion.category)

  return (
    <div
      onClick={onClick}
      className={cn(
        "rounded-lg border bg-white p-1.5 transition-colors hover:bg-[#F8F9FA] hover:border-[#DEE2E6] cursor-pointer",
        discussion.isPinned && "border-[#D4E5D7] bg-[#F8FAF8]"
      )}
    >
      <div className="flex items-start gap-1.5">
        <Avatar size="sm" fallback={discussion.author.charAt(0)} alt={discussion.author} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1 mb-0.5 flex-wrap">
            {discussion.isPinned && (
              <Pin className="h-3 w-3 text-[#8FB996]" />
            )}
            <span className={cn("px-1 py-0.5 rounded text-[8px] font-medium", categoryConfig.bg, categoryConfig.color)}>
              {categoryConfig.label}
            </span>
            <span className="text-[9px] text-[#8E9AAF]">
              {discussion.author}
              {discussion.authorUnit && ` - ${discussion.authorUnit}`}
            </span>
            <span className="text-[9px] text-[#ADB5BD]">•</span>
            <span className="text-[9px] text-[#ADB5BD]">{formatRelativeTime(discussion.createdAt)}</span>
          </div>

          <h3 className="text-[11px] font-medium text-[#495057] line-clamp-1 mb-0.5">{discussion.title}</h3>
          <p className="text-[10px] text-[#8E9AAF] line-clamp-2">{discussion.content}</p>

          <div className="flex items-center gap-3 mt-1.5 text-[9px] text-[#ADB5BD]">
            <span className="flex items-center gap-0.5">
              <MessageSquare className="h-3 w-3" />
              {discussion.commentsCount}
            </span>
            <span className="flex items-center gap-0.5">
              <Eye className="h-3 w-3" />
              {discussion.views}
            </span>
          </div>
        </div>
        <ChevronRight className="h-4 w-4 text-[#DEE2E6] shrink-0" />
      </div>
    </div>
  )
}

// Discussion Detail
function DiscussionDetail({
  discussion,
  open,
  onClose,
  onAddComment,
  onLikeComment,
}: {
  discussion: Discussion | null
  open: boolean
  onClose: () => void
  onAddComment: (content: string) => void
  onLikeComment: (commentId: number) => void
}) {
  const [newComment, setNewComment] = useState("")

  if (!discussion) return null

  const categoryConfig = getCategoryConfig(discussion.category)

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
      title={discussion.title}
      description={`Por ${discussion.author}${discussion.authorUnit ? ` - ${discussion.authorUnit}` : ""}`}
    >
      <div className="space-y-1.5">
        {/* Header */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {discussion.isPinned && (
            <Badge variant="success">
              <Pin className="h-3 w-3 mr-0.5" /> Fixado
            </Badge>
          )}
          <span className={cn("px-1.5 py-0.5 rounded text-[9px] font-medium", categoryConfig.bg, categoryConfig.color)}>
            {categoryConfig.label}
          </span>
          <span className="text-[9px] text-[#8E9AAF]">{formatRelativeTime(discussion.createdAt)}</span>
        </div>

        {/* Content */}
        <p className="text-[11px] text-[#495057] leading-relaxed">{discussion.content}</p>

        {/* Stats */}
        <div className="flex items-center gap-3 text-[9px] text-[#8E9AAF]">
          <span className="flex items-center gap-0.5">
            <Eye className="h-3 w-3" />
            {discussion.views} visualizações
          </span>
          <span className="flex items-center gap-0.5">
            <MessageSquare className="h-3 w-3" />
            {discussion.commentsCount} comentários
          </span>
        </div>

        <Divider />

        {/* Comments */}
        <div>
          <p className="text-[9px] font-medium text-[#8E9AAF] uppercase tracking-wide mb-1">
            Comentários ({discussion.comments.length})
          </p>
          <div className="space-y-1.5 max-h-64 overflow-y-auto">
            {discussion.comments.length === 0 ? (
              <p className="text-[10px] text-[#ADB5BD] italic py-4 text-center">
                Seja o primeiro a comentar
              </p>
            ) : (
              discussion.comments.map((comment) => (
                <div key={comment.id} className="rounded-lg bg-[#F8F9FA] p-1.5">
                  <div className="flex items-center justify-between mb-0.5">
                    <div className="flex items-center gap-1">
                      <Avatar size="sm" fallback={comment.author.charAt(0)} alt={comment.author} />
                      <span className="text-[10px] font-medium text-[#495057]">
                        {comment.author}
                        {comment.authorUnit && ` - ${comment.authorUnit}`}
                      </span>
                    </div>
                    <span className="text-[9px] text-[#ADB5BD]">{formatRelativeTime(comment.createdAt)}</span>
                  </div>
                  <p className="text-[10px] text-[#6C757D] ml-6">{comment.content}</p>
                  <div className="flex items-center gap-2 mt-1 ml-6">
                    <button
                      onClick={() => onLikeComment(comment.id)}
                      className={cn(
                        "flex items-center gap-0.5 text-[9px] transition-colors",
                        comment.isLiked ? "text-[#8FB996]" : "text-[#ADB5BD] hover:text-[#8FB996]"
                      )}
                    >
                      <ThumbsUp className="h-3 w-3" />
                      {comment.likes}
                    </button>
                    <button className="flex items-center gap-0.5 text-[9px] text-[#ADB5BD] hover:text-[#495057]">
                      <Reply className="h-3 w-3" />
                      Responder
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Add Comment */}
          <div className="flex gap-1 mt-1.5">
            <Input
              placeholder="Escreva um comentário..."
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
function DiscussionsContent() {
  const { addToast } = useToast()
  const [discussions, setDiscussions] = useState(mockDiscussions)
  const [selectedDiscussion, setSelectedDiscussion] = useState<Discussion | null>(null)
  const [showDetailSheet, setShowDetailSheet] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showMobileDrawer, setShowMobileDrawer] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterCategory, setFilterCategory] = useState<DiscussionCategory | "all">("all")

  // Stats
  const totalDiscussions = discussions.length
  const totalComments = discussions.reduce((sum, d) => sum + d.commentsCount, 0)
  const totalViews = discussions.reduce((sum, d) => sum + d.views, 0)
  const pinnedCount = discussions.filter(d => d.isPinned).length

  // Filter discussions
  const filteredDiscussions = discussions.filter((d) => {
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      if (!d.title.toLowerCase().includes(term) && !d.content.toLowerCase().includes(term)) {
        return false
      }
    }
    if (filterCategory !== "all" && d.category !== filterCategory) {
      return false
    }
    return true
  })

  // Sort: pinned first, then by date
  const sortedDiscussions = [...filteredDiscussions].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1
    if (!a.isPinned && b.isPinned) return 1
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })

  // Handlers
  const handleCreate = () => {
    if (window.innerWidth < 640) {
      setShowMobileDrawer(true)
    } else {
      setShowCreateModal(true)
    }
  }

  const handleViewDiscussion = (discussion: Discussion) => {
    setSelectedDiscussion(discussion)
    setShowDetailSheet(true)
  }

  const handleAddComment = (content: string) => {
    if (selectedDiscussion) {
      const newComment: Comment = {
        id: Date.now(),
        author: "Você",
        authorUnit: "1A",
        content,
        createdAt: new Date().toISOString(),
        likes: 0,
        isLiked: false,
      }
      setDiscussions(prev => prev.map(d =>
        d.id === selectedDiscussion.id
          ? { ...d, comments: [...d.comments, newComment], commentsCount: d.commentsCount + 1 }
          : d
      ))
      setSelectedDiscussion(prev =>
        prev ? { ...prev, comments: [...prev.comments, newComment], commentsCount: prev.commentsCount + 1 } : null
      )
      addToast({
        variant: "success",
        title: "Comentário publicado",
        description: "O seu comentário foi adicionado à discussão.",
      })
    }
  }

  const handleLikeComment = (commentId: number) => {
    if (selectedDiscussion) {
      setDiscussions(prev => prev.map(d =>
        d.id === selectedDiscussion.id
          ? {
            ...d,
            comments: d.comments.map(c =>
              c.id === commentId
                ? { ...c, likes: c.isLiked ? c.likes - 1 : c.likes + 1, isLiked: !c.isLiked }
                : c
            ),
          }
          : d
      ))
      setSelectedDiscussion(prev =>
        prev
          ? {
            ...prev,
            comments: prev.comments.map(c =>
              c.id === commentId
                ? { ...c, likes: c.isLiked ? c.likes - 1 : c.likes + 1, isLiked: !c.isLiked }
                : c
            ),
          }
          : null
      )
    }
  }

  const handleSaveDiscussion = () => {
    setShowCreateModal(false)
    setShowMobileDrawer(false)
    addToast({
      variant: "success",
      title: "Discussão criada",
      description: "A nova discussão foi publicada com sucesso.",
    })
  }

  // Form
  const DiscussionForm = () => (
    <div className="space-y-1.5">
      <FormField label="Título" required>
        <Input placeholder="Título da discussão" />
      </FormField>
      <FormField label="Categoria" required>
        <Select>
          <option value="general">Geral</option>
          <option value="maintenance">Manutenção</option>
          <option value="finance">Finanças</option>
          <option value="events">Eventos</option>
          <option value="suggestions">Sugestões</option>
        </Select>
      </FormField>
      <FormField label="Conteúdo" required>
        <Textarea placeholder="Escreva a sua mensagem..." className="min-h-[100px]" />
      </FormField>
    </div>
  )

  return (
    <div className="flex-1 overflow-y-auto p-1.5">
      {/* Header */}
      <div className="mb-1.5 flex flex-col gap-1.5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-[14px] font-semibold text-[#343A40]">Discussões</h1>
          <p className="text-[10px] text-[#8E9AAF]">Fórum de discussão do condomínio</p>
        </div>
        <Button size="sm" onClick={handleCreate}>
          <Plus className="h-3 w-3" />
          <span className="hidden sm:inline ml-1">Nova Discussão</span>
        </Button>
      </div>

      {/* Stats */}
      <div className="mb-1.5 grid grid-cols-2 gap-1.5 lg:grid-cols-4">
        <StatCard
          label="Discussões"
          value={totalDiscussions.toString()}
          icon={<MessageSquare className="h-4 w-4" />}
        />
        <StatCard
          label="Comentários"
          value={totalComments.toString()}
          icon={<Reply className="h-4 w-4" />}
        />
        <StatCard
          label="Visualizações"
          value={totalViews.toString()}
          icon={<Eye className="h-4 w-4" />}
        />
        <StatCard
          label="Fixadas"
          value={pinnedCount.toString()}
          icon={<Pin className="h-4 w-4" />}
        />
      </div>

      {/* Toolbar */}
      <Card className="mb-1.5">
        <CardContent className="flex flex-wrap items-center gap-1.5">
          <div className="relative flex-1 min-w-[150px]">
            <Search className="absolute left-1.5 top-1/2 -translate-y-1/2 h-3 w-3 text-[#8E9AAF]" />
            <Input
              type="text"
              placeholder="Pesquisar discussões..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-6"
            />
          </div>
          <Select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value as DiscussionCategory | "all")}
            className="w-auto"
          >
            <option value="all">Todas as categorias</option>
            <option value="general">Geral</option>
            <option value="maintenance">Manutenção</option>
            <option value="finance">Finanças</option>
            <option value="events">Eventos</option>
            <option value="suggestions">Sugestões</option>
          </Select>
        </CardContent>
      </Card>

      {/* Discussions List */}
      {sortedDiscussions.length === 0 ? (
        <Card>
          <EmptyState
            title="Sem discussões"
            description={searchTerm || filterCategory !== "all"
              ? "Nenhuma discussão corresponde aos filtros."
              : "Não há discussões registadas."
            }
            action={
              <Button size="sm" onClick={handleCreate}>
                <Plus className="h-3 w-3 mr-1" />
                Criar Discussão
              </Button>
            }
          />
        </Card>
      ) : (
        <div className="space-y-1.5">
          {sortedDiscussions.map((discussion) => (
            <DiscussionCard
              key={discussion.id}
              discussion={discussion}
              onClick={() => handleViewDiscussion(discussion)}
            />
          ))}
        </div>
      )}

      {/* Detail Sheet */}
      <DiscussionDetail
        discussion={selectedDiscussion}
        open={showDetailSheet}
        onClose={() => { setShowDetailSheet(false); setSelectedDiscussion(null) }}
        onAddComment={handleAddComment}
        onLikeComment={handleLikeComment}
      />

      {/* Create Modal */}
      <Modal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Nova Discussão"
        description="Inicie uma nova discussão com os condóminos."
        footer={
          <div className="flex justify-end gap-1.5">
            <Button variant="outline" onClick={() => setShowCreateModal(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveDiscussion}>
              Publicar
            </Button>
          </div>
        }
      >
        <DiscussionForm />
      </Modal>

      {/* Mobile Drawer */}
      <Drawer
        open={showMobileDrawer}
        onClose={() => setShowMobileDrawer(false)}
        title="Nova Discussão"
        description="Inicie uma nova discussão com os condóminos."
      >
        <DiscussionForm />
        <div className="mt-4 flex gap-1.5">
          <Button variant="outline" className="flex-1" onClick={() => setShowMobileDrawer(false)}>
            Cancelar
          </Button>
          <Button className="flex-1" onClick={handleSaveDiscussion}>
            Publicar
          </Button>
        </div>
      </Drawer>
    </div>
  )
}

export default function DiscussionsPage() {
  return (
    <ToastProvider>
      <div className="h-full bg-white">
        <DiscussionsContent />
      </div>
    </ToastProvider>
  )
}
