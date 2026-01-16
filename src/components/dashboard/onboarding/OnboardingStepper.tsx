"use client"

import { type ReactNode } from "react"
import { Check, ChevronRight, type LucideIcon } from "lucide-react"
import { Card, CardContent } from "@/components/ui/Card"
import { cn } from "@/lib/utils"

export type OnboardingStep = {
  number: number
  title: string
  icon?: LucideIcon
  isComplete: boolean
}

interface OnboardingStepperProps {
  /** Label shown above the main title */
  label: string
  /** Main heading */
  title: string
  /** Optional description below the title */
  description?: string
  /** Step definitions */
  steps: OnboardingStep[]
  /** Currently active step number */
  currentStep: number
  /** Called when user clicks a reachable step */
  onStepChange: (step: number) => void
  /** Main content area */
  children: ReactNode
  /** Optional footer content (buttons, status) */
  footer?: ReactNode
  /** Optional header extra content (e.g., escape link) */
  headerExtra?: ReactNode
}

export function OnboardingStepper({
  label,
  title,
  description,
  steps,
  currentStep,
  onStepChange,
  children,
  footer,
  headerExtra,
}: OnboardingStepperProps) {
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-label font-mono text-gray-400 uppercase tracking-widest mb-2">
            {label}
          </div>
          <h1 className="text-[18px] font-semibold text-gray-800 uppercase tracking-wide">
            {title}
          </h1>
          {description && (
            <p className="text-body text-gray-500 mt-2 max-w-md mx-auto">
              {description}
            </p>
          )}
          {headerExtra}
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-2 mb-8 flex-wrap">
          {steps.map((step, idx) => {
            const Icon = step.icon
            const isReachable =
              step.number <= currentStep || (idx > 0 && steps[idx - 1].isComplete)
            const isActive = currentStep === step.number

            return (
              <div key={step.number} className="flex items-center">
                <button
                  onClick={() => isReachable && onStepChange(step.number)}
                  disabled={!isReachable}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 text-label font-semibold uppercase transition-colors rounded-md",
                    isActive
                      ? "bg-primary text-white"
                      : step.isComplete
                        ? "bg-success-light text-primary-dark border border-success"
                        : "bg-white text-gray-500 border border-gray-200",
                    !isReachable
                      ? "opacity-40 cursor-not-allowed"
                      : "hover:opacity-90"
                  )}
                >
                  {step.isComplete ? (
                    <Check className="w-4 h-4" />
                  ) : Icon ? (
                    <Icon className="w-4 h-4" />
                  ) : (
                    <span
                      className={cn(
                        "w-4 h-4 flex items-center justify-center text-micro font-bold border rounded-full",
                        isActive ? "border-white" : "border-current"
                      )}
                    >
                      {step.number}
                    </span>
                  )}
                  <span className="hidden sm:inline">{step.title}</span>
                </button>
                {idx < steps.length - 1 && (
                  <ChevronRight className="w-4 h-4 text-gray-300 mx-1" />
                )}
              </div>
            )
          })}
        </div>

        {/* Step Content */}
        <Card className="mb-6">
          <CardContent className="p-6">{children}</CardContent>
        </Card>

        {/* Footer */}
        {footer}
      </div>
    </div>
  )
}

/** Status summary component for the footer */
interface OnboardingStatusProps {
  items: { label: string; value: string | number }[]
}

export function OnboardingStatus({ items }: OnboardingStatusProps) {
  return (
    <div className="mt-8 text-center">
      <div className="inline-flex items-center gap-4 text-label text-gray-400 uppercase">
        {items.map((item, idx) => (
          <span key={item.label}>
            {idx > 0 && <span className="mr-4">•</span>}
            {item.value} {item.label}
          </span>
        ))}
      </div>
    </div>
  )
}