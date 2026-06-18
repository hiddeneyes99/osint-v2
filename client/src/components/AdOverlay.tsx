import { useEffect, useState, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { X, MonitorPlay, ExternalLink, Clock } from "lucide-react";

interface AdsConfig {
  enabled: boolean;
  adDuration: number;
  adTitle: string;
  adImageUrl: string;
  adLinkUrl: string;
}

interface AdOverlayProps {
  open: boolean;
  onComplete: () => void;
}

export function useAdsConfig() {
  return useQuery<AdsConfig>({
    queryKey: ["/api/ads-config"],
    queryFn: async () => {
      const res = await fetch("/api/ads-config");
      return res.json();
    },
    staleTime: 60_000,
  });
}

export function AdOverlay({ open, onComplete }: AdOverlayProps) {
  const { data: cfg } = useAdsConfig();
  const [countdown, setCountdown] = useState(0);
  const [done, setDone] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!open || !cfg?.enabled) return;
    const dur = cfg.adDuration || 15;
    setCountdown(dur);
    setDone(false);
    timerRef.current = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(timerRef.current!);
          setDone(true);
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [open, cfg]);

  if (!open || !cfg?.enabled) return null;

  const circumference = 2 * Math.PI * 22;
  const dur = cfg.adDuration || 15;
  const progress = done ? 1 : 1 - countdown / dur;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", damping: 20 }}
            className="w-full max-w-sm rounded-2xl overflow-hidden"
            style={{ background: "#0d0a2e", border: "1px solid rgba(139,92,246,0.3)" }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3" style={{ background: "rgba(139,92,246,0.1)", borderBottom: "1px solid rgba(139,92,246,0.2)" }}>
              <div className="flex items-center gap-2">
                <MonitorPlay className="w-4 h-4 text-violet-400" />
                <span className="text-violet-300 text-xs font-bold uppercase tracking-widest">
                  {cfg.adTitle || "Watch this short ad"}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-violet-400/60 text-[10px]">
                <Clock className="w-3 h-3" />
                <span className="font-mono">{done ? "0s" : `${countdown}s`}</span>
              </div>
            </div>

            {/* Ad Image */}
            {cfg.adImageUrl ? (
              <div className="relative w-full" style={{ minHeight: 180 }}>
                <img
                  src={cfg.adImageUrl}
                  alt="Advertisement"
                  className="w-full object-cover"
                  style={{ maxHeight: 260 }}
                />
                {cfg.adLinkUrl && (
                  <a
                    href={cfg.adLinkUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute bottom-2 right-2 flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-lg"
                    style={{ background: "rgba(139,92,246,0.8)", color: "#fff" }}
                  >
                    <ExternalLink className="w-3 h-3" /> Visit
                  </a>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center" style={{ height: 180, background: "rgba(139,92,246,0.05)" }}>
                <MonitorPlay className="w-16 h-16 text-violet-500/20" />
              </div>
            )}

            {/* Footer with countdown circle + button */}
            <div className="flex items-center justify-between px-4 py-4" style={{ borderTop: "1px solid rgba(139,92,246,0.15)" }}>
              <div className="flex items-center gap-2 text-slate-400 text-xs">
                <svg width="52" height="52" className="-rotate-90">
                  <circle cx="26" cy="26" r="22" fill="none" stroke="rgba(139,92,246,0.15)" strokeWidth="4" />
                  <circle
                    cx="26" cy="26" r="22"
                    fill="none"
                    stroke={done ? "#8B5CF6" : "#7C3AED"}
                    strokeWidth="4"
                    strokeDasharray={circumference}
                    strokeDashoffset={circumference * (1 - progress)}
                    strokeLinecap="round"
                    style={{ transition: "stroke-dashoffset 0.9s linear" }}
                  />
                  <text
                    x="26" y="26"
                    textAnchor="middle"
                    dominantBaseline="central"
                    fill={done ? "#A78BFA" : "#8B5CF6"}
                    fontSize="13"
                    fontWeight="bold"
                    className="rotate-90"
                    style={{ transform: "rotate(90deg)", transformOrigin: "26px 26px" }}
                  >
                    {done ? "✓" : countdown}
                  </text>
                </svg>
                <span className="text-slate-500 text-[11px]">
                  {done ? "Ad completed!" : `Wait ${countdown}s...`}
                </span>
              </div>
              <button
                onClick={done ? onComplete : undefined}
                disabled={!done}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
                  done
                    ? "bg-violet-600 text-white hover:bg-violet-500 cursor-pointer"
                    : "bg-white/[0.04] text-white/20 cursor-not-allowed"
                }`}
              >
                {done ? <><X className="w-4 h-4" /> View Results</> : "Please wait..."}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
