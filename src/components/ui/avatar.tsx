import { forwardRef, type HTMLAttributes } from "react"
import { cn } from "@/lib/utils"

type AvatarSize = "sm" | "md"

interface AvatarProps extends HTMLAttributes<HTMLDivElement> {
  src?: string
  alt?: string
  fallback?: string
  size?: AvatarSize
}

const sizeStyles: Record<AvatarSize, string> = {
  sm: "h-6 w-6 text-[9px]",
  md: "h-8 w-8 text-[10px]",
}

export const Avatar = forwardRef<HTMLDivElement, AvatarProps>(
  ({ className, src, alt, fallback, size = "md", ...props }, ref) => {
    const initials = fallback || alt?.charAt(0)?.toUpperCase() || "?"

    return (
      <div
        ref={ref}
        className={cn(
          "relative flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#E8F0EA]",
          sizeStyles[size],
          className
        )}
        {...props}
      >
        {src ? (
          <img src={src} alt={alt} className="h-full w-full object-cover" />
        ) : (
          <span className="font-medium text-[#6A9B72]">{initials}</span>
        )}
      </div>
    )
  }
)

Avatar.displayName = "Avatar"