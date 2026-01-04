import { InputHTMLAttributes, forwardRef, ReactNode } from "react"
import { cn } from "@/lib/utils"

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> { }

const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ className, ...props }, ref) => {
        return (
            <input
                ref={ref}
                className={cn(
                    "input-sharp w-full font-sans",
                    props["aria-invalid"] ? "border-rose-500 focus:ring-rose-500" : "border-slate-300",
                    props.readOnly && "bg-slate-50 text-slate-500 cursor-not-allowed",
                    className
                )}
                {...props}
            />
        )
    }
)
Input.displayName = "Input"

export { Input }