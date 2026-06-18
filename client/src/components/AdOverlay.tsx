import { useEffect, useState, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, ExternalLink, AlertCircle } from "lucide-react";

export interface Ad {
  id: number;
  title: string;
  type: string;
  mediaUrl: string | null;
  htmlContent: string | null;
  linkUrl: string | null;
  logoUrl: string | null;
  description: string | null;
  buttonText: string | null;
  forceRedirect: boolean;
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
  const [linkVisited, setLinkVisited] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const trackedRef = useRef(false);

  useEffect(() => {
    if (!open) {
      setAd(null);
      setDone(false);
      setCountdown(0);
      setImgError(false);
      setLoading(false);
      setLinkVisited(false);
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
        setLinkVisited(false);
        const dur = fetchedAd.duration || 15;
        setCountdown(dur);
        setDone(false);
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

  // Can user close? 
  // - If forceRedirect: must visit link first
  // - Otherwise: can close after countdown
  const canClose = done && (!ad?.forceRedirect || linkVisited);

  const handleClose = () => {
    if (canClose) onComplete();
  };

  const handleCta = () => {
    if (!ad || !done) return;
    trackClick(ad.id);
    if (ad.linkUrl) {
      window.open(ad.linkUrl, "_blank", "noopener,noreferrer");
      setLinkVisited(true);
      if (!ad.forceRedirect) onComplete();
    } else {
      onComplete();
    }
  };

  const ambientBg = ad?.type === "IMAGE" && ad.mediaUrl && !imgError ? ad.mediaUrl : null;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[9999] overflow-hidden"
          style={{ background: "#0a0710" }}
        >
          {/* ── AMBIENT BACKGROUND (blurred image) ── */}
          {ambientBg && (
            <img
              src={ambientBg}
              alt=""
              aria-hidden
              className="absolute inset-0 w-full h-full object-cover pointer-events-none select-none"
              style={{
                filter: "blur(48px) brightness(0.25) saturate(1.8)",
                transform: "scale(1.15)",
                zIndex: 0,
              }}
            />
          )}
          {/* Dark overlay on top of ambient */}
          <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.3) 40%, rgba(0,0,0,0.75) 100%)", zIndex: 1 }} />

          {/* ── LOADING ── */}
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center" style={{ zIndex: 10 }}>
              <div className="w-8 h-8 border-2 border-white/30 border-t-white/80 rounded-full animate-spin" />
            </div>
          )}

          {/* ── MAIN AD CONTENT ── */}
          {!loading && ad && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="absolute inset-0 flex flex-col"
              style={{ zIndex: 10, maxWidth: "480px", margin: "0 auto", left: 0, right: 0 }}
            >

              {/* ── TOP BAR ── */}
              <div className="flex items-center justify-between px-4 pt-4 pb-2 shrink-0">
                {/* "Ad" label */}
                <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full"
                  style={{ background: "rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.55)", border: "1px solid rgba(255,255,255,0.15)" }}>
                  Ad
                </span>

                <div className="flex items-center gap-2">
                  {/* Countdown pill */}
                  <span className="text-[11px] font-bold px-2.5 py-1 rounded-full"
                    style={done
                      ? { background: "rgba(52,211,153,0.2)", color: "#6ee7b7", border: "1px solid rgba(52,211,153,0.3)" }
                      : { background: "rgba(0,0,0,0.45)", color: "rgba(255,255,255,0.7)", border: "1px solid rgba(255,255,255,0.15)" }
                    }>
                    {done ? "Ad complete" : `Reward in ${countdown}s`}
                  </span>

                  {/* Close button — only if can close */}
                  <button
                    onClick={handleClose}
                    disabled={!canClose}
                    className="w-8 h-8 rounded-full flex items-center justify-center transition-all"
                    style={canClose
                      ? { background: "rgba(255,255,255,0.18)", color: "#fff", cursor: "pointer", border: "1px solid rgba(255,255,255,0.2)" }
                      : { background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.2)", cursor: "not-allowed", border: "1px solid rgba(255,255,255,0.08)" }
                    }
                    title={!canClose && ad.forceRedirect && done ? "You must visit the link first" : ""}
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* HTML type — full screen iframe, no other UI except top bar */}
              {ad.type === "HTML" && ad.htmlContent ? (
                <div className="flex-1 min-h-0 mx-4 mb-4 rounded-2xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.1)" }}>
                  <iframe
                    srcDoc={ad.htmlContent}
                    sandbox="allow-scripts allow-same-origin allow-popups"
                    className="w-full h-full border-0"
                    title="Ad"
                  />
                </div>
              ) : (
                <>
                  {/* ── HEADER: Logo + Title + Subtitle ── */}
                  <div className="flex items-center gap-3 px-4 py-3 shrink-0">
                    {/* Logo */}
                    {ad.logoUrl ? (
                      <img
                        src={ad.logoUrl}
                        alt="logo"
                        className="rounded-xl object-cover shrink-0"
                        style={{ width: "52px", height: "52px", border: "1px solid rgba(255,255,255,0.15)", boxShadow: "0 4px 16px rgba(0,0,0,0.4)" }}
                        onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
                      />
                    ) : (
                      <div className="w-13 h-13 rounded-xl shrink-0 flex items-center justify-center text-2xl font-black"
                        style={{ width: "52px", height: "52px", background: "rgba(139,92,246,0.3)", border: "1px solid rgba(139,92,246,0.4)", color: "#c4b5fd", fontSize: "20px" }}>
                        {(ad.title || "A").charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-base font-bold text-white leading-tight truncate">{ad.title || "Advertisement"}</p>
                      {ad.description && (
                        <p className="text-xs text-white/50 mt-0.5 leading-snug" style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                          {ad.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* ── MAIN MEDIA ── */}
                  <div className="flex-1 min-h-0 px-4 flex items-center justify-center">
                    {/* IMAGE */}
                    {ad.type === "IMAGE" && ad.mediaUrl && !imgError && (
                      <div className="w-full h-full flex items-center justify-center rounded-2xl overflow-hidden"
                        style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.08)" }}>
                        <img
                          src={ad.mediaUrl}
                          alt="Ad"
                          className="w-full h-full object-contain"
                          style={{ maxHeight: "100%", display: "block", borderRadius: "16px" }}
                          onError={() => setImgError(true)}
                        />
                      </div>
                    )}

                    {/* IMAGE error */}
                    {ad.type === "IMAGE" && (imgError || !ad.mediaUrl) && (
                      <div className="flex flex-col items-center gap-3" style={{ color: "rgba(255,255,255,0.2)" }}>
                        <AlertCircle className="w-14 h-14" />
                        <p className="text-sm">{imgError ? "Image failed to load" : "No image URL set"}</p>
                      </div>
                    )}

                    {/* VIDEO — YouTube */}
                    {ad.type === "VIDEO" && ad.mediaUrl && ytId && (
                      <div className="w-full rounded-2xl overflow-hidden" style={{ aspectRatio: "16/9", background: "#000", border: "1px solid rgba(255,255,255,0.08)" }}>
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
                    {ad.type === "VIDEO" && ad.mediaUrl && !ytId && (
                      <div className="w-full rounded-2xl overflow-hidden" style={{ background: "#000", border: "1px solid rgba(255,255,255,0.08)" }}>
                        <video
                          src={ad.mediaUrl}
                          autoPlay
                          muted
                          playsInline
                          className="w-full object-contain"
                          style={{ maxHeight: "45dvh", display: "block" }}
                        />
                      </div>
                    )}

                    {/* VIDEO — no URL */}
                    {ad.type === "VIDEO" && !ad.mediaUrl && (
                      <div className="flex flex-col items-center gap-3" style={{ color: "rgba(255,255,255,0.2)" }}>
                        <AlertCircle className="w-12 h-12" />
                        <p className="text-sm">No video URL set</p>
                      </div>
                    )}
                  </div>

                  {/* ── BOTTOM SECTION ── */}
                  <div className="shrink-0 px-4 pb-6 pt-4 space-y-3">
                    {/* Progress bar */}
                    <div className="relative h-1 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.1)" }}>
                      <motion.div
                        className="absolute inset-y-0 left-0 rounded-full"
                        style={{ background: done ? "#34d399" : "linear-gradient(90deg, #7C3AED, #a78bfa)" }}
                        animate={{ width: `${progress * 100}%` }}
                        transition={{ duration: 0.9, ease: "linear" }}
                      />
                    </div>

                    {/* CTA Button */}
                    {(ad.linkUrl || ad.type !== "HTML") && (
                      <button
                        onClick={handleCta}
                        disabled={!done}
                        className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl text-base font-bold transition-all"
                        style={done
                          ? {
                              background: "linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%)",
                              color: "#fff",
                              cursor: "pointer",
                              boxShadow: "0 8px 32px rgba(124,58,237,0.5)",
                              border: "none",
                            }
                          : {
                              background: "rgba(255,255,255,0.06)",
                              color: "rgba(255,255,255,0.25)",
                              cursor: "not-allowed",
                              border: "1px solid rgba(255,255,255,0.08)",
                            }
                        }
                      >
                        {done ? (
                          <>
                            {ad.linkUrl && <ExternalLink className="w-4 h-4" />}
                            {ad.linkUrl ? (ad.buttonText || "Learn More") : "Close Ad"}
                          </>
                        ) : (
                          `Please wait ${countdown}s…`
                        )}
                      </button>
                    )}

                    {/* Force redirect hint */}
                    {done && ad.forceRedirect && !linkVisited && ad.linkUrl && (
                      <p className="text-center text-[11px] text-white/35">
                        Visit the link above to close this ad
                      </p>
                    )}
                    {done && linkVisited && ad.forceRedirect && (
                      <p className="text-center text-[11px] text-emerald-400/70">
                        ✓ You can now close this ad using the × button
                      </p>
                    )}
                  </div>
                </>
              )}
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
