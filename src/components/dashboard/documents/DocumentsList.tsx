"use client"

import { useState } from "react"
import { Plus, FileText, Download, FolderOpen, ChevronLeft, Clock } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { Card, CardContent } from "@/components/ui/Card"
import { StatCard } from "@/components/ui/Stat-Card"
import { EmptyState } from "@/components/ui/Empty-State"
import { DocumentCard } from "./DocumentCard"
import { DocumentUploadModal } from "./DocumentUploadModal"
import { DocumentPreviewModal } from "./DocumentPreviewModal"
import { DocumentVersions } from "./DocumentVersions"
import { Document, DocumentCategory } from "@/lib/types"
import { DOCUMENT_CATEGORY_CONFIG } from "@/lib/constants/ui"

interface Props {
    buildingId: string
    documents: Document[]
    isManager: boolean
}

function CategoryCard({
    category,
    count,
    onClick,
}: {
    category: DocumentCategory
    count: number
    onClick: () => void
}) {
    const config = DOCUMENT_CATEGORY_CONFIG[category]

    return (
        <button
            onClick={onClick}
            className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 bg-white hover:bg-gray-100 hover:border-gray-300 transition-colors w-full text-left"
        >
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-600">{config.label}</p>
                <p className="text-xs text-secondary">{count} {count === 1 ? 'documento' : 'documentos'}</p>
            </div>
            <FolderOpen className="h-5 w-5 text-gray-300" />
        </button>
    )
}

export function DocumentsList({ buildingId, documents, isManager }: Props) {
    const [selectedCategory, setSelectedCategory] = useState<DocumentCategory | null>(null)
    const [uploadModalOpen, setUploadModalOpen] = useState(false)
    const [previewDocument, setPreviewDocument] = useState<Document | null>(null)
    const [versionHistoryDocument, setVersionHistoryDocument] = useState<Document | null>(null)
    const [newVersionDocument, setNewVersionDocument] = useState<Document | null>(null)

    // Stats
    const totalDocuments = documents.length
    const now = new Date()
    const thisMonth = documents.filter(d => {
        const uploadDate = new Date(d.uploadedAt)
        return uploadDate.getMonth() === now.getMonth() && uploadDate.getFullYear() === now.getFullYear()
    }).length
    const categories = Object.keys(DOCUMENT_CATEGORY_CONFIG) as DocumentCategory[]
    const categoriesWithDocs = categories.filter(cat => documents.some(d => d.category === cat)).length

    // Count documents per category
    const categoryCounts = categories.reduce((acc, cat) => {
        acc[cat] = documents.filter(d => d.category === cat).length
        return acc
    }, {} as Record<DocumentCategory, number>)

    // Filter documents by selected category
    const filteredDocuments = selectedCategory
        ? documents.filter(d => d.category === selectedCategory)
        : []

    return (
        <>
            {/* Header */}
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-lg font-semibold text-gray-800">Documentos</h1>
                    <p className="text-sm text-secondary">Repositório de documentos do condomínio</p>
                </div>
                {isManager && (
                    <Button size="sm" onClick={() => setUploadModalOpen(true)}>
                        <Plus className="w-4 h-4 mr-1" />
                        Carregar Documento
                    </Button>
                )}
            </div>

            {/* Stats */}
            <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
                <StatCard
                    label="Total Documentos"
                    value={totalDocuments}
                    icon={<FileText className="h-4 w-4" />}
                />
                <StatCard
                    label="Categorias"
                    value={categoriesWithDocs}
                    icon={<FolderOpen className="h-4 w-4" />}
                />
                <StatCard
                    label="Este Mês"
                    value={thisMonth}
                    change={thisMonth > 0 ? { value: "novos", positive: true } : undefined}
                    icon={<Clock className="h-4 w-4" />}
                />
                <StatCard
                    label="Última Atualização"
                    value={documents.length > 0 ? formatRelativeDate(documents[0].uploadedAt) : "-"}
                    icon={<Download className="h-4 w-4" />}
                />
            </div>

            {/* Main Content */}
            {selectedCategory === null ? (
                // Category Cards View
                <Card>
                    <CardContent className="p-4">
                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                            {categories.map((category) => (
                                <CategoryCard
                                    key={category}
                                    category={category}
                                    count={categoryCounts[category]}
                                    onClick={() => setSelectedCategory(category)}
                                />
                            ))}
                        </div>
                    </CardContent>
                </Card>
            ) : (
                // Documents List View
                <>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedCategory(null)}
                        className="mb-3"
                    >
                        <ChevronLeft className="h-4 w-4 mr-1" />
                        Voltar às categorias
                    </Button>

                    <Card>
                        <CardContent className="p-4">
                            <div className="mb-4 pb-3 border-b border-gray-200">
                                <h2 className="text-base font-semibold text-gray-800">
                                    {DOCUMENT_CATEGORY_CONFIG[selectedCategory].label}
                                </h2>
                                <p className="text-xs text-secondary">
                                    {filteredDocuments.length} {filteredDocuments.length === 1 ? 'documento' : 'documentos'}
                                </p>
                            </div>

                            {filteredDocuments.length === 0 ? (
                                <EmptyState
                                    title="Sem documentos"
                                    description="Não há documentos nesta categoria."
                                    action={isManager ? (
                                        <Button size="sm" onClick={() => setUploadModalOpen(true)}>
                                            <Plus className="h-4 w-4 mr-1" />
                                            Carregar Documento
                                        </Button>
                                    ) : undefined}
                                />
                            ) : (
                                <div className="space-y-2">
                                    {filteredDocuments.map(doc => (
                                        <DocumentCard
                                            key={doc.id}
                                            document={doc}
                                            isManager={isManager}
                                            onPreview={setPreviewDocument}
                                            onVersionHistory={setVersionHistoryDocument}
                                            onNewVersion={setNewVersionDocument}
                                        />
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </>
            )}

            {/* Upload Modal */}
            {isManager && (
                <DocumentUploadModal
                    isOpen={uploadModalOpen}
                    onClose={() => setUploadModalOpen(false)}
                    buildingId={buildingId}
                />
            )}

            {/* New Version Modal */}
            {isManager && newVersionDocument && (
                <DocumentUploadModal
                    isOpen={!!newVersionDocument}
                    onClose={() => setNewVersionDocument(null)}
                    buildingId={buildingId}
                    originalId={newVersionDocument.originalId || newVersionDocument.id}
                />
            )}

            {/* Preview Modal */}
            <DocumentPreviewModal
                document={previewDocument}
                onClose={() => setPreviewDocument(null)}
            />

            {/* Version History */}
            <DocumentVersions
                document={versionHistoryDocument}
                onClose={() => setVersionHistoryDocument(null)}
            />
        </>
    )
}

function formatRelativeDate(date: Date): string {
    const now = new Date()
    const diffMs = now.getTime() - new Date(date).getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return "Hoje"
    if (diffDays === 1) return "Ontem"
    if (diffDays < 7) return `Há ${diffDays} dias`
    if (diffDays < 30) return `Há ${Math.floor(diffDays / 7)} sem.`
    return `Há ${Math.floor(diffDays / 30)} mês`
}