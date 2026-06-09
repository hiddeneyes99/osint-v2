import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { CyberButton } from "@/components/CyberButton";
import { LogOut, User, History, Infinity, Menu, X, Smartphone, CreditCard, Car, Globe, LayoutDashboard } from "lucide-react";
import { useState, useEffect } from "react";
import { AuthModal } from "./AuthModal";
import { NotificationBell } from "./NotificationBell";
import logoPath from "/favicon.png";

const NAV_SERVICES = [
  { label: "Mobile Lookup", href: "/dashboard?tab=mobile", icon: Smartphone, color: "text-violet-400" },
  { label: "Aadhar Lookup", href: "/dashboard?tab=aadhar", icon: CreditCard, color: "text-purple-400" },
  { label: "Vehicle Lookup", href: "/dashboard?tab=vehicle", icon: Car, color: "text-fuchsia-400" },
  { label: "IP Lookup", href: "/dashboard?tab=ip", icon: Globe, color: "text-indigo-400" },
];

export function Navbar() {
  const { user, isLoading, logout, isLoggingOut } = useAuth();
  const [location] = useLocation();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    if (isMobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isMobileOpen]);

  useEffect(() => { setIsMobileOpen(false); }, [location]);

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-white/[0.06]"
        style={{ background: "rgba(5,3,20,0.9)", backdropFilter: "blur(20px)" }}>
        <div className="container flex h-14 md:h-16 items-center justify-between px-3 md:px-4">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 hover:opacity-80 transition-opacity shrink-0">
            <img src={logoPath} alt="TWH OSINT" className="w-8 h-8 md:w-9 md:h-9 rounded-lg object-contain"
              style={{ boxShadow: "0 0 16px rgba(139,92,246,0.5)" }} />
            <span className="text-base md:text-lg font-bold text-white tracking-tight font-display">
              TWH<span className="text-violet-400">_OSINT</span>
            </span>
          </Link>

          {/* Right nav - desktop */}
          <nav className="hidden md:flex items-center gap-2 shrink-0">
            {isLoading ? (
              <div className="text-xs text-white/40 animate-pulse">Loading...</div>
            ) : user ? (
              <>
                <div className="flex flex-col items-end gap-0.5 border-r border-white/10 pr-3 mr-1">
                  <span className="text-xs text-white/70 font-medium">{user.username}</span>
                  <span className="flex items-center gap-0.5 text-[9px] font-semibold text-violet-300 bg-violet-500/10 border border-violet-500/20 px-1.5 py-0.5 rounded-full">
                    <Infinity className="w-2 h-2 shrink-0" />
                    UNLIMITED
                  </span>
                </div>
                <NotificationBell />
                <Link href="/dashboard">
                  <CyberButton variant={location === "/dashboard" ? "primary" : "outline"} className="text-xs px-3 py-1.5 h-auto">
                    <LayoutDashboard className="mr-1.5 h-3.5 w-3.5" /> Dashboard
                  </CyberButton>
                </Link>
                <Link href="/history">
                  <CyberButton variant={location === "/history" ? "primary" : "outline"} className="text-xs px-3 py-1.5 h-auto">
                    <History className="mr-1.5 h-3.5 w-3.5" /> History
                  </CyberButton>
                </Link>
                <CyberButton variant="danger" className="text-xs px-3 py-1.5 h-auto" onClick={() => logout()} isLoading={isLoggingOut}>
                  <LogOut className="mr-1.5 h-3.5 w-3.5" /> Logout
                </CyberButton>
              </>
            ) : (
              <>
                <Link href="/about">
                  <CyberButton variant="ghost" className="text-xs">About</CyberButton>
                </Link>
                <Link href="/contact">
                  <CyberButton variant="ghost" className="text-xs">Contact</CyberButton>
                </Link>
                <Link href="/privacy">
                  <CyberButton variant="ghost" className="text-xs">Privacy</CyberButton>
                </Link>
                <CyberButton variant="primary" className="text-xs px-4 py-2 h-auto" onClick={() => setIsAuthModalOpen(true)}>
                  <User className="mr-1.5 h-3.5 w-3.5" /> Access
                </CyberButton>
              </>
            )}
          </nav>

          {/* Mobile right side */}
          <div className="flex md:hidden items-center gap-2">
            {user && <NotificationBell />}
            {!user && !isLoading && (
              <CyberButton variant="primary" className="text-xs px-3 py-1.5 h-auto" onClick={() => setIsAuthModalOpen(true)}>
                <User className="mr-1 h-3.5 w-3.5" /> Login
              </CyberButton>
            )}
            <button
              onClick={() => setIsMobileOpen(true)}
              className="w-9 h-9 rounded-xl flex items-center justify-center border border-white/[0.1] bg-white/[0.04] text-white/70 hover:bg-white/[0.08] hover:text-white transition-all active:scale-95"
              aria-label="Open menu"
              data-testid="button-mobile-menu"
            >
              <Menu className="w-4.5 h-4.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile sidebar backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm md:hidden"
          onClick={() => setIsMobileOpen(false)}
          style={{ animation: "fadeIn 0.2s ease" }}
        />
      )}

      {/* Mobile sidebar panel */}
      <aside
        className="fixed top-0 right-0 h-full w-[280px] z-[70] md:hidden flex flex-col"
        style={{
          background: "linear-gradient(160deg, #0F0728 0%, #09051A 100%)",
          borderLeft: "1px solid rgba(139,92,246,0.15)",
          transform: isMobileOpen ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.3s cubic-bezier(0.4,0,0.2,1)",
          boxShadow: isMobileOpen ? "-20px 0 60px rgba(0,0,0,0.6)" : "none",
        }}
      >
        {/* Top accent */}
        <div className="h-px w-full bg-gradient-to-r from-transparent via-violet-500/60 to-transparent" />

        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/[0.06]">
          <div className="flex items-center gap-2.5">
            <img src={logoPath} alt="TWH OSINT" className="w-8 h-8 rounded-lg object-contain" />
            <span className="font-bold text-white text-sm">TWH<span className="text-violet-400">_OSINT</span></span>
          </div>
          <button
            onClick={() => setIsMobileOpen(false)}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white/50 hover:text-white hover:bg-white/[0.08] transition-all"
            data-testid="button-close-mobile-menu"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* User info */}
        {user && (
          <div className="mx-3 mt-4 p-3 rounded-xl border border-violet-500/20 bg-violet-500/[0.06]">
            <div className="text-sm font-semibold text-white truncate">{user.username}</div>
            <div className="flex items-center gap-1 mt-1">
              <Infinity className="w-3 h-3 text-violet-400" />
              <span className="text-[10px] font-semibold text-violet-300">UNLIMITED ACCESS</span>
            </div>
          </div>
        )}

        {/* Services */}
        <div className="px-3 mt-5 flex-1 overflow-y-auto">
          <p className="text-[10px] font-semibold text-white/30 uppercase tracking-widest mb-3 px-1">Services</p>
          <div className="space-y-1">
            {([
              { label: "Mobile Lookup",  href: "/dashboard?tab=mobile",  emoji: "📱", tile: "t-violet"  },
              { label: "Aadhar Lookup",  href: "/dashboard?tab=aadhar",  emoji: "🪪", tile: "t-fuchsia" },
              { label: "Vehicle Lookup", href: "/dashboard?tab=vehicle", emoji: "🚗", tile: "t-orange"  },
              { label: "Email Search",   href: "/dashboard?tab=email",   emoji: "📧", tile: "t-emerald" },
              { label: "IP Probe",       href: "/dashboard?tab=ip",      emoji: "🌐", tile: "t-blue"    },
              { label: "History",        href: "/dashboard?tab=history", emoji: "🕐", tile: "t-slate"   },
            ]).map(({ label, href, emoji, tile }) => (
              <Link key={href} href={href}>
                <button
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-white/70 hover:text-white hover:bg-white/[0.06] transition-all active:scale-[0.98]"
                  data-testid={`link-service-${label.toLowerCase().replace(/\s/g, "-")}`}
                >
                  <div className={`icon3d ${tile} w-9 h-9 rounded-[11px] shrink-0`}>
                    <span className="e text-xl select-none">{emoji}</span>
                  </div>
                  {label}
                </button>
              </Link>
            ))}
          </div>

          {/* Nav links */}
          <p className="text-[10px] font-semibold text-white/30 uppercase tracking-widest mb-3 mt-5 px-1">Navigation</p>
          <div className="space-y-1">
            {user ? (
              <>
                <Link href="/dashboard">
                  <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-white/70 hover:text-white hover:bg-white/[0.06] transition-all">
                    <LayoutDashboard className="w-4 h-4 text-violet-400" /> Dashboard
                  </button>
                </Link>
                <Link href="/history">
                  <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-white/70 hover:text-white hover:bg-white/[0.06] transition-all">
                    <History className="w-4 h-4 text-purple-400" /> Search History
                  </button>
                </Link>
              </>
            ) : (
              <>
                <Link href="/about">
                  <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-white/70 hover:text-white hover:bg-white/[0.06] transition-all">About Us</button>
                </Link>
                <Link href="/contact">
                  <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-white/70 hover:text-white hover:bg-white/[0.06] transition-all">Contact</button>
                </Link>
                <Link href="/privacy">
                  <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-white/70 hover:text-white hover:bg-white/[0.06] transition-all">Privacy Policy</button>
                </Link>
                <Link href="/terms">
                  <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-white/70 hover:text-white hover:bg-white/[0.06] transition-all">Terms</button>
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Bottom actions */}
        <div className="p-3 border-t border-white/[0.06] space-y-2">
          {user ? (
            <button
              onClick={() => logout()}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-red-400 border border-red-500/20 hover:bg-red-500/10 transition-all active:scale-[0.98]"
              data-testid="button-mobile-logout"
            >
              <LogOut className="w-4 h-4" /> Sign Out
            </button>
          ) : (
            <CyberButton variant="primary" className="w-full text-sm" onClick={() => { setIsMobileOpen(false); setIsAuthModalOpen(true); }}>
              <User className="mr-2 h-4 w-4" /> Get Access
            </CyberButton>
          )}
        </div>
      </aside>

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </>
  );
}
