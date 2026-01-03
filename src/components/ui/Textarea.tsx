import { TextareaHTMLAttributes, forwardRef, useId } from "react"
import { cn } from "@/lib/utils"
import { useFormField } from "./Formfield"

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
    resize?: "none" | "vertical" | "horizontal" | "both"
    error?: string
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
    ({ className, resize = "vertical", id: propId, ...props }, ref) => {
        const formField = useFormField()
        const id = propId || formField?.id || useId()
        const isInvalid = !!(props.error || formField?.error || props["aria-invalid"])

        return (
            <textarea
                ref={ref}
                id={id}
                className={cn(
                    "w-full min-h-[80px] px-3 py-2 bg-white border rounded-sm text-content text-slate-700 placeholder:text-slate-400 font-sans",
                    "transition-colors focus:outline-none focus:ring-1 focus:ring-slate-400 focus:border-slate-400",
                    "disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-slate-50",
                    {
                        "border-slate-300 hover:border-slate-400": !isInvalid,
                        "border-rose-400 focus:ring-rose-400 focus:border-rose-400": isInvalid,
                        "resize-none": resize === "none",
                        "resize-y": resize === "vertical",
                        "resize-x": resize === "horizontal",
                        "resize": resize === "both",
                    },
                    className
                )}
                aria-invalid={isInvalid}
                {...props}
            />
        )
    }
)
Textarea.displayName = "Textarea"

export { Textarea }