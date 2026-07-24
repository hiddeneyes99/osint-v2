import { useState } from "react";
import { useLocation } from "wouter";
import { Crown, KeyRound } from "lucide-react";
import { usePremiumAuth } from "@/hooks/use-premium-auth";
import { Navbar } from "@/components/Navbar";

export default function PremiumLogin() {
  const { isPremium, login, isLoggingIn } = usePremiumAuth();
  const [, navigate] = useLocation();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  // Already logged in — redirect to dashboard
  if (isPremium) {
    navigate("/dashboard");
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await login({ email: form.email, password: form.password });
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.message || "Login failed");
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-sm">
          {/* Card */}
          <div
            className="rounded-2xl border border-violet-500/20 p-8 space-y-6"
            style={{ background: "rgba(9,5,26,0.95)" }}
          >
            {/* Header */}
            <div className="text-center space-y-2">
              <div className="w-14 h-14 rounded-2xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center mx-auto">
                <Crown className="w-7 h-7 text-violet-400" />
              </div>
              <h1 className="text-xl font-bold text-white">Premium Login</h1>
              <p className="text-white/40 text-sm">
                Sign in with your premium credentials
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-white/40 uppercase tracking-wide">
                  Email
                </label>
                <input
                  type="email"
                  required
                  autoComplete="email"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  placeholder="your@email.com"
                  className="w-full px-3 py-2.5 rounded-lg text-sm text-white bg-white/[0.04] border border-white/[0.1] outline-none focus:border-violet-500/50 transition-colors"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-white/40 uppercase tracking-wide">
                  Password
                </label>
                <input
                  type="password"
                  required
                  autoComplete="current-password"
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  placeholder="••••••••"
                  className="w-full px-3 py-2.5 rounded-lg text-sm text-white bg-white/[0.04] border border-white/[0.1] outline-none focus:border-violet-500/50 transition-colors"
                />
              </div>

              {error && (
                <p className="text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={isLoggingIn}
                className="w-full py-2.5 rounded-lg text-sm font-semibold bg-violet-600 hover:bg-violet-500 text-white transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {isLoggingIn ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Signing in…
                  </>
                ) : (
                  <>
                    <KeyRound className="w-3.5 h-3.5" />
                    Sign In
                  </>
                )}
              </button>
            </form>

            <p className="text-center text-white/20 text-xs">
              Premium access is granted by an administrator.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
