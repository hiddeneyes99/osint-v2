import * as React from "react"
import * as ToastPrimitives from "@radix-ui/react-toast"
import { cva, type VariantProps } from "class-variance-authority"
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
      "fixed z-[9999] flex flex-col gap-3 p-4",
      "bottom-4 right-4 w-full sm:max-w-[400px]",
      "top-4 right-4 sm:top-auto sm:bottom-4",
      className
    )}
    {...props}
  />
))
ToastViewport.displayName = ToastPrimitives.Viewport.displayName

const toastVariants = cva(
  [
    "toast-premium",
    "group pointer-events-auto relative w-full overflow-hidden",
    "rounded-2xl border backdrop-blur-2xl",
    "flex items-stretch",
    "transition-all duration-200",
    "hover:scale-[1.015] hover:translate-y-[-2px]",
  ].join(" "),
  {
    variants: {
      variant: {
        default: [
          "bg-[#0c0920]/95 border-violet-500/25",
          "shadow-[0_0_0_1px_rgba(139,92,246,0.08),0_8px_40px_rgba(0,0,0,0.5),0_0_60px_rgba(139,92,246,0.08)]",
          "hover:shadow-[0_0_0_1px_rgba(139,92,246,0.2),0_16px_60px_rgba(0,0,0,0.6),0_0_80px_rgba(139,92,246,0.15)]",
        ].join(" "),
        destructive: [
          "bg-[#0c0920]/95 border-red-500/25",
          "shadow-[0_0_0_1px_rgba(255,94,122,0.08),0_8px_40px_rgba(0,0,0,0.5),0_0_60px_rgba(255,94,122,0.08)]",
          "hover:shadow-[0_0_0_1px_rgba(255,94,122,0.2),0_16px_60px_rgba(0,0,0,0.6),0_0_80px_rgba(255,94,122,0.12)]",
        ].join(" "),
        success: [
          "bg-[#0c0920]/95 border-emerald-500/25",
          "shadow-[0_0_0_1px_rgba(0,230,118,0.08),0_8px_40px_rgba(0,0,0,0.5),0_0_60px_rgba(0,230,118,0.08)]",
          "hover:shadow-[0_0_0_1px_rgba(0,230,118,0.2),0_16px_60px_rgba(0,0,0,0.6),0_0_80px_rgba(0,230,118,0.12)]",
        ].join(" "),
        warning: [
          "bg-[#0c0920]/95 border-amber-500/25",
          "shadow-[0_0_0_1px_rgba(255,176,32,0.08),0_8px_40px_rgba(0,0,0,0.5),0_0_60px_rgba(255,176,32,0.08)]",
          "hover:shadow-[0_0_0_1px_rgba(255,176,32,0.2),0_16px_60px_rgba(0,0,0,0.6),0_0_80px_rgba(255,176,32,0.12)]",
        ].join(" "),
        telegram: [
          "bg-[#0c0920]/95 border-sky-500/25",
          "shadow-[0_0_0_1px_rgba(42,171,238,0.08),0_8px_40px_rgba(0,0,0,0.5),0_0_60px_rgba(42,171,238,0.08)]",
          "hover:shadow-[0_0_0_1px_rgba(42,171,238,0.2),0_16px_60px_rgba(0,0,0,0.6),0_0_80px_rgba(42,171,238,0.12)]",
        ].join(" "),
      },
    },
    defaultVariants: { variant: "default" },
  }
)

const Toast = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Root> &
    VariantProps<typeof toastVariants>
>(({ className, variant, ...props }, ref) => (
  <ToastPrimitives.Root
    ref={ref}
    className={cn(toastVariants({ variant }), className)}
    {...props}
  />
))
Toast.displayName = ToastPrimitives.Root.displayName

const ToastAction = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Action>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Action>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Action
    ref={ref}
    className={cn(
      "inline-flex h-7 shrink-0 items-center justify-center rounded-lg",
      "border border-white/10 bg-white/5 px-3 text-xs font-medium text-white/70",
      "transition-colors hover:bg-white/10 hover:text-white",
      "focus:outline-none focus:ring-1 focus:ring-white/20",
      "disabled:pointer-events-none disabled:opacity-50",
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
      "absolute right-3 top-3 z-10",
      "flex h-6 w-6 items-center justify-center rounded-full",
      "bg-white/5 border border-white/10",
      "text-white/30 opacity-0 transition-all duration-200",
      "hover:bg-white/15 hover:text-white/80 hover:rotate-90 hover:scale-110",
      "focus:opacity-100 focus:outline-none",
      "group-hover:opacity-100",
      className
    )}
    toast-close=""
    {...props}
  >
    <X className="h-3 w-3" />
  </ToastPrimitives.Close>
))
ToastClose.displayName = ToastPrimitives.Close.displayName

const ToastTitle = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Title>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Title>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Title
    ref={ref}
    className={cn("text-[13px] font-semibold text-white leading-snug tracking-[-0.01em]", className)}
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
    className={cn("text-[11px] text-white/50 leading-relaxed mt-[3px]", className)}
    {...props}
  />
))
ToastDescription.displayName = ToastPrimitives.Description.displayName

type ToastProps = React.ComponentPropsWithoutRef<typeof Toast>
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
