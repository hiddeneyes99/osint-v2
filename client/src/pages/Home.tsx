import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import {
  ArrowRight, Sparkles, Smartphone, ShieldCheck,
  Infinity as InfinityIcon, Database,
  Zap, Send, Bell, Lock, Download,
  Home as HomeIcon, History, Settings, Check,
  LayoutDashboard,
} from "lucide-react";
import { CyberButton } from "@/components/CyberButton";
import { Navbar } from "@/components/Navbar";
import { useState, useEffect, useRef } from "react";
import { AuthModal } from "@/components/AuthModal";
import logoHeroPath from "@assets/ChatGPT_Image_Jun_1,_2026,_06_09_38_AM_1780274401269.png";
import { useAuth } from "@/hooks/use-auth";
import { useSEO } from "@/hooks/use-seo";

/* ── Animated Counter ────────────────────────────────────── */
function Counter({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [val, setVal] = useState(0);
  const ref = useRef(false);
  useEffect(() => {
    if (ref.current) return;
    ref.current = true;
    const step = Math.ceil(target / 60);
    let cur = 0;
    const t = setInterval(() => {
      cur = Math.min(cur + step, target);
      setVal(cur);
      if (cur >= target) clearInterval(t);
    }, 20);
    return () => clearInterval(t);
  }, [target]);
  return <>{val}{suffix}</>;
}

/* ── Floating Particles ──────────────────────────────────── */
const PARTICLES = [
  { ax: -0.62, ay: -0.52, r: 3,   dur: 2.8, del: 0.0 },
  { ax:  0.72, ay: -0.42, r: 2,   dur: 2.3, del: 0.6 },
  { ax: -0.80, ay:  0.16, r: 2.5, dur: 3.2, del: 1.0 },
  { ax:  0.52, ay:  0.60, r: 2,   dur: 2.6, del: 0.4 },
  { ax: -0.26, ay:  0.80, r: 3,   dur: 3.5, del: 1.4 },
  { ax:  0.86, ay:  0.06, r: 1.5, dur: 2.4, del: 0.9 },
  { ax:  0.10, ay: -0.85, r: 2,   dur: 3.0, del: 0.2 },
  { ax: -0.46, ay: -0.70, r: 2.5, dur: 2.7, del: 1.6 },
  { ax:  0.40, ay: -0.70, r: 1.5, dur: 3.3, del: 0.7 },
  { ax: -0.75, ay:  0.50, r: 2,   dur: 2.9, del: 1.1 },
  { ax:  0.68, ay:  0.38, r: 1.5, dur: 3.6, del: 1.8 },
  { ax: -0.36, ay:  0.62, r: 2,   dur: 2.5, del: 0.3 },
];

/* ── 3D Floating Shield ──────────────────────────────────── */
function FloatingShield({ size = 340 }: { size?: number }) {
  const s = size;
  return (
    <div
      className="relative flex items-center justify-center select-none"
      style={{ width: s, height: s }}
    >
      {/* ① BIG ATMOSPHERIC PURPLE CLOUD — matches logo's own glow */}
      <motion.div
        animate={{ scale: [1, 1.08, 1], opacity: [0.8, 1, 0.8] }}
        transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
        className="absolute pointer-events-none"
        style={{
          inset: "-8%",
          borderRadius: "50%",
          background:
            "radial-gradient(ellipse at 50% 56%, rgba(110,45,210,0.95) 0%, rgba(88,28,180,0.7) 28%, rgba(55,10,140,0.35) 52%, transparent 72%)",
          filter: "blur(24px)",
        }}
      />

      {/* ② SECONDARY OUTER HAZE */}
      <div
        className="absolute pointer-events-none"
        style={{
          inset: "-20%",
          borderRadius: "50%",
          background:
            "radial-gradient(ellipse at center, rgba(139,92,246,0.22) 0%, transparent 60%)",
        }}
      />

      {/* ③ ORBIT RING 1 — main tilted glowing ring */}
      <div
        className="absolute"
        style={{
          width: s * 1.14,
          height: s * 1.14,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transform: "rotateX(70deg)",
          transformStyle: "preserve-3d",
        }}
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          style={{
            width: "80%",
            height: "80%",
            borderRadius: "50%",
            border: "2px solid rgba(167,139,250,0.65)",
            boxShadow:
              "0 0 22px rgba(139,92,246,0.55), inset 0 0 14px rgba(139,92,246,0.22)",
          }}
        />
      </div>

      {/* ④ ORBIT RING 2 — counter-rotate, different tilt */}
      <div
        className="absolute"
        style={{
          width: s * 1.02,
          height: s * 1.02,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transform: "rotateX(70deg) rotateZ(52deg)",
          transformStyle: "preserve-3d",
        }}
      >
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 13, repeat: Infinity, ease: "linear" }}
          style={{
            width: "65%",
            height: "65%",
            borderRadius: "50%",
            border: "1.5px solid rgba(192,132,252,0.4)",
          }}
        />
      </div>

      {/* ⑤ ENERGY SWEEP ARCS */}
      <svg
        className="absolute pointer-events-none"
        style={{ inset: "-8%", width: "116%", height: "116%", zIndex: 8, overflow: "visible" }}
        viewBox={`0 0 ${s * 1.16} ${s * 1.16}`}
      >
        <defs>
          <filter id="arcGlow">
            <feGaussianBlur stdDeviation="2.5" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>
        {/* Sweep arc 1 — diagonal upper-left to lower-right */}
        <motion.ellipse
          cx={s * 0.58} cy={s * 0.58}
          rx={s * 0.44} ry={s * 0.16}
          fill="none"
          stroke="rgba(196,181,253,0.8)"
          strokeWidth="2.2"
          strokeDasharray={`${s * 0.34} ${s * 2.4}`}
          strokeLinecap="round"
          transform={`rotate(-36, ${s * 0.58}, ${s * 0.58})`}
          animate={{ strokeDashoffset: [0, -(s * 2.74)] }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          filter="url(#arcGlow)"
        />
        {/* Sweep arc 2 — opposite diagonal */}
        <motion.ellipse
          cx={s * 0.58} cy={s * 0.58}
          rx={s * 0.38} ry={s * 0.13}
          fill="none"
          stroke="rgba(167,139,250,0.6)"
          strokeWidth="1.8"
          strokeDasharray={`${s * 0.26} ${s * 2.1}`}
          strokeLinecap="round"
          transform={`rotate(42, ${s * 0.58}, ${s * 0.58})`}
          animate={{ strokeDashoffset: [0, s * 2.36] }}
          transition={{ duration: 5.5, repeat: Infinity, ease: "linear", delay: 1.2 }}
          filter="url(#arcGlow)"
        />
      </svg>

      {/* ⑥ TWINKLING PARTICLES */}
      {PARTICLES.map(({ ax, ay, r, dur, del }, i) => (
        <motion.div
          key={i}
          animate={{ opacity: [0.1, 0.95, 0.1], scale: [0.5, 1.5, 0.5] }}
          transition={{ duration: dur, delay: del, repeat: Infinity, ease: "easeInOut" }}
          className="absolute pointer-events-none rounded-full"
          style={{
            width: r * 2,
            height: r * 2,
            background:
              i % 3 === 0
                ? "rgba(255,255,255,0.95)"
                : i % 3 === 1
                ? "rgba(196,181,253,1)"
                : "rgba(139,92,246,0.9)",
            left: "50%",
            top: "50%",
            transform: `translate(calc(-50% + ${ax * s * 0.48}px), calc(-50% + ${ay * s * 0.48}px))`,
            boxShadow: `0 0 ${r * 3}px rgba(167,139,250,0.9)`,
            zIndex: 12,
          }}
        />
      ))}

      {/* ⑦ FLOATING LOGO */}
      <motion.div
        animate={{ y: [-12, 12, -12] }}
        transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
        style={{ position: "relative", width: s * 0.98, height: s * 0.98, zIndex: 10 }}
      >
        {/* Breathing inner aura */}
        <motion.div
          animate={{ scale: [1, 1.12, 1], opacity: [0.35, 0.7, 0.35] }}
          transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
          className="absolute pointer-events-none"
          style={{
            inset: "5%",
            borderRadius: "50%",
            background:
              "radial-gradient(ellipse at 50% 54%, rgba(139,92,246,0.8) 0%, rgba(88,28,220,0.4) 42%, transparent 70%)",
            filter: "blur(14px)",
          }}
        />

        {/* Logo image — edge-faded mask so it blends into the purple cloud */}
        <img
          src={logoHeroPath}
          alt="TWH OSINT"
          className="w-full h-full object-contain"
          style={{
            position: "relative",
            zIndex: 2,
            filter:
              "drop-shadow(0 0 30px rgba(139,92,246,0.95)) drop-shadow(0 0 60px rgba(109,40,217,0.6)) drop-shadow(0 16px 28px rgba(0,0,0,0.5))",
            WebkitMaskImage:
              "radial-gradient(ellipse 88% 88% at 50% 48%, black 40%, transparent 78%)",
            maskImage:
              "radial-gradient(ellipse 88% 88% at 50% 48%, black 40%, transparent 78%)",
          }}
          draggable={false}
        />
      </motion.div>

      {/* ⑧ PLATFORM GLOW */}
      <div
        className="absolute pointer-events-none"
        style={{
          bottom: s * 0.03,
          left: "50%",
          transform: "translateX(-50%)",
          width: s * 0.68,
          height: 16,
          background:
            "linear-gradient(90deg, transparent, rgba(109,40,217,0.95) 28%, rgba(167,139,250,1) 50%, rgba(109,40,217,0.95) 72%, transparent)",
          borderRadius: "50%",
          boxShadow: "0 0 44px 10px rgba(139,92,246,0.6)",
        }}
      />
      <div
        className="absolute pointer-events-none"
        style={{
          bottom: s * 0.01,
          left: "50%",
          transform: "translateX(-50%)",
          width: s * 0.52,
          height: 10,
          background: "rgba(88,28,220,0.55)",
          borderRadius: "50%",
          filter: "blur(8px)",
        }}
      />
    </div>
  );
}

/* ── DATA ────────────────────────────────────────────────── */
const STATS = [
  { icon: Database, value: 100000, suffix: "+", label: "Data Sources" },
  { icon: ShieldCheck, value: 100, suffix: "%", label: "Validation" },
  { icon: Zap, value: 1, suffix: "s", label: "Avg Response" },
  { icon: InfinityIcon, value: 0, suffix: "∞", label: "Unlimited Searches" },
];

const MODULES = [
  { emoji: "📱", tile: "t-violet", title: "Mobile", desc: "Mobile number intelligence" },
  { emoji: "🪪", tile: "t-fuchsia", title: "Aadhar", desc: "Identity verification data" },
  { emoji: "🚗", tile: "t-orange", title: "Vehicle", desc: "Vehicle information lookup" },
  { emoji: "🌐", tile: "t-blue", title: "IP Probe", desc: "IP address intelligence" },
  { emoji: "📧", tile: "t-emerald", title: "Email", desc: "Email address intelligence" },
];

const V2_FEATURES = [
  {
    icon: InfinityIcon,
    color: "rgba(139,92,246,0.15)",
    border: "rgba(139,92,246,0.3)",
    iconColor: "#A78BFA",
    title: "Free Unlimited Access",
    badge: "NEW",
    desc: "No credits. No subscriptions. No restrictions. Every search is completely free — forever.",
  },
  {
    icon: Database,
    color: "rgba(59,130,246,0.12)",
    border: "rgba(59,130,246,0.25)",
    iconColor: "#93C5FD",
    title: "100K+ Data Sources",
    desc: "Significantly expanded intelligence coverage with enhanced real-time data collection.",
  },
  {
    icon: ShieldCheck,
    color: "rgba(16,185,129,0.12)",
    border: "rgba(16,185,129,0.25)",
    iconColor: "#6EE7B7",
    title: "Advanced Validation",
    desc: "Improved validation systems and stronger government document verification processes.",
  },
  {
    icon: Zap,
    color: "rgba(245,158,11,0.12)",
    border: "rgba(245,158,11,0.25)",
    iconColor: "#FCD34D",
    title: "Faster Search Engine",
    desc: "Massively optimized infrastructure for near-instant intelligence retrieval under 1 second.",
  },
  {
    icon: Send,
    color: "rgba(14,165,233,0.12)",
    border: "rgba(14,165,233,0.25)",
    iconColor: "#7DD3FC",
    title: "Telegram Connect",
    badge: "NEW",
    desc: "Connect Telegram and automatically receive your search results directly in your chat.",
  },
  {
    icon: Bell,
    color: "rgba(168,85,247,0.12)",
    border: "rgba(168,85,247,0.25)",
    iconColor: "#E879F9",
    title: "Telegram Alerts",
    desc: "Receive search updates and intelligence reports directly through Telegram instantly.",
  },
  {
    icon: Lock,
    color: "rgba(239,68,68,0.1)",
    border: "rgba(239,68,68,0.22)",
    iconColor: "#FCA5A5",
    title: "7-Day Privacy Storage",
    desc: "Search records auto-deleted after 7 days. Your data, your privacy, always protected.",
  },
  {
    icon: Download,
    color: "rgba(34,197,94,0.1)",
    border: "rgba(34,197,94,0.22)",
    iconColor: "#86EFAC",
    title: "Export & Sharing",
    desc: "Copy results, download JSON reports, and share intelligence findings in one click.",
  },
  {
    icon: Smartphone,
    color: "rgba(139,92,246,0.1)",
    border: "rgba(139,92,246,0.22)",
    iconColor: "#C4B5FD",
    title: "Mobile Experience",
    badge: "NEW",
    desc: "Completely redesigned mobile interface. Native-app feel with better navigation and speed.",
  },
];

const COMPARISON = [
  { v1: "Credits Required", v2: "Unlimited Free Access" },
  { v1: "Basic Validation", v2: "Advanced Validation" },
  { v1: "Limited Data Sources", v2: "100K+ Sources" },
  { v1: "No Telegram", v2: "Telegram Integration" },
  { v1: "No Alerts", v2: "Telegram Alerts" },
  { v1: "Basic Mobile", v2: "Optimized Mobile Experience" },
  { v1: "No Privacy Control", v2: "7-Day Auto-Delete" },
  { v1: "No Export", v2: "Copy + Download Reports" },
];

/* ── HOME PAGE ───────────────────────────────────────────── */
export default function Home() {
  useSEO({
    title: "TWH OSINT — Free Mobile Number Lookup, Aadhar, Vehicle & IP Search India",
    description: "India's #1 free OSINT platform. Instantly lookup any mobile number, Aadhar card, vehicle registration or IP address. No credits, no limits. Built by Technical White Hat.",
    canonical: "https://twh-osint.vercel.app/",
    keywords: "free mobile number lookup India, Aadhar lookup, vehicle registration lookup, IP address lookup, OSINT tool India, phone number trace, TWH OSINT, number info",
  });
  const { user, isLoading, logout } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [, navigate] = useLocation();

  return (
    <div className="min-h-screen flex flex-col relative">
      <Navbar />

      <main className="flex-1 pb-24 lg:pb-0">

        {/* ── HERO SECTION ──────────────────────────────── */}
        <section className="relative container px-4 pt-12 md:pt-20 pb-6 md:pb-10 overflow-hidden">
          {/* Background glow */}
          <div
            className="absolute top-0 right-0 w-[600px] h-[600px] pointer-events-none -z-10"
            style={{
              background:
                "radial-gradient(ellipse at top right, rgba(139,92,246,0.18) 0%, transparent 65%)",
            }}
          />

          <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-4">
            {/* Left — text */}
            <div className="flex-1 lg:pr-8 text-center lg:text-left">

              {/* V2 new launch pill */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="flex items-center justify-center lg:justify-start gap-2 mb-3"
              >
                <div
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold tracking-wide"
                  style={{
                    background: "linear-gradient(135deg, rgba(139,92,246,0.25), rgba(168,85,247,0.15))",
                    border: "1px solid rgba(139,92,246,0.45)",
                    color: "#C084FC",
                  }}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse inline-block" />
                  TWH OSINT V2 — Now Live
                </div>
                <div
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold"
                  style={{
                    background: "rgba(16,185,129,0.12)",
                    border: "1px solid rgba(16,185,129,0.3)",
                    color: "#6EE7B7",
                  }}
                >
                  <InfinityIcon className="w-2.5 h-2.5" style={{ width: "10px", height: "10px" }} />
                  Unlimited Free
                </div>
              </motion.div>

              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.06, duration: 0.45 }}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-violet-500/30 bg-violet-500/10 text-violet-300 text-xs font-medium mb-5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>AI-Powered Intelligence Platform · v4.0</span>
              </motion.div>

              {/* Headline */}
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.5 }}
                className="text-4xl sm:text-5xl md:text-6xl lg:text-[62px] font-extrabold tracking-tight leading-[1.08] mb-5"
              >
                <span className="text-white">Open Source</span>
                <br />
                <span className="gradient-text">Intelligence Suite</span>
                <span
                  className="ml-3 align-middle inline-flex items-center px-3 py-1 rounded-xl text-sm font-bold"
                  style={{
                    background: "rgba(139,92,246,0.2)",
                    border: "1px solid rgba(139,92,246,0.4)",
                    color: "#A78BFA",
                    verticalAlign: "middle",
                    fontSize: "14px",
                    lineHeight: "1",
                  }}
                >
                  V2
                </span>
              </motion.h1>

              {/* Mobile hero shield — shown only on mobile, between headline and subtext */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="flex justify-center my-6 lg:hidden"
              >
                <FloatingShield size={260} />
              </motion.div>

              {/* Subtext */}
              <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.18, duration: 0.45 }}
                className="text-sm md:text-base text-white/50 max-w-xl mx-auto lg:mx-0 leading-relaxed mb-5"
              >
                Lookup mobile numbers, Aadhar cards, vehicle registrations, email addresses &amp; IP addresses instantly.
                100% free — no credits, no subscriptions, no limits. Telegram integration included.
              </motion.p>

              {/* Quick capability chips */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.22, duration: 0.4 }}
                className="flex flex-wrap items-center gap-2 justify-center lg:justify-start mb-7"
              >
                {[
                  { label: "Mobile Lookup", color: "rgba(139,92,246,0.2)", border: "rgba(139,92,246,0.35)", text: "#C084FC" },
                  { label: "Aadhar Verify", color: "rgba(168,85,247,0.15)", border: "rgba(168,85,247,0.3)", text: "#E879F9" },
                  { label: "Vehicle Recon", color: "rgba(249,115,22,0.12)", border: "rgba(249,115,22,0.25)", text: "#FB923C" },
                  { label: "IP Probe", color: "rgba(59,130,246,0.12)", border: "rgba(59,130,246,0.25)", text: "#93C5FD" },
                  { label: "Email Search", color: "rgba(16,185,129,0.1)", border: "rgba(16,185,129,0.25)", text: "#6EE7B7" },
                  { label: "Telegram Alerts", color: "rgba(14,165,233,0.1)", border: "rgba(14,165,233,0.22)", text: "#7DD3FC" },
                ].map(({ label, color, border, text }) => (
                  <span
                    key={label}
                    className="text-[10px] font-semibold px-2.5 py-1 rounded-lg"
                    style={{ background: color, border: `1px solid ${border}`, color: text }}
                  >
                    {label}
                  </span>
                ))}
              </motion.div>

              {/* CTA */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.28, duration: 0.45 }}
                className="flex flex-col sm:flex-row items-center lg:items-start gap-3"
              >
                {isLoading ? (
                  <CyberButton className="h-12 px-8 text-sm opacity-50">Loading...</CyberButton>
                ) : user ? (
                  <Link href="/dashboard">
                    <CyberButton className="h-12 px-8 text-sm">
                      Open Dashboard <ArrowRight className="ml-2 w-4 h-4" />
                    </CyberButton>
                  </Link>
                ) : (
                  <CyberButton className="h-12 px-8 text-sm" onClick={() => setIsAuthModalOpen(true)}>
                    Get Started Free <ArrowRight className="ml-2 w-4 h-4" />
                  </CyberButton>
                )}
                {/* Trust line */}
                <div className="flex items-center gap-3 text-[11px] text-white/35">
                  <span className="flex items-center gap-1">
                    <InfinityIcon className="w-3 h-3 text-emerald-400/70" style={{ width: "12px", height: "12px" }} />
                    No credit card
                  </span>
                  <span className="w-1 h-1 rounded-full bg-white/20" />
                  <span className="flex items-center gap-1">
                    <Lock className="w-3 h-3 text-violet-400/70" style={{ width: "12px", height: "12px" }} />
                    7-day privacy
                  </span>
                  <span className="w-1 h-1 rounded-full bg-white/20" />
                  <span className="flex items-center gap-1">
                    <Send className="w-3 h-3 text-sky-400/70" style={{ width: "12px", height: "12px" }} />
                    Telegram ready
                  </span>
                </div>
              </motion.div>
            </div>

            {/* Right — 3D shield (desktop only) */}
            <motion.div
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.15, duration: 0.6 }}
              className="hidden lg:flex items-center justify-center shrink-0"
              style={{ width: 420, height: 420 }}
            >
              <FloatingShield size={400} />
            </motion.div>
          </div>
        </section>

        {/* ── STATS BAR ─────────────────────────────────── */}
        <section className="container px-4 pb-10 md:pb-14">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.45 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-3"
          >
            {STATS.map(({ icon: Icon, value, suffix, label }, i) => (
              <div
                key={label}
                className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 px-3 py-3 sm:px-4 sm:py-4 rounded-2xl"
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.07)",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
                }}
              >
                <div
                  className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center shrink-0"
                  style={{
                    background: "rgba(139,92,246,0.15)",
                    border: "1px solid rgba(139,92,246,0.25)",
                  }}
                >
                  <Icon className="w-4 h-4 text-violet-400" style={{ width: "16px", height: "16px" }} />
                </div>
                <div className="min-w-0">
                  <div className="text-base sm:text-xl md:text-2xl font-extrabold gradient-text leading-none">
                    {suffix === "∞" ? (
                      <span className="flex items-center gap-1">∞ <span className="text-sm sm:text-lg md:text-xl">Unlimited</span></span>
                    ) : suffix === "s" ? (
                      `<1s`
                    ) : (
                      <>
                        <Counter target={value} />
                        {suffix}
                      </>
                    )}
                  </div>
                  <div className="text-[10px] text-white/40 font-medium mt-0.5 leading-tight">{label}</div>
                </div>
              </div>
            ))}
          </motion.div>
        </section>

        {/* ── INTELLIGENCE MODULES ──────────────────────── */}
        <section className="container px-4 pb-10 md:pb-14">
          <div
            className="rounded-2xl p-5 md:p-6"
            style={{
              background: "rgba(255,255,255,0.025)",
              border: "1px solid rgba(255,255,255,0.07)",
            }}
          >
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-lg md:text-xl font-bold text-white">Intelligence Modules</h2>
                <p className="text-xs text-white/40 mt-0.5">
                  Five powerful data extraction tools, each backed by real-time API integrations.
                </p>
              </div>
              <Link href="/dashboard">
                <button
                  className="hidden sm:flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-xl transition-all"
                  style={{
                    background: "rgba(139,92,246,0.1)",
                    border: "1px solid rgba(139,92,246,0.25)",
                    color: "#C084FC",
                  }}
                >
                  Explore All <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </Link>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
              {MODULES.map(({ emoji, tile, title, desc }) => (
                <Link key={title} href="/dashboard">
                  <motion.div
                    whileHover={{ y: -3 }}
                    className="flex items-center gap-3 p-3 md:p-4 rounded-xl cursor-pointer transition-all group"
                    style={{
                      background: "rgba(255,255,255,0.03)",
                      border: "1px solid rgba(255,255,255,0.07)",
                    }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLElement).style.borderColor = "rgba(139,92,246,0.3)";
                      (e.currentTarget as HTMLElement).style.background = "rgba(139,92,246,0.07)";
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.07)";
                      (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.03)";
                    }}
                  >
                    <div className={`icon3d ${tile} w-10 h-10 rounded-[12px] shrink-0`}>
                      <span className="e text-xl select-none">{emoji}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-white truncate">{title}</div>
                      <div className="text-[10px] text-white/40 truncate">{desc}</div>
                    </div>
                    <ArrowRight
                      className="w-3.5 h-3.5 text-white/25 group-hover:text-violet-400 transition-colors shrink-0"
                      style={{ width: "14px", height: "14px" }}
                    />
                  </motion.div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ── WHAT'S NEW IN V2 ──────────────────────────── */}
        <section className="container px-4 pb-10 md:pb-14">
          <div className="text-center mb-8">
            <div
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold mb-3"
              style={{
                background: "linear-gradient(135deg, rgba(139,92,246,0.2), rgba(168,85,247,0.1))",
                border: "1px solid rgba(139,92,246,0.35)",
                color: "#C084FC",
              }}
            >
              <Sparkles className="w-3 h-3" />
              Version 2.0
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">What's New in V2</h2>
            <p className="text-white/40 text-sm max-w-md mx-auto">
              Massive upgrade. Faster platform. Better security. Free for everyone.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {V2_FEATURES.map(({ icon: Icon, color, border, iconColor, title, badge, desc }) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.4 }}
                whileHover={{ y: -3 }}
                className="p-4 rounded-2xl"
                style={{
                  background: color,
                  border: `1px solid ${border}`,
                }}
              >
                <div className="flex items-start gap-3">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: "rgba(0,0,0,0.25)", border: `1px solid ${border}` }}
                  >
                    <Icon
                      className="w-4 h-4"
                      style={{ width: "16px", height: "16px", color: iconColor }}
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-sm font-semibold text-white">{title}</h3>
                      {badge && (
                        <span
                          className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                          style={{
                            background: "rgba(139,92,246,0.25)",
                            border: "1px solid rgba(139,92,246,0.4)",
                            color: "#C084FC",
                          }}
                        >
                          {badge}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-white/50 leading-relaxed">{desc}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ── V1 VS V2 COMPARISON ───────────────────────── */}
        <section className="container px-4 pb-14 md:pb-20">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">V1 → V2</h2>
            <p className="text-white/40 text-sm">Everything that changed in this upgrade</p>
          </div>
          <div
            className="rounded-2xl overflow-hidden"
            style={{
              background: "rgba(255,255,255,0.02)",
              border: "1px solid rgba(255,255,255,0.07)",
            }}
          >
            {/* Header row */}
            <div
              className="grid grid-cols-2 px-5 py-3"
              style={{
                background: "rgba(139,92,246,0.08)",
                borderBottom: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <span className="text-xs font-bold uppercase tracking-widest text-red-400/70">V1 — Before</span>
              <span className="text-xs font-bold uppercase tracking-widest text-emerald-400/80">V2 — Now</span>
            </div>
            {COMPARISON.map(({ v1, v2 }, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.04 }}
                className="grid grid-cols-2 px-5 py-3.5 transition-colors hover:bg-white/[0.02]"
                style={{
                  borderBottom:
                    i < COMPARISON.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
                }}
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-4 h-4 rounded-full flex items-center justify-center shrink-0"
                    style={{ background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.25)" }}
                  >
                    <span className="text-[9px] text-red-400 font-bold">✕</span>
                  </div>
                  <span className="text-xs text-white/40">{v1}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className="w-4 h-4 rounded-full flex items-center justify-center shrink-0"
                    style={{ background: "rgba(16,185,129,0.15)", border: "1px solid rgba(16,185,129,0.25)" }}
                  >
                    <Check className="w-2.5 h-2.5 text-emerald-400" style={{ width: "10px", height: "10px" }} />
                  </div>
                  <span className="text-xs text-white/75 font-medium">{v2}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      </main>

      {/* ── FOOTER ────────────────────────────────────────── */}
      <footer className="border-t border-white/[0.06] pt-10 pb-8" style={{ background: "#09051A" }}>
        <div className="container px-4">
          {/* Top row */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">

            {/* Brand column */}
            <div className="md:col-span-1 flex flex-col gap-3">
              <div className="flex items-center gap-2.5 font-bold text-lg text-white">
                <div className="icon3d t-violet w-7 h-7 rounded-xl">
                  <span className="e text-base select-none">🧠</span>
                </div>
                TWH<span className="text-violet-400">_OSINT</span>
              </div>
              <p className="text-[11px] text-white/35 leading-relaxed">
                Free open-source intelligence platform by <strong className="text-white/50">Technical White Hat</strong>. Built for researchers, students, and security professionals in India.
              </p>
              {/* Social links */}
              <div className="flex flex-wrap gap-2 mt-1">
                <a
                  href="https://t.me/technicalwhitehat"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-semibold transition-all hover:opacity-80"
                  style={{
                    background: "rgba(14,165,233,0.1)",
                    border: "1px solid rgba(14,165,233,0.2)",
                    color: "#7DD3FC",
                  }}
                >
                  ✈️ Channel
                </a>
                <a
                  href="https://t.me/Technical_whitehat"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-semibold transition-all hover:opacity-80"
                  style={{
                    background: "rgba(14,165,233,0.07)",
                    border: "1px solid rgba(14,165,233,0.15)",
                    color: "#7DD3FC",
                  }}
                >
                  👥 Group
                </a>
                <a
                  href="https://www.youtube.com/channel/UC6itmDFY0MWGfA7_T3yJpkg"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-semibold transition-all hover:opacity-80"
                  style={{
                    background: "rgba(220,38,38,0.1)",
                    border: "1px solid rgba(220,38,38,0.22)",
                    color: "#FCA5A5",
                  }}
                >
                  ▶ YouTube
                </a>
              </div>
            </div>

            {/* Services */}
            <div className="flex flex-col gap-2">
              <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1">Services</span>
              <Link href="/dashboard?tab=mobile" className="text-xs text-white/40 hover:text-violet-400 transition-colors">📱 Mobile Lookup</Link>
              <Link href="/dashboard?tab=aadhar" className="text-xs text-white/40 hover:text-violet-400 transition-colors">🪪 Aadhar Verify</Link>
              <Link href="/dashboard?tab=vehicle" className="text-xs text-white/40 hover:text-violet-400 transition-colors">🚗 Vehicle Recon</Link>
              <Link href="/dashboard?tab=ip" className="text-xs text-white/40 hover:text-violet-400 transition-colors">🌐 IP Probe</Link>
            </div>

            {/* Company */}
            <div className="flex flex-col gap-2">
              <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1">Company</span>
              <Link href="/twh" className="text-xs text-violet-400/70 hover:text-violet-300 transition-colors font-semibold">⚡ Technical White Hat (TWH)</Link>
              <Link href="/about" className="text-xs text-white/40 hover:text-violet-400 transition-colors">About Us</Link>
              <Link href="/contact" className="text-xs text-white/40 hover:text-violet-400 transition-colors">Contact Us</Link>
              <a href="mailto:mrwhitehath@gmail.com" className="text-xs text-white/40 hover:text-violet-400 transition-colors">mrwhitehath@gmail.com</a>
            </div>

            {/* Legal + System */}
            <div className="flex flex-col gap-2">
              <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1">Legal</span>
              <Link href="/privacy" className="text-xs text-white/40 hover:text-violet-400 transition-colors">Privacy Policy</Link>
              <Link href="/terms" className="text-xs text-white/40 hover:text-violet-400 transition-colors">Terms &amp; Conditions</Link>
              <div className="mt-3 pt-3 border-t border-white/[0.05]">
                <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest block mb-2">System</span>
                <span className="text-xs text-white/30 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-pulse" />
                  All systems online
                </span>
                <span className="text-xs text-white/30 block mt-1">V2 · &lt;1s latency</span>
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="pt-6 border-t border-white/[0.05] flex flex-col md:flex-row items-center justify-between gap-3">
            <p className="text-[10px] text-white/20 tracking-wider text-center md:text-left">
              &copy; 2026 TWH OSINT · Technical White Hat · Owner: Afsar Ali · All rights reserved.
            </p>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-white/20">Made with</span>
              <span className="text-[10px] text-violet-400/60">♥</span>
              <span className="text-[10px] text-white/20">in India</span>
              <span
                className="ml-2 text-[9px] font-bold px-2 py-0.5 rounded-full"
                style={{
                  background: "rgba(139,92,246,0.12)",
                  border: "1px solid rgba(139,92,246,0.2)",
                  color: "#A78BFA",
                }}
              >
                V2
              </span>
            </div>
          </div>
        </div>
      </footer>

      {/* ── MOBILE BOTTOM NAV ─────────────────────────────── */}
      <div
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 px-3 pb-4 pt-2"
        style={{
          background: "linear-gradient(to top, rgba(5,3,20,0.98) 70%, transparent)",
        }}
      >
        <div
          className="flex items-center rounded-2xl p-1.5 gap-1"
          style={{
            background: "rgba(9,5,26,0.96)",
            border: "1px solid rgba(139,92,246,0.14)",
            boxShadow: "0 -8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.04)",
          }}
        >
          {(
            [
              { id: "home", icon: HomeIcon, label: "Home", action: () => navigate("/"), active: true },
              { id: "dash", icon: LayoutDashboard, label: "Dashboard", action: () => navigate("/dashboard"), active: false },
              { id: "history", icon: History, label: "History", action: () => navigate("/history"), active: false },
              { id: "settings", icon: Settings, label: "Settings", action: () => {}, active: false },
            ] as const
          ).map(({ id, icon: Icon, label, action, active }) => (
            <button
              key={id}
              onClick={action}
              className="flex-1 flex flex-col items-center gap-1 py-2.5 rounded-xl transition-all touch-manipulation"
              style={{
                background: active ? "rgba(139,92,246,0.15)" : "transparent",
                minHeight: "52px",
              }}
              data-testid={`nav-home-bottom-${id}`}
            >
              <Icon
                className="shrink-0"
                style={{
                  width: "18px",
                  height: "18px",
                  color: active ? "#A78BFA" : "rgba(255,255,255,0.35)",
                }}
              />
              <span
                className="text-[10px] font-medium leading-none"
                style={{ color: active ? "#C084FC" : "rgba(255,255,255,0.3)" }}
              >
                {label}
              </span>
            </button>
          ))}
        </div>
      </div>

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </div>
  );
}
