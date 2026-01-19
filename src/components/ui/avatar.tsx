import { forwardRef, type HTMLAttributes } from "react"
import Image from "next/image"
import { cn } from "@/lib/utils"

type AvatarSize = "sm" | "md" | "lg"
type AvatarStatus = "online" | "offline" | "busy" | "away"

interface AvatarProps extends HTMLAttributes<HTMLDivElement> {
  src?: string
  alt?: string
  fallback?: string
  size?: AvatarSize
  status?: AvatarStatus
}

const sizeStyles: Record<AvatarSize, string> = {
  sm: "h-6 w-6 text-[9px]",
  md: "h-8 w-8 text-[10px]",
  lg: "h-10 w-10 text-[12px]",
}

const statusColors: Record<AvatarStatus, string> = {
  online: "bg-[#8FB996]",
  offline: "bg-[#ADB5BD]",
  busy: "bg-[#B86B73]",
  away: "bg-[#B8963E]",
}

const statusSizes: Record<AvatarSize, string> = {
  sm: "w-1.5 h-1.5 border",
  md: "w-2 h-2 border-2",
  lg: "w-2.5 h-2.5 border-2",
}

export const Avatar = forwardRef<HTMLDivElement, AvatarProps>(
  ({ className, src, alt, fallback, size = "md", status, ...props }, ref) => {
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
          <Image
            src={src}
            alt={alt || ""}
            fill
            sizes={size === "sm" ? "24px" : size === "md" ? "32px" : "40px"}
            className="object-cover"
            unoptimized
          />
        ) : (
          <span className="font-medium text-primary-dark">{initials}</span>
        )}
        {status && (
          <span
            className={cn(
              "absolute bottom-0 right-0 rounded-full border-white",
              statusColors[status],
              statusSizes[size]
            )}
          />
        )}
      </div>
    )
  }
)

Avatar.displayName = "Avatar"

// Avatar Group (stacked avatars)
interface AvatarGroupProps extends HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  max?: number
  size?: AvatarSize
}

export const AvatarGroup = forwardRef<HTMLDivElement, AvatarGroupProps>(
  ({ className, children, max, size = "md", ...props }, ref) => {
    const childrenArray = Array.isArray(children) ? children : [children]
    const visibleAvatars = max ? childrenArray.slice(0, max) : childrenArray
    const remainingCount = max ? childrenArray.length - max : 0

    return (
      <div
        ref={ref}
        className={cn("flex -space-x-2", className)}
        {...props}
      >
        {visibleAvatars}
        {remainingCount > 0 && (
          <div
            className={cn(
              "flex items-center justify-center rounded-full bg-gray text-gray font-medium ring-2 ring-white",
              sizeStyles[size]
            )}
          >
            +{remainingCount}
          </div>
        )}
      </div>
    )
  }
)

AvatarGroup.displayName = "AvatarGroup"

// Avatar with name
interface AvatarWithNameProps extends AvatarProps {
  name: string
  description?: string
}

export const AvatarWithName = forwardRef<HTMLDivElement, AvatarWithNameProps>(
  ({ className, name, description, size = "md", ...avatarProps }, ref) => {
    const textSizes = {
      sm: { name: "text-[10px]", description: "text-[9px]" },
      md: { name: "text-[11px]", description: "text-[10px]" },
      lg: { name: "text-[12px]", description: "text-[11px]" },
    }

    return (
      <div ref={ref} className={cn("flex items-center gap-1.5", className)}>
        <Avatar size={size} {...avatarProps} />
        <div className="min-w-0 flex-1">
          <p className={cn("font-medium text-gray truncate", textSizes[size].name)}>
            {name}
          </p>
          {description && (
            <p className={cn("text-[#8E9AAF] truncate", textSizes[size].description)}>
              {description}
            </p>
          )}
        </div>
      </div>
    )
  }
)

AvatarWithName.displayName = "AvatarWithName"
