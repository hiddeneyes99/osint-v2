import { useEffect, useState, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, ExternalLink, AlertCircle, Play } from "lucide-react";

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
      setAd(null); setDone(false); setCountdown(0); setImgError(false);
      setLoading(false); setLinkVisited(false); trackedRef.current = false;
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
        setImgError(false); setLinkVisited(false);
        const dur = fetchedAd.duration || 15;
        setCountdown(dur); setDone(false);
        if (!trackedRef.current) { trackedRef.current = true; trackView(fetchedAd.id); }
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
  const canClose = done && (!ad?.forceRedirect || linkVisited);

  const handleClose = () => { if (canClose) onComplete(); };
  const handleCta = () => {
    if (!ad) return;
    trackClick(ad.id);
    if (ad.linkUrl) {
      window.open(ad.linkUrl, "_blank", "noopener,noreferrer");
      setLinkVisited(true);
      if (!ad.forceRedirect) onComplete();
    } else {
      onComplete();
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-[9999] flex items-stretch justify-center overflow-hidden"
          style={{ background: "rgba(0,0,0,0.92)" }}
        >
          {/* Card — takes full height, max-width phone-style */}
          <div
            className="relative w-full flex flex-col overflow-hidden"
            style={{
              maxWidth: "480px",
              background: "#0d0b18",
            }}
          >
            {/* ───────────── HTML AD ───────────── */}
            {ad?.type === "HTML" && ad.htmlContent ? (
              <>
                {/* Top bar only */}
                <div className="flex items-center justify-between px-4 pt-4 pb-3 shrink-0"
                  style={{ background: "rgba(255,255,255,0.04)", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
                  <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full"
                    style={{ background: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.45)", border: "1px solid rgba(255,255,255,0.12)" }}>
                    Ad
                  </span>
                  <div className="flex items-center gap-2">
                    <CountdownPill done={done} countdown={countdown} />
                    <CloseBtn canClose={canClose} onClick={handleClose} />
                  </div>
                </div>
                <div className="flex-1 min-h-0">
                  <iframe srcDoc={ad.htmlContent} sandbox="allow-scripts allow-same-origin allow-popups"
                    className="w-full h-full border-0" title="Ad" />
                </div>
              </>
            ) : (
              <>
                {/* ═══════════════════════════════════════
                    TOP BAR — "Ad" badge | timer | close
                ═══════════════════════════════════════ */}
                <div className="flex items-center justify-between px-4 pt-4 pb-3 shrink-0"
                  style={{ background: "rgba(255,255,255,0.04)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                  <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full"
                    style={{ background: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.45)", border: "1px solid rgba(255,255,255,0.12)" }}>
                    Ad
                  </span>
                  <div className="flex items-center gap-2">
                    <CountdownPill done={done} countdown={countdown} />
                    <CloseBtn canClose={canClose} onClick={handleClose} />
                  </div>
                </div>

                {/* ═══════════════════════════════════════
                    APP HEADER — Logo + Title
                    (Matches reference: logo left, title right)
                ═══════════════════════════════════════ */}
                {!loading && ad && (
                  <div className="flex items-center gap-3 px-4 py-4 shrink-0"
                    style={{ background: "rgba(255,255,255,0.025)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                    {/* Logo */}
                    {ad.logoUrl ? (
                      <img src={ad.logoUrl} alt="logo"
                        className="rounded-2xl object-cover shrink-0"
                        style={{ width: "56px", height: "56px", border: "1px solid rgba(255,255,255,0.12)", boxShadow: "0 4px 20px rgba(0,0,0,0.5)" }}
                        onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
                      />
                    ) : (
                      <div className="rounded-2xl shrink-0 flex items-center justify-center font-black text-xl"
                        style={{ width: "56px", height: "56px", background: "linear-gradient(135deg, #6d28d9, #4c1d95)", border: "1px solid rgba(139,92,246,0.4)", color: "#e9d5ff", boxShadow: "0 4px 20px rgba(109,40,217,0.4)" }}>
                        {(ad.title || "A").charAt(0).toUpperCase()}
                      </div>
                    )}
                    {/* Title only — description goes below media */}
                    <div className="flex-1 min-w-0">
                      <p className="text-lg font-bold text-white leading-tight">{ad.title || "Advertisement"}</p>
                      {ad.linkUrl && (
                        <p className="text-xs mt-1 flex items-center gap-1"
                          style={{ color: "rgba(255,255,255,0.35)" }}>
                          <ExternalLink className="w-3 h-3" />
                          {(() => { try { return new URL(ad.linkUrl).hostname; } catch { return ad.linkUrl; } })()}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* ═══════════════════════════════════════
                    MAIN MEDIA — flex-1, fills remaining space, no black bars
                ═══════════════════════════════════════ */}
                <div className="relative w-full aspect-video overflow-hidden"
                  style={{ background: "#000" }}>

                  {loading && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-9 h-9 border-2 border-white/20 border-t-white/70 rounded-full animate-spin" />
                    </div>
                  )}

                  {!loading && ad?.type === "IMAGE" && ad.mediaUrl && !imgError && (
                    <img src={ad.mediaUrl} alt="Ad"
                      className="absolute inset-0 w-full h-full object-cover block"
                      onError={() => setImgError(true)}
                    />
                  )}
                  {!loading && ad?.type === "IMAGE" && (imgError || !ad?.mediaUrl) && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3" style={{ color: "rgba(255,255,255,0.18)" }}>
                      <AlertCircle className="w-16 h-16" />
                      <p className="text-sm">{imgError ? "Image failed to load" : "No image URL"}</p>
                    </div>
                  )}

                  {!loading && ad?.type === "VIDEO" && ad.mediaUrl && ytId && (
                    <iframe
                      src={`https://www.youtube.com/embed/${ytId}?autoplay=1&mute=1&rel=0&modestbranding=1&playsinline=1`}
                      className="absolute inset-0 w-full h-full border-0"
                      allow="autoplay; encrypted-media"
                      allowFullScreen
                      title="Ad Video"
                    />
                  )}
                  {!loading && ad?.type === "VIDEO" && ad.mediaUrl && !ytId && (
                    <video src={ad.mediaUrl} autoPlay muted playsInline
                      className="absolute inset-0 w-full h-full object-cover block" />
                  )}
                  {!loading && ad?.type === "VIDEO" && !ad?.mediaUrl && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3" style={{ color: "rgba(255,255,255,0.18)" }}>
                      <Play className="w-16 h-16" />
                      <p className="text-sm">No video URL</p>
                    </div>
                  )}
                </div>

                {/* ═══════════════════════════════════════
                    MIDDLE AREA — Description centered, button pinned bottom
                ═══════════════════════════════════════ */}
                {!loading && ad && (
                  <div className="flex-1 flex flex-col" style={{ background: "rgba(10,7,22,0.98)" }}>
                    {/* Description — right below media, natural height */}
                    {ad.description && (
                      <div className="shrink-0 px-6 py-5 text-center"
                        style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                        <p className="text-sm font-semibold text-white/90 leading-relaxed">{ad.description}</p>
                      </div>
                    )}

                    {/* Spacer — pushes button to bottom */}
                    <div className="flex-1" />

                    {/* CTA Button — pinned to bottom */}
                    <div className="shrink-0 px-4 pb-8 pt-4 space-y-3">
                      <button
                        onClick={handleCta}
                        className="w-full flex items-center justify-center gap-2 font-bold transition-all"
                        style={{
                          height: "54px",
                          borderRadius: "27px",
                          fontSize: "16px",
                          letterSpacing: "0.01em",
                          background: "linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)",
                          color: "#ffffff",
                          cursor: "pointer",
                          boxShadow: "0 8px 32px rgba(124,58,237,0.55), 0 2px 8px rgba(0,0,0,0.4)",
                          border: "none",
                        }}
                      >
                        <ExternalLink className="w-4 h-4" />
                        {ad.linkUrl ? (ad.buttonText || "Learn More") : "Close Ad"}
                      </button>

                      {done && ad.forceRedirect && !linkVisited && ad.linkUrl && (
                        <p className="text-center text-[11px]" style={{ color: "rgba(255,255,255,0.3)" }}>
                          Visit the link above to close this ad
                        </p>
                      )}
                      {done && linkVisited && ad.forceRedirect && (
                        <p className="text-center text-[11px] text-emerald-400/70">
                          ✓ You can now close this ad using the × button
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ── Small shared sub-components ── */

function CountdownPill({ done, countdown }: { done: boolean; countdown: number }) {
  return (
    <span className="text-[11px] font-bold px-3 py-1.5 rounded-full"
      style={done
        ? { background: "rgba(52,211,153,0.15)", color: "#6ee7b7", border: "1px solid rgba(52,211,153,0.25)" }
        : { background: "rgba(0,0,0,0.5)", color: "rgba(255,255,255,0.65)", border: "1px solid rgba(255,255,255,0.12)" }
      }>
      {done ? "Ad complete" : `Reward in ${countdown}s`}
    </span>
  );
}

function CloseBtn({ canClose, onClick }: { canClose: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      disabled={!canClose}
      title={!canClose ? "Watch the ad to close" : "Close ad"}
      className="w-8 h-8 rounded-full flex items-center justify-center transition-all"
      style={canClose
        ? { background: "rgba(255,255,255,0.15)", color: "#fff", cursor: "pointer", border: "1px solid rgba(255,255,255,0.2)" }
        : { background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.18)", cursor: "not-allowed", border: "1px solid rgba(255,255,255,0.07)" }
      }
    >
      <X className="w-3.5 h-3.5" />
    </button>
  );
}
