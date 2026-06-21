import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { X, Radio, Zap, Info, TriangleAlert, RefreshCw, ChevronDown, ExternalLink, ArrowRight } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

const TYPE_CONFIG: Record<string, {
  accent: string; glow: string; bg: string; border: string;
  badgeBg: string; badgeBorder: string; dot: string;
  barGradient: string; btnGradient: string; btnGlow: string;
  Icon: React.ElementType; label: string; tag: string;
}> = {
  INFO:    {
    accent: "#A78BFA", glow: "0 0 40px rgba(139,92,246,0.3), 0 24px 60px rgba(0,0,0,0.7)",
    bg: "linear-gradient(145deg, rgba(13,7,36,0.98) 0%, rgba(7,4,22,0.99) 100%)",
    border: "rgba(139,92,246,0.3)", badgeBg: "rgba(139,92,246,0.15)", badgeBorder: "rgba(139,92,246,0.35)",
    dot: "#A78BFA", barGradient: "linear-gradient(90deg, #7C3AED, #A78BFA, #C4B5FD, transparent)",
    btnGradient: "linear-gradient(135deg, #7C3AED, #8B5CF6, #A78BFA)",
    btnGlow: "0 0 18px rgba(139,92,246,0.5)", Icon: Info, label: "Platform Broadcast", tag: "INFO",
  },
  WARNING: {
    accent: "#FCD34D", glow: "0 0 40px rgba(251,191,36,0.18), 0 24px 60px rgba(0,0,0,0.7)",
    bg: "linear-gradient(145deg, rgba(13,9,2,0.98) 0%, rgba(7,4,22,0.99) 100%)",
    border: "rgba(251,191,36,0.25)", badgeBg: "rgba(251,191,36,0.1)", badgeBorder: "rgba(251,191,36,0.3)",
    dot: "#FCD34D", barGradient: "linear-gradient(90deg, #D97706, #FCD34D, #FDE68A, transparent)",
    btnGradient: "linear-gradient(135deg, #B45309, #D97706, #F59E0B)",
    btnGlow: "0 0 18px rgba(245,158,11,0.45)", Icon: TriangleAlert, label: "Warning Notice", tag: "WARNING",
  },
  ALERT:   {
    accent: "#F87171", glow: "0 0 40px rgba(239,68,68,0.22), 0 24px 60px rgba(0,0,0,0.7)",
    bg: "linear-gradient(145deg, rgba(14,3,3,0.98) 0%, rgba(7,4,22,0.99) 100%)",
    border: "rgba(239,68,68,0.25)", badgeBg: "rgba(239,68,68,0.1)", badgeBorder: "rgba(239,68,68,0.3)",
    dot: "#F87171", barGradient: "linear-gradient(90deg, #991B1B, #F87171, #FCA5A5, transparent)",
    btnGradient: "linear-gradient(135deg, #991B1B, #DC2626, #EF4444)",
    btnGlow: "0 0 18px rgba(239,68,68,0.45)", Icon: Zap, label: "Critical Alert", tag: "ALERT",
  },
  FLASH:   {
    accent: "#FB923C", glow: "0 0 40px rgba(251,146,60,0.18), 0 24px 60px rgba(0,0,0,0.7)",
    bg: "linear-gradient(145deg, rgba(13,6,2,0.98) 0%, rgba(7,4,22,0.99) 100%)",
    border: "rgba(251,146,60,0.25)", badgeBg: "rgba(251,146,60,0.1)", badgeBorder: "rgba(251,146,60,0.3)",
    dot: "#FB923C", barGradient: "linear-gradient(90deg, #C2410C, #FB923C, #FDBA74, transparent)",
    btnGradient: "linear-gradient(135deg, #C2410C, #EA580C, #F97316)",
    btnGlow: "0 0 18px rgba(249,115,22,0.45)", Icon: Radio, label: "Flash Report", tag: "FLASH",
  },
  UPDATE:  {
    accent: "#34D399", glow: "0 0 40px rgba(52,211,153,0.18), 0 24px 60px rgba(0,0,0,0.7)",
    bg: "linear-gradient(145deg, rgba(2,13,9,0.98) 0%, rgba(7,4,22,0.99) 100%)",
    border: "rgba(52,211,153,0.25)", badgeBg: "rgba(52,211,153,0.1)", badgeBorder: "rgba(52,211,153,0.3)",
    dot: "#34D399", barGradient: "linear-gradient(90deg, #065F46, #34D399, #6EE7B7, transparent)",
    btnGradient: "linear-gradient(135deg, #065F46, #059669, #10B981)",
    btnGlow: "0 0 18px rgba(16,185,129,0.45)", Icon: RefreshCw, label: "System Update", tag: "UPDATE",
  },
};

const getCfg = (type: string) => TYPE_CONFIG[type] || TYPE_CONFIG.INFO;

const getYouTubeEmbedUrl = (url: string) => {
  try {
    if (url.includes("youtu.be/")) {
      const id = url.split("youtu.be/")[1]?.split("?")[0]?.split("&")[0];
      return `https://www.youtube.com/embed/${id}`;
    }
    const match = url.match(/[?&]v=([^&]+)/);
    return match ? `https://www.youtube.com/embed/${match[1]}` : url;
  } catch { return url; }
};

/* Static gradient bar — no infinite JS animation */
function StaticBar({ gradient }: { gradient: string }) {
  return <div className="h-0.5 w-full" style={{ background: gradient }} />;
}

/* Static icon badge — no infinite animations */
function IconBadge({ cfg, size = 20, boxSize = 44 }: { cfg: typeof TYPE_CONFIG[string]; size?: number; boxSize?: number }) {
  return (
    <div
      className="relative shrink-0 flex items-center justify-center rounded-2xl"
      style={{
        width: boxSize, height: boxSize,
        background: cfg.badgeBg,
        border: `1px solid ${cfg.badgeBorder}`,
        boxShadow: `0 0 14px ${cfg.accent}33`,
      }}
    >
      <cfg.Icon size={size} style={{ color: cfg.accent }} />
    </div>
  );
}

function playNotificationSound() {
  try {
    const ctx = new AudioContext();
    const playTone = (freq: number, startTime: number, duration: number, gainPeak: number, type: OscillatorType = "sine") => {
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      osc.connect(gainNode);
      gainNode.connect(ctx.destination);
      osc.type = type;
      osc.frequency.setValueAtTime(freq, startTime);
      gainNode.gain.setValueAtTime(0, startTime);
      gainNode.gain.linearRampToValueAtTime(gainPeak, startTime + 0.025);
      gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
      osc.start(startTime);
      osc.stop(startTime + duration + 0.05);
    };
    const t = ctx.currentTime;
    playTone(330, t,        0.18, 0.18, "sine");
    playTone(523, t + 0.13, 0.22, 0.15, "sine");
    playTone(659, t + 0.26, 0.38, 0.12, "sine");
    playTone(880, t + 0.36, 0.55, 0.08, "sine");
  } catch {}
}

export function BroadcastNotifications() {
  const [location] = useLocation();
  const queryClient = useQueryClient();

  const [dismissed, setDismissed] = useState<Set<number>>(new Set());
  const [expanded, setExpanded] = useState<Set<number>>(new Set());
  const [seenIds, setSeenIds] = useState<Set<number>>(() => {
    try {
      const stored = sessionStorage.getItem("seenBroadcastIds");
      return stored ? new Set(JSON.parse(stored)) : new Set<number>();
    } catch { return new Set<number>(); }
  });
  const [modalOpen, setModalOpen] = useState(false);
  const [modalIdx, setModalIdx] = useState(0);
  const [viewingId, setViewingId] = useState<number | null>(null);
  const { data: broadcasts = [] } = useQuery<any[]>({
    queryKey: ["/api/broadcasts"],
    refetchInterval: 10000,
  });

  const prevBroadcastIdsRef = useRef<Set<number>>(new Set());
  useEffect(() => {
    const currentIds = new Set(broadcasts.map((b: any) => b.id));
    const hasNew = broadcasts.some((b: any) => !prevBroadcastIdsRef.current.has(b.id));
    prevBroadcastIdsRef.current = currentIds;
    if (hasNew) {
      const unseen = broadcasts.filter((b: any) => !seenIds.has(b.id));
      if (unseen.length > 0 && !modalOpen) {
        setModalIdx(0);
        setModalOpen(true);
        playNotificationSound();
      }
    }
  }, [broadcasts]);

  useEffect(() => {
    if (!modalOpen) return;
    const target = viewingId ?? broadcasts[modalIdx]?.id;
    if (target && !broadcasts.find((b: any) => b.id === target)) {
      setModalOpen(false);
      setViewingId(null);
    }
  }, [broadcasts, modalOpen, viewingId, modalIdx]);

  if (location === "/admin" || location === "/secret") return null;

  const unseenBroadcasts = broadcasts.filter((b: any) => !seenIds.has(b.id));
  const currentModal = viewingId
    ? broadcasts.find((b: any) => b.id === viewingId)
    : unseenBroadcasts[modalIdx];

  const markSeen = (id: number) => {
    setSeenIds(prev => {
      const next = new Set([...prev, id]);
      try { sessionStorage.setItem("seenBroadcastIds", JSON.stringify([...next])); } catch {}
      return next;
    });
  };

  const closeModal = () => {
    if (!viewingId) unseenBroadcasts.forEach((b: any) => markSeen(b.id));
    setModalOpen(false);
    setViewingId(null);
  };

  const nextModal = () => {
    if (viewingId) { setModalOpen(false); setViewingId(null); return; }
    if (currentModal) markSeen(currentModal.id);
    if (modalIdx < unseenBroadcasts.length - 1) setModalIdx(i => i + 1);
    else setModalOpen(false);
  };

  const toggleExpand = (id: number) =>
    setExpanded(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const dismiss = (id: number) =>
    setDismissed(prev => new Set([...prev, id]));

  const visibleCards = broadcasts.filter((b: any) => !dismissed.has(b.id));

  return (
    <>
      {/* ── MODAL ── */}
      <AnimatePresence>
        {modalOpen && currentModal && (() => {
          const b = currentModal;
          const cfg = getCfg(b.type);
          const isLast = modalIdx >= unseenBroadcasts.length - 1;

          return (
            <motion.div
              key="modal-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.22 }}
              className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
              style={{ background: "rgba(3,1,14,0.92)" }}
              onClick={closeModal}
            >
              {/* Modal card — simplified entry (no rotateX, no blur filter) */}
              <motion.div
                key={b.id}
                initial={{ opacity: 0, scale: 0.88, y: 40 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.92, y: -20 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                onClick={e => e.stopPropagation()}
                className="relative w-full max-w-md overflow-hidden rounded-3xl"
                style={{
                  background: cfg.bg,
                  border: `1px solid ${cfg.border}`,
                  boxShadow: cfg.glow,
                }}
              >
                {/* Inner radial glow — CSS only, no JS */}
                <div className="absolute inset-0 rounded-3xl pointer-events-none"
                  style={{ background: `radial-gradient(ellipse 70% 35% at 50% 0%, ${cfg.accent}10 0%, transparent 70%)` }} />

                <div className="relative">
                  <StaticBar gradient={cfg.barGradient} />

                  {/* Header */}
                  <div className="flex items-center gap-3.5 px-6 pt-5 pb-4" style={{ borderBottom: `1px solid ${cfg.border}` }}>
                    <IconBadge cfg={cfg} size={20} boxSize={44} />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="relative flex h-1.5 w-1.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-60" style={{ background: cfg.dot }} />
                          <span className="relative inline-flex rounded-full h-1.5 w-1.5" style={{ background: cfg.dot }} />
                        </span>
                        <span className="text-[10px] font-bold tracking-widest uppercase" style={{ color: cfg.accent }}>
                          {cfg.label}{unseenBroadcasts.length > 1 ? ` · ${modalIdx + 1} / ${unseenBroadcasts.length}` : ""}
                        </span>
                      </div>
                      {b.title && b.title !== "SYSTEM BROADCAST" && (
                        <p className="text-[15px] font-bold text-white leading-tight">{b.title}</p>
                      )}
                    </div>

                    <button
                      onClick={closeModal}
                      className="shrink-0 w-8 h-8 flex items-center justify-center rounded-xl cursor-pointer transition-colors hover:bg-white/10"
                      style={{ color: "rgba(255,255,255,0.35)", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                      <X size={14} />
                    </button>
                  </div>

                  {/* Body */}
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1, duration: 0.28 }}
                    className="px-6 py-5 space-y-4"
                  >
                    {b.mediaUrl && (
                      <div
                        className="rounded-2xl overflow-hidden"
                        style={{ border: `1px solid ${cfg.border}` }}>
                        {b.mediaType === "IMAGE" && <img src={b.mediaUrl} alt="broadcast" className="w-full max-h-56 object-cover" style={{ background: "rgba(0,0,0,0.4)" }} />}
                        {b.mediaType === "VIDEO" && <video src={b.mediaUrl} controls playsInline className="w-full max-h-56 bg-black" />}
                        {b.mediaType === "YOUTUBE" && (
                          <iframe src={getYouTubeEmbedUrl(b.mediaUrl)} className="w-full h-52"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen />
                        )}
                      </div>
                    )}
                    <p className="text-base font-medium leading-relaxed" style={{ color: "rgba(255,255,255,0.85)" }}>
                      {b.message}
                    </p>
                  </motion.div>

                  {/* Footer */}
                  <div
                    className="flex items-center justify-center gap-3 px-6 pb-5 pt-4"
                    style={{ borderTop: `1px solid ${cfg.border}` }}>
                    {b.actionLink ? (
                      <a
                        href={b.actionLink} target="_blank" rel="noopener noreferrer"
                        onClick={nextModal}
                        className="flex items-center gap-2.5 text-sm font-bold px-10 py-4 rounded-2xl cursor-pointer text-white select-none transition-opacity hover:opacity-90 active:opacity-75"
                        style={{
                          background: cfg.btnGradient,
                          letterSpacing: "0.04em",
                          boxShadow: cfg.btnGlow,
                        }}
                      >
                        <ExternalLink size={15} />
                        {b.buttonText || "Learn More"}
                      </a>
                    ) : (
                      <button
                        onClick={nextModal}
                        className="flex items-center gap-2.5 text-sm font-bold px-10 py-4 rounded-2xl cursor-pointer text-white select-none transition-opacity hover:opacity-90 active:opacity-75"
                        style={{
                          background: cfg.btnGradient,
                          letterSpacing: "0.04em",
                          boxShadow: cfg.btnGlow,
                        }}
                      >
                        {isLast ? <><span className="text-base">✓</span> Got it</> : <>Next <ArrowRight size={14} /></>}
                      </button>
                    )}
                  </div>

                  <StaticBar gradient={`linear-gradient(90deg, transparent, ${cfg.accent}44, transparent)`} />
                </div>
              </motion.div>
            </motion.div>
          );
        })()}
      </AnimatePresence>

      {/* ── FLOATING NOTIFICATION CARDS ── */}
      <div className="fixed bottom-24 lg:bottom-5 right-5 z-[9998] flex flex-col-reverse gap-2.5 items-end pointer-events-none">
        <AnimatePresence initial={false}>
          {visibleCards.map((b: any, cardIdx: number) => {
            const cfg = getCfg(b.type);
            const { Icon } = cfg;
            const isExpanded = expanded.has(b.id);

            return (
              <motion.div
                key={b.id}
                initial={{ opacity: 0, x: 60, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 60, scale: 0.9 }}
                transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1], delay: cardIdx * 0.04 }}
                className="pointer-events-auto relative overflow-hidden rounded-2xl"
                style={{
                  width: isExpanded ? 320 : "auto",
                  maxWidth: "calc(100vw - 2.5rem)",
                  background: "linear-gradient(145deg, rgba(13,7,36,0.97) 0%, rgba(7,4,22,0.98) 100%)",
                  border: `1px solid ${cfg.border}`,
                  boxShadow: `0 4px 24px rgba(0,0,0,0.5), 0 0 14px ${cfg.accent}18`,
                }}
              >
                <StaticBar gradient={cfg.barGradient} />

                {/* Card row */}
                <div
                  className="relative flex items-center gap-2.5 px-3.5 py-3 cursor-pointer select-none"
                  onClick={() => toggleExpand(b.id)} role="button" tabIndex={0}
                  onKeyDown={e => e.key === "Enter" && toggleExpand(b.id)}
                >
                  {/* Static icon badge */}
                  <div
                    className="flex items-center justify-center w-8 h-8 rounded-xl shrink-0"
                    style={{ background: cfg.badgeBg, border: `1px solid ${cfg.badgeBorder}` }}
                  >
                    <Icon size={14} style={{ color: cfg.accent }} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-[9px] font-bold tracking-widest uppercase mb-0.5" style={{ color: cfg.accent }}>{cfg.tag}</p>
                    <p className="text-[11px] font-semibold text-white/80 truncate leading-none">
                      {b.title && b.title !== "SYSTEM BROADCAST" ? b.title : b.message}
                    </p>
                  </div>

                  {/* Live dot */}
                  <span className="relative flex h-1.5 w-1.5 shrink-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-50" style={{ background: cfg.dot }} />
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5" style={{ background: cfg.dot }} />
                  </span>

                  <span
                    className="transition-transform duration-200"
                    style={{
                      color: "rgba(255,255,255,0.25)",
                      display: "flex",
                      transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
                    }}>
                    <ChevronDown size={13} />
                  </span>

                  <button
                    onClick={e => { e.stopPropagation(); dismiss(b.id); }}
                    className="shrink-0 w-6 h-6 flex items-center justify-center rounded-lg ml-0.5 cursor-pointer transition-colors hover:text-white/80"
                    style={{ color: "rgba(255,255,255,0.2)" }}
                    aria-label="Dismiss">
                    <X size={11} />
                  </button>
                </div>

                {/* Expanded content */}
                <AnimatePresence initial={false}>
                  {isExpanded && (
                    <motion.div key="expand"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                      className="overflow-hidden">
                      <div style={{ borderTop: `1px solid ${cfg.border}` }}>
                        <div className="px-4 py-3 space-y-2.5">
                          {b.title && b.title !== "SYSTEM BROADCAST" && (
                            <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: cfg.accent }}>{b.title}</p>
                          )}
                          <p className="text-[12px] text-white/65 leading-relaxed">{b.message}</p>
                          {b.mediaUrl && (
                            <div className="rounded-xl overflow-hidden" style={{ border: `1px solid ${cfg.border}` }}>
                              {b.mediaType === "IMAGE" && <img src={b.mediaUrl} alt="" className="w-full max-h-36 object-contain" style={{ background: "rgba(0,0,0,0.4)" }} />}
                              {b.mediaType === "VIDEO" && <video src={b.mediaUrl} controls playsInline className="w-full max-h-36 bg-black" />}
                              {b.mediaType === "YOUTUBE" && <iframe src={getYouTubeEmbedUrl(b.mediaUrl)} className="w-full h-40" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen />}
                            </div>
                          )}
                        </div>

                        <div
                          className="flex items-center justify-between gap-2 px-4 py-3"
                          style={{ borderTop: `1px solid ${cfg.border}` }}>
                          <button
                            onClick={() => dismiss(b.id)}
                            className="text-[10px] font-semibold px-3 py-1.5 rounded-xl cursor-pointer transition-colors hover:text-white/60"
                            style={{ color: "rgba(255,255,255,0.32)", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
                            Dismiss
                          </button>
                          {b.actionLink ? (
                            <a
                              href={b.actionLink} target="_blank" rel="noopener noreferrer"
                              className="flex items-center gap-1.5 text-[10px] font-bold px-4 py-1.5 rounded-xl text-white cursor-pointer transition-opacity hover:opacity-85"
                              style={{ background: cfg.btnGradient, boxShadow: `0 0 10px ${cfg.accent}44` }}
                            >
                              <ExternalLink size={9} />
                              {b.buttonText || "Learn More"}
                            </a>
                          ) : <span />}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </>
  );
}
