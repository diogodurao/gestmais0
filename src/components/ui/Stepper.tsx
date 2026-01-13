import { forwardRef, type HTMLAttributes, type ReactNode } from "react"
import { cn } from "@/lib/utils"
import { Check, ChevronRight } from "lucide-react"

type StepperSize = "sm" | "md"
type StepperOrientation = "horizontal" | "vertical"
type StepStatus = "pending" | "current" | "completed"

// Stepper Container
interface StepperProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
}

export const Stepper = forwardRef<HTMLDivElement, StepperProps>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex items-center", className)}
      {...props}
    >
      {children}
    </div>
  )
)
Stepper.displayName = "Stepper"

// Stepper Item
interface StepperItemProps extends HTMLAttributes<HTMLDivElement> {
  step: number
  currentStep: number
  title: string
  icon: React.ElementType
  isCompleted?: boolean
  size?: StepperSize
  orientation?: StepperOrientation
  hideTitle?: boolean
}

const sizeStyles: Record<StepperSize, {
  circle: string
  icon: string
  checkIcon: string
  title: string
  gap: string
}> = {
  sm: {
    circle: "w-7 h-7",
    icon: "w-3.5 h-3.5",
    checkIcon: "w-3.5 h-3.5",
    title: "text-[10px]",
    gap: "gap-1.5",
  },
  md: {
    circle: "w-10 h-10",
    icon: "w-5 h-5",
    checkIcon: "w-5 h-5",
    title: "text-[9px]",
    gap: "gap-0.5",
  },
}

function getStepStatus(step: number, currentStep: number, isCompleted?: boolean): StepStatus {
  if (isCompleted || step < currentStep) return "completed"
  if (step === currentStep) return "current"
  return "pending"
}

export const StepperItem = forwardRef<HTMLDivElement, StepperItemProps>(
  ({
    className,
    step,
    currentStep,
    title,
    icon: Icon,
    isCompleted,
    size = "sm",
    orientation = "horizontal",
    hideTitle = false,
    ...props
  }, ref) => {
    const status = getStepStatus(step, currentStep, isCompleted)
    const styles = sizeStyles[size]

    return (
      <div
        ref={ref}
        className={cn(
          "flex items-center",
          orientation === "vertical" && "flex-col",
          styles.gap,
          className
        )}
        {...props}
      >
        {/* Circle */}
        <div
          className={cn(
            "rounded-full flex items-center justify-center transition-colors",
            styles.circle,
            status === "current" && "bg-[#8FB996] text-white",
            status === "completed" && "bg-[#E8F0EA] text-[#6A9B72]",
            status === "pending" && "bg-[#F1F3F5] text-[#ADB5BD]"
          )}
        >
          {status === "completed" ? (
            <Check className={styles.checkIcon} />
          ) : (
            <Icon className={styles.icon} />
          )}
        </div>

        {/* Title */}
        {!hideTitle && (
          <span
            className={cn(
              "font-medium",
              styles.title,
              orientation === "vertical" && "text-center",
              orientation === "horizontal" && "hidden sm:block",
              status === "current" && "text-[#495057]",
              status === "completed" && "text-[#6A9B72]",
              status === "pending" && "text-[#ADB5BD]"
            )}
          >
            {title}
          </span>
        )}
      </div>
    )
  }
)
StepperItem.displayName = "StepperItem"

// Stepper Connector (arrow or line between steps)
interface StepperConnectorProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "arrow" | "line"
  size?: StepperSize
}

export const StepperConnector = forwardRef<HTMLDivElement, StepperConnectorProps>(
  ({ className, variant = "arrow", size = "sm", ...props }, ref) => {
    if (variant === "arrow") {
      return (
        <ChevronRight
          className={cn(
            "text-[#DEE2E6] shrink-0",
            size === "sm" ? "w-3 h-3" : "w-4 h-4",
            className
          )}
        />
      )
    }

    return (
      <div
        ref={ref}
        className={cn(
          "h-px bg-[#E9ECEF]",
          size === "sm" ? "w-6" : "w-8",
          className
        )}
        {...props}
      />
    )
  }
)
StepperConnector.displayName = "StepperConnector"

// Progress Stepper (combines progress bar + step indicators)
interface ProgressStepperProps extends HTMLAttributes<HTMLDivElement> {
  currentStep: number
  totalSteps: number
  size?: "sm" | "md" | "lg"
}

export const ProgressStepper = forwardRef<HTMLDivElement, ProgressStepperProps>(
  ({ className, currentStep, totalSteps, size = "sm", ...props }, ref) => {
    const percentage = ((currentStep - 1) / totalSteps) * 100

    const heightStyles = {
      sm: "h-1",
      md: "h-1.5",
      lg: "h-2",
    }

    return (
      <div
        ref={ref}
        className={cn("w-full", className)}
        {...props}
      >
        <div
          className={cn(
            "w-full overflow-hidden rounded-full bg-[#E9ECEF]",
            heightStyles[size]
          )}
        >
          <div
            className="h-full rounded-full bg-[#8FB996] transition-all duration-300"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    )
  }
)
ProgressStepper.displayName = "ProgressStepper"
