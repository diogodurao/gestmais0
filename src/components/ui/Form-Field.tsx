"use client"

import { createContext, useContext, useId, type ReactNode } from "react"
import { cn } from "@/lib/utils"
import { Label } from "./Label"

// Context for compound component pattern
interface FormFieldContextValue {
  id: string
  required?: boolean
  error?: string
  errorId: string
}

const FormFieldContext = createContext<FormFieldContextValue | null>(null)

function useFormField() {
  const context = useContext(FormFieldContext)
  if (!context) {
    throw new Error("FormField compound components must be used within a FormField")
  }
  return context
}

// Main FormField component
interface FormFieldProps {
  required?: boolean
  error?: string
  children: ReactNode
  className?: string
}

export function FormField({ required, error, children, className }: FormFieldProps) {
  const id = useId()
  const errorId = `${id}-error`

  return (
    <FormFieldContext.Provider value={{ id, required, error, errorId }}>
      <div className={cn("space-y-1", className)}>
        {children}
      </div>
    </FormFieldContext.Provider>
  )
}

// FormLabel component
interface FormLabelProps {
  children: ReactNode
  className?: string
}

export function FormLabel({ children, className }: FormLabelProps) {
  const { id, required } = useFormField()

  return (
    <Label htmlFor={id} required={required} className={className}>
      {children}
    </Label>
  )
}

// FormControl component - uses render prop pattern
interface FormControlProps {
  children: (props: {
    id: string
    "aria-describedby"?: string
    "aria-invalid"?: boolean
  }) => ReactNode
}

export function FormControl({ children }: FormControlProps) {
  const { id, error, errorId } = useFormField()

  return children({
    id,
    "aria-describedby": error ? errorId : undefined,
    "aria-invalid": error ? true : undefined,
  })
}

// FormDescription component
interface FormDescriptionProps {
  children: ReactNode
  className?: string
}

export function FormDescription({ children, className }: FormDescriptionProps) {
  return (
    <p className={cn("text-[11px] text-gray-500", className)}>
      {children}
    </p>
  )
}

// FormError component
interface FormErrorProps {
  className?: string
}

export function FormError({ className }: FormErrorProps) {
  const { error, errorId } = useFormField()

  if (!error) return null

  return (
    <p id={errorId} className={cn("text-[11px] text-red-600", className)}>
      {error}
    </p>
  )
}