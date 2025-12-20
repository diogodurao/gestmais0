"use client"

import { ReactNode, createContext, useContext, useId, forwardRef, HTMLAttributes } from "react"
import { cn } from "@/lib/utils"
import { AlertCircle } from "lucide-react"

// ===========================================
// CONTEXT
// ===========================================
type FormFieldContextValue = {
    id: string
    error?: string
    required?: boolean
}

const FormFieldContext = createContext<FormFieldContextValue | null>(null)

function useFormField() {
    const context = useContext(FormFieldContext)
    if (!context) {
        throw new Error("FormField components must be used within a FormField")
    }
    return context
}

// ===========================================
// FORM FIELD ROOT
// ===========================================
interface FormFieldProps extends HTMLAttributes<HTMLDivElement> {
    error?: string
    required?: boolean
}

const FormField = forwardRef<HTMLDivElement, FormFieldProps>(
    ({ className, children, error, required, ...props }, ref) => {
        const id = useId()

        return (
            <FormFieldContext.Provider value={{ id, error, required }}>
                <div
                    ref={ref}
                    className={cn("space-y-1.5", className)}
                    {...props}
                >
                    {children}
                </div>
            </FormFieldContext.Provider>
        )
    }
)
FormField.displayName = "FormField"

// ===========================================
// FORM LABEL
// ===========================================
interface FormLabelProps extends HTMLAttributes<HTMLLabelElement> {
    optional?: boolean
}

const FormLabel = forwardRef<HTMLLabelElement, FormLabelProps>(
    ({ className, children, optional, ...props }, ref) => {
        const { id, required, error } = useFormField()

        return (
            <label
                ref={ref}
                htmlFor={id}
                className={cn(
                    "block text-[10px] font-bold uppercase tracking-wider",
                    error ? "text-rose-600" : "text-slate-500",
                    className
                )}
                {...props}
            >
                {children}
                {required && <span className="text-rose-500 ml-0.5">*</span>}
                {optional && <span className="text-slate-400 font-normal ml-1">(optional)</span>}
            </label>
        )
    }
)
FormLabel.displayName = "FormLabel"

// ===========================================
// FORM CONTROL (Wrapper for input elements)
// ===========================================
interface FormControlProps {
    children: (props: { id: string; "aria-invalid": boolean; "aria-describedby"?: string }) => ReactNode
}

function FormControl({ children }: FormControlProps) {
    const { id, error } = useFormField()
    
    return (
        <>
            {children({
                id,
                "aria-invalid": !!error,
                "aria-describedby": error ? `${id}-error` : undefined,
            })}
        </>
    )
}

// ===========================================
// FORM DESCRIPTION
// ===========================================
const FormDescription = forwardRef<HTMLParagraphElement, HTMLAttributes<HTMLParagraphElement>>(
    ({ className, ...props }, ref) => {
        return (
            <p
                ref={ref}
                className={cn("text-[10px] text-slate-400", className)}
                {...props}
            />
        )
    }
)
FormDescription.displayName = "FormDescription"

// ===========================================
// FORM ERROR MESSAGE
// ===========================================
const FormError = forwardRef<HTMLParagraphElement, HTMLAttributes<HTMLParagraphElement>>(
    ({ className, children, ...props }, ref) => {
        const { id, error } = useFormField()

        if (!error) return null

        return (
            <p
                ref={ref}
                id={`${id}-error`}
                className={cn(
                    "flex items-center gap-1 text-[10px] font-medium text-rose-600",
                    className
                )}
                {...props}
            >
                <AlertCircle className="w-3 h-3 shrink-0" />
                {error}
            </p>
        )
    }
)
FormError.displayName = "FormError"

// ===========================================
// INLINE FORM ROW (for horizontal layouts)
// ===========================================
interface FormRowProps extends HTMLAttributes<HTMLDivElement> {
    label: string
    required?: boolean
    error?: string
}

const FormRow = forwardRef<HTMLDivElement, FormRowProps>(
    ({ className, label, required, error, children, ...props }, ref) => {
        const id = useId()

        return (
            <div
                ref={ref}
                className={cn(
                    "grid grid-cols-1 md:grid-cols-[140px_1fr] border-b border-slate-100",
                    className
                )}
                {...props}
            >
                <div className="label-col border-none flex items-center gap-1">
                    <label htmlFor={id} className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        {label}
                    </label>
                    {required && <span className="text-rose-500">*</span>}
                </div>
                <div className="value-col border-none flex flex-col">
                    <FormFieldContext.Provider value={{ id, error, required }}>
                        {children}
                    </FormFieldContext.Provider>
                    {error && (
                        <span className="text-[9px] text-rose-600 mt-0.5 flex items-center gap-1">
                            <AlertCircle className="w-2.5 h-2.5" />
                            {error}
                        </span>
                    )}
                </div>
            </div>
        )
    }
)
FormRow.displayName = "FormRow"

export { 
    FormField, 
    FormLabel, 
    FormControl, 
    FormDescription, 
    FormError,
    FormRow,
    useFormField 
}