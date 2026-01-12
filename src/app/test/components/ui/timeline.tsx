import { forwardRef, type HTMLAttributes } from "react"
import { cn } from "@/lib/utils"
import { Avatar } from "./avatar"

interface TimelineItemData {
  id: number | string
  title: string
  description?: string
  time: string
  icon?: React.ReactNode
  iconBg?: string
  author?: {
    name: string
    avatar?: string
  }
  isManager?: boolean
}

interface TimelineProps extends HTMLAttributes<HTMLDivElement> {
  items: TimelineItemData[]
  variant?: "default" | "compact"
}

export const Timeline = forwardRef<HTMLDivElement, TimelineProps>(
  ({ className, items, variant = "default", ...props }, ref) => {
    return (
      <div ref={ref} className={cn("relative", className)} {...props}>
        {/* Vertical Line */}
        <div className="absolute left-3 top-0 bottom-0 w-px bg-[#E9ECEF]" />

        <div className={cn("space-y-1.5", variant === "compact" && "space-y-1")}>
          {items.map((item, idx) => (
            <TimelineItem key={item.id} item={item} variant={variant} isLast={idx === items.length - 1} />
          ))}
        </div>
      </div>
    )
  }
)

Timeline.displayName = "Timeline"

// Timeline Item
interface TimelineItemProps extends HTMLAttributes<HTMLDivElement> {
  item: TimelineItemData
  variant?: "default" | "compact"
  isLast?: boolean
}

export const TimelineItem = forwardRef<HTMLDivElement, TimelineItemProps>(
  ({ className, item, variant = "default", isLast, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("relative flex gap-2 pl-6", className)}
        {...props}
      >
        {/* Icon/Dot */}
        <div
          className={cn(
            "absolute left-0 w-6 h-6 flex items-center justify-center rounded-full border-2 border-white z-10",
            item.iconBg || "bg-[#F8F9FA]"
          )}
        >
          {item.icon ? (
            <span className="text-[#6C757D]">{item.icon}</span>
          ) : (
            <span className="w-2 h-2 rounded-full bg-[#8FB996]" />
          )}
        </div>

        {/* Content */}
        <div className={cn(
          "flex-1 rounded-lg bg-[#F8F9FA] border border-[#E9ECEF] p-1.5",
          variant === "compact" && "p-1"
        )}>
          {/* Header */}
          <div className="flex items-center justify-between mb-0.5">
            <div className="flex items-center gap-1">
              {item.author && (
                <>
                  <Avatar size="sm" fallback={item.author.name.charAt(0)} alt={item.author.name} />
                  <span className="text-[10px] font-medium text-[#495057]">
                    {item.author.name}
                  </span>
                  {item.isManager && (
                    <span className="px-1 py-0.5 rounded text-[8px] font-medium bg-[#E8F0EA] text-[#6A9B72]">
                      Admin
                    </span>
                  )}
                </>
              )}
            </div>
            <span className="text-[9px] text-[#ADB5BD]">{item.time}</span>
          </div>

          {/* Content */}
          <h4 className="text-[10px] font-medium text-[#495057]">{item.title}</h4>
          {item.description && (
            <p className="text-[9px] text-[#6C757D] mt-0.5">{item.description}</p>
          )}
        </div>
      </div>
    )
  }
)

TimelineItem.displayName = "TimelineItem"

// Activity Item (simpler version for activity feeds)
interface ActivityItemProps extends HTMLAttributes<HTMLDivElement> {
  icon: React.ReactNode
  iconBg?: string
  title: string
  time: string
}

export const ActivityItem = forwardRef<HTMLDivElement, ActivityItemProps>(
  ({ className, icon, iconBg, title, time, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("flex items-start gap-1.5", className)}
        {...props}
      >
        <div
          className={cn(
            "w-6 h-6 rounded-full flex items-center justify-center shrink-0",
            iconBg || "bg-[#F1F3F5]"
          )}
        >
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] text-[#495057]">{title}</p>
          <p className="text-[9px] text-[#ADB5BD]">{time}</p>
        </div>
      </div>
    )
  }
)

ActivityItem.displayName = "ActivityItem"
