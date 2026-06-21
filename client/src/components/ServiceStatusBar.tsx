import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Smartphone, Globe, Car, ShieldCheck, Mail, RefreshCw } from "lucide-react";

const SERVICES = [
  { key: "mobile",  label: "Mobile",  icon: Smartphone  },
  { key: "aadhar",  label: "Aadhar",  icon: ShieldCheck  },
  { key: "email",   label: "Gmail",   icon: Mail         },
  { key: "ip",      label: "IP",      icon: Globe        },
  { key: "vehicle", label: "Vehicle", icon: Car          },
] as const;

const STATUS_STYLES: Record<string, { label: string; dot: string; text: string }> = {
  up:       { label: "Online",   dot: "bg-emerald-400", text: "text-emerald-400" },
  degraded: { label: "Degraded", dot: "bg-amber-400",   text: "text-amber-400"   },
  down:     { label: "Offline",  dot: "bg-red-400",     text: "text-red-400"     },
  "n/a":    { label: "N/A",      dot: "bg-zinc-600",    text: "text-zinc-500"    },
};

export function ServiceStatusBar() {
  const { data, isLoading, refetch, isFetching } = useQuery<Record<string, any>>({
    queryKey: ["/api/services/status"],
    refetchInterval: 5 * 1000,
    staleTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
  });

  const reasons: Record<string, string> = data?.reasons || {};

  return (
    <div
      className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 sm:px-4 py-2 mb-4 flex items-center gap-2 sm:gap-3 overflow-x-auto"
      style={{ scrollbarWidth: "none" }}
    >
      <span className="text-[9px] sm:text-[10px] font-medium uppercase tracking-widest text-white/25 shrink-0">
        Status
      </span>
      <div className="h-3 w-px bg-white/10 shrink-0" />

      <div className="flex items-center gap-2.5 sm:gap-4 min-w-max">
        {SERVICES.map(({ key, label, icon: Icon }) => {
          const status = isLoading ? null : (data?.[key] ?? "down");
          const style = status ? (STATUS_STYLES[status] ?? STATUS_STYLES.down) : null;
          const reason = status === "down" ? (reasons[key] || "") : "";

          return (
            <div key={key} className="flex items-center gap-1 sm:gap-1.5 relative group">
              <Icon size={10} className="text-violet-400/60 shrink-0" />
              <span className="text-[9px] sm:text-[10px] text-white/45 font-medium hidden sm:inline">
                {label}
              </span>
              <span className="flex items-center gap-0.5 sm:gap-1">
                {!style ? (
                  <span className="w-1.5 h-1.5 rounded-full bg-zinc-700 animate-pulse" />
                ) : (
                  <motion.span
                    className="relative flex h-1.5 w-1.5 shrink-0"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                  >
                    {status === "up" && (
                      <span
                        className={`animate-ping absolute inline-flex h-full w-full rounded-full ${style.dot} opacity-40`}
                      />
                    )}
                    <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${style.dot}`} />
                  </motion.span>
                )}
                <span className={`text-[9px] sm:text-[10px] font-medium ${style?.text ?? "text-zinc-600"}`}>
                  {style?.label ?? "..."}
                </span>
              </span>

              {/* Reason tooltip — only when service is down and reason exists */}
              {status === "down" && reason && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 hidden group-hover:block pointer-events-none">
                  <div className="rounded-lg px-2.5 py-1.5 text-[10px] leading-relaxed max-w-[180px] text-center whitespace-pre-wrap"
                    style={{
                      background: "rgba(9,5,26,0.96)",
                      border: "1px solid rgba(239,68,68,0.3)",
                      color: "rgba(252,165,165,0.9)",
                      boxShadow: "0 4px 16px rgba(0,0,0,0.5)",
                    }}>
                    {reason}
                  </div>
                  <div className="w-2 h-2 rotate-45 mx-auto -mt-1"
                    style={{ background: "rgba(9,5,26,0.96)", borderRight: "1px solid rgba(239,68,68,0.3)", borderBottom: "1px solid rgba(239,68,68,0.3)" }} />
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="ml-auto shrink-0">
        <button
          onClick={() => refetch()}
          disabled={isFetching}
          className="flex items-center gap-1 text-[9px] sm:text-[10px] text-white/20 hover:text-violet-400 transition-colors font-medium"
        >
          <RefreshCw size={9} className={isFetching ? "animate-spin" : ""} />
          <span className="hidden sm:inline">{isFetching ? "Checking..." : "Refresh"}</span>
        </button>
      </div>
    </div>
  );
}
