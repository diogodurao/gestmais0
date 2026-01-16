"use client"

import { useState } from "react"
import { Button } from "../components/ui/Button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "../components/ui/Card"
import { Badge } from "../components/ui/Badge"
import { Avatar } from "../components/ui/Avatar"
import { Progress } from "../components/ui/Progress"
import { StatCard } from "../components/ui/Stat-Card"
import { Select } from "../components/ui/Select"
import { Textarea } from "../components/ui/Textarea"
import { FormField } from "../components/ui/Form-Field"
import { Divider } from "../components/ui/Divider"
import { ToastProvider, useToast } from "../components/ui/Toast"
import { cn } from "@/lib/utils"
import {
  Star, TrendingUp, TrendingDown, Users, Calendar,
  CheckCircle, Clock, BarChart3, MessageSquare,
  ChevronLeft, ChevronRight,
} from "lucide-react"

// Types
interface MonthlyEvaluation {
  month: number
  year: number
  averageRating: number
  totalResponses: number
  totalEligible: number
  categories: {
    cleaning: number
    maintenance: number
    communication: number
    security: number
    overall: number
  }
  comments: {
    id: number
    rating: number
    comment: string
    author: string
    date: string
  }[]
}

// Mock data
const MONTHS_PT = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
]

const mockEvaluations: MonthlyEvaluation[] = [
  {
    month: 1,
    year: 2025,
    averageRating: 4.2,
    totalResponses: 10,
    totalEligible: 15,
    categories: {
      cleaning: 4.5,
      maintenance: 3.8,
      communication: 4.3,
      security: 4.6,
      overall: 4.2,
    },
    comments: [
      { id: 1, rating: 5, comment: "Excelente trabalho de limpeza este mês!", author: "Maria S.", date: "2025-01-28" },
      { id: 2, rating: 4, comment: "Boa comunicação geral, mas podiam responder mais rápido aos emails.", author: "João S.", date: "2025-01-27" },
      { id: 3, rating: 3, comment: "A manutenção do elevador demorou muito.", author: "Ana C.", date: "2025-01-25" },
    ],
  },
  {
    month: 12,
    year: 2024,
    averageRating: 4.0,
    totalResponses: 12,
    totalEligible: 15,
    categories: {
      cleaning: 4.2,
      maintenance: 3.5,
      communication: 4.0,
      security: 4.5,
      overall: 4.0,
    },
    comments: [],
  },
  {
    month: 11,
    year: 2024,
    averageRating: 3.8,
    totalResponses: 11,
    totalEligible: 15,
    categories: {
      cleaning: 4.0,
      maintenance: 3.2,
      communication: 3.9,
      security: 4.3,
      overall: 3.8,
    },
    comments: [],
  },
]

const CATEGORY_LABELS = {
  cleaning: "Limpeza",
  maintenance: "Manutenção",
  communication: "Comunicação",
  security: "Segurança",
  overall: "Geral",
}

// Star Rating Component
function StarRating({
  value,
  onChange,
  size = "md",
  readonly = false,
}: {
  value: number
  onChange?: (value: number) => void
  size?: "sm" | "md" | "lg"
  readonly?: boolean
}) {
  const [hover, setHover] = useState(0)

  const sizeClasses = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-6 w-6",
  }

  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          onClick={() => onChange?.(star)}
          onMouseEnter={() => !readonly && setHover(star)}
          onMouseLeave={() => setHover(0)}
          className={cn(
            "transition-colors",
            !readonly && "cursor-pointer hover:scale-110"
          )}
        >
          <Star
            className={cn(
              sizeClasses[size],
              (hover || value) >= star
                ? "fill-[#B8963E] text-[#B8963E]"
                : "text-[#DEE2E6]"
            )}
          />
        </button>
      ))}
    </div>
  )
}

// Rating Display Component
function RatingDisplay({ rating, label }: { rating: number; label: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[10px] text-[#8E9AAF]">{label}</span>
      <div className="flex items-center gap-1">
        <StarRating value={Math.round(rating)} size="sm" readonly />
        <span className="text-[10px] font-medium text-[#495057] w-6 text-right">{rating.toFixed(1)}</span>
      </div>
    </div>
  )
}

// Evaluation Form Component
function EvaluationForm({
  onSubmit,
}: {
  onSubmit: (ratings: Record<string, number>, comment: string) => void
}) {
  const [ratings, setRatings] = useState({
    cleaning: 0,
    maintenance: 0,
    communication: 0,
    security: 0,
    overall: 0,
  })
  const [comment, setComment] = useState("")

  const isComplete = Object.values(ratings).every(r => r > 0)

  const handleSubmit = () => {
    if (isComplete) {
      onSubmit(ratings, comment)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Avaliação de Janeiro 2025</CardTitle>
        <CardDescription>Avalie a gestão do condomínio este mês</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-1.5">
          {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
            <div key={key} className="flex items-center justify-between py-1">
              <span className="text-[11px] text-[#495057]">{label}</span>
              <StarRating
                value={ratings[key as keyof typeof ratings]}
                onChange={(value) => setRatings(prev => ({ ...prev, [key]: value }))}
              />
            </div>
          ))}

          <Divider className="my-1.5" />

          <FormField label="Comentário (opcional)">
            <Textarea
              placeholder="Partilhe a sua opinião ou sugestões..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
          </FormField>
        </div>
      </CardContent>
      <CardFooter>
        <Button
          className="w-full"
          disabled={!isComplete}
          onClick={handleSubmit}
        >
          <CheckCircle className="h-3 w-3 mr-1" />
          Submeter Avaliação
        </Button>
      </CardFooter>
    </Card>
  )
}

// Monthly Summary Card
function MonthlySummary({ evaluation }: { evaluation: MonthlyEvaluation }) {
  const participationRate = Math.round((evaluation.totalResponses / evaluation.totalEligible) * 100)
  const prevMonth = mockEvaluations[1]
  const ratingChange = prevMonth ? evaluation.averageRating - prevMonth.averageRating : 0

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{MONTHS_PT[evaluation.month - 1]} {evaluation.year}</CardTitle>
          <Badge variant={evaluation.averageRating >= 4 ? "success" : evaluation.averageRating >= 3 ? "warning" : "error"}>
            {evaluation.averageRating.toFixed(1)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {/* Overall Rating */}
        <div className="text-center mb-1.5">
          <StarRating value={Math.round(evaluation.averageRating)} size="lg" readonly />
          <p className="text-[14px] font-semibold text-[#343A40] mt-0.5">{evaluation.averageRating.toFixed(1)}</p>
          <p className="text-[10px] text-[#8E9AAF]">
            Média de {evaluation.totalResponses} avaliações
            {ratingChange !== 0 && (
              <span className={cn(
                "ml-1",
                ratingChange > 0 ? "text-[#6A9B72]" : "text-[#B86B73]"
              )}>
                ({ratingChange > 0 ? "+" : ""}{ratingChange.toFixed(1)})
              </span>
            )}
          </p>
        </div>

        {/* Participation */}
        <div className="mb-1.5">
          <div className="flex items-center justify-between mb-0.5">
            <span className="text-[10px] text-[#8E9AAF]">Participação</span>
            <span className="text-[10px] font-medium text-[#495057]">{participationRate}%</span>
          </div>
          <Progress value={participationRate} size="sm" />
          <p className="text-[9px] text-[#ADB5BD] mt-0.5">
            {evaluation.totalResponses} de {evaluation.totalEligible} condóminos
          </p>
        </div>

        <Divider className="my-1.5" />

        {/* Category Ratings */}
        <div className="space-y-1">
          {Object.entries(evaluation.categories).map(([key, value]) => (
            <RatingDisplay
              key={key}
              label={CATEGORY_LABELS[key as keyof typeof CATEGORY_LABELS]}
              rating={value}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

// Comments List
function CommentsList({ comments }: { comments: MonthlyEvaluation["comments"] }) {
  if (comments.length === 0) {
    return (
      <Card>
        <CardContent className="py-6 text-center">
          <MessageSquare className="h-8 w-8 text-[#DEE2E6] mx-auto mb-1.5" />
          <p className="text-[11px] font-medium text-[#8E9AAF]">Sem comentários</p>
          <p className="text-[10px] text-[#ADB5BD]">Não há comentários para este mês</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Comentários ({comments.length})</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-[#F1F3F5]">
          {comments.map((comment) => (
            <div key={comment.id} className="p-1.5">
              <div className="flex items-center justify-between mb-0.5">
                <div className="flex items-center gap-1">
                  <Avatar size="sm" fallback={comment.author.charAt(0)} alt={comment.author} />
                  <span className="text-[10px] font-medium text-[#495057]">{comment.author}</span>
                </div>
                <div className="flex items-center gap-1">
                  <StarRating value={comment.rating} size="sm" readonly />
                  <span className="text-[9px] text-[#ADB5BD]">{comment.date}</span>
                </div>
              </div>
              <p className="text-[10px] text-[#6C757D] ml-6">{comment.comment}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

// Trend Chart (simplified)
function TrendChart({ evaluations }: { evaluations: MonthlyEvaluation[] }) {
  const maxRating = 5
  const sortedEvals = [...evaluations].reverse()

  return (
    <Card>
      <CardHeader>
        <CardTitle>Evolução da Avaliação</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-end justify-between gap-1 h-24">
          {sortedEvals.map((eval_, idx) => {
            const height = (eval_.averageRating / maxRating) * 100
            return (
              <div key={idx} className="flex-1 flex flex-col items-center gap-0.5">
                <div className="w-full flex flex-col justify-end h-20">
                  <div
                    className={cn(
                      "w-full rounded-t transition-all",
                      eval_.averageRating >= 4 ? "bg-[#8FB996]" :
                        eval_.averageRating >= 3 ? "bg-[#B8963E]" : "bg-[#B86B73]"
                    )}
                    style={{ height: `${height}%` }}
                  />
                </div>
                <span className="text-[8px] text-[#8E9AAF]">
                  {MONTHS_PT[eval_.month - 1].slice(0, 3)}
                </span>
                <span className="text-[9px] font-medium text-[#495057]">
                  {eval_.averageRating.toFixed(1)}
                </span>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

// Main Content
function EvaluationsContent() {
  const { addToast } = useToast()
  const [evaluations, setEvaluations] = useState(mockEvaluations)
  const [selectedMonth, setSelectedMonth] = useState(0)
  const [hasSubmitted, setHasSubmitted] = useState(false)

  const currentEval = evaluations[selectedMonth]

  // Stats
  const avgRating = (evaluations.reduce((sum, e) => sum + e.averageRating, 0) / evaluations.length).toFixed(1)
  const avgParticipation = Math.round(
    evaluations.reduce((sum, e) => sum + (e.totalResponses / e.totalEligible) * 100, 0) / evaluations.length
  )
  const totalComments = evaluations.reduce((sum, e) => sum + e.comments.length, 0)

  // Navigation
  const goToPrevMonth = () => {
    if (selectedMonth < evaluations.length - 1) {
      setSelectedMonth(selectedMonth + 1)
    }
  }

  const goToNextMonth = () => {
    if (selectedMonth > 0) {
      setSelectedMonth(selectedMonth - 1)
    }
  }

  // Submit evaluation
  const handleSubmitEvaluation = (ratings: Record<string, number>, comment: string) => {
    setHasSubmitted(true)
    addToast({
      variant: "success",
      title: "Avaliação submetida",
      description: "Obrigado pelo seu feedback!",
    })
  }

  return (
    <div className="flex-1 overflow-y-auto p-1.5">
      {/* Header */}
      <div className="mb-1.5">
        <h1 className="text-[14px] font-semibold text-[#343A40]">Avaliação Mensal</h1>
        <p className="text-[10px] text-[#8E9AAF]">Avalie e acompanhe a qualidade da gestão do condomínio</p>
      </div>

      {/* Stats */}
      <div className="mb-1.5 grid grid-cols-2 gap-1.5 lg:grid-cols-4">
        <StatCard
          label="Média Geral"
          value={avgRating}
          change={{ value: "+0.2", positive: true }}
          icon={<Star className="h-4 w-4" />}
        />
        <StatCard
          label="Participação"
          value={`${avgParticipation}%`}
          icon={<Users className="h-4 w-4" />}
        />
        <StatCard
          label="Comentários"
          value={totalComments.toString()}
          icon={<MessageSquare className="h-4 w-4" />}
        />
        <StatCard
          label="Meses Avaliados"
          value={evaluations.length.toString()}
          icon={<Calendar className="h-4 w-4" />}
        />
      </div>

      <div className="grid gap-1.5 lg:grid-cols-3">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-1.5">
          {/* Evaluation Form or Submitted */}
          {!hasSubmitted ? (
            <EvaluationForm onSubmit={handleSubmitEvaluation} />
          ) : (
            <Card>
              <CardContent className="py-6 text-center">
                <CheckCircle className="h-10 w-10 text-[#8FB996] mx-auto mb-1.5" />
                <p className="text-[12px] font-medium text-[#495057]">Avaliação Submetida</p>
                <p className="text-[10px] text-[#8E9AAF]">Obrigado pelo seu feedback deste mês!</p>
              </CardContent>
            </Card>
          )}

          {/* Month Navigation */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={goToPrevMonth}
                  disabled={selectedMonth >= evaluations.length - 1}
                >
                  <ChevronLeft className="h-3 w-3" />
                </Button>
                <span className="text-[12px] font-medium text-[#495057]">
                  {MONTHS_PT[currentEval.month - 1]} {currentEval.year}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={goToNextMonth}
                  disabled={selectedMonth === 0}
                >
                  <ChevronRight className="h-3 w-3" />
                </Button>
              </div>
            </CardHeader>
          </Card>

          {/* Comments */}
          <CommentsList comments={currentEval.comments} />
        </div>

        {/* Right Column */}
        <div className="space-y-1.5">
          {/* Monthly Summary */}
          <MonthlySummary evaluation={currentEval} />

          {/* Trend Chart */}
          <TrendChart evaluations={evaluations} />
        </div>
      </div>
    </div>
  )
}

export default function EvaluationsPage() {
  return (
    <ToastProvider>
      <div className="h-full bg-white">
        <EvaluationsContent />
      </div>
    </ToastProvider>
  )
}
