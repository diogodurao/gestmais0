"use client"

import { useState, useEffect } from "react"
import { Download } from "lucide-react"
import { Modal } from "@/components/ui/Modal"
import { Button } from "@/components/ui/Button"
import { Document } from "@/lib/types"
import { formatFileSize } from "@/lib/utils"
import { getDocumentVersions, getDocumentDownloadUrl } from "@/lib/actions/documents"
import { formatDistanceToNow } from "@/lib/format"
import { Skeleton } from "@/components/ui/Skeleton"

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
                    <div className="space-y-2 p-1">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="flex justify-between items-center p-3 border border-gray-100 rounded-lg">
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-24" />
                                    <Skeleton className="h-3 w-48" />
                                </div>
                                <Skeleton className="h-8 w-8 rounded-full" />
                            </div>
                        ))}
                    </div>
                ) : versions.length === 0 ? (
                    <p className="text-body text-gray-500 text-center py-4">Sem versões anteriores</p>
                ) : (
                    versions.map((version, index) => (
                        <div
                            key={version.id}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                        >
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="text-body font-medium text-gray-700">
                                        Versão {version.version}
                                    </span>
                                    {index === 0 && (
                                        <span className="text-label px-2 py-0.5 bg-info-light text-info rounded">
                                            Atual
                                        </span>
                                    )}
                                </div>
                                <p className="text-label text-gray-500">
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