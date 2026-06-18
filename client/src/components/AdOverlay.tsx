import { useEffect, useState, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { X, MonitorPlay, ExternalLink } from "lucide-react";

export interface Ad {
  id: number;
  title: string;
  type: string;
  mediaUrl: string | null;
  htmlContent: string | null;
  linkUrl: string | null;
  duration: number;
  isActive: boolean;
}

interface AdOverlayProps {
  open: boolean;
  onComplete: () => void;
}

export function useAdsConfig() {
  return useQuery<Ad | null>({
    queryKey: ["/api/ads/random"],
    queryFn: async () => {
      const res = await fetch("/api/ads/random");
      return res.json();
    },
    staleTime: 0,
    enabled: false,
  });
}

export function AdOverlay({ open, onComplete }: AdOverlayProps) {
  const [ad, setAd] = useState<Ad | null>(null);
  const [countdown, setCountdown] = useState(0);
  const [done, setDone] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!open) {
      setAd(null);
      setDone(false);
      setCountdown(0);
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }
    // Fetch a fresh random ad each time search is triggered
    fetch("/api/ads/random")
      .then(r => r.json())
      .then((fetchedAd: Ad | null) => {
        if (!fetchedAd) { onComplete(); return; }
        setAd(fetchedAd);
        const dur = fetchedAd.duration || 15;
        setCountdown(dur);
        setDone(false);
        if (timerRef.current) clearInterval(timerRef.current);
        timerRef.current = setInterval(() => {
          setCountdown(c => {
            if (c <= 1) {
              clearInterval(timerRef.current!);
              setDone(true);
              return 0;
            }
            return c - 1;
          });
        }, 1000);
      })
      .catch(() => onComplete());
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [open]);

  if (!open || !ad) return null;

  const dur = ad.duration || 15;
  const progress = done ? 1 : 1 - countdown / dur;
  const circumference = 2 * Math.PI * 20;

  return (
    <AnimatePresence>
      {open && ad && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center bg-black/85 backdrop-blur-sm"
          style={{ padding: "0" }}
        >
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ type: "spring", damping: 22, stiffness: 300 }}
            className="w-full sm:max-w-sm flex flex-col overflow-hidden"
            style={{
              background: "#0d0a2e",
              border: "1px solid rgba(139,92,246,0.35)",
              borderRadius: "20px 20px 0 0",
              maxHeight: "92dvh",
            }}
          >
            {/* Header bar */}
            <div className="flex items-center justify-between px-4 py-3 shrink-0" style={{ background: "rgba(139,92,246,0.12)", borderBottom: "1px solid rgba(139,92,246,0.2)" }}>
              <div className="flex items-center gap-2">
                <MonitorPlay className="w-4 h-4 text-violet-400 shrink-0" />
                <span className="text-violet-300 text-xs font-bold uppercase tracking-widest truncate max-w-[200px]">
                  {ad.title || "Watch ad to continue"}
                </span>
              </div>
              <span className="text-violet-400/50 text-[10px] font-mono shrink-0 ml-2">
                {done ? "Done" : `${countdown}s`}
              </span>
            </div>

            {/* Ad content */}
            <div className="relative overflow-hidden flex-1 min-h-0">
              {ad.type === "IMAGE" && ad.mediaUrl && (
                <a href={ad.linkUrl || undefined} target="_blank" rel="noopener noreferrer"
                  className={ad.linkUrl ? "block" : "pointer-events-none block"}>
                  <img src={ad.mediaUrl} alt="Ad" className="w-full object-contain" style={{ maxHeight: "55dvh" }} />
                </a>
              )}

              {ad.type === "VIDEO" && ad.mediaUrl && (
                <video
                  src={ad.mediaUrl}
                  autoPlay
                  muted
                  playsInline
                  className="w-full object-contain bg-black"
                  style={{ maxHeight: "55dvh" }}
                  onEnded={() => {}}
                />
              )}

              {ad.type === "HTML" && ad.htmlContent && (
                <iframe
                  srcDoc={ad.htmlContent}
                  sandbox="allow-scripts allow-same-origin allow-popups"
                  className="w-full border-0"
                  style={{ height: "50dvh" }}
                  title="Ad"
                />
              )}

              {!ad.mediaUrl && !ad.htmlContent && (
                <div className="flex items-center justify-center h-48" style={{ background: "rgba(139,92,246,0.05)" }}>
                  <MonitorPlay className="w-14 h-14 text-violet-500/20" />
                </div>
              )}

              {ad.linkUrl && ad.type !== "IMAGE" && (
                <a href={ad.linkUrl} target="_blank" rel="noopener noreferrer"
                  className="absolute bottom-3 right-3 flex items-center gap-1.5 text-[10px] font-bold px-3 py-1.5 rounded-lg"
                  style={{ background: "rgba(139,92,246,0.85)", color: "#fff" }}>
                  <ExternalLink className="w-3 h-3" /> Visit
                </a>
              )}
            </div>

            {/* Footer — timer + close button */}
            <div className="flex items-center justify-between px-4 py-4 shrink-0" style={{ borderTop: "1px solid rgba(139,92,246,0.15)" }}>
              <div className="flex items-center gap-3">
                <svg width="46" height="46" viewBox="0 0 46 46">
                  <circle cx="23" cy="23" r="20" fill="none" stroke="rgba(139,92,246,0.2)" strokeWidth="3.5" />
                  <circle
                    cx="23" cy="23" r="20"
                    fill="none"
                    stroke={done ? "#A78BFA" : "#7C3AED"}
                    strokeWidth="3.5"
                    strokeDasharray={circumference}
                    strokeDashoffset={circumference * (1 - progress)}
                    strokeLinecap="round"
                    transform="rotate(-90 23 23)"
                    style={{ transition: "stroke-dashoffset 0.9s linear" }}
                  />
                  <text x="23" y="23" textAnchor="middle" dominantBaseline="central"
                    fill={done ? "#A78BFA" : "#8B5CF6"} fontSize="11" fontWeight="bold">
                    {done ? "✓" : countdown}
                  </text>
                </svg>
                <span className="text-slate-500 text-xs">
                  {done ? "Ad complete!" : `Wait ${countdown}s...`}
                </span>
              </div>

              <button
                onClick={done ? onComplete : undefined}
                disabled={!done}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all"
                style={done
                  ? { background: "#7C3AED", color: "#fff", cursor: "pointer" }
                  : { background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.2)", cursor: "not-allowed" }
                }
              >
                {done ? <><X className="w-4 h-4" />View Results</> : "Please wait..."}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
