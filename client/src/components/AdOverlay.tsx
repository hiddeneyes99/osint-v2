import { useEffect, useState, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, MonitorPlay, ExternalLink, AlertCircle, Youtube, Wifi } from "lucide-react";

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

function getYoutubeId(url: string): string | null {
  const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&?/]+)/);
  return m ? m[1] : null;
}

export function AdOverlay({ open, onComplete }: AdOverlayProps) {
  const [ad, setAd] = useState<Ad | null>(null);
  const [countdown, setCountdown] = useState(0);
  const [done, setDone] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [loading, setLoading] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!open) {
      setAd(null);
      setDone(false);
      setCountdown(0);
      setImgError(false);
      setLoading(false);
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }
    setLoading(true);
    fetch("/api/ads/random")
      .then(r => r.json())
      .then((fetchedAd: Ad | null) => {
        setLoading(false);
        if (!fetchedAd) { onComplete(); return; }
        setAd(fetchedAd);
        setImgError(false);
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
      .catch(() => { setLoading(false); onComplete(); });
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [open]);

  if (!open) return null;

  const dur = ad?.duration || 15;
  const progress = done ? 1 : ad ? 1 - countdown / dur : 0;
  const ytId = ad?.type === "VIDEO" && ad.mediaUrl ? getYoutubeId(ad.mediaUrl) : null;
  const isYoutube = !!ytId;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center"
          style={{ background: "rgba(0,0,0,0.92)", backdropFilter: "blur(8px)" }}
        >
          {/* Loading state */}
          {loading && (
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-white/40 text-sm">Loading ad...</p>
            </div>
          )}

          {/* Ad card */}
          {!loading && ad && (
            <motion.div
              initial={{ scale: 0.94, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.94, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 24, stiffness: 320 }}
              className="w-full flex flex-col overflow-hidden"
              style={{
                maxWidth: "480px",
                maxHeight: "90dvh",
                margin: "0 16px",
                background: "linear-gradient(180deg, #0d0820 0%, #08051a 100%)",
                border: "1px solid rgba(139,92,246,0.4)",
                borderRadius: "20px",
                boxShadow: "0 0 60px rgba(139,92,246,0.15), 0 24px 48px rgba(0,0,0,0.6)",
              }}
            >
              {/* Top bar */}
              <div className="flex items-center justify-between px-4 py-3 shrink-0" style={{ borderBottom: "1px solid rgba(139,92,246,0.2)", background: "rgba(139,92,246,0.08)" }}>
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-widest" style={{ background: "rgba(139,92,246,0.2)", color: "#c4b5fd", border: "1px solid rgba(139,92,246,0.3)" }}>
                    <MonitorPlay className="w-3 h-3" /> Advertisement
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {done ? (
                    <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" /> Ad complete
                    </span>
                  ) : (
                    <span className="text-[10px] text-white/30 font-mono">Wait {countdown}s</span>
                  )}
                </div>
              </div>

              {/* Ad title */}
              {ad.title && (
                <div className="px-4 pt-3 pb-0 shrink-0">
                  <p className="text-sm font-semibold text-white/80 truncate">{ad.title}</p>
                </div>
              )}

              {/* Media area */}
              <div className="flex-1 min-h-0 overflow-hidden flex flex-col">

                {/* IMAGE */}
                {ad.type === "IMAGE" && ad.mediaUrl && !imgError && (
                  <a
                    href={ad.linkUrl || undefined}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex items-center justify-center flex-1 min-h-0 ${ad.linkUrl ? "cursor-pointer" : "pointer-events-none"}`}
                    style={{ background: "#000", margin: "12px", borderRadius: "12px", overflow: "hidden" }}
                  >
                    <img
                      src={ad.mediaUrl}
                      alt="Advertisement"
                      className="w-full object-contain"
                      style={{ maxHeight: "340px", display: "block" }}
                      onError={() => setImgError(true)}
                    />
                  </a>
                )}

                {/* IMAGE error */}
                {ad.type === "IMAGE" && (imgError || !ad.mediaUrl) && (
                  <div className="flex flex-col items-center justify-center flex-1 gap-3 py-10" style={{ color: "rgba(255,255,255,0.15)" }}>
                    <AlertCircle className="w-10 h-10" />
                    <p className="text-sm">{imgError ? "Image could not be loaded" : "No image set"}</p>
                    {ad.linkUrl && (
                      <a href={ad.linkUrl} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-xl"
                        style={{ background: "rgba(139,92,246,0.3)", color: "#c4b5fd", border: "1px solid rgba(139,92,246,0.4)" }}>
                        <ExternalLink className="w-3.5 h-3.5" /> Visit Advertiser
                      </a>
                    )}
                  </div>
                )}

                {/* VIDEO — YouTube */}
                {ad.type === "VIDEO" && ad.mediaUrl && isYoutube && (
                  <div className="mx-3 my-3 rounded-xl overflow-hidden flex-shrink-0" style={{ aspectRatio: "16/9", background: "#000" }}>
                    <iframe
                      src={`https://www.youtube.com/embed/${ytId}?autoplay=1&mute=1&rel=0&modestbranding=1`}
                      className="w-full h-full border-0"
                      allow="autoplay; encrypted-media"
                      allowFullScreen
                      title="Ad Video"
                    />
                  </div>
                )}

                {/* VIDEO — direct */}
                {ad.type === "VIDEO" && ad.mediaUrl && !isYoutube && (
                  <div className="mx-3 my-3 rounded-xl overflow-hidden flex-shrink-0" style={{ background: "#000" }}>
                    <video
                      src={ad.mediaUrl}
                      autoPlay
                      muted
                      playsInline
                      className="w-full object-contain"
                      style={{ maxHeight: "300px", display: "block" }}
                    />
                  </div>
                )}

                {/* VIDEO — no URL */}
                {ad.type === "VIDEO" && !ad.mediaUrl && (
                  <div className="flex flex-col items-center justify-center flex-1 gap-2 py-10" style={{ color: "rgba(255,255,255,0.15)" }}>
                    <Youtube className="w-10 h-10" />
                    <p className="text-sm">No video URL set</p>
                  </div>
                )}

                {/* HTML */}
                {ad.type === "HTML" && ad.htmlContent && (
                  <div className="mx-3 my-3 rounded-xl overflow-hidden flex-shrink-0" style={{ border: "1px solid rgba(255,255,255,0.06)" }}>
                    <iframe
                      srcDoc={ad.htmlContent}
                      sandbox="allow-scripts allow-same-origin allow-popups"
                      className="w-full border-0"
                      style={{ height: "240px" }}
                      title="Ad"
                    />
                  </div>
                )}

                {/* Visit link button for non-image types */}
                {ad.linkUrl && ad.type !== "IMAGE" && (
                  <div className="px-4 pb-3 shrink-0">
                    <a
                      href={ad.linkUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-xs font-bold transition-all"
                      style={{ background: "rgba(139,92,246,0.15)", border: "1px solid rgba(139,92,246,0.3)", color: "#c4b5fd" }}
                    >
                      <ExternalLink className="w-3.5 h-3.5" /> Visit Advertiser
                    </a>
                  </div>
                )}
              </div>

              {/* Bottom bar — progress + action */}
              <div className="shrink-0 px-4 pb-4 pt-3 space-y-3" style={{ borderTop: "1px solid rgba(139,92,246,0.12)" }}>
                {/* Progress bar */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-white/25">
                      {done ? "You can now close this ad" : `Ad ends in ${countdown} second${countdown !== 1 ? "s" : ""}`}
                    </span>
                    <span className="text-[10px] font-mono font-bold" style={{ color: done ? "#34d399" : "#8B5CF6" }}>
                      {done ? "✓ Done" : `${countdown}s`}
                    </span>
                  </div>
                  <div className="relative h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(139,92,246,0.15)" }}>
                    <motion.div
                      className="absolute inset-y-0 left-0 rounded-full"
                      style={{ background: done ? "#34d399" : "linear-gradient(90deg, #7C3AED, #A78BFA)" }}
                      animate={{ width: `${progress * 100}%` }}
                      transition={{ duration: 0.9, ease: "linear" }}
                    />
                  </div>
                </div>

                {/* Action button */}
                <button
                  onClick={done ? onComplete : undefined}
                  disabled={!done}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all"
                  style={done
                    ? { background: "linear-gradient(135deg, #7C3AED, #6D28D9)", color: "#fff", cursor: "pointer", boxShadow: "0 4px 20px rgba(124,58,237,0.4)" }
                    : { background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.2)", cursor: "not-allowed", border: "1px solid rgba(255,255,255,0.06)" }
                  }
                >
                  {done ? (
                    <><X className="w-4 h-4" /> Close Ad & View Results</>
                  ) : (
                    <>
                      <Wifi className="w-4 h-4 opacity-40" />
                      Please wait {countdown} second{countdown !== 1 ? "s" : ""}...
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
