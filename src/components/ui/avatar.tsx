import { forwardRef, useMemo, type HTMLAttributes } from "react"
import { cn } from "@/lib/utils"

type AvatarSize = "sm" | "md"

interface AvatarProps extends HTMLAttributes<HTMLDivElement> {
  src?: string
  alt?: string
  fallback?: string
  size?: AvatarSize
}

const sizeStyles: Record<AvatarSize, string> = {
  sm: "h-6 w-6 text-label",
  md: "h-8 w-8 text-label",
}

export const Avatar = forwardRef<HTMLDivElement, AvatarProps>(
  ({ className, src, alt, fallback, size = "md", ...props }, ref) => {
    // useMemo is valuable here - string manipulation on every render
    const initials = useMemo(
      () => fallback || alt?.charAt(0)?.toUpperCase() || "?",
      [fallback, alt]
    )

    return (
      <div
        ref={ref}
        className={cn(
          "relative flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary-light",
          sizeStyles[size],
          className
        )}
        {...props}
      >
        {src ? (
          <img src={src} alt={alt} className="h-full w-full object-cover" />
        ) : (
          <span className="font-medium text-primary-dark">{initials}</span>
        )}
      </div>
    )
  }
)

Avatar.displayName = "Avatar"
