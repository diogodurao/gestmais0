"use client"

import * as React from "react"
import * as ToastPrimitives from "@radix-ui/react-toast"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

const ToastProvider = ToastPrimitives.Provider

const ToastViewport = React.forwardRef<
    React.ElementRef<typeof ToastPrimitives.Viewport>,
    React.ComponentPropsWithoutRef<typeof ToastPrimitives.Viewport>
>(({ className, ...props }, ref) => (
    <ToastPrimitives.Viewport
        ref={ref}
        className={cn(
            "fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-1.5 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[360px]",
            className
        )}
        {...props}
    />
))
ToastViewport.displayName = ToastPrimitives.Viewport.displayName

const toastVariants = {
    default: "border-[#E9ECEF] bg-white text-[#343A40]",
    destructive: "border-[#EFCDD1] bg-[#F9ECEE] text-[#B86B73] group destructive",
    success: "border-[#D4E5D7] bg-[#E8F0EA] text-[#6A9B72]",
    warning: "border-[#F0E4C8] bg-[#FBF6EC] text-[#B8963E]",
}

interface ToastRootProps extends React.ComponentPropsWithoutRef<typeof ToastPrimitives.Root> {
    variant?: keyof typeof toastVariants
}

const Toast = React.forwardRef<
    React.ElementRef<typeof ToastPrimitives.Root>,
    ToastRootProps
>(({ className, variant = "default", ...props }, ref) => {
    return (
        <ToastPrimitives.Root
            ref={ref}
            className={cn(
                "group pointer-events-auto relative flex w-full items-center justify-between gap-3 overflow-hidden rounded-lg border p-3 pr-8 shadow-sm transition-all",
                "data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none",
                "data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full data-[state=open]:sm:slide-in-from-bottom-full",
                toastVariants[variant],
                className
            )}
            {...props}
        />
    )
})
Toast.displayName = ToastPrimitives.Root.displayName

const ToastAction = React.forwardRef<
    React.ElementRef<typeof ToastPrimitives.Action>,
    React.ComponentPropsWithoutRef<typeof ToastPrimitives.Action>
>(({ className, ...props }, ref) => (
    <ToastPrimitives.Action
        ref={ref}
        className={cn(
            "inline-flex h-7 shrink-0 items-center justify-center rounded border border-[#E9ECEF] bg-transparent px-2 text-[10px] font-medium transition-colors",
            "hover:bg-[#F8F9FA] focus:outline-none focus:ring-2 focus:ring-[#8FB996] focus:ring-offset-1",
            "disabled:pointer-events-none disabled:opacity-50",
            "group-[.destructive]:border-[#EFCDD1] group-[.destructive]:hover:border-[#D4848C] group-[.destructive]:hover:bg-[#D4848C] group-[.destructive]:hover:text-white group-[.destructive]:focus:ring-[#D4848C]",
            className
        )}
        {...props}
    />
))
ToastAction.displayName = ToastPrimitives.Action.displayName

const ToastClose = React.forwardRef<
    React.ElementRef<typeof ToastPrimitives.Close>,
    React.ComponentPropsWithoutRef<typeof ToastPrimitives.Close>
>(({ className, ...props }, ref) => (
    <ToastPrimitives.Close
        ref={ref}
        className={cn(
            "absolute right-2 top-2 rounded p-1 text-[#ADB5BD] opacity-0 transition-opacity hover:text-[#6C757D] focus:opacity-100 focus:outline-none focus:ring-1 group-hover:opacity-100",
            "group-[.destructive]:text-[#D4848C] group-[.destructive]:hover:text-[#B86B73] group-[.destructive]:focus:ring-[#D4848C]",
            className
        )}
        toast-close=""
        {...props}
    >
        <X className="h-3.5 w-3.5" />
    </ToastPrimitives.Close>
))
ToastClose.displayName = ToastPrimitives.Close.displayName

const ToastTitle = React.forwardRef<
    React.ElementRef<typeof ToastPrimitives.Title>,
    React.ComponentPropsWithoutRef<typeof ToastPrimitives.Title>
>(({ className, ...props }, ref) => (
    <ToastPrimitives.Title
        ref={ref}
        className={cn("text-[11px] font-semibold", className)}
        {...props}
    />
))
ToastTitle.displayName = ToastPrimitives.Title.displayName

const ToastDescription = React.forwardRef<
    React.ElementRef<typeof ToastPrimitives.Description>,
    React.ComponentPropsWithoutRef<typeof ToastPrimitives.Description>
>(({ className, ...props }, ref) => (
    <ToastPrimitives.Description
        ref={ref}
        className={cn("text-[10px] opacity-90", className)}
        {...props}
    />
))
ToastDescription.displayName = ToastPrimitives.Description.displayName

type ToastProps = React.ComponentPropsWithoutRef<typeof Toast> & {
    variant?: "default" | "destructive" | "success" | "warning"
}
type ToastActionElement = React.ReactElement<typeof ToastAction>

export {
    type ToastProps,
    type ToastActionElement,
    ToastProvider,
    ToastViewport,
    Toast,
    ToastTitle,
    ToastDescription,
    ToastClose,
    ToastAction,
}
