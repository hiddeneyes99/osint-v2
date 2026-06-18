import { useEffect, useState, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, ExternalLink, AlertCircle, Wifi } from "lucide-react";

export interface Ad {
  id: number;
  title: string;
  type: string;
  mediaUrl: string | null;
  htmlContent: string | null;
  linkUrl: string | null;
  duration: number;
  isActive: boolean;
  views?: number;
  clicks?: number;
}

interface AdOverlayProps {
  open: boolean;
  onComplete: () => void;
}

function getYoutubeId(url: string): string | null {
  const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&?/]+)/);
  return m ? m[1] : null;
}

function trackView(id: number) {
  fetch(`/api/ads/${id}/view`, { method: "POST" }).catch(() => {});
}

function trackClick(id: number) {
  fetch(`/api/ads/${id}/click`, { method: "POST" }).catch(() => {});
}

export function AdOverlay({ open, onComplete }: AdOverlayProps) {
  const [ad, setAd] = useState<Ad | null>(null);
  const [countdown, setCountdown] = useState(0);
  const [done, setDone] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [loading, setLoading] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const trackedRef = useRef(false);

  useEffect(() => {
    if (!open) {
      setAd(null);
      setDone(false);
      setCountdown(0);
      setImgError(false);
      setLoading(false);
      trackedRef.current = false;
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
        // Track view once
        if (!trackedRef.current) {
          trackedRef.current = true;
          trackView(fetchedAd.id);
        }
        if (timerRef.current) clearInterval(timerRef.current);
        timerRef.current = setInterval(() => {
          setCountdown(c => {
            if (c <= 1) { clearInterval(timerRef.current!); setDone(true); return 0; }
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

  const handleCtaClick = () => {
    if (!done || !ad) return;
    onComplete();
  };

  const handleLinkClick = (e: React.MouseEvent, adId: number) => {
    trackClick(adId);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-[9999]"
          style={{ background: "rgba(0,0,0,0.96)" }}
        >
          {/* Loading */}
          {loading && (
            <div className="flex flex-col items-center justify-center h-full gap-4">
              <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-white/30 text-sm">Loading...</p>
            </div>
          )}

          {/* Ad full-screen */}
          {!loading && ad && (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col h-full w-full"
              style={{ maxWidth: "520px", margin: "0 auto" }}
            >
              {/* ─── TOP BAR ─── */}
              <div className="flex items-center justify-between px-4 pt-safe pt-3 pb-3 shrink-0">
                <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full"
                  style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.4)", border: "1px solid rgba(255,255,255,0.1)" }}>
                  Advertisement
                </span>
                <span
                  className="text-[11px] font-bold px-3 py-1 rounded-full"
                  style={done
                    ? { background: "rgba(52,211,153,0.15)", color: "#34d399", border: "1px solid rgba(52,211,153,0.3)" }
                    : { background: "rgba(139,92,246,0.15)", color: "#a78bfa", border: "1px solid rgba(139,92,246,0.3)" }
                  }
                >
                  {done ? "✓ Ad complete" : `Reward in ${countdown}s`}
                </span>
              </div>

              {/* ─── MEDIA AREA (fills all available space) ─── */}
              <div className="flex-1 min-h-0 flex flex-col items-center justify-center px-4 py-2">

                {/* IMAGE */}
                {ad.type === "IMAGE" && ad.mediaUrl && !imgError && (
                  ad.linkUrl ? (
                    <a
                      href={ad.linkUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => handleLinkClick(e, ad.id)}
                      className="w-full flex items-center justify-center"
                      style={{ maxHeight: "calc(100dvh - 200px)" }}
                    >
                      <img
                        src={ad.mediaUrl}
                        alt="Ad"
                        className="w-full rounded-2xl object-contain"
                        style={{ maxHeight: "calc(100dvh - 200px)", display: "block" }}
                        onError={() => setImgError(true)}
                      />
                    </a>
                  ) : (
                    <div className="w-full flex items-center justify-center" style={{ maxHeight: "calc(100dvh - 200px)" }}>
                      <img
                        src={ad.mediaUrl}
                        alt="Ad"
                        className="w-full rounded-2xl object-contain"
                        style={{ maxHeight: "calc(100dvh - 200px)", display: "block" }}
                        onError={() => setImgError(true)}
                      />
                    </div>
                  )
                )}

                {/* IMAGE error / no URL */}
                {ad.type === "IMAGE" && (imgError || !ad.mediaUrl) && (
                  <div className="flex flex-col items-center gap-4 py-16" style={{ color: "rgba(255,255,255,0.15)" }}>
                    <AlertCircle className="w-14 h-14" />
                    <p className="text-base">{imgError ? "Image failed to load" : "No image URL"}</p>
                    {ad.linkUrl && (
                      <a href={ad.linkUrl} target="_blank" rel="noopener noreferrer"
                        onClick={(e) => handleLinkClick(e, ad.id)}
                        className="flex items-center gap-2 text-sm font-bold px-6 py-3 rounded-2xl"
                        style={{ background: "rgba(139,92,246,0.25)", color: "#c4b5fd", border: "1px solid rgba(139,92,246,0.4)" }}>
                        <ExternalLink className="w-4 h-4" /> Visit Advertiser
                      </a>
                    )}
                  </div>
                )}

                {/* VIDEO — YouTube */}
                {ad.type === "VIDEO" && ad.mediaUrl && isYoutube && (
                  <div className="w-full rounded-2xl overflow-hidden" style={{ aspectRatio: "9/16", maxHeight: "calc(100dvh - 200px)", background: "#000" }}>
                    <iframe
                      src={`https://www.youtube.com/embed/${ytId}?autoplay=1&mute=1&rel=0&modestbranding=1&playsinline=1`}
                      className="w-full h-full border-0"
                      allow="autoplay; encrypted-media"
                      allowFullScreen
                      title="Ad Video"
                    />
                  </div>
                )}

                {/* VIDEO — direct */}
                {ad.type === "VIDEO" && ad.mediaUrl && !isYoutube && (
                  <div className="w-full rounded-2xl overflow-hidden" style={{ background: "#000", maxHeight: "calc(100dvh - 200px)" }}>
                    <video
                      src={ad.mediaUrl}
                      autoPlay
                      muted
                      playsInline
                      className="w-full object-contain"
                      style={{ maxHeight: "calc(100dvh - 200px)", display: "block" }}
                    />
                  </div>
                )}

                {/* VIDEO — no URL */}
                {ad.type === "VIDEO" && !ad.mediaUrl && (
                  <div className="flex flex-col items-center gap-3 py-16" style={{ color: "rgba(255,255,255,0.15)" }}>
                    <AlertCircle className="w-12 h-12" />
                    <p>No video URL set</p>
                  </div>
                )}

                {/* HTML */}
                {ad.type === "HTML" && ad.htmlContent && (
                  <div className="w-full rounded-2xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.08)", height: "calc(100dvh - 220px)" }}>
                    <iframe
                      srcDoc={ad.htmlContent}
                      sandbox="allow-scripts allow-same-origin allow-popups"
                      className="w-full h-full border-0"
                      title="Ad"
                    />
                  </div>
                )}
              </div>

              {/* ─── BOTTOM BAR ─── */}
              <div className="shrink-0 px-4 pb-safe pb-6 pt-3 space-y-3">

                {/* Ad title (if set) */}
                {ad.title && (
                  <p className="text-center text-sm font-semibold text-white/60 truncate">{ad.title}</p>
                )}

                {/* Visit link (for non-image types) */}
                {ad.linkUrl && ad.type !== "IMAGE" && (
                  <a href={ad.linkUrl} target="_blank" rel="noopener noreferrer"
                    onClick={(e) => handleLinkClick(e, ad.id)}
                    className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl text-sm font-bold"
                    style={{ background: "rgba(139,92,246,0.15)", border: "1px solid rgba(139,92,246,0.3)", color: "#c4b5fd" }}>
                    <ExternalLink className="w-4 h-4" /> Visit Advertiser
                  </a>
                )}

                {/* Progress bar */}
                <div className="relative h-1 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
                  <motion.div
                    className="absolute inset-y-0 left-0 rounded-full"
                    style={{ background: done ? "#34d399" : "linear-gradient(90deg, #7C3AED, #A78BFA)" }}
                    animate={{ width: `${progress * 100}%` }}
                    transition={{ duration: 0.9, ease: "linear" }}
                  />
                </div>

                {/* CTA button */}
                <button
                  onClick={handleCtaClick}
                  disabled={!done}
                  className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl text-base font-bold transition-all"
                  style={done
                    ? {
                        background: "linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%)",
                        color: "#fff",
                        cursor: "pointer",
                        boxShadow: "0 8px 32px rgba(124,58,237,0.45)",
                      }
                    : {
                        background: "rgba(255,255,255,0.05)",
                        color: "rgba(255,255,255,0.2)",
                        cursor: "not-allowed",
                        border: "1px solid rgba(255,255,255,0.06)",
                      }
                  }
                >
                  {done ? (
                    <><X className="w-5 h-5" /> Close Ad &amp; Continue</>
                  ) : (
                    <><Wifi className="w-4 h-4 opacity-30" /> Please wait {countdown} second{countdown !== 1 ? "s" : ""}…</>
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
