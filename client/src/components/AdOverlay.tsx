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
  const [shakeWarning, setShakeWarning] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const trackedRef = useRef(false);

  // ── Anti-bypass: block all escape routes while ad is open ──
  useEffect(() => {
    if (!open) return;

    // 1. Block scroll on body
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // 2. Block right-click (context menu)
    const blockContext = (e: MouseEvent) => e.preventDefault();
    document.addEventListener("contextmenu", blockContext);

    // 3. Block keyboard shortcuts (F12, Ctrl+Shift+I/J/C/U, Ctrl+S)
    const blockKeys = (e: KeyboardEvent) => {
      if (e.key === "F12") { e.preventDefault(); e.stopPropagation(); return; }
      if (e.ctrlKey && e.shiftKey && ["I","i","J","j","C","c"].includes(e.key)) {
        e.preventDefault(); e.stopPropagation(); return;
      }
      if (e.ctrlKey && ["u","U","s","S"].includes(e.key)) {
        e.preventDefault(); e.stopPropagation(); return;
      }
    };
    document.addEventListener("keydown", blockKeys, true);

    // 4. Block touch swipe / pull-to-refresh
    const blockTouch = (e: TouchEvent) => e.preventDefault();
    document.addEventListener("touchmove", blockTouch, { passive: false });

    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener("contextmenu", blockContext);
      document.removeEventListener("keydown", blockKeys, true);
      document.removeEventListener("touchmove", blockTouch);
    };
  }, [open]);

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
  const needsLinkFirst = done && ad?.forceRedirect && !linkVisited;

  const handleClose = () => {
    if (!done) return;
    if (needsLinkFirst) {
      setShakeWarning(true);
      setTimeout(() => setShakeWarning(false), 700);
      return;
    }
    onComplete();
  };
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
          className="fixed inset-0 z-[9999] flex items-stretch md:items-center justify-center overflow-hidden"
          style={{ background: "rgba(0,0,0,0.92)", userSelect: "none", pointerEvents: "all" }}
        >
          {/* Card — full screen on mobile, centered card on desktop */}
          <div
            className="relative w-full h-full md:h-[88vh] md:max-w-[480px] md:rounded-2xl flex flex-col overflow-hidden"
            style={{
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
                    <CloseBtn done={done} needsLinkFirst={needsLinkFirst} onClick={handleClose} />
                  </div>
                </div>
                <div className="flex-1 min-h-0">
                  <iframe srcDoc={ad.htmlContent} sandbox="allow-scripts allow-same-origin allow-popups"
                    className="w-full h-full border-0" title="Ad" />
                </div>
              </>
            ) : (
              <>
                {/* TOP BAR — fixed at very top */}
                <div className="flex items-center justify-between px-5 pt-5 pb-4 shrink-0"
                  style={{ background: "rgba(255,255,255,0.04)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                  <span className="text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full"
                    style={{ background: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.5)", border: "1px solid rgba(255,255,255,0.12)" }}>
                    Ad
                  </span>
                  <div className="flex items-center gap-3">
                    <CountdownPill done={done} countdown={countdown} />
                    <CloseBtn done={done} needsLinkFirst={needsLinkFirst} onClick={handleClose} />
                  </div>
                </div>

                {/* REMAINING HEIGHT — split into 3 zones + button */}
                <div className="flex-1 min-h-0 flex flex-col">

                  {/* ZONE 1 — Logo + Title: shares remaining space with description */}
                  <div className="flex-1 flex items-center justify-center px-6"
                    style={{ background: "rgba(255,255,255,0.025)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                    {!loading && ad && (
                      <div className="flex items-center gap-4 w-full">
                        {ad.logoUrl ? (
                          <img src={ad.logoUrl} alt="logo"
                            className="rounded-2xl object-cover shrink-0"
                            style={{ width: "68px", height: "68px", border: "1px solid rgba(255,255,255,0.12)", boxShadow: "0 4px 24px rgba(0,0,0,0.6)" }}
                            onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
                          />
                        ) : (
                          <div className="rounded-2xl shrink-0 flex items-center justify-center font-black text-2xl"
                            style={{ width: "68px", height: "68px", background: "linear-gradient(135deg, #6d28d9, #4c1d95)", border: "1px solid rgba(139,92,246,0.4)", color: "#e9d5ff", boxShadow: "0 4px 24px rgba(109,40,217,0.4)" }}>
                            {(ad.title || "A").charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-xl font-bold text-white leading-tight">{ad.title || "Advertisement"}</p>
                          {ad.linkUrl && (
                            <p className="text-sm mt-1.5 flex items-center gap-1.5" style={{ color: "rgba(255,255,255,0.4)" }}>
                              <ExternalLink className="w-3.5 h-3.5" />
                              {(() => { try { return new URL(ad.linkUrl).hostname; } catch { return ad.linkUrl; } })()}
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* ZONE 2 — exact 16:9 media */}
                  <div className="shrink-0 w-full relative overflow-hidden"
                    style={{ aspectRatio: "16/9", background: "#000" }}>
                    {loading && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-10 h-10 border-2 border-white/20 border-t-white/70 rounded-full animate-spin" />
                      </div>
                    )}
                    {!loading && ad?.type === "IMAGE" && ad?.mediaUrl && !imgError && (
                      <img src={ad.mediaUrl} alt="Ad"
                        className="absolute inset-0 w-full h-full object-contain block"
                        onError={() => setImgError(true)}
                      />
                    )}
                    {!loading && ad?.type === "IMAGE" && (imgError || !ad?.mediaUrl) && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3" style={{ color: "rgba(255,255,255,0.18)" }}>
                        <AlertCircle className="w-14 h-14" />
                        <p className="text-base">{imgError ? "Image failed to load" : "No image URL"}</p>
                      </div>
                    )}
                    {!loading && ad?.type === "VIDEO" && ad?.mediaUrl && ytId && (
                      <iframe
                        src={`https://www.youtube.com/embed/${ytId}?autoplay=1&mute=0&rel=0&modestbranding=1&playsinline=1`}
                        className="absolute inset-0 w-full h-full border-0"
                        allow="autoplay; encrypted-media"
                        allowFullScreen
                        title="Ad Video"
                      />
                    )}
                    {!loading && ad?.type === "VIDEO" && ad?.mediaUrl && !ytId && (
                      <video src={ad.mediaUrl} autoPlay playsInline
                        className="absolute inset-0 w-full h-full object-contain block" />
                    )}
                    {!loading && ad?.type === "VIDEO" && !ad?.mediaUrl && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3" style={{ color: "rgba(255,255,255,0.18)" }}>
                        <Play className="w-14 h-14" />
                        <p className="text-base">No video URL</p>
                      </div>
                    )}
                  </div>

                  {/* ZONE 3 — Description: scrollable when text is long */}
                  <div className="flex-1 min-h-0 overflow-y-auto px-8 py-4 text-center"
                    style={{ background: "rgba(15,10,30,0.98)", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                    {!loading && ad?.description && (
                      <p className="text-base font-semibold text-white/90 leading-relaxed">{ad.description}</p>
                    )}
                  </div>

                  {/* BUTTON — pinned at bottom, always visible */}
                  {!loading && ad && (
                    <div className="shrink-0 px-6 pb-8 pt-4 space-y-3"
                      style={{ background: "rgba(10,7,22,0.98)", borderTop: "1px solid rgba(255,255,255,0.05)" }}>

                      {/* Force redirect prominent warning — shake animation on X click */}
                      {done && needsLinkFirst && (
                        <div
                          className={`flex items-center gap-3 px-4 py-3 rounded-2xl ${shakeWarning ? "animate-[shake_0.5s_ease-in-out]" : ""}`}
                          style={{
                            background: "rgba(239,68,68,0.12)",
                            border: "1px solid rgba(239,68,68,0.45)",
                          }}
                        >
                          <span className="text-2xl shrink-0">⚠️</span>
                          <div className="flex-1">
                            <p className="text-sm font-bold" style={{ color: "#fca5a5" }}>
                              Pehle neeche button pe click karo!
                            </p>
                            <p className="text-xs mt-0.5" style={{ color: "rgba(252,165,165,0.65)" }}>
                              Ad close karne ke liye link visit karna zaruri hai
                            </p>
                          </div>
                        </div>
                      )}

                      {done && linkVisited && ad.forceRedirect && (
                        <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl"
                          style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.3)" }}>
                          <span className="text-lg">✅</span>
                          <p className="text-xs font-bold text-emerald-400">Ab ✕ button se ad band kar sakte ho</p>
                        </div>
                      )}

                      <button
                        onClick={handleCta}
                        className="w-full flex items-center justify-center gap-2.5 font-bold transition-all"
                        style={{
                          height: "60px",
                          borderRadius: "30px",
                          fontSize: "17px",
                          letterSpacing: "0.01em",
                          background: "linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)",
                          color: "#ffffff",
                          cursor: "pointer",
                          boxShadow: "0 8px 32px rgba(124,58,237,0.55), 0 2px 8px rgba(0,0,0,0.4)",
                          border: "none",
                        }}
                      >
                        <ExternalLink className="w-5 h-5" />
                        {ad.linkUrl ? (ad.buttonText || "Learn More") : "Close Ad"}
                      </button>
                    </div>
                  )}

                </div>
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

function CloseBtn({ done, needsLinkFirst, onClick }: { done: boolean; needsLinkFirst: boolean; onClick: () => void }) {
  const canClose = done && !needsLinkFirst;
  return (
    <button
      onClick={onClick}
      title={!done ? "Ad dekho pehle" : needsLinkFirst ? "Pehle link visit karo" : "Close ad"}
      className="w-8 h-8 rounded-full flex items-center justify-center transition-all"
      style={
        !done
          ? { background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.18)", cursor: "not-allowed", border: "1px solid rgba(255,255,255,0.07)" }
          : needsLinkFirst
            ? { background: "rgba(239,68,68,0.18)", color: "#fca5a5", cursor: "pointer", border: "1px solid rgba(239,68,68,0.4)" }
            : { background: "rgba(255,255,255,0.15)", color: "#fff", cursor: "pointer", border: "1px solid rgba(255,255,255,0.2)" }
      }
    >
      <X className="w-3.5 h-3.5" />
    </button>
  );
}
