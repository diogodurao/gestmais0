"use client"

import { useState, useRef } from "react"
import { Camera, X, Upload } from "lucide-react"
import { cn } from "@/lib/utils"

interface SelectedPhoto {
    file: File
    preview: string
}

interface Props {
    photos: SelectedPhoto[]
    onChange: (photos: SelectedPhoto[]) => void
    maxPhotos?: number
    disabled?: boolean
}

export function PhotoUpload({ photos, onChange, maxPhotos = 3, disabled }: Props) {
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleFiles = (files: FileList | null) => {
        if (!files || disabled) return

        const newPhotos: SelectedPhoto[] = []
        const remaining = maxPhotos - photos.length

        for (let i = 0; i < Math.min(files.length, remaining); i++) {
            const file = files[i]
            if (file.type.startsWith('image/')) {
                newPhotos.push({
                    file,
                    preview: URL.createObjectURL(file),
                })
            }
        }

        onChange([...photos, ...newPhotos])
    }

    const removePhoto = (index: number) => {
        const photo = photos[index]
        URL.revokeObjectURL(photo.preview) // Cleanup
        onChange(photos.filter((_, i) => i !== index))
    }

    const canAddMore = photos.length < maxPhotos && !disabled

    return (
        <div className="space-y-2">
            <label className="block text-body font-bold text-slate-500 uppercase">
                Fotos (máx. {maxPhotos})
            </label>

            <div className="flex flex-wrap gap-2">
                {/* Existing photos */}
                {photos.map((photo, index) => (
                    <div key={index} className="relative w-20 h-20">
                        <img
                            src={photo.preview}
                            alt={`Foto ${index + 1}`}
                            className="w-full h-full object-cover rounded-lg"
                        />
                        {!disabled && (
                            <button
                                type="button"
                                onClick={() => removePhoto(index)}
                                className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                            >
                                <X className="w-3 h-3" />
                            </button>
                        )}
                    </div>
                ))}

                {/* Add button */}
                {canAddMore && (
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className={cn(
                            "w-20 h-20 border-2 border-dashed border-slate-300 rounded-lg",
                            "flex flex-col items-center justify-center gap-1",
                            "text-slate-400 hover:border-slate-400 hover:text-slate-500 transition-colors"
                        )}
                    >
                        <Camera className="w-5 h-5" />
                        <span className="text-micro">Adicionar</span>
                    </button>
                )}
            </div>

            <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                onChange={(e) => handleFiles(e.target.files)}
                className="hidden"
            />

            <p className="text-label text-slate-400">
                JPG, PNG ou WebP (máx. 5 MB cada)
            </p>
        </div>
    )
}