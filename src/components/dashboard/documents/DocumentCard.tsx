"use client"

import { useState } from "react"
import { Download, Trash2, Eye, History, MoreVertical } from "lucide-react"
import { Card } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { ConfirmModal } from "@/components/ui/ConfirmModal"
import { Document } from "@/lib/types"
import { DOCUMENT_CATEGORY_CONFIG as CATEGORY_CONFIG } from "@/lib/constants/ui"
import { formatFileSize, canPreview } from "@/lib/utils"
import { getDocumentDownloadUrl, deleteDocument } from "@/lib/actions/documents"
import { useToast } from "@/components/ui/Toast"
import { formatDistanceToNow } from "@/lib/format"

interface Props {
    document: Document
    isManager: boolean
    onPreview: (doc: Document) => void
    onVersionHistory: (doc: Document) => void
    onNewVersion: (doc: Document) => void
}

export function DocumentCard({
    document,
    isManager,
    onPreview,
    onVersionHistory,
    onNewVersion,
}: Props) {
    const { addToast } = useToast()
    const [menuOpen, setMenuOpen] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

    const handleDownload = async () => {
        const url = await getDocumentDownloadUrl(document.id)
        if (url) {
            window.open(url, '_blank')
        }
    }

    const handleDeleteClick = () => {
        setMenuOpen(false)
        setShowDeleteConfirm(true)
    }

    const confirmDelete = async () => {
        setIsDeleting(true)
        const result = await deleteDocument(document.id)

        if (result.success) {
            addToast({ title: "Sucesso", description: "Documento eliminado", variant: "success" })
        } else {
            addToast({ title: "Erro", description: result.error, variant: "error" })
        }
        setIsDeleting(false)
        setShowDeleteConfirm(false)
    }

    const showPreview = canPreview(document.fileType)

    return (
        <>
            <Card className="p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-3">
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                        <h3 className="text-body font-bold text-gray-900 truncate">
                            {document.title}
                        </h3>
                        <p className="text-label text-gray-500">
                            {CATEGORY_CONFIG[document.category].label}
                        </p>
                        <div className="flex items-center gap-2 mt-1 text-label text-gray-400">
                            <span>{formatFileSize(document.fileSize)}</span>
                            <span>•</span>
                            <span>v{document.version}</span>
                            <span>•</span>
                            <span>{formatDistanceToNow(document.uploadedAt)}</span>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1">
                        {showPreview && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onPreview(document)}
                                title="Pré-visualizar"
                            >
                                <Eye className="w-4 h-4" />
                            </Button>
                        )}
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleDownload}
                            title="Descarregar"
                        >
                            <Download className="w-4 h-4" />
                        </Button>

                        {document.version > 1 && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onVersionHistory(document)}
                                title="Histórico de versões"
                            >
                                <History className="w-4 h-4" />
                            </Button>
                        )}

                        {isManager && (
                            <div className="relative">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setMenuOpen(!menuOpen)}
                                >
                                    <MoreVertical className="w-4 h-4" />
                                </Button>

                                {menuOpen && (
                                    <>
                                        <div
                                            className="fixed inset-0 z-40"
                                            onClick={() => setMenuOpen(false)}
                                        />
                                        <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 py-1 min-w-40">
                                            <button
                                                onClick={() => {
                                                    onNewVersion(document)
                                                    setMenuOpen(false)
                                                }}
                                                className="flex items-center gap-2 px-3 py-2 text-body hover:bg-gray-50 w-full text-left"
                                            >
                                                <History className="w-4 h-4" />
                                                Nova versão
                                            </button>
                                            <button
                                                onClick={handleDeleteClick}
                                                disabled={isDeleting}
                                                className="flex items-center gap-2 px-3 py-2 text-body text-error hover:bg-gray-50 w-full text-left"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                                Eliminar
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {document.description && (
                    <p className="text-label text-gray-500 mt-2 line-clamp-2">
                        {document.description}
                    </p>
                )}
            </Card>

            {/* Delete Confirmation Modal */}
            <ConfirmModal
                isOpen={showDeleteConfirm}
                title="Eliminar documento"
                message="Tem a certeza que deseja eliminar este documento e todas as versões?"
                variant="danger"
                confirmText="Eliminar"
                onConfirm={confirmDelete}
                onCancel={() => setShowDeleteConfirm(false)}
                loading={isDeleting}
            />
        </>
    )
}