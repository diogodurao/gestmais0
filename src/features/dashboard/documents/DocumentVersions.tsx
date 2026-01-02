"use client"

import { useState, useEffect } from "react"
import { Download } from "lucide-react"
import { Modal } from "@/components/ui/Modal"
import { Button } from "@/components/ui/Button"
import { Document } from "@/lib/types"
import { formatFileSize } from "@/lib/utils"
import { getDocumentVersions, getDocumentDownloadUrl } from "@/app/actions/documents"
import { formatDistanceToNow } from "@/lib/format"

interface Props {
    document: Document | null
    onClose: () => void
}

export function DocumentVersions({ document, onClose }: Props) {
    const [versions, setVersions] = useState<Document[]>([])
    const [isLoading, setIsLoading] = useState(false)

    useEffect(() => {
        if (document) {
            setIsLoading(true)
            getDocumentVersions(document.id).then(data => {
                setVersions(data)
                setIsLoading(false)
            })
        } else {
            setVersions([])
        }
    }, [document])

    const handleDownload = async (doc: Document) => {
        const url = await getDocumentDownloadUrl(doc.id)
        if (url) {
            window.open(url, '_blank')
        }
    }

    if (!document) return null

    return (
        <Modal
            isOpen={!!document}
            onClose={onClose}
            title={`Histórico de Versões — ${document.title}`}
        >
            <div className="space-y-2">
                {isLoading ? (
                    <p className="text-body text-slate-500 text-center py-4">A carregar...</p>
                ) : versions.length === 0 ? (
                    <p className="text-body text-slate-500 text-center py-4">Sem versões anteriores</p>
                ) : (
                    versions.map((version, index) => (
                        <div
                            key={version.id}
                            className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                        >
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="text-body font-medium text-slate-700">
                                        Versão {version.version}
                                    </span>
                                    {index === 0 && (
                                        <span className="text-label px-2 py-0.5 bg-blue-100 text-blue-700 rounded">
                                            Atual
                                        </span>
                                    )}
                                </div>
                                <p className="text-label text-slate-500">
                                    {version.uploaderName} • {formatDistanceToNow(version.uploadedAt)} • {formatFileSize(version.fileSize)}
                                </p>
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDownload(version)}
                            >
                                <Download className="w-4 h-4" />
                            </Button>
                        </div>
                    ))
                )}
            </div>
        </Modal>
    )
}