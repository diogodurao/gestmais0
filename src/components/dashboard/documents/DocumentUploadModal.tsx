"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Upload, X, File } from "lucide-react"
import { Modal } from "@/components/ui/Modal"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Textarea } from "@/components/ui/Textarea"
import { Select } from "@/components/ui/Select"
import { FormField, FormLabel, FormControl, FormError } from "@/components/ui/Form-Field"
import { DocumentCategory } from "@/lib/types"
import { DOCUMENT_CATEGORY_OPTIONS as CATEGORY_OPTIONS } from "@/lib/constants"
import { formatFileSize } from "@/lib/utils"
import { useToast } from "@/components/ui/Toast"
import { cn } from "@/lib/utils"

interface Props {
    isOpen: boolean
    onClose: () => void
    buildingId: string
    originalId?: number // For uploading new version
}

interface SelectedFile {
    file: File
    title: string
}

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10 MB

export function DocumentUploadModal({ isOpen, onClose, buildingId, originalId }: Props) {
    const router = useRouter()
    const { toast } = useToast()
    const fileInputRef = useRef<HTMLInputElement>(null)

    const [selectedFiles, setSelectedFiles] = useState<SelectedFile[]>([])
    const [category, setCategory] = useState<DocumentCategory>('outros')
    const [description, setDescription] = useState("")
    const [isUploading, setIsUploading] = useState(false)
    const [dragActive, setDragActive] = useState(false)

    const isNewVersion = !!originalId

    const handleFiles = (files: FileList | null) => {
        if (!files) return

        const newFiles: SelectedFile[] = []
        for (let i = 0; i < files.length; i++) {
            const file = files[i]
            if (file.size > MAX_FILE_SIZE) {
                toast({
                    title: "Erro",
                    description: `${file.name} é muito grande (máx. 10 MB)`,
                    variant: "destructive",
                })
                continue
            }
            newFiles.push({
                file,
                title: file.name.replace(/\.[^/.]+$/, ""), // Remove extension for title
            })
        }

        if (isNewVersion) {
            // For new version, only allow single file
            setSelectedFiles(newFiles.slice(0, 1))
        } else {
            setSelectedFiles(prev => [...prev, ...newFiles])
        }
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        setDragActive(false)
        handleFiles(e.dataTransfer.files)
    }

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault()
        setDragActive(true)
    }

    const handleDragLeave = () => {
        setDragActive(false)
    }

    const removeFile = (index: number) => {
        setSelectedFiles(prev => prev.filter((_, i) => i !== index))
    }

    const updateFileTitle = (index: number, title: string) => {
        setSelectedFiles(prev =>
            prev.map((f, i) => i === index ? { ...f, title } : f)
        )
    }

    const handleClose = () => {
        setSelectedFiles([])
        setCategory('outros')
        setDescription("")
        onClose()
    }

    const handleSubmit = async () => {
        if (selectedFiles.length === 0) {
            toast({ title: "Erro", description: "Selecione ficheiros", variant: "destructive" })
            return
        }

        if (!isNewVersion && !category) {
            toast({ title: "Erro", description: "Selecione uma categoria", variant: "destructive" })
            return
        }

        setIsUploading(true)

        const formData = new FormData()
        formData.append('buildingId', buildingId)
        formData.append('category', category)
        formData.append('description', description)

        if (isNewVersion && originalId) {
            formData.append('originalId', originalId.toString())
        }

        selectedFiles.forEach((sf, index) => {
            formData.append('files', sf.file)
            formData.append(`title_${index}`, sf.title)
        })

        // For single file, use its title
        if (selectedFiles.length === 1) {
            formData.set('title', selectedFiles[0].title)
        }

        try {
            const response = await fetch('/api/documents/upload', {
                method: 'POST',
                body: formData,
            })

            let data
            const contentType = response.headers.get("content-type")
            if (contentType && contentType.indexOf("application/json") !== -1) {
                data = await response.json()
            } else {
                // If not JSON, probably an error page (500, 404, etc.)
                throw new Error(`Server returned ${response.status}: ${response.statusText}`)
            }

            if (!response.ok) {
                throw new Error(data.error || 'Erro ao carregar')
            }

            const successCount = data.results.filter((r: any) => r.success).length
            const failCount = data.results.filter((r: any) => !r.success).length

            if (successCount > 0) {
                toast({
                    title: "Sucesso",
                    description: `${successCount} documento(s) carregado(s)`,
                })
            }

            if (failCount > 0) {
                toast({
                    title: "Aviso",
                    description: `${failCount} documento(s) falharam`,
                    variant: "destructive",
                })
            }

            router.refresh()
            handleClose()
        } catch (error) {
            toast({
                title: "Erro",
                description: "Erro ao carregar documentos",
                variant: "destructive",
            })
        }

        setIsUploading(false)
    }

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title={isNewVersion ? "Nova Versão" : "Carregar Documentos"}
        >
            <div className="space-y-4">
                {/* Drop Zone */}
                <div
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onClick={() => fileInputRef.current?.click()}
                    className={cn(
                        "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
                        dragActive
                            ? "border-info bg-info-light"
                            : "border-gray-300 hover:border-gray-400"
                    )}
                >
                    <Upload className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                    <p className="text-body text-gray-600">
                        Arraste ficheiros ou clique para selecionar
                    </p>
                    <p className="text-label text-gray-400 mt-1">
                        PDF, Word, Excel, CSV, Imagens (máx. 10 MB)
                    </p>
                </div>

                <input
                    ref={fileInputRef}
                    type="file"
                    multiple={!isNewVersion}
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.jpg,.jpeg,.png,.txt"
                    onChange={(e) => handleFiles(e.target.files)}
                    className="hidden"
                />

                {/* Selected Files */}
                {selectedFiles.length > 0 && (
                    <div className="space-y-2">
                        {selectedFiles.map((sf, index) => (
                            <div key={index} className="flex items-center gap-2 bg-gray-50 p-2 rounded-lg">
                                <File className="w-5 h-5 text-gray-400 flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                    <FormField>
                                        <FormControl>
                                            {(props) => (
                                                <Input
                                                    {...props}
                                                    value={sf.title}
                                                    onChange={(e) => updateFileTitle(index, e.target.value)}
                                                    placeholder="Título do documento"
                                                    className="text-body"
                                                />
                                            )}
                                        </FormControl>
                                    </FormField>
                                    <p className="text-label text-gray-400 mt-1">
                                        {sf.file.name} • {formatFileSize(sf.file.size)}
                                    </p>
                                </div>
                                <button
                                    onClick={() => removeFile(index)}
                                    className="p-1 hover:bg-gray-200 rounded"
                                >
                                    <X className="w-4 h-4 text-gray-500" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {/* Category (not for new version) */}
                {!isNewVersion && (
                    <FormField required>
                        <FormLabel>Categoria</FormLabel>
                        <FormControl>
                            {(props) => (
                                <Select
                                    {...props}
                                    options={CATEGORY_OPTIONS}
                                    value={category}
                                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setCategory(e.target.value as DocumentCategory)}
                                    fullWidth
                                />
                            )}
                        </FormControl>
                        <FormError />
                    </FormField>
                )}

                {/* Description */}
                {!isNewVersion && (
                    <FormField>
                        <FormLabel>Descrição (opcional)</FormLabel>
                        <FormControl>
                            {(props) => (
                                <Textarea
                                    {...props}
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Adicione uma descrição..."
                                    rows={2}
                                />
                            )}
                        </FormControl>
                        <FormError />
                    </FormField>
                )}

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                    <Button variant="outline" onClick={handleClose} disabled={isUploading}>
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        isLoading={isUploading}
                        disabled={selectedFiles.length === 0}
                        className="flex-1"
                    >
                        {isNewVersion ? "Carregar Versão" : "Carregar"}
                    </Button>
                </div>
            </div>
        </Modal>
    )
}