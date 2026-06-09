import { cn } from "@/lib/utils";

interface CyberCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function CyberCard({ className, children, ...props }: CyberCardProps) {
  return (
    <div
      className={cn(
        "relative rounded-2xl p-6 overflow-hidden transition-all duration-300",
        "bg-white/[0.03] backdrop-blur-md border border-white/[0.07]",
        "hover:-translate-y-2",
        "hover:shadow-[0_12px_0_-4px_rgba(88,28,220,0.4),0_24px_60px_rgba(0,0,0,0.5),0_0_40px_rgba(139,92,246,0.18)]",
        "hover:border-violet-500/30",
        "shadow-[0_4px_0_-2px_rgba(88,28,220,0.2),0_8px_30px_rgba(0,0,0,0.3)]",
        className
      )}
      {...props}
    >
      {/* Top highlight stripe — simulates light source */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-400/40 to-transparent" />
      {/* Bottom depth shadow line */}
      <div className="absolute inset-x-2 bottom-0 h-px bg-gradient-to-r from-transparent via-black/60 to-transparent" />
      {children}
    </div>
  );
}
