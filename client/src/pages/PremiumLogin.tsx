import { useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Crown, Eye, EyeOff, LogIn, LogOut, Infinity } from "lucide-react";
import { MatrixBackground } from "@/components/MatrixBackground";
import { usePremiumAuth } from "@/hooks/use-premium-auth";
import { useToast } from "@/hooks/use-toast";
import logoPath from "/favicon.png";

export default function PremiumLogin() {
  const [, setLocation] = useLocation();
  const { premiumUser, isLoading, login, logout, isLoggingIn, isLoggingOut, isPremium } = usePremiumAuth();
  const { toast } = useToast();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      toast({ title: "Enter username and password", variant: "destructive" });
      return;
    }
    try {
      await login({ username: username.trim(), password });
      toast({ title: "Welcome back!", description: `Logged in as ${username.trim()}` });
      setLocation("/dashboard");
    } catch (err: any) {
      toast({ title: "Login failed", description: err.message || "Invalid credentials", variant: "destructive" });
    }
  };

  const handleLogout = () => {
    logout();
    toast({ title: "Logged out" });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative px-4" style={{ background: "#050314" }}>
      <MatrixBackground />

      {/* Logo / header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8 flex flex-col items-center gap-3 z-10"
      >
        <div className="relative">
          <img
            src={logoPath}
            alt="TWH OSINT"
            className="w-16 h-16 rounded-2xl object-contain"
            style={{ boxShadow: "0 0 32px rgba(139,92,246,0.6), 0 0 80px rgba(139,92,246,0.2)" }}
          />
          <div className="absolute -bottom-1.5 -right-1.5 w-6 h-6 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-600 flex items-center justify-center"
            style={{ boxShadow: "0 0 12px rgba(139,92,246,0.8)" }}>
            <Crown className="w-3 h-3 text-white" />
          </div>
        </div>
        <div className="text-center">
          <h1 className="text-xl font-bold text-white tracking-tight font-display">
            TWH<span className="text-violet-400">_OSINT</span>
          </h1>
          <p className="text-[11px] font-semibold text-violet-400/70 uppercase tracking-widest mt-0.5">
            Premium Access Portal
          </p>
        </div>
      </motion.div>

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="w-full max-w-sm z-10"
        style={{
          background: "rgba(9,5,26,0.85)",
          backdropFilter: "blur(24px)",
          border: "1px solid rgba(139,92,246,0.2)",
          borderRadius: "20px",
          boxShadow: "0 24px 80px rgba(0,0,0,0.6), 0 0 40px rgba(139,92,246,0.08)",
        }}
      >
        {/* Top accent */}
        <div className="h-px w-full rounded-t-[20px] bg-gradient-to-r from-transparent via-violet-500/70 to-transparent" />

        <div className="p-6">
          {isLoading ? (
            <div className="flex flex-col items-center gap-3 py-8">
              <div className="w-8 h-8 rounded-full border-2 border-violet-500/30 border-t-violet-500 animate-spin" />
              <p className="text-xs text-white/30">Verifying session…</p>
            </div>
          ) : isPremium && premiumUser ? (
            /* Already logged in */
            <div className="space-y-5">
              <div className="flex items-center gap-3 p-3 rounded-xl border border-violet-500/20 bg-violet-500/[0.06]">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-600 flex items-center justify-center shrink-0"
                  style={{ boxShadow: "0 0 16px rgba(139,92,246,0.5)" }}>
                  <Crown className="w-5 h-5 text-white" />
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-white truncate">{premiumUser.username}</div>
                  <div className="flex items-center gap-1 mt-0.5">
                    <Infinity className="w-2.5 h-2.5 text-violet-400" />
                    <span className="text-[10px] font-semibold text-violet-300 uppercase tracking-widest">Premium Member</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setLocation("/dashboard")}
                className="btn-primary w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold"
              >
                <LogIn className="w-4 h-4" /> Go to Dashboard
              </button>

              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-red-400 border border-red-500/20 hover:bg-red-500/10 transition-all disabled:opacity-50"
              >
                <LogOut className="w-4 h-4" /> {isLoggingOut ? "Signing out…" : "Sign Out"}
              </button>
            </div>
          ) : (
            /* Login form */
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="mb-2">
                <h2 className="text-base font-bold text-white">Sign in to Premium</h2>
                <p className="text-xs text-white/30 mt-0.5">Enter your premium credentials to continue</p>
              </div>

              {/* Username */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-white/50 uppercase tracking-wide">Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  autoComplete="username"
                  placeholder="your_username"
                  className="w-full px-4 py-2.5 rounded-xl text-sm text-white placeholder:text-white/20 outline-none transition-all"
                  style={{
                    background: "rgba(139,92,246,0.06)",
                    border: "1px solid rgba(139,92,246,0.2)",
                    boxShadow: "0 0 0 0 transparent",
                  }}
                  onFocus={e => (e.target.style.borderColor = "rgba(139,92,246,0.5)")}
                  onBlur={e => (e.target.style.borderColor = "rgba(139,92,246,0.2)")}
                />
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-white/50 uppercase tracking-wide">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    autoComplete="current-password"
                    placeholder="••••••••"
                    className="w-full px-4 py-2.5 pr-10 rounded-xl text-sm text-white placeholder:text-white/20 outline-none transition-all"
                    style={{
                      background: "rgba(139,92,246,0.06)",
                      border: "1px solid rgba(139,92,246,0.2)",
                    }}
                    onFocus={e => (e.target.style.borderColor = "rgba(139,92,246,0.5)")}
                    onBlur={e => (e.target.style.borderColor = "rgba(139,92,246,0.2)")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(p => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoggingIn}
                className="btn-primary w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold disabled:opacity-60 disabled:cursor-not-allowed mt-2"
              >
                {isLoggingIn ? (
                  <>
                    <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    Authenticating…
                  </>
                ) : (
                  <>
                    <Crown className="w-4 h-4" /> Sign In
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        {/* Bottom accent */}
        <div className="h-px w-full rounded-b-[20px] bg-gradient-to-r from-transparent via-violet-500/30 to-transparent" />
      </motion.div>

      <p className="mt-6 text-[11px] text-white/20 z-10">
        Premium accounts are issued by administrators only.
      </p>
    </div>
  );
}
