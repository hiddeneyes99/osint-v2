import { useState, useEffect, useRef, useCallback } from "react";
import { X } from "lucide-react";
import { FaTelegram } from "react-icons/fa";
import { CyberButton } from "@/components/CyberButton";
import { useQuery } from "@tanstack/react-query";

// ─── constants ────────────────────────────────────────────────────────────────
const DELAY_MS      = 2000;
const EXIT_DURATION = 360;

// ─── keyframes ────────────────────────────────────────────────────────────────
const POPUP_STYLES = `
  @keyframes pp-backdrop-in  { from{opacity:0}  to{opacity:1} }
  @keyframes pp-backdrop-out { from{opacity:1}  to{opacity:0} }
  @keyframes pp-card-in {
    from { opacity:0; transform:scale(0.86) translateY(18px); }
    to   { opacity:1; transform:scale(1)    translateY(0);    }
  }
  @keyframes pp-card-out {
    from { opacity:1; transform:scale(1)    translateY(0);    }
    to   { opacity:0; transform:scale(0.93) translateY(10px); }
  }
  @keyframes pp-border-spin {
    0%   { background-position:0%   50% }
    50%  { background-position:100% 50% }
    100% { background-position:0%   50% }
  }
  .pp-backdrop-enter { animation: pp-backdrop-in  0.32s ease forwards; }
  .pp-backdrop-exit  { animation: pp-backdrop-out 0.34s ease forwards; }
  .pp-card-enter     { animation: pp-card-in  0.38s cubic-bezier(0.34,1.56,0.64,1) forwards; }
  .pp-card-exit      { animation: pp-card-out 0.32s ease forwards; }
  .pp-glow-border { position:relative; }
  .pp-glow-border::before {
    content:'';
    position:absolute;
    inset:-1.5px;
    border-radius:14px;
    background:linear-gradient(270deg,#8B5CF6,#C084FC,#6366F1,#a855f7,#8B5CF6);
    background-size:400% 400%;
    animation:pp-border-spin 3s ease infinite;
    z-index:0;
  }
  .pp-glow-border > * { position:relative; z-index:1; }
`;

// ─── helpers ──────────────────────────────────────────────────────────────────
function Feature({ text, bright }: { text: string; bright?: boolean }) {
  return (
    <li className="flex items-center gap-2.5 text-sm">
      <span style={{
        color: bright ? "#C084FC" : "#8B5CF6",
        fontSize: "10px", flexShrink: 0,
        filter: bright ? "drop-shadow(0 0 4px rgba(192,132,252,0.7))" : undefined,
      }}>✦</span>
      <span className={bright ? "text-white/80" : "text-white/55"}>{text}</span>
    </li>
  );
}

function Divider() {
  return (
    <div style={{
      height: "1px",
      background: "linear-gradient(90deg,transparent,rgba(139,92,246,0.28),transparent)",
      margin: "0 0 1.5rem 0",
    }} />
  );
}

// ─── component ────────────────────────────────────────────────────────────────
interface Props { isPremium: boolean }

export function PremiumPopup({ isPremium }: Props) {
  const [mounted,  setMounted]  = useState(false);
  const [isOpen,   setIsOpen]   = useState(false);
  const [sending,  setSending]  = useState<"basic" | "premium" | null>(null);

  const showingRef  = useRef(false);
  const timerRef    = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isPremRef   = useRef(isPremium);
  isPremRef.current = isPremium;           // always up-to-date without re-creating callbacks

  // read cached Firebase user for Telegram notification (no extra fetch)
  const { data: user } = useQuery<any>({
    queryKey: ["/api/auth/user"],
    enabled: false,
    staleTime: Infinity,
  });

  // ── stable helpers ────────────────────────────────────────────────────────
  const show = useCallback(() => {
    if (showingRef.current || isPremRef.current) return;
    showingRef.current = true;
    setMounted(true);
    requestAnimationFrame(() => requestAnimationFrame(() => setIsOpen(true)));
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    setTimeout(() => {
      setMounted(false);
      showingRef.current = false;
    }, EXIT_DURATION);
  }, []);

  // ── show every time user lands on "/" ─────────────────────────────────────
  useEffect(() => {
    function handleLocation() {
      if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; }

      if (window.location.pathname === "/") {
        // schedule show; show() itself checks isPremRef
        timerRef.current = setTimeout(show, DELAY_MS);
      } else {
        // navigated away — close if open
        if (showingRef.current) close();
      }
    }

    // run immediately for initial page load
    handleLocation();

    // listen to SPA navigations
    window.addEventListener("popstate",   handleLocation);
    window.addEventListener("pushstate",  handleLocation);  // custom event
    window.addEventListener("replacestate", handleLocation); // custom event

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      window.removeEventListener("popstate",    handleLocation);
      window.removeEventListener("pushstate",   handleLocation);
      window.removeEventListener("replacestate", handleLocation);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show, close]);   // show/close are stable — runs once

  // ── close popup when user becomes premium (e.g. mid-session upgrade) ─────
  useEffect(() => {
    if (isPremium && showingRef.current) close();
  }, [isPremium, close]);

  // ── show every time after login ───────────────────────────────────────────
  useEffect(() => {
    const onLogin = () => {
      if (isPremRef.current) return;
      showingRef.current = false;   // reset so show() doesn't skip
      show();
    };
    window.addEventListener("twh:show-premium", onLogin);
    return () => window.removeEventListener("twh:show-premium", onLogin);
  }, [show]);

  // ── ESC to close ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isOpen) return;
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") close(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [isOpen, close]);

  // ── plan button handler ───────────────────────────────────────────────────
  const handlePlan = async (plan: "basic" | "premium") => {
    setSending(plan);
    try {
      await fetch("/api/notify/plan-interest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan,
          userEmail: (user as any)?.email    ?? null,
          userName:  (user as any)?.username ?? (user as any)?.firstName ?? null,
        }),
      });
    } catch (_) { /* silent */ }
    setSending(null);
    window.open("https://t.me/twhosint", "_blank");
  };

  if (!mounted) return null;

  const backdropCls = isOpen ? "pp-backdrop-enter" : "pp-backdrop-exit";
  const cardCls     = isOpen ? "pp-card-enter"     : "pp-card-exit";

  return (
    <>
      <style>{POPUP_STYLES}</style>

      {/* backdrop */}
      <div
        className={`fixed inset-0 z-[999] flex items-center justify-center p-4 sm:p-6 ${backdropCls}`}
        style={{ background: "rgba(3,1,14,0.82)", backdropFilter: "blur(10px)" }}
        onClick={close}
      >
        {/* card */}
        <div
          className={`relative w-full max-w-2xl ${cardCls}`}
          onClick={e => e.stopPropagation()}
        >
          <div
            className="relative overflow-hidden rounded-2xl"
            style={{
              background: "linear-gradient(160deg,#130a2e 0%,#09051A 55%,#0d0521 100%)",
              border: "1px solid rgba(139,92,246,0.22)",
              boxShadow:
                "0 0 70px rgba(139,92,246,0.14),0 48px 96px rgba(0,0,0,0.65)," +
                "inset 0 1px 0 rgba(255,255,255,0.065)",
            }}
          >
            {/* bg orbs */}
            <div className="absolute pointer-events-none" style={{
              top:"-80px",left:"-80px",width:"280px",height:"280px",
              background:"radial-gradient(circle,rgba(139,92,246,0.11) 0%,transparent 70%)",
            }}/>
            <div className="absolute pointer-events-none" style={{
              bottom:"-60px",right:"-60px",width:"220px",height:"220px",
              background:"radial-gradient(circle,rgba(168,85,247,0.09) 0%,transparent 70%)",
            }}/>

            <div className="relative z-10 p-5 sm:p-8">

              {/* close button */}
              <button
                onClick={close}
                aria-label="Close"
                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-lg transition-all duration-150"
                style={{ color:"rgba(255,255,255,0.35)", background:"transparent" }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLButtonElement).style.color      = "rgba(255,255,255,0.8)";
                  (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.06)";
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLButtonElement).style.color      = "rgba(255,255,255,0.35)";
                  (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                }}
              >
                <X className="w-4 h-4" />
              </button>

              {/* header */}
              <div className="text-center mb-6">
                <div className="text-4xl mb-3" style={{ filter:"drop-shadow(0 0 12px rgba(168,85,247,0.5))" }}>
                  🚀
                </div>
                <h2
                  className="font-display font-bold text-2xl sm:text-3xl tracking-tight mb-3"
                  style={{
                    background: "linear-gradient(135deg,#C084FC,#8B5CF6,#6366F1)",
                    WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text",
                  }}
                >
                  TWH OSINT IS NOW PREMIUM
                </h2>
                <p
                  className="text-sm sm:text-base leading-relaxed mx-auto"
                  style={{ color:"rgba(255,255,255,0.48)", maxWidth:"420px" }}
                >
                  To maintain servers, improve performance and keep adding new
                  OSINT features, we are introducing Premium Plans.
                </p>
              </div>

              <Divider />

              {/* plan cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">

                {/* Basic */}
                <div className="rounded-xl p-5 flex flex-col" style={{
                  background:"rgba(255,255,255,0.025)",
                  border:"1px solid rgba(139,92,246,0.16)",
                  backdropFilter:"blur(8px)",
                }}>
                  <div className="text-2xl mb-1">🥉</div>
                  <p className="text-xs font-bold tracking-widest uppercase mb-1"
                    style={{ color:"rgba(255,255,255,0.45)", fontFamily:"var(--font-display)" }}>
                    Basic Plan
                  </p>
                  <p className="font-display font-bold text-2xl text-white mb-4">
                    ₹300{" "}
                    <span className="text-sm font-normal" style={{ color:"rgba(255,255,255,0.38)" }}>/ Month</span>
                  </p>
                  <ul className="space-y-2.5 mb-5 flex-1">
                    {["1000 Searches Daily","Ads Included","Priority Servers","Faster Response"]
                      .map(f => <Feature key={f} text={f} />)}
                  </ul>
                  <CyberButton variant="outline" className="w-full"
                    isLoading={sending === "basic"} onClick={() => handlePlan("basic")}>
                    Buy Basic
                  </CyberButton>
                </div>

                {/* Premium — animated glowing border */}
                <div className="pp-glow-border rounded-xl flex flex-col">
                  <div className="rounded-xl p-5 flex flex-col h-full overflow-hidden relative"
                    style={{ background:"linear-gradient(145deg,#1e0d45 0%,#130a2e 60%,#0d0521 100%)" }}>
                    <div className="absolute inset-0 pointer-events-none rounded-xl" style={{
                      background:"radial-gradient(ellipse at 45% 0%,rgba(168,85,247,0.14) 0%,transparent 65%)",
                    }}/>
                    <span className="absolute top-3 right-3 text-white font-bold rounded-full px-2 py-0.5"
                      style={{
                        background:"linear-gradient(135deg,#8B5CF6,#C084FC)",
                        fontSize:"10px", letterSpacing:"0.06em",
                        boxShadow:"0 0 10px rgba(168,85,247,0.45)",
                      }}>
                      POPULAR
                    </span>

                    <div className="relative z-10 flex flex-col flex-1">
                      <div className="text-2xl mb-1">👑</div>
                      <p className="text-xs font-bold tracking-widest uppercase mb-1"
                        style={{ color:"rgba(192,132,252,0.75)", fontFamily:"var(--font-display)" }}>
                        Premium Plan
                      </p>
                      <p className="font-display font-bold text-2xl text-white mb-4">
                        ₹500{" "}
                        <span className="text-sm font-normal" style={{ color:"rgba(255,255,255,0.38)" }}>/ Month</span>
                      </p>
                      <ul className="space-y-2.5 mb-5 flex-1">
                        {["Unlimited Searches","Completely Ad-Free","Highest Priority","Premium Support"]
                          .map(f => <Feature key={f} text={f} bright />)}
                      </ul>
                      <CyberButton variant="primary" className="w-full"
                        isLoading={sending === "premium"} onClick={() => handlePlan("premium")}>
                        Get Premium
                      </CyberButton>
                    </div>
                  </div>
                </div>

              </div>

              {/* bottom CTA */}
              <div className="text-center">
                <div style={{
                  height:"1px",
                  background:"linear-gradient(90deg,transparent,rgba(139,92,246,0.22),transparent)",
                  marginBottom:"1rem",
                }}/>
                <p className="text-xs mb-2" style={{ color:"rgba(255,255,255,0.35)" }}>📩 Contact to Buy</p>
                <a
                  href="https://t.me/twhosint"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 font-semibold transition-all duration-150 hover:opacity-80"
                  style={{ color:"#a78bfa" }}
                >
                  <FaTelegram style={{ color:"#2AABEE", fontSize:"20px" }} />
                  <span>@twhosint</span>
                </a>
              </div>

            </div>
          </div>
        </div>
      </div>
    </>
  );
}
