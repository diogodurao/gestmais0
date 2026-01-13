"use client"

import { useState, forwardRef, type HTMLAttributes } from "react"
import { cn } from "@/lib/utils"
import { Star } from "lucide-react"

interface StarRatingProps extends Omit<HTMLAttributes<HTMLDivElement>, "onChange"> {
  value: number
  onChange?: (value: number) => void
  max?: number
  size?: "sm" | "md" | "lg"
  readonly?: boolean
  showValue?: boolean
}

const sizeStyles = {
  sm: {
    star: "h-3 w-3",
    gap: "gap-0.5",
    text: "text-[9px]",
  },
  md: {
    star: "h-4 w-4",
    gap: "gap-0.5",
    text: "text-[10px]",
  },
  lg: {
    star: "h-6 w-6",
    gap: "gap-1",
    text: "text-[12px]",
  },
}

export const StarRating = forwardRef<HTMLDivElement, StarRatingProps>(
  ({
    className,
    value,
    onChange,
    max = 5,
    size = "md",
    readonly = false,
    showValue = false,
    ...props
  }, ref) => {
    const [hover, setHover] = useState(0)
    const sizes = sizeStyles[size]

    return (
      <div
        ref={ref}
        className={cn("flex items-center", sizes.gap, className)}
        {...props}
      >
        {Array.from({ length: max }, (_, i) => i + 1).map((star) => (
          <button
            key={star}
            type="button"
            disabled={readonly}
            onClick={() => onChange?.(star)}
            onMouseEnter={() => !readonly && setHover(star)}
            onMouseLeave={() => setHover(0)}
            className={cn(
              "transition-colors focus:outline-none",
              !readonly && "cursor-pointer hover:scale-110"
            )}
          >
            <Star
              className={cn(
                sizes.star,
                (hover || value) >= star
                  ? "fill-[#B8963E] text-[#B8963E]"
                  : "text-[#DEE2E6]"
              )}
            />
          </button>
        ))}
        {showValue && (
          <span className={cn("font-medium text-[#495057] ml-1", sizes.text)}>
            {value.toFixed(1)}
          </span>
        )}
      </div>
    )
  }
)

StarRating.displayName = "StarRating"

// Rating Display (label + stars)
interface RatingDisplayProps {
  label: string
  rating: number
  size?: "sm" | "md" | "lg"
  className?: string
}

export function RatingDisplay({
  label,
  rating,
  size = "sm",
  className,
}: RatingDisplayProps) {
  const sizes = sizeStyles[size]

  return (
    <div className={cn("flex items-center justify-between", className)}>
      <span className={cn("text-[#8E9AAF]", sizes.text)}>{label}</span>
      <div className="flex items-center gap-1">
        <StarRating value={Math.round(rating)} size={size} readonly />
        <span className={cn("font-medium text-[#495057] w-6 text-right", sizes.text)}>
          {rating.toFixed(1)}
        </span>
      </div>
    </div>
  )
}
