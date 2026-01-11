"use client"

import { useState } from "react"
import { Star } from "lucide-react"
import { cn } from "@/lib/utils"

interface Props {
    value: number
    onChange?: (value: number) => void
    readonly?: boolean
    size?: "sm" | "md" | "lg"
}

const SIZE_CLASSES = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
}

export function StarRating({ value, onChange, readonly = false, size = "md" }: Props) {
    const [hovered, setHovered] = useState(0)

    const displayValue = hovered || value

    return (
        <div
            className={cn("flex gap-1", !readonly && "cursor-pointer")}
            onMouseLeave={() => setHovered(0)}
        >
            {[1, 2, 3, 4, 5].map((star) => (
                <button
                    key={star}
                    type="button"
                    disabled={readonly}
                    onClick={() => onChange?.(star)}
                    onMouseEnter={() => !readonly && setHovered(star)}
                    className={cn(
                        "transition-colors",
                        readonly && "cursor-default"
                    )}
                >
                    <Star
                        className={cn(
                            SIZE_CLASSES[size],
                            star <= displayValue
                                ? "fill-warning text-warning"
                                : "fill-none text-gray-300"
                        )}
                    />
                </button>
            ))}
        </div>
    )
}