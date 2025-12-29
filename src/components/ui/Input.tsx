import { InputHTMLAttributes, forwardRef, ReactNode } from "react"
import { cn } from "@/lib/utils"

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: ReactNode
    error?: string
}

const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ className, label, error, ...props }, ref) => {
        return (
            <div className="w-full">
                {label && (
                    <label className="block text-body font-bold text-slate-500 uppercase mb-1 tracking-wider">
                        {label}
                    </label>
                )}
                <input
                    ref={ref}
                    className={cn(
                        "input-sharp w-full font-sans",
                        error ? "border-rose-500 focus:ring-rose-500" : "border-slate-300",
                        props.readOnly && "bg-slate-50 text-slate-500 cursor-not-allowed",
                        className
                    )}
                    {...props}
                />
                {error && (
                    <p className="mt-1 text-body font-bold text-rose-600 uppercase tracking-tight">{error}</p>
                )}
            </div>
        )
    }
)
Input.displayName = "Input"

export { Input }