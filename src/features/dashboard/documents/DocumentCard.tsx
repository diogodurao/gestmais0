"use client"

import { useState } from "react"
import { Download, Trash2, Eye, History, MoreVertical } from "lucide-react"
import { Card } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Document } from "@/lib/types"
import { DOCUMENT_CATEGORY_CONFIG as CATEGORY_CONFIG } from "@/lib/constants"
import { formatFileSize, getFileIcon, canPreview } from "@/lib/utils"
import { getDocumentDownloadUrl, deleteDocument } from "@/app/actions/documents"
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
    const { toast } = useToast()
    const [menuOpen, setMenuOpen] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)

    const handleDownload = async () => {
        const url = await getDocumentDownloadUrl(document.id)
        if (url) {
            window.open(url, '_blank')
        }
    }

    const handleDelete = async () => {
        if (!confirm("Eliminar este documento e todas as versões?")) return

        setIsDeleting(true)
        const result = await deleteDocument(document.id)

        if (result.success) {
            toast({ title: "Sucesso", description: "Documento eliminado" })
        } else {
            toast({ title: "Erro", description: result.error, variant: "destructive" })
        }
        setIsDeleting(false)
        setMenuOpen(false)
    }

    const showPreview = canPreview(document.fileType)

    return (
        <Card className="p-4 hover:shadow-md transition-shadow">
            <div className="flex items-start gap-3">
                {/* Icon */}
                <span className="text-2xl">{getFileIcon(document.fileType)}</span>

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
                                    <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 py-1 min-w-[160px]">
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
                                            onClick={handleDelete}
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
    )
}