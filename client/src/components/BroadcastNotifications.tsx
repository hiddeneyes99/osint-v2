import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence, useAnimationControls } from "framer-motion";
import { X, Radio, Zap, Info, TriangleAlert, RefreshCw, ChevronDown, ChevronUp, ExternalLink, ArrowRight } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

const TYPE_CONFIG: Record<string, {
  accent: string; glow: string; bg: string; border: string;
  badgeBg: string; badgeBorder: string; dot: string;
  barGradient: string; btnGradient: string; btnGlow: string;
  Icon: React.ElementType; label: string; tag: string;
}> = {
  INFO:    {
    accent: "#A78BFA", glow: "0 0 60px rgba(139,92,246,0.35), 0 32px 80px rgba(0,0,0,0.7)",
    bg: "linear-gradient(145deg, rgba(13,7,36,0.98) 0%, rgba(7,4,22,0.99) 100%)",
    border: "rgba(139,92,246,0.3)", badgeBg: "rgba(139,92,246,0.15)", badgeBorder: "rgba(139,92,246,0.35)",
    dot: "#A78BFA", barGradient: "linear-gradient(90deg, #7C3AED, #A78BFA, #C4B5FD, transparent)",
    btnGradient: "linear-gradient(135deg, #7C3AED, #8B5CF6, #A78BFA)",
    btnGlow: "0 0 24px rgba(139,92,246,0.6)", Icon: Info, label: "Platform Broadcast", tag: "INFO",
  },
  WARNING: {
    accent: "#FCD34D", glow: "0 0 60px rgba(251,191,36,0.2), 0 32px 80px rgba(0,0,0,0.7)",
    bg: "linear-gradient(145deg, rgba(13,9,2,0.98) 0%, rgba(7,4,22,0.99) 100%)",
    border: "rgba(251,191,36,0.25)", badgeBg: "rgba(251,191,36,0.1)", badgeBorder: "rgba(251,191,36,0.3)",
    dot: "#FCD34D", barGradient: "linear-gradient(90deg, #D97706, #FCD34D, #FDE68A, transparent)",
    btnGradient: "linear-gradient(135deg, #B45309, #D97706, #F59E0B)",
    btnGlow: "0 0 24px rgba(245,158,11,0.5)", Icon: TriangleAlert, label: "Warning Notice", tag: "WARNING",
  },
  ALERT:   {
    accent: "#F87171", glow: "0 0 60px rgba(239,68,68,0.25), 0 32px 80px rgba(0,0,0,0.7)",
    bg: "linear-gradient(145deg, rgba(14,3,3,0.98) 0%, rgba(7,4,22,0.99) 100%)",
    border: "rgba(239,68,68,0.25)", badgeBg: "rgba(239,68,68,0.1)", badgeBorder: "rgba(239,68,68,0.3)",
    dot: "#F87171", barGradient: "linear-gradient(90deg, #991B1B, #F87171, #FCA5A5, transparent)",
    btnGradient: "linear-gradient(135deg, #991B1B, #DC2626, #EF4444)",
    btnGlow: "0 0 24px rgba(239,68,68,0.5)", Icon: Zap, label: "Critical Alert", tag: "ALERT",
  },
  FLASH:   {
    accent: "#FB923C", glow: "0 0 60px rgba(251,146,60,0.2), 0 32px 80px rgba(0,0,0,0.7)",
    bg: "linear-gradient(145deg, rgba(13,6,2,0.98) 0%, rgba(7,4,22,0.99) 100%)",
    border: "rgba(251,146,60,0.25)", badgeBg: "rgba(251,146,60,0.1)", badgeBorder: "rgba(251,146,60,0.3)",
    dot: "#FB923C", barGradient: "linear-gradient(90deg, #C2410C, #FB923C, #FDBA74, transparent)",
    btnGradient: "linear-gradient(135deg, #C2410C, #EA580C, #F97316)",
    btnGlow: "0 0 24px rgba(249,115,22,0.5)", Icon: Radio, label: "Flash Report", tag: "FLASH",
  },
  UPDATE:  {
    accent: "#34D399", glow: "0 0 60px rgba(52,211,153,0.2), 0 32px 80px rgba(0,0,0,0.7)",
    bg: "linear-gradient(145deg, rgba(2,13,9,0.98) 0%, rgba(7,4,22,0.99) 100%)",
    border: "rgba(52,211,153,0.25)", badgeBg: "rgba(52,211,153,0.1)", badgeBorder: "rgba(52,211,153,0.3)",
    dot: "#34D399", barGradient: "linear-gradient(90deg, #065F46, #34D399, #6EE7B7, transparent)",
    btnGradient: "linear-gradient(135deg, #065F46, #059669, #10B981)",
    btnGlow: "0 0 24px rgba(16,185,129,0.5)", Icon: RefreshCw, label: "System Update", tag: "UPDATE",
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

/* Animated shimmer bar that sweeps across */
function ShimmerBar({ gradient }: { gradient: string }) {
  return (
    <div className="relative h-0.5 w-full overflow-hidden">
      <div className="absolute inset-0" style={{ background: gradient }} />
      <motion.div
        className="absolute inset-y-0 w-24"
        style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent)" }}
        animate={{ x: ["-6rem", "110%"] }}
        transition={{ duration: 2.2, repeat: Infinity, repeatDelay: 1.5, ease: "easeInOut" }}
      />
    </div>
  );
}

/* Pulsing glow ring around icon */
function GlowIcon({ cfg, size = 20, containerSize = 11 }: { cfg: typeof TYPE_CONFIG[string]; size?: number; containerSize?: number }) {
  return (
    <div className="relative shrink-0" style={{ width: containerSize * 4, height: containerSize * 4 }}>
      {/* Pulsing outer ring */}
      <motion.div
        className="absolute inset-0 rounded-2xl"
        style={{ background: cfg.badgeBg, border: `1px solid ${cfg.badgeBorder}` }}
        animate={{ boxShadow: [`0 0 0px ${cfg.accent}00`, `0 0 18px ${cfg.accent}55`, `0 0 0px ${cfg.accent}00`] }}
        transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
      />
      {/* Icon itself with subtle float */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center rounded-2xl"
        animate={{ y: [0, -2, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      >
        <cfg.Icon size={size} style={{ color: cfg.accent }} />
      </motion.div>
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
  const esRef = useRef<EventSource | null>(null);

  const { data: broadcasts = [] } = useQuery<any[]>({
    queryKey: ["/api/broadcasts"],
    refetchInterval: 5000,
  });

  useEffect(() => {
    let es: EventSource;
    const connect = () => {
      es = new EventSource("/api/broadcasts/stream");
      esRef.current = es;
      es.onmessage = (e) => {
        try {
          const data = JSON.parse(e.data);
          if (data.type === "broadcast_new") {
            queryClient.setQueryData(["/api/broadcasts"], (old: any[] = []) => {
              if (old.find((b: any) => b.id === data.broadcast.id)) return old;
              return [...old, data.broadcast];
            });
          } else if (data.type === "broadcast_removed") {
            queryClient.setQueryData(["/api/broadcasts"], (old: any[] = []) =>
              old.filter((b: any) => b.id !== data.id)
            );
            setDismissed(prev => { const n = new Set(prev); n.delete(data.id); return n; });
            setExpanded(prev => { const n = new Set(prev); n.delete(data.id); return n; });
          }
        } catch {}
      };
      es.onerror = () => {};
    };
    connect();
    return () => { esRef.current?.close(); };
  }, []);

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

  /* stagger variants for modal children */
  const container = {
    hidden: {},
    show: { transition: { staggerChildren: 0.07, delayChildren: 0.15 } },
  };
  const item = {
    hidden: { opacity: 0, y: 10 },
    show:   { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] } },
  };

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
              transition={{ duration: 0.28 }}
              className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
              style={{ background: "rgba(3,1,12,0.88)", backdropFilter: "blur(14px)" }}
              onClick={closeModal}
            >
              {/* Animated modal card */}
              <motion.div
                key={b.id}
                initial={{ opacity: 0, scale: 0.72, y: 64, rotateX: 12, filter: "blur(12px)" }}
                animate={{ opacity: 1, scale: 1, y: 0, rotateX: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, scale: 0.88, y: -28, filter: "blur(8px)" }}
                transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
                style={{ perspective: 1000 }}
                onClick={e => e.stopPropagation()}
                className="relative w-full max-w-md overflow-hidden rounded-3xl"
              >
                {/* Animated pulsing border glow */}
                <motion.div
                  className="absolute inset-0 rounded-3xl pointer-events-none"
                  animate={{ boxShadow: [cfg.glow, cfg.glow.replace("0.35", "0.55").replace("0.2", "0.38"), cfg.glow] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }}
                />

                {/* Inner radial glow */}
                <div className="absolute inset-0 rounded-3xl pointer-events-none"
                  style={{ background: `radial-gradient(ellipse 70% 35% at 50% 0%, ${cfg.accent}12 0%, transparent 70%)` }} />

                <div className="relative">
                  {/* Animated shimmer top bar */}
                  <ShimmerBar gradient={cfg.barGradient} />

                  {/* Header — staggered */}
                  <motion.div variants={container} initial="hidden" animate="show">
                    <motion.div variants={item}
                      className="flex items-center gap-3.5 px-6 pt-5 pb-4"
                      style={{ borderBottom: `1px solid ${cfg.border}` }}>

                      {/* Floating + glowing icon badge */}
                      <GlowIcon cfg={cfg} size={20} containerSize={11} />

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

                      <motion.button onClick={closeModal}
                        whileHover={{ scale: 1.1, backgroundColor: "rgba(255,255,255,0.1)" }}
                        whileTap={{ scale: 0.92 }}
                        className="shrink-0 w-8 h-8 flex items-center justify-center rounded-xl cursor-pointer"
                        style={{ color: "rgba(255,255,255,0.35)", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                        <X size={14} />
                      </motion.button>
                    </motion.div>

                    {/* Body */}
                    <motion.div variants={item} className="px-6 py-5 space-y-4">
                      {b.mediaUrl && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.94, y: 10 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          transition={{ delay: 0.2, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                          className="rounded-2xl overflow-hidden"
                          style={{ border: `1px solid ${cfg.border}`, boxShadow: `0 8px 32px rgba(0,0,0,0.5), 0 0 20px ${cfg.accent}18` }}>
                          {b.mediaType === "IMAGE" && <img src={b.mediaUrl} alt="broadcast" className="w-full max-h-56 object-cover" style={{ background: "rgba(0,0,0,0.4)" }} />}
                          {b.mediaType === "VIDEO" && <video src={b.mediaUrl} controls playsInline className="w-full max-h-56 bg-black" />}
                          {b.mediaType === "YOUTUBE" && (
                            <iframe src={getYouTubeEmbedUrl(b.mediaUrl)} className="w-full h-52"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen />
                          )}
                        </motion.div>
                      )}
                      <p className="text-base font-medium leading-relaxed" style={{ color: "rgba(255,255,255,0.85)" }}>
                        {b.message}
                      </p>
                    </motion.div>

                    {/* Footer */}
                    <motion.div variants={item}
                      className="flex items-center justify-center gap-3 px-6 pb-5 pt-4"
                      style={{ borderTop: `1px solid ${cfg.border}` }}>
                      {b.actionLink ? (
                        <motion.a
                          href={b.actionLink} target="_blank" rel="noopener noreferrer"
                          onClick={nextModal}
                          className="relative flex items-center gap-2.5 text-sm font-bold px-10 py-4 rounded-2xl cursor-pointer text-white overflow-hidden select-none"
                          style={{ background: cfg.btnGradient, letterSpacing: "0.04em" }}
                          initial={{ scale: 0.92, opacity: 0 }}
                          animate={{
                            scale: [1, 1.025, 1],
                            opacity: 1,
                            boxShadow: [
                              `0 0 14px ${cfg.accent}55, 0 4px 24px ${cfg.accent}25`,
                              `0 0 30px ${cfg.accent}bb, 0 4px 48px ${cfg.accent}45, 0 0 80px ${cfg.accent}18`,
                              `0 0 14px ${cfg.accent}55, 0 4px 24px ${cfg.accent}25`,
                            ],
                          }}
                          transition={{
                            opacity: { duration: 0.35, ease: "easeOut" },
                            scale: { duration: 3.2, repeat: Infinity, ease: "easeInOut" },
                            boxShadow: { duration: 3.2, repeat: Infinity, ease: "easeInOut" },
                          }}
                          whileHover={{
                            scale: 1.06,
                            boxShadow: `0 0 40px ${cfg.accent}ee, 0 4px 56px ${cfg.accent}66`,
                            transition: { duration: 0.2, ease: "easeOut" },
                          }}
                          whileTap={{ scale: 0.95, transition: { duration: 0.1 } }}>
                          {/* Soft radial glow overlay */}
                          <span
                            className="absolute inset-0 pointer-events-none rounded-2xl"
                            style={{ background: `radial-gradient(ellipse 80% 60% at 50% 0%, rgba(255,255,255,0.13) 0%, transparent 70%)` }}
                          />
                          {/* Shimmer sweep — slow and smooth */}
                          <motion.span
                            className="absolute inset-0 pointer-events-none"
                            style={{ background: "linear-gradient(108deg, transparent 25%, rgba(255,255,255,0.22) 50%, transparent 75%)" }}
                            animate={{ x: ["-110%", "210%"] }}
                            transition={{ duration: 3.0, repeat: Infinity, repeatDelay: 2.0, ease: [0.4, 0, 0.2, 1] }}
                          />
                          <motion.span
                            animate={{ rotate: [0, 12, -8, 0] }}
                            transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
                            style={{ display: "flex" }}>
                            <ExternalLink size={15} />
                          </motion.span>
                          {b.buttonText || "Learn More"}
                        </motion.a>
                      ) : (
                        <motion.button onClick={nextModal}
                          className="relative flex items-center gap-2.5 text-sm font-bold px-10 py-4 rounded-2xl cursor-pointer text-white overflow-hidden select-none"
                          style={{ background: cfg.btnGradient, letterSpacing: "0.04em" }}
                          initial={{ scale: 0.92, opacity: 0 }}
                          animate={{
                            scale: [1, 1.025, 1],
                            opacity: 1,
                            boxShadow: [
                              `0 0 14px ${cfg.accent}55, 0 4px 24px ${cfg.accent}25`,
                              `0 0 30px ${cfg.accent}bb, 0 4px 48px ${cfg.accent}45, 0 0 80px ${cfg.accent}18`,
                              `0 0 14px ${cfg.accent}55, 0 4px 24px ${cfg.accent}25`,
                            ],
                          }}
                          transition={{
                            opacity: { duration: 0.35, ease: "easeOut" },
                            scale: { duration: 3.2, repeat: Infinity, ease: "easeInOut" },
                            boxShadow: { duration: 3.2, repeat: Infinity, ease: "easeInOut" },
                          }}
                          whileHover={{
                            scale: 1.06,
                            boxShadow: `0 0 40px ${cfg.accent}ee, 0 4px 56px ${cfg.accent}66`,
                            transition: { duration: 0.2, ease: "easeOut" },
                          }}
                          whileTap={{ scale: 0.95, transition: { duration: 0.1 } }}>
                          <span
                            className="absolute inset-0 pointer-events-none rounded-2xl"
                            style={{ background: `radial-gradient(ellipse 80% 60% at 50% 0%, rgba(255,255,255,0.13) 0%, transparent 70%)` }}
                          />
                          <motion.span
                            className="absolute inset-0 pointer-events-none"
                            style={{ background: "linear-gradient(108deg, transparent 25%, rgba(255,255,255,0.22) 50%, transparent 75%)" }}
                            animate={{ x: ["-110%", "210%"] }}
                            transition={{ duration: 3.0, repeat: Infinity, repeatDelay: 2.0, ease: [0.4, 0, 0.2, 1] }}
                          />
                          {isLast ? <><span className="text-base">✓</span> Got it</> : <>Next <ArrowRight size={14} /></>}
                        </motion.button>
                      )}
                    </motion.div>
                  </motion.div>

                  {/* Bottom shimmer bar */}
                  <ShimmerBar gradient={`linear-gradient(90deg, transparent, ${cfg.accent}55, transparent)`} />
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
                initial={{ opacity: 0, x: 60, scale: 0.88 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 60, scale: 0.88 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1], delay: cardIdx * 0.05 }}
                className="pointer-events-auto relative overflow-hidden rounded-2xl"
                style={{
                  width: isExpanded ? 320 : "auto",
                  maxWidth: "calc(100vw - 2.5rem)",
                  background: "linear-gradient(145deg, rgba(13,7,36,0.97) 0%, rgba(7,4,22,0.98) 100%)",
                  border: `1px solid ${cfg.border}`,
                  backdropFilter: "blur(16px)",
                }}
                whileHover={{ scale: 1.01 }}
              >
                {/* Animated border glow */}
                <motion.div
                  className="absolute inset-0 rounded-2xl pointer-events-none"
                  animate={{ boxShadow: [`0 0 12px rgba(139,92,246,0.08)`, `0 0 22px rgba(139,92,246,0.18)`, `0 0 12px rgba(139,92,246,0.08)`] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: cardIdx * 0.4 }}
                />

                {/* Shimmer top bar */}
                <ShimmerBar gradient={cfg.barGradient} />

                {/* Card row */}
                <div className="relative flex items-center gap-2.5 px-3.5 py-3 cursor-pointer select-none"
                  onClick={() => toggleExpand(b.id)} role="button" tabIndex={0}
                  onKeyDown={e => e.key === "Enter" && toggleExpand(b.id)}>

                  {/* Icon with float animation */}
                  <motion.div
                    className="flex items-center justify-center w-8 h-8 rounded-xl shrink-0"
                    style={{ background: cfg.badgeBg, border: `1px solid ${cfg.badgeBorder}` }}
                    animate={{ y: [0, -2, 0] }}
                    transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut", delay: cardIdx * 0.5 }}
                  >
                    <Icon size={14} style={{ color: cfg.accent }} />
                  </motion.div>

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

                  <motion.span
                    animate={{ rotate: isExpanded ? 180 : 0 }}
                    transition={{ duration: 0.25, ease: "easeInOut" }}
                    style={{ color: "rgba(255,255,255,0.25)", display: "flex" }}>
                    <ChevronDown size={13} />
                  </motion.span>

                  <motion.button
                    onClick={e => { e.stopPropagation(); dismiss(b.id); }}
                    whileHover={{ scale: 1.15, color: "rgba(255,255,255,0.8)" }}
                    whileTap={{ scale: 0.88 }}
                    className="shrink-0 w-6 h-6 flex items-center justify-center rounded-lg ml-0.5 cursor-pointer"
                    style={{ color: "rgba(255,255,255,0.2)" }}
                    aria-label="Dismiss">
                    <X size={11} />
                  </motion.button>
                </div>

                {/* Expanded content */}
                <AnimatePresence initial={false}>
                  {isExpanded && (
                    <motion.div key="expand"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                      className="overflow-hidden">
                      <div style={{ borderTop: `1px solid ${cfg.border}` }}>
                        <motion.div
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.08, duration: 0.28 }}
                          className="px-4 py-3 space-y-2.5">
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
                        </motion.div>

                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.14 }}
                          className="flex items-center justify-between gap-2 px-4 py-3"
                          style={{ borderTop: `1px solid ${cfg.border}` }}>
                          {/* Dismiss — left, plain */}
                          <motion.button onClick={() => dismiss(b.id)}
                            whileHover={{ scale: 1.05, color: "rgba(255,255,255,0.6)" }}
                            whileTap={{ scale: 0.95 }}
                            className="text-[10px] font-semibold px-3 py-1.5 rounded-xl cursor-pointer"
                            style={{ color: "rgba(255,255,255,0.32)", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
                            Dismiss
                          </motion.button>
                          {/* LEARN MORE — right, glowing */}
                          {b.actionLink ? (
                            <motion.a href={b.actionLink} target="_blank" rel="noopener noreferrer"
                              className="relative flex items-center gap-1.5 text-[10px] font-bold px-4 py-1.5 rounded-xl overflow-hidden text-white cursor-pointer"
                              style={{ background: cfg.btnGradient }}
                              animate={{ boxShadow: [
                                `0 0 8px ${cfg.accent}55, 0 2px 14px ${cfg.accent}25`,
                                `0 0 18px ${cfg.accent}aa, 0 2px 28px ${cfg.accent}44`,
                                `0 0 8px ${cfg.accent}55, 0 2px 14px ${cfg.accent}25`,
                              ] }}
                              transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
                              whileHover={{ scale: 1.06, transition: { duration: 0.18 } }}
                              whileTap={{ scale: 0.94 }}>
                              <motion.span
                                className="absolute inset-0 pointer-events-none"
                                style={{ background: "linear-gradient(108deg, transparent 25%, rgba(255,255,255,0.2) 50%, transparent 75%)" }}
                                animate={{ x: ["-110%", "210%"] }}
                                transition={{ duration: 2.8, repeat: Infinity, repeatDelay: 1.8, ease: [0.4, 0, 0.2, 1] }}
                              />
                              <ExternalLink size={9} />
                              {b.buttonText || "Learn More"}
                            </motion.a>
                          ) : <span />}
                        </motion.div>
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
