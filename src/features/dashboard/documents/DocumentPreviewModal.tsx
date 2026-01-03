"use client"

import { useState, useEffect } from "react"
import { Download, X } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { Document } from "@/lib/types"
import { getDocumentDownloadUrl } from "@/app/actions/documents"
import { Skeleton } from "@/components/ui/Skeleton"

interface Props {
    document: Document | null
    onClose: () => void
}

export function DocumentPreviewModal({ document, onClose }: Props) {
    const [url, setUrl] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(false)

    useEffect(() => {
        if (document) {
            setIsLoading(true)
            getDocumentDownloadUrl(document.id).then(downloadUrl => {
                setUrl(downloadUrl)
                setIsLoading(false)
            })
        } else {
            setUrl(null)
        }
    }, [document])

    if (!document) return null

    const isPdf = document.fileType === 'application/pdf'
    const isImage = document.fileType.startsWith('image/')

    const handleDownload = () => {
        if (url) {
            window.open(url, '_blank')
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col m-4">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-slate-200">
                    <h2 className="text-h4 font-bold text-slate-900 truncate">
                        {document.title}
                    </h2>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={handleDownload}>
                            <Download className="w-4 h-4 mr-1" />
                            Descarregar
                        </Button>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-slate-100 rounded-lg"
                        >
                            <X className="w-5 h-5 text-slate-500" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-auto p-4 bg-slate-100">
                    {isLoading ? (
                        <div className="w-full h-full min-h-[600px] bg-white rounded-lg p-8">
                            <Skeleton className="w-full h-full rounded-lg" />
                        </div>
                    ) : url ? (
                        isPdf ? (
                            <iframe
                                src={`${url}#toolbar=0`}
                                className="w-full h-full min-h-[600px] rounded-lg"
                                title={document.title}
                            />
                        ) : isImage ? (
                            <img
                                src={url}
                                alt={document.title}
                                className="max-w-full max-h-full mx-auto rounded-lg"
                            />
                        ) : null
                    ) : (
                        <div className="flex items-center justify-center h-full">
                            <p className="text-body text-slate-500">Erro ao carregar documento</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}