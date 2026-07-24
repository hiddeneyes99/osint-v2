import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import {
  Smartphone,
  Car,
  Globe,
  AlertTriangle,
  History,
  ShieldAlert,
  X,
  Send,
  CheckCircle2,
  Shield,
  Zap,
  MapPin,
  RefreshCw,
  Copy,
  Check,
  ChevronRight,
  Unlink,
  ArrowLeft,
  Phone,
  Home as HomeIcon,
  Settings,
} from "lucide-react";
import { useLocation } from "wouter";
import { ServiceStatusBar } from "@/components/ServiceStatusBar";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Navbar } from "@/components/Navbar";
import { CyberButton } from "@/components/CyberButton";
import { CyberCard } from "@/components/CyberCard";
import { TerminalOutput } from "@/components/TerminalOutput";
import {
  useMobileInfo,
  useAadharInfo,
  useVehicleInfo,
  useEmailInfo,
  useIpInfo,
} from "@/hooks/use-services";
import { useAuth } from "@/hooks/use-auth";
import { usePremiumAuth } from "@/hooks/use-premium-auth";
import {
  mobileInfoSchema,
  aadharInfoSchema,
  vehicleInfoSchema,
  emailInfoSchema,
  ipInfoSchema,
} from "@shared/schema";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { AuthModal } from "@/components/AuthModal";
import sirenSound from "@assets/siren_1768712570112_1780125705439.mp3";
import { AdOverlay } from "@/components/AdOverlay";

function ServiceComingSoon({ emoji, tileClass, label, reason }: { emoji: string; tileClass: string; label: string; reason?: string }) {
  return (
    <CyberCard className="flex flex-col items-center justify-center py-20 text-center">
      <div className={`icon3d ${tileClass} w-16 h-16 rounded-2xl mb-5`}>
        <span className="e text-3xl select-none">{emoji}</span>
      </div>
      <h2 className="text-lg font-semibold text-white mb-1.5">{label} Coming Soon</h2>
      <p className="text-white/40 text-sm mb-6 max-w-xs leading-relaxed">
        {reason || "Coming soon — module under development"}
      </p>
      <div className="h-1.5 w-40 bg-white/[0.06] rounded-full relative overflow-hidden">
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-violet-600 to-purple-400 rounded-full"
          animate={{ x: ["-100%", "100%"] }}
          transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
        />
      </div>
    </CyberCard>
  );
}

export default function Dashboard() {
  const { user, isAuthenticated } = useAuth();
  const { isPremium, premiumUser } = usePremiumAuth();
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState("mobile");
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [showProtectedAlert, setShowProtectedAlert] = useState(false);
  const [protectionReason, setProtectionReason] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Ad overlay state
  const [showAdOverlay, setShowAdOverlay] = useState(false);
  const pendingSearchRef = useRef<(() => void) | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [telegramInput, setTelegramInput] = useState("");
  const [tgLinkClicked, setTgLinkClicked] = useState(false);
  const [isTgModalOpen, setIsTgModalOpen] = useState(false);
  const [copiedChatId, setCopiedChatId] = useState(false);
  const tgPollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startTgPolling = () => {
    if (tgPollRef.current) return;
    tgPollRef.current = setInterval(() => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    }, 3000);
    setTimeout(() => {
      if (tgPollRef.current) {
        clearInterval(tgPollRef.current);
        tgPollRef.current = null;
        setTgLinkClicked(false);
      }
    }, 90000);
  };

  useEffect(() => {
    if ((user as any)?.telegramChatId && tgPollRef.current) {
      clearInterval(tgPollRef.current);
      tgPollRef.current = null;
      setTgLinkClicked(false);
    }
  }, [(user as any)?.telegramChatId]);

  useEffect(() => {
    return () => {
      if (tgPollRef.current) clearInterval(tgPollRef.current);
    };
  }, []);

  const telegramMutation = useMutation({
    mutationFn: async (chatId: string) => {
      const res = await apiRequest("PATCH", "/api/user/telegram", { chatId });
      return res.json();
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      setTelegramInput("");
      if (data.chatId) {
        toast({ title: "✅ Telegram alerts enabled!", description: "A test message was sent to your Telegram." });
      } else {
        toast({ title: "Telegram alerts disabled" });
      }
    },
    onError: (err: any) => {
      toast({ title: "Failed to save", description: err.message, variant: "destructive" });
    },
  });

  const { data: history = [] } = useQuery<any[]>({
    queryKey: ["/api/user/history"],
    enabled: isAuthenticated,
    refetchInterval: 5000,
  });

  // Service availability (coming soon) — poll every 3 seconds for real-time sync
  const { data: comingSoon = {} } = useQuery<Record<string, boolean | Record<string, string>>>({
    queryKey: ["/api/services/availability"],
    refetchInterval: 3000,
  });
  const serviceReasons = (comingSoon._reasons || {}) as Record<string, string>;

  // Service Mutations
  const mobileMutation = useMobileInfo();
  const aadharMutation = useAadharInfo();
  const vehicleMutation = useVehicleInfo();
  const emailMutation = useEmailInfo();
  const ipMutation = useIpInfo();

  // Watch for protected number errors
  useEffect(() => {
    const mutations = [
      mobileMutation,
      aadharMutation,
      vehicleMutation,
      emailMutation,
      ipMutation,
    ];
    const mutationWithError = mutations.find(
      (m) =>
        m.error &&
        (m.error as any).message?.toLowerCase().includes("protected"),
    );

    if (mutationWithError && !showProtectedAlert) {
      const reason =
        (mutationWithError.error as any).reason ||
        "SECURITY PROTOCOL ACTIVATED. ACCESS RESTRICTED.";
      setProtectionReason(reason);
      setShowProtectedAlert(true);
      if (!audioRef.current) {
        audioRef.current = new Audio(sirenSound);
        audioRef.current.loop = true;
      }
      audioRef.current.play().catch(console.error);
    }
  }, [
    mobileMutation.error,
    aadharMutation.error,
    vehicleMutation.error,
    emailMutation.error,
    ipMutation.error,
  ]);

  const closeProtectedAlert = () => {
    setShowProtectedAlert(false);
    setProtectionReason(null);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    // Reset mutations to clear error state and prevent the default toast/error UI
    mobileMutation.reset();
    aadharMutation.reset();
    vehicleMutation.reset();
    emailMutation.reset();
    ipMutation.reset();
  };

  // Forms
  const mobileForm = useForm<z.infer<typeof mobileInfoSchema>>({
    resolver: zodResolver(mobileInfoSchema),
    defaultValues: { number: "" },
  });

  const aadharForm = useForm<z.infer<typeof aadharInfoSchema>>({
    resolver: zodResolver(aadharInfoSchema),
    defaultValues: { number: "" },
  });

  const vehicleForm = useForm<z.infer<typeof vehicleInfoSchema>>({
    resolver: zodResolver(vehicleInfoSchema),
    defaultValues: { number: "" },
  });

  const emailForm = useForm<z.infer<typeof emailInfoSchema>>({
    resolver: zodResolver(emailInfoSchema),
    defaultValues: { email: "" },
  });

  const ipForm = useForm<z.infer<typeof ipInfoSchema>>({
    resolver: zodResolver(ipInfoSchema),
    defaultValues: { ip: "" },
  });

  // Ad-aware search helper — starts API fetch immediately in background,
  // shows ad overlay at the same time so results are ready when ad finishes
  const withAd = async (searchFn: () => void) => {
    try {
      const res = await fetch("/api/ads/random");
      const ad = await res.json();
      if (ad) {
        // Fire the actual API call right now (runs behind the ad overlay)
        searchFn();
        setShowAdOverlay(true);
      } else {
        searchFn();
      }
    } catch {
      searchFn();
    }
  };

  const handleAdComplete = () => {
    setShowAdOverlay(false);
    // Results already fetching / ready in background — nothing more to trigger
  };

  // Handlers — always reset before mutate so old result is cleared instantly
  const onMobileSubmit = (data: z.infer<typeof mobileInfoSchema>) =>
    withAd(() => { mobileMutation.reset(); mobileMutation.mutate(data); });
  const onAadharSubmit = (data: z.infer<typeof aadharInfoSchema>) =>
    withAd(() => { aadharMutation.reset(); aadharMutation.mutate(data); });
  const onVehicleSubmit = (data: z.infer<typeof vehicleInfoSchema>) =>
    withAd(() => { vehicleMutation.reset(); vehicleMutation.mutate(data); });
  const onEmailSubmit = (data: z.infer<typeof emailInfoSchema>) =>
    withAd(() => { emailMutation.reset(); emailMutation.mutate(data); });
  const onIpSubmit = (data: z.infer<typeof ipInfoSchema>) => {
    withAd(() => {
      ipMutation.reset();
      ipMutation.mutate(data);
    });
  };

  if (!isAuthenticated && !isPremium) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="max-w-md w-full">
            <CyberCard className="w-full text-center py-12">
              <div className="icon3d t-orange w-16 h-16 rounded-2xl mx-auto mb-5">
                <span className="e text-3xl select-none">⚠️</span>
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Access Required</h2>
              <p className="text-white/40 text-sm mb-8">Sign in to access the intelligence platform.</p>
              <CyberButton className="w-full" onClick={() => setIsAuthModalOpen(true)}>
                Sign In
              </CyberButton>
            </CyberCard>
          </div>
        </div>
        <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      <Navbar />

      {/* Protected Number Alert Overlay */}
      <AnimatePresence>
        {showProtectedAlert && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center p-4 text-white overflow-hidden"
          >
            {/* Animated Red + Black Background */}
            <div className="absolute inset-0 z-0">
              <motion.div
                className="absolute inset-0 bg-gradient-to-br from-red-950 via-black to-red-950 opacity-80"
                animate={{
                  backgroundPosition: ["0% 0%", "100% 100%"],
                }}
                transition={{ repeat: Infinity, duration: 10, ease: "linear" }}
              />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(185,28,28,0.2)_0%,transparent_70%)]" />
              {/* Scanning Lines */}
              <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-10 bg-[length:100%_2px,3px_100%]" />
              <motion.div
                className="absolute top-0 left-0 w-full h-1 bg-red-600/30 blur-sm z-20"
                animate={{ top: ["0%", "100%"] }}
                transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
              />
            </div>

            <div className="relative z-30 flex flex-col items-center max-w-4xl w-full">
              {/* Enhanced Shield Icon with Glow and Pulse */}
              <motion.div
                animate={{
                  scale: [1, 1.15, 0.95, 1.1, 1],
                  filter: [
                    "drop-shadow(0 0 20px rgba(220,38,38,0.7))",
                    "drop-shadow(0 0 50px rgba(220,38,38,1))",
                    "drop-shadow(0 0 20px rgba(220,38,38,0.7))",
                  ],
                  rotate: [0, -5, 5, -5, 0],
                }}
                transition={{
                  repeat: Infinity,
                  duration: 0.8,
                  ease: "easeInOut",
                }}
                className="mb-8"
              >
                <ShieldAlert className="w-20 h-20 sm:w-32 sm:h-32 md:w-48 md:h-48 text-red-600" />
              </motion.div>

              {/* PROTECTED CONTENT with Glitch + Shake */}
              <motion.div
                animate={{
                  x: [-2, 2, -3, 3, 0],
                  y: [2, -2, 3, -3, 0],
                  skew: [0, 5, -5, 2, 0],
                }}
                transition={{
                  repeat: Infinity,
                  duration: 0.08,
                  repeatType: "mirror",
                }}
                className="relative mb-4"
              >
                <h1 className="text-4xl xs:text-5xl sm:text-6xl md:text-9xl font-black text-center tracking-tighter uppercase leading-none italic text-white drop-shadow-[0_0_25px_rgba(255,0,0,0.8)]">
                  PROTECTED
                </h1>
                <motion.div
                  className="absolute inset-0 text-red-600 opacity-70 translate-x-2 text-4xl xs:text-5xl sm:text-6xl md:text-9xl font-black text-center tracking-tighter uppercase leading-none italic"
                  animate={{
                    opacity: [0, 0.8, 0],
                    x: [2, -2, 2],
                  }}
                  transition={{ repeat: Infinity, duration: 0.04 }}
                >
                  PROTECTED
                </motion.div>
                <motion.div
                  className="absolute inset-0 text-cyan-500 opacity-70 -translate-x-2 text-4xl xs:text-5xl sm:text-6xl md:text-9xl font-black text-center tracking-tighter uppercase leading-none italic"
                  animate={{
                    opacity: [0, 0.8, 0],
                    x: [-2, 2, -2],
                  }}
                  transition={{ repeat: Infinity, duration: 0.06, delay: 0.01 }}
                >
                  PROTECTED
                </motion.div>
              </motion.div>

              {/* ACCESS RESTRICTED */}
              <motion.h2
                animate={{
                  opacity: [1, 0.5, 1],
                  scale: [1, 1.02, 1],
                }}
                transition={{ repeat: Infinity, duration: 0.2 }}
                className="text-2xl xs:text-3xl sm:text-4xl md:text-7xl font-black text-red-600 mb-6 md:mb-8 tracking-[0.1em] sm:tracking-[0.2em] uppercase drop-shadow-[0_0_30px_rgba(220,38,38,1)] text-center"
              >
                ACCESS RESTRICTED
              </motion.h2>

              <div className="bg-red-950/60 border-y-4 border-red-600 py-4 md:py-6 px-4 sm:px-8 md:px-10 mb-8 md:mb-12 backdrop-blur-md w-full relative overflow-hidden">
                <motion.div
                  className="absolute inset-0 bg-red-600/10"
                  animate={{ opacity: [0, 0.2, 0] }}
                  transition={{ repeat: Infinity, duration: 0.1 }}
                />
                <div className="flex flex-col items-center gap-4">
                  <p className="text-base sm:text-xl md:text-4xl font-mono text-center uppercase tracking-[0.1em] sm:tracking-[0.2em] md:tracking-[0.3em] font-black text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.5)] break-words w-full">
                    {protectionReason}
                  </p>
                </div>
              </div>

              <div className="flex gap-4 px-4">
                <motion.button
                  whileHover={{
                    scale: 1.1,
                    boxShadow: "0 0 60px rgba(220,38,38,1)",
                    backgroundColor: "#ff0000",
                  }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => {
                    closeProtectedAlert();
                  }}
                  className="bg-red-700 text-white border-4 border-white text-lg sm:text-2xl px-8 sm:px-16 md:px-20 py-4 sm:py-6 md:py-8 h-auto font-black uppercase tracking-widest shadow-[0_0_30px_rgba(220,38,38,0.8)] transition-all touch-manipulation"
                >
                  Back
                </motion.button>
              </div>
            </div>

            {/* Violent Blinking Overlay */}
            <motion.div
              className="absolute inset-0 bg-red-600 pointer-events-none mix-blend-hard-light"
              animate={{ opacity: [0, 0.3, 0, 0.5, 0] }}
              transition={{ repeat: Infinity, duration: 0.1 }}
            />

            {/* Static Noise Overlay */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.05] bg-[url('https://media.giphy.com/media/oEI9uWUicKgH6/giphy.gif')] bg-cover" />
          </motion.div>
        )}
      </AnimatePresence>


      <main className="flex-1 container px-4 py-4 md:py-8 pb-24 lg:pb-8">
        <ServiceStatusBar />
        <div className="flex flex-col lg:flex-row gap-5 h-full">
          {/* Sidebar / Tools Selector */}
          <div className="w-full lg:w-64 flex-shrink-0">

            {/* Query Stats — desktop only */}
            {history.length > 0 && (() => {
              const now = new Date();
              const today = history.filter((l: any) => new Date(l.createdAt) >= new Date(now.getFullYear(), now.getMonth(), now.getDate())).length;
              const month = history.filter((l: any) => new Date(l.createdAt) >= new Date(now.getFullYear(), now.getMonth(), 1)).length;
              return (
                <div className="hidden lg:block mb-4 rounded-2xl border border-white/[0.07] bg-white/[0.02] px-4 py-3 space-y-2">
                  <div className="text-[9px] font-semibold text-white/25 uppercase tracking-widest">Query Stats</div>
                  <div className="flex justify-between text-xs">
                    <span className="text-white/40">Today</span>
                    <span className="text-violet-300 font-bold">{today}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-white/40">This Month</span>
                    <span className="text-violet-300 font-bold">{month}</span>
                  </div>
                  <div className="flex justify-between text-xs border-t border-white/[0.06] pt-2">
                    <span className="text-white/40">Total</span>
                    <span className="text-white/70 font-bold">{history.length}</span>
                  </div>
                </div>
              );
            })()}

            {/* ── MOBILE: 3-column grid — all tabs always visible ── */}
            <div className="lg:hidden w-full">
              <div className="grid grid-cols-3 gap-2 py-1">
                {([
                  { id: "mobile",  emoji: "📱", label: "Mobile",   tile: "t-violet",  activeTile: "t-active-violet"  },
                  { id: "aadhar",  emoji: "🪪", label: "Aadhar",   tile: "t-fuchsia", activeTile: "t-active-fuchsia" },
                  { id: "vehicle", emoji: "🚗", label: "Vehicle",  tile: "t-orange",  activeTile: "t-active-violet"  },
                  { id: "email",   emoji: "📧", label: "Email",    tile: "t-emerald", activeTile: "t-active-violet"  },
                  { id: "ip",      emoji: "🌐", label: "IP Probe", tile: "t-blue",    activeTile: "t-active-blue"    },
                  { id: "history", emoji: "🕐", label: "History",  tile: "t-slate",   activeTile: "t-active-slate"   },
                ] as const).map(({ id, emoji, label, tile, activeTile }) => {
                  const active = activeTab === id;
                  return (
                    <button
                      key={id}
                      onClick={() => setActiveTab(id)}
                      className={`flex flex-col items-center gap-2 py-3 px-2 rounded-2xl border transition-all duration-200 active:scale-[0.95] w-full
                        ${active
                          ? "border-violet-500/35 text-white"
                          : "border-white/[0.07] bg-white/[0.02] text-white/50"
                        }`}
                      style={active ? { background: "linear-gradient(145deg, rgba(139,92,246,0.13) 0%, rgba(109,40,217,0.06) 100%)" } : {}}
                      data-testid={`tab-${id}`}
                    >
                      <div className={`icon3d ${active ? activeTile : tile} w-10 h-10 rounded-[13px]`}
                        style={!active ? { opacity: 0.55 } : {}}>
                        <span className="e text-xl select-none">{emoji}</span>
                      </div>
                      <span className={`text-[10px] font-semibold leading-none ${active ? "text-white" : "text-white/40"}`}>{label}</span>
                    </button>
                  );
                })}
              </div>
              {/* Telegram — full-width row below grid */}
              <button
                onClick={() => setIsTgModalOpen(true)}
                className={`mt-2 w-full flex items-center justify-center gap-2.5 py-2.5 rounded-2xl border transition-all active:scale-[0.98]
                  ${(user as any)?.telegramChatId
                    ? "border-blue-500/40 bg-blue-500/[0.06] text-blue-300"
                    : "border-white/[0.08] bg-white/[0.02] text-white/50"
                  }`}
                data-testid="tab-telegram"
              >
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center relative overflow-hidden shrink-0 ${(user as any)?.telegramChatId ? "bg-gradient-to-br from-blue-500 to-cyan-500" : "bg-white/[0.06]"}`}
                  style={(user as any)?.telegramChatId ? { boxShadow: "0 4px 0 rgba(14,88,180,0.7), 0 6px 14px rgba(59,130,246,0.4)" } : {}}>
                  {(user as any)?.telegramChatId && <span className="absolute inset-0 bg-gradient-to-b from-white/[0.18] to-transparent pointer-events-none rounded-lg" />}
                  <Send className={`w-3.5 h-3.5 relative z-10 ${(user as any)?.telegramChatId ? "text-white" : "text-white/40"}`} />
                </div>
                <span className={`text-[11px] font-semibold ${(user as any)?.telegramChatId ? "text-blue-300" : "text-white/40"}`}>
                  {(user as any)?.telegramChatId ? "Telegram Alerts • Connected" : "Connect Telegram Alerts"}
                </span>
                {(user as any)?.telegramChatId && (
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse ml-auto mr-1" style={{ boxShadow: "0 0 5px rgba(96,165,250,0.8)" }} />
                )}
              </button>
            </div>

            {/* ── DESKTOP: vertical list with Glaze icon tiles ── */}
            <div className="hidden lg:flex flex-col gap-1.5 w-full">
              <p className="text-[10px] font-medium text-white/25 uppercase tracking-widest px-1 mb-1">Modules</p>
              {([
                { id: "mobile",  emoji: "📱", label: "Mobile",   tile: "t-violet",  activeTile: "t-active-violet"  },
                { id: "aadhar",  emoji: "🪪", label: "Aadhar",   tile: "t-fuchsia", activeTile: "t-active-fuchsia" },
                { id: "vehicle", emoji: "🚗", label: "Vehicle",  tile: "t-orange",  activeTile: "t-active-violet"  },
                { id: "email",   emoji: "📧", label: "Email",    tile: "t-emerald", activeTile: "t-active-violet"  },
                { id: "ip",      emoji: "🌐", label: "IP Probe", tile: "t-blue",    activeTile: "t-active-blue"    },
                { id: "history", emoji: "🕐", label: "History",  tile: "t-slate",   activeTile: "t-active-slate"   },
              ] as const).map(({ id, emoji, label, tile, activeTile }) => {
                const active = activeTab === id;
                return (
                  <button
                    key={id}
                    onClick={() => setActiveTab(id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-all duration-200 text-sm font-semibold active:scale-[0.98]
                      ${active
                        ? "border-violet-500/30 text-white"
                        : "border-white/[0.07] bg-transparent text-white/50 hover:border-violet-500/25 hover:bg-white/[0.03] hover:text-white/70"
                      }`}
                    style={active ? { background: "linear-gradient(135deg, rgba(139,92,246,0.10) 0%, rgba(109,40,217,0.05) 100%)" } : {}}
                    data-testid={`tab-desktop-${id}`}
                  >
                    <div className={`icon3d ${active ? activeTile : tile} w-9 h-9 rounded-[11px] shrink-0`}
                      style={!active ? { opacity: 0.55 } : {}}>
                      <span className="e text-xl select-none">{emoji}</span>
                    </div>
                    <span>{label}</span>
                    {active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-violet-400" style={{ boxShadow: "0 0 6px rgba(139,92,246,0.8)" }} />}
                  </button>
                );
              })}

              {/* Telegram — original 3D Send icon */}
              <button
                onClick={() => setIsTgModalOpen(true)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-all duration-200 text-sm font-semibold active:scale-[0.98]
                  ${(user as any)?.telegramChatId
                    ? "border-blue-500/40 bg-blue-500/[0.06] text-blue-300"
                    : "border-white/[0.07] text-white/40 hover:border-blue-500/30 hover:bg-blue-500/[0.04] hover:text-blue-400"
                  }`}
                data-testid="tab-desktop-telegram"
              >
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-all relative overflow-hidden ${(user as any)?.telegramChatId ? "bg-gradient-to-br from-blue-500 to-cyan-500" : "bg-white/[0.05]"}`}
                  style={(user as any)?.telegramChatId ? { boxShadow: "0 5px 0 rgba(14,88,180,0.8), 0 6px 16px rgba(59,130,246,0.45), inset 0 1px 0 rgba(255,255,255,0.2)" } : {}}>
                  {(user as any)?.telegramChatId && <span className="absolute inset-0 bg-gradient-to-b from-white/[0.18] to-transparent pointer-events-none rounded-xl" />}
                  <Send className={`w-3.5 h-3.5 relative z-10 ${(user as any)?.telegramChatId ? "text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]" : "text-white/35"}`} />
                </div>
                <span>Telegram</span>
                {(user as any)?.telegramChatId && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" style={{ boxShadow: "0 0 6px rgba(59,130,246,0.8)" }} />
                )}
              </button>
            </div>
          </div>

          {/* ── TELEGRAM MODAL ── */}
          <Dialog open={isTgModalOpen} onOpenChange={(v) => { setIsTgModalOpen(v); if (!v) setTgLinkClicked(false); }}>
            <DialogContent className="p-0 border-0 bg-transparent shadow-none max-w-[400px] w-[calc(100vw-1.5rem)] sm:w-full mx-auto">
              <VisuallyHidden><DialogTitle>Telegram Alerts</DialogTitle></VisuallyHidden>
              <motion.div
                initial={{ opacity: 0, y: 32, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 16, scale: 0.97 }}
                transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                className="relative overflow-hidden"
                style={{
                  borderRadius: "24px",
                  background: "linear-gradient(160deg, rgba(15,7,40,0.98) 0%, rgba(9,5,26,0.99) 60%, rgba(5,3,20,1) 100%)",
                  border: "1px solid rgba(139,92,246,0.22)",
                  boxShadow: "0 0 0 1px rgba(255,255,255,0.04) inset, 0 32px 80px -12px rgba(0,0,0,0.9), 0 0 60px -8px rgba(139,92,246,0.25), 0 0 120px -20px rgba(168,85,247,0.15)",
                  backdropFilter: "blur(40px)",
                }}
              >
                {/* Ambient glow layers */}
                <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-64 h-40 rounded-full pointer-events-none" style={{ background: "radial-gradient(ellipse, rgba(139,92,246,0.12) 0%, transparent 70%)" }} />
                <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 w-48 h-32 rounded-full pointer-events-none" style={{ background: "radial-gradient(ellipse, rgba(168,85,247,0.07) 0%, transparent 70%)" }} />

                {/* Top shimmer line */}
                <div className="absolute top-0 inset-x-0 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(192,132,252,0.6) 40%, rgba(139,92,246,0.8) 60%, transparent)" }} />

                {/* Header */}
                <div className="relative flex items-center gap-3.5 px-5 pt-5 pb-4" style={{ borderBottom: "1px solid rgba(139,92,246,0.1)" }}>
                  {/* Premium Telegram icon */}
                  <div className="relative shrink-0">
                    <div className="w-11 h-11 rounded-[14px] flex items-center justify-center relative overflow-hidden"
                      style={{
                        background: "linear-gradient(145deg, #2AABEE 0%, #1d96d8 50%, #1480c0 100%)",
                        boxShadow: "0 8px 0 rgba(10,80,140,0.7), 0 10px 24px rgba(42,171,238,0.35), inset 0 1px 0 rgba(255,255,255,0.25)",
                      }}>
                      <span className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent pointer-events-none rounded-[14px]" />
                      <Send className="w-4.5 h-4.5 text-white relative z-10 drop-shadow-[0_1px_3px_rgba(0,0,0,0.4)]" style={{ width: "18px", height: "18px" }} />
                    </div>
                    {(user as any)?.telegramChatId && (
                      <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-[#09051A]" style={{ boxShadow: "0 0 6px rgba(52,211,153,0.8)" }} />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-bold tracking-[0.08em] uppercase text-white" style={{ letterSpacing: "0.06em" }}>Telegram Alerts</div>
                    <div className="text-[11px] mt-0.5" style={{ color: "rgba(255,255,255,0.38)" }}>
                      {(user as any)?.telegramChatId ? "@twhosint_bot · Real-time notifications" : "Connect to get instant search alerts"}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {(user as any)?.telegramChatId ? (
                      <motion.span
                        className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold tracking-wider"
                        style={{
                          background: "linear-gradient(135deg, rgba(139,92,246,0.2), rgba(168,85,247,0.1))",
                          border: "1px solid rgba(139,92,246,0.35)",
                          color: "#C084FC",
                        }}
                      >
                        <motion.span
                          className="w-1.5 h-1.5 rounded-full bg-violet-400"
                          animate={{ opacity: [1, 0.3, 1], scale: [1, 0.8, 1] }}
                          transition={{ repeat: Infinity, duration: 1.6, ease: "easeInOut" }}
                          style={{ boxShadow: "0 0 6px rgba(192,132,252,0.9)" }}
                        />
                        LIVE
                      </motion.span>
                    ) : (
                      <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold tracking-wider"
                        style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.3)" }}>
                        OFF
                      </span>
                    )}

                    {/* Close button */}
                    <motion.button
                      whileHover={{ scale: 1.08 }}
                      whileTap={{ scale: 0.94 }}
                      onClick={() => { setIsTgModalOpen(false); setTgLinkClicked(false); }}
                      className="w-7 h-7 rounded-full flex items-center justify-center transition-all"
                      style={{
                        background: "rgba(255,255,255,0.06)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        color: "rgba(255,255,255,0.5)",
                      }}
                      onMouseEnter={e => {
                        (e.currentTarget as HTMLButtonElement).style.background = "rgba(139,92,246,0.15)";
                        (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(139,92,246,0.35)";
                        (e.currentTarget as HTMLButtonElement).style.color = "rgba(192,132,252,0.9)";
                      }}
                      onMouseLeave={e => {
                        (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.06)";
                        (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.1)";
                        (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.5)";
                      }}
                      data-testid="button-close-telegram"
                    >
                      <X className="w-3.5 h-3.5" />
                    </motion.button>
                  </div>
                </div>

                <div className="px-5 py-4 space-y-3">
                  {(user as any)?.telegramChatId ? (
                    /* ── CONNECTED STATE ── */
                    <>
                      {/* Premium status card */}
                      <motion.div
                        className="flex items-center gap-3.5 px-4 py-3.5 rounded-2xl relative overflow-hidden"
                        style={{
                          background: "linear-gradient(135deg, rgba(16,185,129,0.1) 0%, rgba(5,150,105,0.06) 100%)",
                          border: "1px solid rgba(16,185,129,0.2)",
                          boxShadow: "0 0 20px -4px rgba(16,185,129,0.1) inset",
                        }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-transparent pointer-events-none rounded-2xl" />
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                          style={{ background: "rgba(16,185,129,0.15)", border: "1px solid rgba(16,185,129,0.25)" }}>
                          <CheckCircle2 className="w-4.5 h-4.5 text-emerald-400" style={{ width: "18px", height: "18px" }} />
                        </div>
                        <div className="flex-1">
                          <div className="text-[13px] font-semibold text-emerald-300">Connected</div>
                          <div className="text-[11px] mt-0.5" style={{ color: "rgba(52,211,153,0.5)" }}>Alerts active for all searches</div>
                        </div>
                        {/* 3D shield badge */}
                        <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                          style={{
                            background: "linear-gradient(145deg, rgba(139,92,246,0.25), rgba(109,40,217,0.15))",
                            border: "1px solid rgba(139,92,246,0.3)",
                            boxShadow: "0 4px 8px rgba(109,40,217,0.2)",
                          }}>
                          <Shield className="w-4 h-4 text-violet-300" />
                        </div>
                      </motion.div>

                      {/* Chat ID — premium glass field */}
                      <div>
                        <div className="text-[10px] font-semibold uppercase tracking-widest mb-2" style={{ color: "rgba(255,255,255,0.28)", letterSpacing: "0.1em" }}>Your Chat ID</div>
                        <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-[14px] relative"
                          style={{
                            background: "rgba(0,0,0,0.4)",
                            border: "1px solid rgba(139,92,246,0.15)",
                            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.03), inset 0 0 20px rgba(139,92,246,0.04)",
                          }}>
                          <span className="text-[13px] font-mono flex-1 tracking-wider text-violet-200">{(user as any).telegramChatId}</span>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.92 }}
                            onClick={() => {
                              navigator.clipboard.writeText((user as any).telegramChatId);
                              setCopiedChatId(true);
                              setTimeout(() => setCopiedChatId(false), 2000);
                            }}
                            className="w-6 h-6 rounded-lg flex items-center justify-center transition-all"
                            style={{
                              background: "rgba(139,92,246,0.12)",
                              border: "1px solid rgba(139,92,246,0.2)",
                            }}
                            data-testid="button-copy-chatid"
                          >
                            {copiedChatId
                              ? <Check className="w-3 h-3 text-emerald-400" />
                              : <Copy className="w-3 h-3 text-violet-400" />}
                          </motion.button>
                        </div>
                      </div>

                      {/* Premium feature tiles */}
                      <div className="space-y-2">
                        {[
                          {
                            Icon: Zap,
                            iconColor: "#FB923C",
                            iconBg: "linear-gradient(145deg, rgba(251,146,60,0.2), rgba(234,88,12,0.12))",
                            iconBorder: "rgba(251,146,60,0.25)",
                            title: "Instant alert for every search result",
                            sub: "Get notified immediately",
                          },
                          {
                            Icon: MapPin,
                            iconColor: "#60A5FA",
                            iconBg: "linear-gradient(145deg, rgba(96,165,250,0.2), rgba(37,99,235,0.12))",
                            iconBorder: "rgba(96,165,250,0.25)",
                            title: "Full data — address, maps, links",
                            sub: "Comprehensive results delivered",
                          },
                          {
                            Icon: RefreshCw,
                            iconColor: "#A78BFA",
                            iconBg: "linear-gradient(145deg, rgba(167,139,250,0.2), rgba(109,40,217,0.12))",
                            iconBorder: "rgba(167,139,250,0.25)",
                            title: "Real-time 24/7 — never miss anything",
                            sub: "Always updated, always on",
                          },
                        ].map(({ Icon, iconColor, iconBg, iconBorder, title, sub }) => (
                          <motion.div
                            key={title}
                            className="flex items-center gap-3 px-3.5 py-3 rounded-[14px] relative overflow-hidden group cursor-default"
                            style={{
                              background: "rgba(255,255,255,0.025)",
                              border: "1px solid rgba(255,255,255,0.07)",
                            }}
                            whileHover={{
                              y: -1,
                              transition: { duration: 0.18 },
                            }}
                          >
                            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-[14px]"
                              style={{ background: "rgba(139,92,246,0.04)" }} />
                            <div className="w-9 h-9 rounded-[11px] flex items-center justify-center shrink-0 relative"
                              style={{ background: iconBg, border: `1px solid ${iconBorder}`, boxShadow: `0 4px 12px rgba(0,0,0,0.2)` }}>
                              <span className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent rounded-[11px]" />
                              <Icon className="w-4 h-4 relative z-10" style={{ color: iconColor, width: "16px", height: "16px" }} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-[12px] font-medium text-white/80 leading-snug">{title}</div>
                              <div className="text-[10px] mt-0.5" style={{ color: "rgba(255,255,255,0.3)" }}>{sub}</div>
                            </div>
                            <ChevronRight className="w-3.5 h-3.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: "rgba(139,92,246,0.7)" }} />
                          </motion.div>
                        ))}
                      </div>

                      {/* Disconnect button */}
                      <motion.button
                        whileHover={{ y: -1 }}
                        whileTap={{ scale: 0.99 }}
                        onClick={() => { telegramMutation.mutate(""); setIsTgModalOpen(false); }}
                        disabled={telegramMutation.isPending}
                        className="w-full flex items-center justify-center gap-2.5 py-3 rounded-[14px] text-[12px] font-semibold tracking-wide transition-all disabled:opacity-40 relative overflow-hidden group"
                        style={{
                          background: "rgba(239,68,68,0.05)",
                          border: "1px solid rgba(239,68,68,0.2)",
                          color: "rgba(252,165,165,0.6)",
                        }}
                        onMouseEnter={e => {
                          const el = e.currentTarget as HTMLButtonElement;
                          el.style.background = "rgba(239,68,68,0.1)";
                          el.style.borderColor = "rgba(239,68,68,0.35)";
                          el.style.color = "rgba(252,165,165,0.9)";
                          el.style.boxShadow = "0 0 20px -4px rgba(239,68,68,0.15)";
                        }}
                        onMouseLeave={e => {
                          const el = e.currentTarget as HTMLButtonElement;
                          el.style.background = "rgba(239,68,68,0.05)";
                          el.style.borderColor = "rgba(239,68,68,0.2)";
                          el.style.color = "rgba(252,165,165,0.6)";
                          el.style.boxShadow = "none";
                        }}
                        data-testid="button-disconnect-telegram"
                      >
                        <Unlink className="w-3.5 h-3.5" />
                        {telegramMutation.isPending ? "Disconnecting..." : "Disconnect Telegram"}
                      </motion.button>
                    </>
                  ) : (
                    /* ── DISCONNECTED STATE ── */
                    <>
                      {!tgLinkClicked ? (
                        <>
                          {/* Step guide */}
                          <div>
                            <div className="text-[10px] font-semibold uppercase tracking-widest mb-2.5" style={{ color: "rgba(255,255,255,0.28)", letterSpacing: "0.1em" }}>How to connect</div>
                            <div className="space-y-1.5">
                              {[
                                { n: "01", text: "Tap the connect button below" },
                                { n: "02", text: "Telegram opens — send /start to the bot" },
                                { n: "03", text: "Done! Alerts activate automatically" },
                              ].map(({ n, text }) => (
                                <div key={n} className="flex items-start gap-3 px-3.5 py-2.5 rounded-[12px]"
                                  style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.06)" }}>
                                  <span className="text-[10px] font-bold shrink-0 mt-px" style={{ color: "rgba(139,92,246,0.6)" }}>{n}</span>
                                  <span className="text-[11px] leading-snug" style={{ color: "rgba(255,255,255,0.5)" }}>{text}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* CTA */}
                          <motion.a
                            href={`https://t.me/twhosint_bot?start=${user?.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => { setTgLinkClicked(true); startTgPolling(); }}
                            className="flex items-center justify-center gap-2.5 w-full py-3.5 rounded-[14px] text-[12px] font-semibold tracking-wide transition-all relative overflow-hidden"
                            style={{
                              background: "linear-gradient(135deg, rgba(42,171,238,0.2) 0%, rgba(29,150,216,0.12) 100%)",
                              border: "1px solid rgba(42,171,238,0.4)",
                              color: "#7DD3FC",
                              boxShadow: "0 0 24px -6px rgba(42,171,238,0.2)",
                            }}
                            whileHover={{ y: -1, boxShadow: "0 0 32px -4px rgba(42,171,238,0.3)" }}
                            whileTap={{ scale: 0.99 }}
                            data-testid="link-connect-telegram"
                          >
                            <Send className="w-4 h-4" />
                            Connect Telegram
                          </motion.a>
                        </>
                      ) : (
                        /* Waiting state */
                        <>
                          <div className="flex flex-col items-center gap-3 py-5">
                            <div className="relative">
                              <motion.div
                                className="w-14 h-14 rounded-full"
                                style={{ border: "2px solid rgba(139,92,246,0.3)" }}
                                animate={{ rotate: 360 }}
                                transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
                              />
                              <div className="absolute inset-0 flex items-center justify-center">
                                <motion.span
                                  className="w-3 h-3 rounded-full"
                                  style={{ background: "#8B5CF6", boxShadow: "0 0 10px rgba(139,92,246,0.8)" }}
                                  animate={{ opacity: [1, 0.4, 1], scale: [1, 0.85, 1] }}
                                  transition={{ repeat: Infinity, duration: 1.4 }}
                                />
                              </div>
                            </div>
                            <div className="text-center">
                              <div className="text-[13px] font-semibold text-violet-300">Waiting for connection...</div>
                              <div className="text-[11px] mt-0.5" style={{ color: "rgba(255,255,255,0.3)" }}>Page will update automatically</div>
                            </div>
                          </div>

                          <div className="px-4 py-3 rounded-[14px] space-y-2"
                            style={{ background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.06)" }}>
                            <div className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.25)" }}>In Telegram:</div>
                            <div className="text-[11px]" style={{ color: "rgba(255,255,255,0.5)" }}>
                              1. Open <span className="text-sky-400 font-semibold">@twhosint_bot</span>
                            </div>
                            <div className="text-[11px]" style={{ color: "rgba(255,255,255,0.5)" }}>
                              2. Send <span className="text-sky-400 font-semibold">/start</span> → linked instantly
                            </div>
                          </div>

                          <div className="flex gap-2">
                            <motion.button
                              whileHover={{ y: -1 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] })}
                              className="flex-1 py-2.5 rounded-[12px] text-[11px] font-semibold tracking-wide transition-all"
                              style={{ background: "rgba(139,92,246,0.12)", border: "1px solid rgba(139,92,246,0.25)", color: "#A78BFA" }}
                              data-testid="button-check-telegram"
                            >
                              ↻ Check Now
                            </motion.button>
                            <motion.button
                              whileHover={{ y: -1 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => setTgLinkClicked(false)}
                              className="px-4 py-2.5 rounded-[12px] text-[11px] font-medium transition-all flex items-center gap-1.5"
                              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.4)" }}
                              data-testid="button-back-telegram"
                            >
                              <ArrowLeft className="w-3 h-3" />
                              Back
                            </motion.button>
                          </div>
                        </>
                      )}

                      {/* Manual entry */}
                      <details>
                        <summary className="text-[10px] cursor-pointer uppercase tracking-widest list-none text-center transition-colors select-none py-1"
                          style={{ color: "rgba(255,255,255,0.2)" }}
                          onMouseEnter={e => (e.currentTarget.style.color = "rgba(255,255,255,0.45)")}
                          onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.2)")}>
                          Advanced: enter Chat ID manually ▾
                        </summary>
                        <div className="mt-3 space-y-2">
                          <div className="text-[10px]" style={{ color: "rgba(255,255,255,0.25)" }}>Get your ID from <span style={{ color: "rgba(255,255,255,0.45)" }}>@userinfobot</span> on Telegram</div>
                          <div className="flex gap-2">
                            <input
                              value={telegramInput}
                              onChange={e => setTelegramInput(e.target.value)}
                              placeholder="e.g. 1234567890"
                              className="flex-1 text-[12px] text-white placeholder:text-white/20 px-3 py-2 rounded-[10px] outline-none font-mono transition-all"
                              style={{
                                background: "rgba(0,0,0,0.4)",
                                border: "1px solid rgba(139,92,246,0.15)",
                              }}
                              onFocus={e => (e.currentTarget.style.borderColor = "rgba(139,92,246,0.4)")}
                              onBlur={e => (e.currentTarget.style.borderColor = "rgba(139,92,246,0.15)")}
                              data-testid="input-telegram-chatid"
                            />
                            <button
                              onClick={() => { if (telegramInput.trim()) { telegramMutation.mutate(telegramInput.trim()); setIsTgModalOpen(false); }}}
                              disabled={telegramMutation.isPending || !telegramInput.trim()}
                              className="text-[11px] font-semibold px-3 py-2 rounded-[10px] uppercase tracking-wide transition-all disabled:opacity-40"
                              style={{ background: "rgba(139,92,246,0.2)", border: "1px solid rgba(139,92,246,0.35)", color: "#C084FC" }}
                              data-testid="button-save-chatid"
                            >
                              Save
                            </button>
                          </div>
                        </div>
                      </details>
                    </>
                  )}
                </div>

                {/* Bottom shimmer */}
                <div className="absolute bottom-0 inset-x-0 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(139,92,246,0.2) 50%, transparent)" }} />
              </motion.div>
            </DialogContent>
          </Dialog>


          {/* Main Content Area */}
          <div className="flex-1 min-h-[400px] md:min-h-[500px] w-full overflow-hidden">
            <AnimatePresence mode="wait">
              {activeTab === "mobile" && (
                <motion.div
                  key="mobile"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="h-full flex flex-col gap-4 md:gap-5"
                >
                  {comingSoon.mobile ? (
                    <ServiceComingSoon emoji="📱" tileClass="t-violet" label="Number Search" reason={serviceReasons.mobile} />
                  ) : (
                    <>
                      <CyberCard>
                        <div className="flex items-center gap-3 mb-5 pb-4 border-b border-white/[0.07]">
                          <div className="icon3d t-violet w-11 h-11 rounded-[14px] shrink-0">
                            <span className="e text-2xl select-none">📱</span>
                          </div>
                          <div>
                            <h2 className="text-base font-semibold text-white">Mobile Intelligence</h2>
                            <p className="text-xs text-white/40">Lookup carrier, identity, and location data</p>
                          </div>
                        </div>
                        <Form {...mobileForm}>
                          <form onSubmit={mobileForm.handleSubmit(onMobileSubmit)} className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-end">
                            <FormField
                              control={mobileForm.control}
                              name="number"
                              render={({ field }) => (
                                <FormItem className="flex-1">
                                  <FormLabel className="text-sm text-white/60 font-medium">Mobile Number (India)</FormLabel>
                                  <FormControl>
                                    <div className="relative flex items-center">
                                      <div
                                        className="absolute left-0 flex items-center gap-1.5 px-3 h-11 select-none pointer-events-none z-10"
                                        style={{ borderRight: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.45)" }}
                                      >
                                        <Phone className="w-3.5 h-3.5" style={{ width: "14px", height: "14px" }} />
                                        <span className="text-sm font-medium">+91</span>
                                      </div>
                                      <Input
                                        placeholder="7065008260"
                                        className="bg-white/[0.04] border-white/[0.1] focus:border-violet-500 h-11 text-white placeholder:text-white/20 rounded-xl pl-[78px]"
                                        maxLength={10}
                                        {...field}
                                        data-testid="input-mobile-number"
                                      />
                                    </div>
                                  </FormControl>
                                  <FormMessage className="text-xs" />
                                </FormItem>
                              )}
                            />
                            <CyberButton type="submit" className="h-11 w-full sm:w-28" isLoading={mobileMutation.isPending}>
                              Analyze
                            </CyberButton>
                          </form>
                        </Form>
                      </CyberCard>
                      <TerminalOutput data={mobileMutation.data?.data} title="Mobile Intelligence Results" isLoading={mobileMutation.isPending} className="flex-1" />
                    </>
                  )}
                </motion.div>
              )}

              {activeTab === "aadhar" && (
                <motion.div key="aadhar" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }} className="h-full flex flex-col gap-4 md:gap-5">
                  {comingSoon.aadhar ? (
                    <ServiceComingSoon emoji="🪪" tileClass="t-fuchsia" label="Aadhaar Search" reason={serviceReasons.aadhar} />
                  ) : (
                    <>
                      <CyberCard>
                        <div className="flex items-center gap-3 mb-5 pb-4 border-b border-white/[0.07]">
                          <div className="icon3d t-fuchsia w-11 h-11 rounded-[14px] shrink-0">
                            <span className="e text-2xl select-none">🪪</span>
                          </div>
                          <div>
                            <h2 className="text-base font-semibold text-white">Aadhar Intelligence</h2>
                            <p className="text-xs text-white/40">Lookup identity details linked to an Aadhar number</p>
                          </div>
                        </div>
                        <Form {...aadharForm}>
                          <form onSubmit={aadharForm.handleSubmit(onAadharSubmit)} className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-end">
                            <FormField
                              control={aadharForm.control}
                              name="number"
                              render={({ field }) => (
                                <FormItem className="flex-1">
                                  <FormLabel className="text-sm text-white/60 font-medium">Aadhar Number</FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder="e.g. 123456789012"
                                      className="bg-white/[0.04] border-white/[0.1] focus:border-violet-500 h-11 text-white placeholder:text-white/20 rounded-xl"
                                      maxLength={12}
                                      {...field}
                                      data-testid="input-aadhar-number"
                                    />
                                  </FormControl>
                                  <FormMessage className="text-xs" />
                                </FormItem>
                              )}
                            />
                            <CyberButton type="submit" className="h-11 w-full sm:w-28" isLoading={aadharMutation.isPending}>
                              Lookup
                            </CyberButton>
                          </form>
                        </Form>
                      </CyberCard>
                      <TerminalOutput data={aadharMutation.data?.data} title="Aadhar Intelligence Results" isLoading={aadharMutation.isPending} className="flex-1" />
                    </>
                  )}
                </motion.div>
              )}

              {activeTab === "vehicle" && (
                <motion.div key="vehicle" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }} className="h-full flex flex-col gap-4 md:gap-5">
                  {comingSoon.vehicle ? (
                    <ServiceComingSoon emoji="🚗" tileClass="t-orange" label="Vehicle Search" reason={serviceReasons.vehicle} />
                  ) : (
                    <>
                      <CyberCard>
                        <div className="flex items-center gap-3 mb-5 pb-4 border-b border-white/[0.07]">
                          <div className="icon3d t-orange w-11 h-11 rounded-[14px] shrink-0">
                            <span className="e text-2xl select-none">🚗</span>
                          </div>
                          <div>
                            <h2 className="text-base font-semibold text-white">Vehicle Recon</h2>
                            <p className="text-xs text-white/40">Lookup registration details for any vehicle RC number</p>
                          </div>
                        </div>
                        <Form {...vehicleForm}>
                          <form onSubmit={vehicleForm.handleSubmit(onVehicleSubmit)} className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-end">
                            <FormField
                              control={vehicleForm.control}
                              name="number"
                              render={({ field }) => (
                                <FormItem className="flex-1">
                                  <FormLabel className="text-sm text-white/60 font-medium">Vehicle RC Number</FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder="e.g. MH12AB1234"
                                      className="bg-white/[0.04] border-white/[0.1] focus:border-violet-500 h-11 text-white placeholder:text-white/20 rounded-xl"
                                      {...field}
                                      data-testid="input-vehicle-number"
                                    />
                                  </FormControl>
                                  <FormMessage className="text-xs" />
                                </FormItem>
                              )}
                            />
                            <CyberButton type="submit" className="h-11 w-full sm:w-28" isLoading={vehicleMutation.isPending}>
                              Lookup
                            </CyberButton>
                          </form>
                        </Form>
                      </CyberCard>
                      <TerminalOutput data={vehicleMutation.data?.data} title="Vehicle Recon Results" isLoading={vehicleMutation.isPending} className="flex-1" />
                    </>
                  )}
                </motion.div>
              )}

              {activeTab === "email" && (
                <motion.div key="email" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }} className="h-full flex flex-col gap-5">
                  {comingSoon.email !== false ? (
                    <ServiceComingSoon emoji="📧" tileClass="t-emerald" label="Email Search" reason={serviceReasons.email} />
                  ) : (
                    <>
                      <CyberCard>
                        <div className="flex items-center gap-3 mb-5 pb-4 border-b border-white/[0.07]">
                          <div className="icon3d t-emerald w-11 h-11 rounded-[14px] shrink-0">
                            <span className="e text-2xl select-none">📧</span>
                          </div>
                          <div>
                            <h2 className="text-base font-semibold text-white">Email Intelligence</h2>
                            <p className="text-xs text-white/40">Lookup details linked to a Gmail / email address</p>
                          </div>
                        </div>
                        <Form {...emailForm}>
                          <form onSubmit={emailForm.handleSubmit(onEmailSubmit)} className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-end">
                            <FormField
                              control={emailForm.control}
                              name="email"
                              render={({ field }) => (
                                <FormItem className="flex-1">
                                  <FormLabel className="text-sm text-white/60 font-medium">Email Address</FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder="e.g. user@gmail.com"
                                      className="bg-white/[0.04] border-white/[0.1] focus:border-violet-500 h-11 text-white placeholder:text-white/20 rounded-xl"
                                      {...field}
                                      data-testid="input-email-address"
                                    />
                                  </FormControl>
                                  <FormMessage className="text-xs" />
                                </FormItem>
                              )}
                            />
                            <CyberButton type="submit" className="h-11 w-full sm:w-28" isLoading={emailMutation.isPending}>
                              Lookup
                            </CyberButton>
                          </form>
                        </Form>
                      </CyberCard>
                      <TerminalOutput data={emailMutation.data?.data} title="Email Intelligence Results" isLoading={emailMutation.isPending} className="flex-1" />
                    </>
                  )}
                </motion.div>
              )}

              {activeTab === "ip" && (
                <motion.div key="ip" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }} className="h-full flex flex-col gap-4 md:gap-5">
                  {comingSoon.ip ? (
                    <ServiceComingSoon emoji="🌐" tileClass="t-blue" label="IP Trace" reason={serviceReasons.ip} />
                  ) : (
                    <>
                      <CyberCard>
                        <div className="flex items-center gap-3 mb-5 pb-4 border-b border-white/[0.07]">
                          <div className="icon3d t-blue w-11 h-11 rounded-[14px] shrink-0">
                            <span className="e text-2xl select-none">🌐</span>
                          </div>
                          <div>
                            <h2 className="text-base font-semibold text-white">Network Probe</h2>
                            <p className="text-xs text-white/40">Geolocation & ISP identification for IPv4</p>
                          </div>
                        </div>
                        <Form {...ipForm}>
                          <form onSubmit={ipForm.handleSubmit(onIpSubmit)} className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-end">
                            <FormField
                              control={ipForm.control}
                              name="ip"
                              render={({ field }) => (
                                <FormItem className="flex-1">
                                  <FormLabel className="text-sm text-white/60 font-medium">IP Address (IPv4)</FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder="e.g. 192.168.1.1"
                                      className="bg-white/[0.04] border-white/[0.1] focus:border-violet-500 h-11 text-white placeholder:text-white/25 rounded-xl"
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage className="text-xs" />
                                </FormItem>
                              )}
                            />
                            <CyberButton type="submit" className="h-11 w-full sm:w-28" isLoading={ipMutation.isPending}>
                              Probe
                            </CyberButton>
                          </form>
                        </Form>
                      </CyberCard>
                      <TerminalOutput data={ipMutation.data?.data} title="Network Probe Results" isLoading={ipMutation.isPending} className="flex-1" />
                    </>
                  )}
                </motion.div>
              )}

              {activeTab === "history" && (
                <motion.div key="history" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }} className="h-full flex flex-col gap-5">
                  <CyberCard className="flex-1">
                    <div className="flex items-center gap-3 mb-5 pb-4 border-b border-white/[0.07]">
                      <div className="icon3d t-slate w-11 h-11 rounded-[14px] shrink-0">
                        <span className="e text-2xl select-none">🕐</span>
                      </div>
                      <div>
                        <h2 className="text-base font-semibold text-white">Recent Searches</h2>
                        <p className="text-xs text-white/40">Your query history</p>
                      </div>
                    </div>
                    <ScrollArea className="h-[350px] md:h-[400px] pr-2 md:pr-4">
                      <div className="space-y-2">
                        {history.length === 0 ? (
                          <p className="text-center text-white/30 text-sm py-8">No searches yet</p>
                        ) : (
                          history.map((log: any) => (
                            <div key={log.id} className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-3 hover:bg-white/[0.04] transition-colors">
                              <div className="flex justify-between items-start gap-2 mb-1.5">
                                <span className="text-violet-300 font-medium text-xs capitalize">{log.service}</span>
                                <span className="text-[10px] text-white/30">{new Date(log.createdAt).toLocaleString()}</span>
                              </div>
                              <p className="text-sm text-white/70 mb-3 break-all">{log.query}</p>
                              {log.result && <TerminalOutput data={log.result} title="Result" className="h-auto" />}
                            </div>
                          ))
                        )}
                      </div>
                    </ScrollArea>
                  </CyberCard>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>

      {/* Mobile bottom navigation */}
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
              { id: "home", icon: HomeIcon, label: "Home", action: () => navigate("/") },
              { id: "mobile", icon: Smartphone, label: "Mobile", action: () => setActiveTab("mobile") },
              { id: "ip", icon: Globe, label: "IP Probe", action: () => setActiveTab("ip") },
              { id: "history", icon: History, label: "History", action: () => setActiveTab("history") },
              { id: "telegram", icon: Send, label: "Alerts", action: () => setIsTgModalOpen(true) },
            ] as const
          ).map(({ id, icon: Icon, label, action }) => {
            const isActive =
              (id === "mobile" && activeTab === "mobile") ||
              (id === "ip" && activeTab === "ip") ||
              (id === "history" && activeTab === "history");
            return (
              <button
                key={id}
                onClick={action}
                className="flex-1 flex flex-col items-center gap-1 py-2.5 rounded-xl transition-all touch-manipulation"
                style={{
                  background: isActive ? "rgba(139,92,246,0.15)" : "transparent",
                  minHeight: "52px",
                }}
                data-testid={`nav-bottom-${id}`}
              >
                <Icon
                  className="shrink-0"
                  style={{
                    width: "18px",
                    height: "18px",
                    color: isActive ? "#A78BFA" : "rgba(255,255,255,0.35)",
                  }}
                />
                <span
                  className="text-[10px] font-medium leading-none"
                  style={{ color: isActive ? "#C084FC" : "rgba(255,255,255,0.3)" }}
                >
                  {label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
      <AdOverlay open={showAdOverlay} onComplete={handleAdComplete} />
    </div>
  );
}
