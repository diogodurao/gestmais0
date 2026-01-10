"use client"

import { createContext, useContext, useId, type ReactNode, type HTMLAttributes } from "react"
import { cn } from "@/lib/utils"

// ============================================================================
// CONTEXT
// ============================================================================

interface FormFieldContextValue {
  required?: boolean
  error?: string
  fieldId: string
}

const FormFieldContext = createContext<FormFieldContextValue | null>(null)

function useFormFieldContext() {
  const context = useContext(FormFieldContext)
  if (!context) {
    throw new Error("FormField sub-components must be used within FormField")
  }
  return context
}

// ============================================================================
// FORM FIELD (Root Component)
// ============================================================================

interface FormFieldProps {
  required?: boolean
  error?: string
  children: ReactNode
  className?: string
}

export function FormField({ required, error, children, className }: FormFieldProps) {
  // ✅ Modern React 19 pattern - useId() generates stable IDs across SSR/client
  const fieldId = useId()

  return (
    <FormFieldContext.Provider value={{ required, error, fieldId }}>
      <div className={cn("space-y-1", className)}>
        {children}
      </div>
    </FormFieldContext.Provider>
  )
}

// ============================================================================
// FORM LABEL
// ============================================================================

interface FormLabelProps extends HTMLAttributes<HTMLLabelElement> {
  children: ReactNode
}

export function FormLabel({ children, className, ...props }: FormLabelProps) {
  const { required, fieldId } = useFormFieldContext()

  return (
    <label
      htmlFor={fieldId}
      className={cn(
        "text-label font-medium leading-tight text-gray-700",
        className
      )}
      {...props}
    >
      {children}
      {required && <span className="ml-0.5 text-error">*</span>}
    </label>
  )
}

// ============================================================================
// FORM CONTROL
// ============================================================================

interface FormControlProps {
  children: (props: { id: string; "aria-invalid"?: boolean; "aria-describedby"?: string }) => ReactNode
}

export function FormControl({ children }: FormControlProps) {
  const { error, fieldId } = useFormFieldContext()
  const errorId = error ? `${fieldId}-error` : undefined

  return (
    <>
      {children({
        id: fieldId,
        "aria-invalid": !!error,
        "aria-describedby": errorId,
      })}
    </>
  )
}

// ============================================================================
// FORM ERROR
// ============================================================================

interface FormErrorProps {
  className?: string
}

export function FormError({ className }: FormErrorProps) {
  const { error, fieldId } = useFormFieldContext()

  if (!error) return null

  return (
    <p
      id={`${fieldId}-error`}
      className={cn("text-label font-medium leading-tight text-error", className)}
      role="alert"
    >
      {error}
    </p>
  )
}

// ============================================================================
// FORM DESCRIPTION (Optional helper)
// ============================================================================

interface FormDescriptionProps {
  children: ReactNode
  className?: string
}

export function FormDescription({ children, className }: FormDescriptionProps) {
  const { fieldId } = useFormFieldContext()

  return (
    <p
      id={`${fieldId}-description`}
      className={cn("text-label leading-normal text-gray-500", className)}
    >
      {children}
    </p>
  )
}
