"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card"
import { Select } from "@/components/ui/Select"
import { DocumentCard } from "./DocumentCard"
import { DocumentUploadModal } from "./DocumentUploadModal"
import { DocumentPreviewModal } from "./DocumentPreviewModal"
import { DocumentVersions } from "./DocumentVersions"
import { Document, DocumentCategory } from "@/lib/types"
import { DOCUMENT_CATEGORY_CONFIG as CATEGORY_CONFIG, DOCUMENT_CATEGORY_OPTIONS as CATEGORY_OPTIONS } from "@/lib/constant/"

interface Props {
    buildingId: string
    documents: Document[]
    isManager: boolean
}

export function DocumentsList({ buildingId, documents, isManager }: Props) {
    const [categoryFilter, setCategoryFilter] = useState<DocumentCategory | 'all'>('all')
    const [uploadModalOpen, setUploadModalOpen] = useState(false)
    const [previewDocument, setPreviewDocument] = useState<Document | null>(null)
    const [versionHistoryDocument, setVersionHistoryDocument] = useState<Document | null>(null)
    const [newVersionDocument, setNewVersionDocument] = useState<Document | null>(null)

    const filteredDocuments = categoryFilter === 'all'
        ? documents
        : documents.filter(d => d.category === categoryFilter)

    // Group by category
    const groupedDocuments: Record<string, Document[]> = {}
    for (const doc of filteredDocuments) {
        if (!groupedDocuments[doc.category]) {
            groupedDocuments[doc.category] = []
        }
        groupedDocuments[doc.category].push(doc)
    }

    const filterOptions = [
        { value: 'all', label: 'Todas as categorias' },
        ...CATEGORY_OPTIONS,
    ]

    return (
        <>
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between w-full">
                        <CardTitle>Documentos</CardTitle>
                        {isManager && (
                            <Button size="sm" onClick={() => setUploadModalOpen(true)}>
                                <Plus className="w-4 h-4 mr-1" />
                                Carregar Documento
                            </Button>
                        )}
                    </div>
                </CardHeader>
                <CardContent>
                    {/* Filter */}
                    <div className="mb-4">
                        <Select
                            options={filterOptions}
                            value={categoryFilter}
                            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setCategoryFilter(e.target.value as DocumentCategory | 'all')}
                        />
                    </div>

                    {/* Documents */}
                    {filteredDocuments.length === 0 ? (
                        <p className="text-body text-gray-500 text-center py-8">
                            Nenhum documento encontrado.
                        </p>
                    ) : categoryFilter === 'all' ? (
                        // Grouped view
                        <div className="space-y-6">
                            {Object.entries(groupedDocuments).map(([category, docs]) => (
                                <div key={category}>
                                    <h3 className="text-body font-bold text-gray-700 mb-3 flex items-center gap-2">
                                        <span>{CATEGORY_CONFIG[category as DocumentCategory].icon}</span>
                                        {CATEGORY_CONFIG[category as DocumentCategory].label}
                                    </h3>
                                    <div className="space-y-2">
                                        {docs.map(doc => (
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
                                </div>
                            ))}
                        </div>
                    ) : (
                        // Flat view
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