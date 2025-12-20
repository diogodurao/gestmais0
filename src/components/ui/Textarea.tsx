import { TextareaHTMLAttributes, forwardRef } from "react"
import { cn } from "@/lib/utils"

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
    error?: boolean
    resize?: "none" | "vertical" | "horizontal" | "both"
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
    ({ className, error, resize = "vertical", ...props }, ref) => {
        return (
            <textarea
                ref={ref}
                className={cn(
                    "w-full min-h-[80px] px-3 py-2 bg-white border rounded-sm text-[13px] text-slate-700 placeholder:text-slate-400",
                    "transition-colors focus:outline-none focus:ring-1 focus:ring-slate-400 focus:border-slate-400",
                    "disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-slate-50",
                    {
                        "border-slate-300 hover:border-slate-400": !error,
                        "border-rose-400 focus:ring-rose-400 focus:border-rose-400": error,
                        "resize-none": resize === "none",
                        "resize-y": resize === "vertical",
                        "resize-x": resize === "horizontal",
                        "resize": resize === "both",
                    },
                    className
                )}
                {...props}
            />
        )
    }
)
Textarea.displayName = "Textarea"

export { Textarea }