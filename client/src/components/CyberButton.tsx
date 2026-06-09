import * as React from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface CyberButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  variant?: "primary" | "danger" | "outline" | "ghost";
}

export function CyberButton({
  className,
  children,
  isLoading,
  variant = "primary",
  disabled,
  ...props
}: CyberButtonProps) {
  const baseStyles = [
    "relative font-semibold transition-all duration-150 rounded-xl",
    "active:translate-y-[3px] active:shadow-none",
    "disabled:opacity-50 disabled:pointer-events-none select-none",
    "inline-flex items-center justify-center",
    "transform-gpu",
  ].join(" ");

  const variants = {
    primary: [
      "text-white",
      "bg-gradient-to-br from-violet-400 via-violet-600 to-purple-700",
      // 3D depth shadow (bottom) + glow
      "shadow-[0_6px_0_rgba(67,20,180,0.9),0_8px_24px_rgba(139,92,246,0.4)]",
      "hover:shadow-[0_8px_0_rgba(67,20,180,0.9),0_12px_32px_rgba(168,85,247,0.55)]",
      "hover:-translate-y-1",
      "active:shadow-[0_2px_0_rgba(67,20,180,0.9),0_4px_12px_rgba(139,92,246,0.3)]",
      // top shine
      "before:absolute before:inset-0 before:rounded-xl before:bg-gradient-to-b before:from-white/[0.18] before:to-transparent before:pointer-events-none",
    ].join(" "),
    danger: [
      "text-white",
      "bg-gradient-to-br from-red-400 via-rose-600 to-red-700",
      "shadow-[0_6px_0_rgba(153,27,27,0.9),0_8px_20px_rgba(239,68,68,0.35)]",
      "hover:shadow-[0_8px_0_rgba(153,27,27,0.9),0_12px_28px_rgba(239,68,68,0.5)]",
      "hover:-translate-y-1",
      "active:shadow-[0_2px_0_rgba(153,27,27,0.9),0_4px_10px_rgba(239,68,68,0.25)]",
      "before:absolute before:inset-0 before:rounded-xl before:bg-gradient-to-b before:from-white/[0.14] before:to-transparent before:pointer-events-none",
    ].join(" "),
    outline: [
      "bg-transparent border border-violet-500/50 text-violet-300",
      "shadow-[0_4px_0_rgba(109,40,217,0.55),0_6px_16px_rgba(139,92,246,0.2)]",
      "hover:bg-violet-500/10 hover:border-violet-400/70 hover:-translate-y-0.5",
      "hover:shadow-[0_6px_0_rgba(109,40,217,0.6),0_8px_20px_rgba(139,92,246,0.3)]",
      "active:shadow-[0_1px_0_rgba(109,40,217,0.5)]",
    ].join(" "),
    ghost: "bg-transparent text-violet-300/70 hover:text-violet-200 hover:bg-violet-500/10",
  };

  return (
    <button
      className={cn(
        baseStyles,
        variants[variant] ?? variants.primary,
        "px-3 py-2 xs:px-4 xs:py-2 md:px-5 md:py-2.5 text-sm touch-manipulation min-h-[36px]",
        className
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      <div className="flex items-center justify-center gap-2 relative z-10">
        {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
        {children}
      </div>
    </button>
  );
}
