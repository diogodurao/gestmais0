"use client"

import { useState } from "react"
import { Button } from "../components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "../components/ui/card"
import { Badge } from "../components/ui/badge"
import { IconButton } from "../components/ui/icon-button"
import { Input } from "../components/ui/input"
import { Modal } from "../components/ui/modal"
import { Drawer } from "../components/ui/drawer"
import { FormField } from "../components/ui/form-field"
import { Select } from "../components/ui/select"
import { Dropdown, DropdownItem, DropdownDivider } from "../components/ui/dropdown"
import { StatCard } from "../components/ui/stat-card"
import { EmptyState } from "../components/ui/empty-state"
import { ToastProvider, useToast } from "../components/ui/toast"
import { cn } from "@/lib/utils"
import {
  Plus, Search, Filter, FileText, Folder, Download,
  Eye, Trash2, MoreVertical, Upload, File, Clock,
  FolderOpen, Grid, List, ChevronRight, ExternalLink,
  Image, FileSpreadsheet, FilePlus,
} from "lucide-react"

// Types
type DocumentCategory = "regulations" | "minutes" | "contracts" | "financial" | "other"
type ViewMode = "grid" | "list"

interface Document {
  id: number
  name: string
  category: DocumentCategory
  fileType: "pdf" | "doc" | "xls" | "img" | "other"
  fileSize: string
  uploadedBy: string
  uploadedAt: string
  downloads: number
  version: number
  description?: string
}

// Mock data
const mockDocuments: Document[] = [
  {
    id: 1,
    name: "Regulamento Interno do Condomínio",
    category: "regulations",
    fileType: "pdf",
    fileSize: "2.4 MB",
    uploadedBy: "Administração",
    uploadedAt: "2025-01-05",
    downloads: 45,
    version: 3,
    description: "Regulamento interno atualizado com as alterações aprovadas na última assembleia.",
  },
  {
    id: 2,
    name: "Ata da Assembleia - Janeiro 2025",
    category: "minutes",
    fileType: "pdf",
    fileSize: "1.2 MB",
    uploadedBy: "Administração",
    uploadedAt: "2025-01-15",
    downloads: 23,
    version: 1,
  },
  {
    id: 3,
    name: "Contrato Empresa de Limpeza",
    category: "contracts",
    fileType: "pdf",
    fileSize: "856 KB",
    uploadedBy: "Administração",
    uploadedAt: "2024-12-10",
    downloads: 12,
    version: 1,
  },
  {
    id: 4,
    name: "Orçamento 2025",
    category: "financial",
    fileType: "xls",
    fileSize: "340 KB",
    uploadedBy: "Administração",
    uploadedAt: "2024-12-20",
    downloads: 38,
    version: 2,
  },
  {
    id: 5,
    name: "Relatório Financeiro Q4 2024",
    category: "financial",
    fileType: "pdf",
    fileSize: "1.8 MB",
    uploadedBy: "Administração",
    uploadedAt: "2025-01-10",
    downloads: 29,
    version: 1,
  },
  {
    id: 6,
    name: "Planta do Edifício",
    category: "other",
    fileType: "img",
    fileSize: "5.2 MB",
    uploadedBy: "Administração",
    uploadedAt: "2024-06-15",
    downloads: 18,
    version: 1,
  },
  {
    id: 7,
    name: "Ata da Assembleia - Dezembro 2024",
    category: "minutes",
    fileType: "pdf",
    fileSize: "980 KB",
    uploadedBy: "Administração",
    uploadedAt: "2024-12-18",
    downloads: 31,
    version: 1,
  },
  {
    id: 8,
    name: "Seguro do Condomínio 2025",
    category: "contracts",
    fileType: "pdf",
    fileSize: "2.1 MB",
    uploadedBy: "Administração",
    uploadedAt: "2025-01-02",
    downloads: 15,
    version: 1,
  },
]

// Utilities
function getCategoryConfig(category: DocumentCategory) {
  const config = {
    regulations: { label: "Regulamentos", icon: FileText, color: "text-[#6A9B72]", bg: "bg-[#E8F0EA]" },
    minutes: { label: "Atas", icon: File, color: "text-[#6C757D]", bg: "bg-[#F1F3F5]" },
    contracts: { label: "Contratos", icon: FileText, color: "text-[#B8963E]", bg: "bg-[#FBF6EC]" },
    financial: { label: "Financeiro", icon: FileSpreadsheet, color: "text-[#8E9AAF]", bg: "bg-[#E9ECF0]" },
    other: { label: "Outros", icon: Folder, color: "text-[#ADB5BD]", bg: "bg-[#F8F9FA]" },
  }
  return config[category]
}

function getFileIcon(fileType: Document["fileType"]) {
  const icons = {
    pdf: FileText,
    doc: FileText,
    xls: FileSpreadsheet,
    img: Image,
    other: File,
  }
  return icons[fileType]
}

function formatDate(dateStr: string) {
  const date = new Date(dateStr)
  return date.toLocaleDateString("pt-PT", { day: "numeric", month: "short", year: "numeric" })
}

// Document Grid Card
function DocumentGridCard({
  document,
  onView,
  onDownload,
  onDelete,
}: {
  document: Document
  onView: () => void
  onDownload: () => void
  onDelete: () => void
}) {
  const categoryConfig = getCategoryConfig(document.category)
  const FileIcon = getFileIcon(document.fileType)

  return (
    <Card className="group hover:border-[#DEE2E6] transition-colors">
      <CardContent className="p-1.5">
        <div className="flex items-start justify-between gap-1.5 mb-1.5">
          <div className={cn(
            "flex h-10 w-10 items-center justify-center rounded",
            categoryConfig.bg
          )}>
            <FileIcon className={cn("h-5 w-5", categoryConfig.color)} />
          </div>
          <Dropdown
            trigger={
              <IconButton
                size="sm"
                variant="ghost"
                icon={<MoreVertical className="h-3 w-3" />}
                label="Opções"
                className="opacity-0 group-hover:opacity-100 transition-opacity"
              />
            }
            align="right"
          >
            <DropdownItem onClick={onView}>
              <Eye className="mr-1.5 h-3 w-3" /> Ver
            </DropdownItem>
            <DropdownItem onClick={onDownload}>
              <Download className="mr-1.5 h-3 w-3" /> Download
            </DropdownItem>
            <DropdownDivider />
            <DropdownItem onClick={onDelete} destructive>
              <Trash2 className="mr-1.5 h-3 w-3" /> Eliminar
            </DropdownItem>
          </Dropdown>
        </div>

        <h3 className="text-[11px] font-medium text-[#495057] line-clamp-2 mb-1">
          {document.name}
        </h3>

        <div className="flex items-center gap-1.5 flex-wrap">
          <Badge variant="default">{categoryConfig.label}</Badge>
          {document.version > 1 && (
            <Badge variant="info">v{document.version}</Badge>
          )}
        </div>

        <div className="flex items-center justify-between mt-1.5 pt-1.5 border-t border-[#F1F3F5] text-[9px] text-[#8E9AAF]">
          <span>{document.fileSize}</span>
          <span className="flex items-center gap-0.5">
            <Download className="h-3 w-3" />
            {document.downloads}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}

// Document List Item
function DocumentListItem({
  document,
  onView,
  onDownload,
  onDelete,
}: {
  document: Document
  onView: () => void
  onDownload: () => void
  onDelete: () => void
}) {
  const categoryConfig = getCategoryConfig(document.category)
  const FileIcon = getFileIcon(document.fileType)

  return (
    <div className="flex items-center gap-1.5 p-1.5 rounded-lg border border-[#E9ECEF] bg-white hover:bg-[#F8F9FA] hover:border-[#DEE2E6] transition-colors group">
      <div className={cn(
        "flex h-8 w-8 items-center justify-center rounded shrink-0",
        categoryConfig.bg
      )}>
        <FileIcon className={cn("h-4 w-4", categoryConfig.color)} />
      </div>

      <div className="flex-1 min-w-0">
        <h3 className="text-[11px] font-medium text-[#495057] truncate">{document.name}</h3>
        <div className="flex items-center gap-2 text-[9px] text-[#8E9AAF]">
          <span>{categoryConfig.label}</span>
          <span>•</span>
          <span>{document.fileSize}</span>
          <span>•</span>
          <span>{formatDate(document.uploadedAt)}</span>
          {document.version > 1 && (
            <>
              <span>•</span>
              <span>v{document.version}</span>
            </>
          )}
        </div>
      </div>

      <div className="flex items-center gap-0.5 shrink-0">
        <IconButton
          size="sm"
          variant="ghost"
          icon={<Eye className="h-3 w-3" />}
          label="Ver"
          onClick={onView}
          className="opacity-0 group-hover:opacity-100 transition-opacity"
        />
        <IconButton
          size="sm"
          variant="ghost"
          icon={<Download className="h-3 w-3" />}
          label="Download"
          onClick={onDownload}
        />
        <Dropdown
          trigger={
            <IconButton
              size="sm"
              variant="ghost"
              icon={<MoreVertical className="h-3 w-3" />}
              label="Opções"
              className="opacity-0 group-hover:opacity-100 transition-opacity"
            />
          }
          align="right"
        >
          <DropdownItem onClick={onDelete} destructive>
            <Trash2 className="mr-1.5 h-3 w-3" /> Eliminar
          </DropdownItem>
        </Dropdown>
      </div>
    </div>
  )
}

// Category Folder Card
function CategoryFolder({
  category,
  count,
  onClick,
}: {
  category: DocumentCategory
  count: number
  onClick: () => void
}) {
  const config = getCategoryConfig(category)
  const Icon = config.icon

  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 p-1.5 rounded-lg border border-[#E9ECEF] bg-white hover:bg-[#F8F9FA] hover:border-[#DEE2E6] transition-colors w-full text-left"
    >
      <div className={cn("flex h-8 w-8 items-center justify-center rounded", config.bg)}>
        <FolderOpen className={cn("h-4 w-4", config.color)} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-medium text-[#495057]">{config.label}</p>
        <p className="text-[9px] text-[#8E9AAF]">{count} documentos</p>
      </div>
      <ChevronRight className="h-4 w-4 text-[#DEE2E6]" />
    </button>
  )
}

// Main Content
function DocumentsContent() {
  const { addToast } = useToast()
  const [documents, setDocuments] = useState(mockDocuments)
  const [viewMode, setViewMode] = useState<ViewMode>("grid")
  const [searchTerm, setSearchTerm] = useState("")
  const [filterCategory, setFilterCategory] = useState<DocumentCategory | "all">("all")
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [showMobileDrawer, setShowMobileDrawer] = useState(false)
  const [showPreviewModal, setShowPreviewModal] = useState(false)
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null)

  // Stats
  const totalDocuments = documents.length
  const totalDownloads = documents.reduce((sum, d) => sum + d.downloads, 0)
  const categoryCounts = {
    regulations: documents.filter(d => d.category === "regulations").length,
    minutes: documents.filter(d => d.category === "minutes").length,
    contracts: documents.filter(d => d.category === "contracts").length,
    financial: documents.filter(d => d.category === "financial").length,
    other: documents.filter(d => d.category === "other").length,
  }

  // Filter documents
  const filteredDocuments = documents.filter((d) => {
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      if (!d.name.toLowerCase().includes(term)) {
        return false
      }
    }
    if (filterCategory !== "all" && d.category !== filterCategory) {
      return false
    }
    return true
  })

  // Handlers
  const handleUpload = () => {
    if (window.innerWidth < 640) {
      setShowMobileDrawer(true)
    } else {
      setShowUploadModal(true)
    }
  }

  const handleView = (document: Document) => {
    setSelectedDocument(document)
    setShowPreviewModal(true)
  }

  const handleDownload = (document: Document) => {
    setDocuments(prev => prev.map(d =>
      d.id === document.id ? { ...d, downloads: d.downloads + 1 } : d
    ))
    addToast({
      variant: "success",
      title: "Download iniciado",
      description: `A transferir "${document.name}"...`,
    })
  }

  const handleDelete = (document: Document) => {
    setDocuments(prev => prev.filter(d => d.id !== document.id))
    addToast({
      variant: "success",
      title: "Documento eliminado",
      description: `"${document.name}" foi removido.`,
    })
  }

  const handleSaveUpload = () => {
    setShowUploadModal(false)
    setShowMobileDrawer(false)
    addToast({
      variant: "success",
      title: "Documento carregado",
      description: "O documento foi adicionado com sucesso.",
    })
  }

  // Upload Form
  const UploadForm = () => (
    <div className="space-y-1.5">
      <FormField label="Ficheiro" required>
        <div className="border-2 border-dashed border-[#DEE2E6] rounded-lg p-6 text-center cursor-pointer hover:border-[#8FB996] transition-colors">
          <Upload className="h-8 w-8 text-[#ADB5BD] mx-auto mb-1.5" />
          <p className="text-[11px] font-medium text-[#495057]">Clique ou arraste ficheiros</p>
          <p className="text-[10px] text-[#8E9AAF]">PDF, DOC, XLS, PNG, JPG até 10MB</p>
        </div>
      </FormField>
      <FormField label="Nome do Documento" required>
        <Input placeholder="Nome do documento" />
      </FormField>
      <FormField label="Categoria" required>
        <Select>
          <option value="regulations">Regulamentos</option>
          <option value="minutes">Atas</option>
          <option value="contracts">Contratos</option>
          <option value="financial">Financeiro</option>
          <option value="other">Outros</option>
        </Select>
      </FormField>
      <FormField label="Descrição">
        <Input placeholder="Descrição breve (opcional)" />
      </FormField>
    </div>
  )

  return (
    <div className="flex-1 overflow-y-auto p-1.5">
      {/* Header */}
      <div className="mb-1.5 flex flex-col gap-1.5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-[14px] font-semibold text-[#343A40]">Documentos</h1>
          <p className="text-[10px] text-[#8E9AAF]">Repositório de documentos do condomínio</p>
        </div>
        <Button size="sm" onClick={handleUpload}>
          <Plus className="h-3 w-3" />
          <span className="hidden sm:inline ml-1">Carregar Documento</span>
        </Button>
      </div>

      {/* Stats */}
      <div className="mb-1.5 grid grid-cols-2 gap-1.5 lg:grid-cols-4">
        <StatCard
          label="Total Documentos"
          value={totalDocuments.toString()}
          icon={<FileText className="h-4 w-4" />}
        />
        <StatCard
          label="Downloads"
          value={totalDownloads.toString()}
          icon={<Download className="h-4 w-4" />}
        />
        <StatCard
          label="Categorias"
          value="5"
          icon={<Folder className="h-4 w-4" />}
        />
        <StatCard
          label="Este Mês"
          value={documents.filter(d => new Date(d.uploadedAt) > new Date("2025-01-01")).length.toString()}
          change={{ value: "novos", positive: true }}
          icon={<FilePlus className="h-4 w-4" />}
        />
      </div>

      {/* Category Folders */}
      {filterCategory === "all" && !searchTerm && (
        <div className="mb-1.5 grid grid-cols-2 gap-1.5 sm:grid-cols-3 lg:grid-cols-5">
          {(Object.keys(categoryCounts) as DocumentCategory[]).map((category) => (
            <CategoryFolder
              key={category}
              category={category}
              count={categoryCounts[category]}
              onClick={() => setFilterCategory(category)}
            />
          ))}
        </div>
      )}

      {/* Toolbar */}
      <Card className="mb-1.5">
        <CardContent className="flex flex-wrap items-center gap-1.5">
          <div className="relative flex-1 min-w-[150px]">
            <Search className="absolute left-1.5 top-1/2 -translate-y-1/2 h-3 w-3 text-[#8E9AAF]" />
            <Input
              type="text"
              placeholder="Pesquisar documentos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-6"
            />
          </div>
          <Select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value as DocumentCategory | "all")}
            className="w-auto"
          >
            <option value="all">Todas as categorias</option>
            <option value="regulations">Regulamentos</option>
            <option value="minutes">Atas</option>
            <option value="contracts">Contratos</option>
            <option value="financial">Financeiro</option>
            <option value="other">Outros</option>
          </Select>
          <div className="flex border border-[#E9ECEF] rounded overflow-hidden">
            <IconButton
              size="sm"
              variant={viewMode === "grid" ? "primary" : "ghost"}
              icon={<Grid className="h-3 w-3" />}
              label="Vista em grelha"
              onClick={() => setViewMode("grid")}
              className="rounded-none"
            />
            <IconButton
              size="sm"
              variant={viewMode === "list" ? "primary" : "ghost"}
              icon={<List className="h-3 w-3" />}
              label="Vista em lista"
              onClick={() => setViewMode("list")}
              className="rounded-none"
            />
          </div>
        </CardContent>
      </Card>

      {/* Back button when filtering */}
      {filterCategory !== "all" && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setFilterCategory("all")}
          className="mb-1.5"
        >
          <ChevronRight className="h-3 w-3 rotate-180 mr-1" />
          Voltar às categorias
        </Button>
      )}

      {/* Documents */}
      {filteredDocuments.length === 0 ? (
        <Card>
          <EmptyState
            title="Sem documentos"
            description={searchTerm || filterCategory !== "all"
              ? "Nenhum documento corresponde aos filtros."
              : "Não há documentos carregados."
            }
            action={
              <Button size="sm" onClick={handleUpload}>
                <Plus className="h-3 w-3 mr-1" />
                Carregar Documento
              </Button>
            }
          />
        </Card>
      ) : viewMode === "grid" ? (
        <div className="grid gap-1.5 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
          {filteredDocuments.map((doc) => (
            <DocumentGridCard
              key={doc.id}
              document={doc}
              onView={() => handleView(doc)}
              onDownload={() => handleDownload(doc)}
              onDelete={() => handleDelete(doc)}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-1">
          {filteredDocuments.map((doc) => (
            <DocumentListItem
              key={doc.id}
              document={doc}
              onView={() => handleView(doc)}
              onDownload={() => handleDownload(doc)}
              onDelete={() => handleDelete(doc)}
            />
          ))}
        </div>
      )}

      {/* Upload Modal */}
      <Modal
        open={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        title="Carregar Documento"
        description="Adicione um novo documento ao repositório."
        footer={
          <div className="flex justify-end gap-1.5">
            <Button variant="outline" onClick={() => setShowUploadModal(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveUpload}>
              <Upload className="h-3 w-3 mr-1" />
              Carregar
            </Button>
          </div>
        }
      >
        <UploadForm />
      </Modal>

      {/* Mobile Drawer */}
      <Drawer
        open={showMobileDrawer}
        onClose={() => setShowMobileDrawer(false)}
        title="Carregar Documento"
        description="Adicione um novo documento ao repositório."
      >
        <UploadForm />
        <div className="mt-4 flex gap-1.5">
          <Button variant="outline" className="flex-1" onClick={() => setShowMobileDrawer(false)}>
            Cancelar
          </Button>
          <Button className="flex-1" onClick={handleSaveUpload}>
            <Upload className="h-3 w-3 mr-1" />
            Carregar
          </Button>
        </div>
      </Drawer>

      {/* Preview Modal */}
      <Modal
        open={showPreviewModal}
        onClose={() => { setShowPreviewModal(false); setSelectedDocument(null) }}
        title={selectedDocument?.name || ""}
        description={selectedDocument ? `${getCategoryConfig(selectedDocument.category).label} • ${selectedDocument.fileSize}` : ""}
        footer={
          <div className="flex justify-between w-full">
            <Button variant="outline" onClick={() => setShowPreviewModal(false)}>
              Fechar
            </Button>
            <Button onClick={() => selectedDocument && handleDownload(selectedDocument)}>
              <Download className="h-3 w-3 mr-1" />
              Download
            </Button>
          </div>
        }
      >
        {selectedDocument && (
          <div className="space-y-1.5">
            <div className="aspect-[4/3] bg-[#F8F9FA] rounded-lg flex items-center justify-center border border-[#E9ECEF]">
              <FileText className="h-16 w-16 text-[#DEE2E6]" />
            </div>
            {selectedDocument.description && (
              <p className="text-[10px] text-[#6C757D]">{selectedDocument.description}</p>
            )}
            <div className="grid grid-cols-2 gap-1.5 text-[10px]">
              <div>
                <span className="text-[#8E9AAF]">Carregado por:</span>
                <span className="text-[#495057] ml-1">{selectedDocument.uploadedBy}</span>
              </div>
              <div>
                <span className="text-[#8E9AAF]">Data:</span>
                <span className="text-[#495057] ml-1">{formatDate(selectedDocument.uploadedAt)}</span>
              </div>
              <div>
                <span className="text-[#8E9AAF]">Downloads:</span>
                <span className="text-[#495057] ml-1">{selectedDocument.downloads}</span>
              </div>
              <div>
                <span className="text-[#8E9AAF]">Versão:</span>
                <span className="text-[#495057] ml-1">{selectedDocument.version}</span>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default function DocumentsPage() {
  return (
    <ToastProvider>
      <div className="h-full bg-white">
        <DocumentsContent />
      </div>
    </ToastProvider>
  )
}
