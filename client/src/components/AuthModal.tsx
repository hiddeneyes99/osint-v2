import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/use-auth";
import { usePremiumAuth } from "@/hooks/use-premium-auth";
import { useLocation, Link } from "wouter";
import { CyberButton } from "@/components/CyberButton";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import { Sparkles, Zap, Eye, EyeOff } from "lucide-react";
import logoPath from "/logo.png";

// ─────────────────────────────────────────────────────────────────────────────
// Global keyframes
// ─────────────────────────────────────────────────────────────────────────────
const STYLES = `
  @keyframes twCaret {
    0%,100% { opacity:1; }
    50%      { opacity:0; }
  }
  @keyframes eyeIn {
    from { opacity:0; transform:scale(0.6) rotate(-15deg); }
    to   { opacity:1; transform:scale(1)   rotate(0deg);   }
  }
  .auth-field-glow:focus-within {
    box-shadow: 0 0 0 1.5px rgba(139,92,246,0.55), 0 0 18px rgba(139,92,246,0.15);
    border-radius: 0.75rem;
  }
  .eye-toggle {
    transition: color 0.15s ease, transform 0.2s cubic-bezier(.34,1.56,.64,1), opacity 0.15s ease;
    color: rgba(255,255,255,0.35);
  }
  .eye-toggle:hover  { color:rgba(167,139,250,0.9); transform:scale(1.2); }
  .eye-toggle:active { transform:scale(0.88); }
  .eye-icon-in { animation: eyeIn 0.2s cubic-bezier(.34,1.56,.64,1) both; }
`;

// ─────────────────────────────────────────────────────────────────────────────
// Typewriter hook — cycles phrases when input is idle
// ─────────────────────────────────────────────────────────────────────────────
function useTypewriter(phrases: string[], active: boolean): string {
  const [text, setText]       = useState("");
  const [pi, setPi]           = useState(0);
  const [ci, setCi]           = useState(0);
  const [erasing, setErasing] = useState(false);
  const tid = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!active) { setText(""); setCi(0); setErasing(false); return; }
    const cur = phrases[pi];
    if (!erasing) {
      if (ci < cur.length) {
        tid.current = setTimeout(() => { setText(cur.slice(0, ci + 1)); setCi(c => c + 1); }, 55);
      } else {
        tid.current = setTimeout(() => setErasing(true), 1800);
      }
    } else {
      if (ci > 0) {
        tid.current = setTimeout(() => { setText(cur.slice(0, ci - 1)); setCi(c => c - 1); }, 30);
      } else {
        setErasing(false);
        setPi(i => (i + 1) % phrases.length);
      }
    }
    return () => { if (tid.current) clearTimeout(tid.current); };
  }, [active, ci, erasing, pi, phrases]);

  return text;
}

const EMAIL_PHRASES = ["Search intelligence...", "Lookup mobile records...", "Verify Aadhar identity...", "Track vehicle info...", "you@example.com"];
const PASS_PHRASES  = ["Enter secure key...", "Access credentials...", "Intelligence clearance...", "••••••••"];

// ─────────────────────────────────────────────────────────────────────────────
// Typewriter placeholder overlay (shown when input is empty + unfocused)
// ─────────────────────────────────────────────────────────────────────────────
function TypewriterOverlay({ text, visible }: { text: string; visible: boolean }) {
  if (!visible || !text) return null;
  return (
    <span
      className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none select-none text-sm"
      style={{ color: "rgba(255,255,255,0.22)", fontFamily: "inherit" }}
    >
      {text}
      <span style={{
        display: "inline-block", width: 1.5, height: 13,
        background: "rgba(167,139,250,0.75)", marginLeft: 1,
        animation: "twCaret 0.9s step-end infinite",
        verticalAlign: "middle",
      }} />
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Orbs
// ─────────────────────────────────────────────────────────────────────────────
function FloatingOrbs() {
  return (
    <div className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none">
      <div className="absolute -top-4 -right-4 w-32 h-32 rounded-full opacity-30 animate-pulse"
        style={{ background: "radial-gradient(circle,rgba(139,92,246,0.6) 0%,transparent 70%)", filter: "blur(20px)", animationDuration: "3s" }} />
      <div className="absolute -bottom-6 -left-6 w-40 h-40 rounded-full opacity-20"
        style={{ background: "radial-gradient(circle,rgba(168,85,247,0.5) 0%,transparent 70%)", filter: "blur(25px)", animation: "pulse 4s ease-in-out infinite 1s" }} />
      <div className="absolute top-1/2 -right-2 w-20 h-20 rounded-full opacity-15"
        style={{ background: "radial-gradient(circle,rgba(192,132,252,0.6) 0%,transparent 70%)", filter: "blur(15px)", animation: "pulse 5s ease-in-out infinite 0.5s" }} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Schema
// ─────────────────────────────────────────────────────────────────────────────
const authSchema = z.object({
  email:           z.string().email("Invalid email address"),
  password:        z.string().min(6, "Password must be at least 6 characters"),
  termsAccepted:   z.boolean().optional(),
  privacyAccepted: z.boolean().optional(),
});

interface AuthModalProps { isOpen: boolean; onClose: () => void; }

// ─────────────────────────────────────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────────────────────────────────────
export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [isLogin, setIsLogin]           = useState(true);
  const { login, register, googleLogin } = useAuth();
  const { login: premiumLogin } = usePremiumAuth();
  const [, setLocation]                 = useLocation();
  const { toast }                       = useToast();
  const [isLoading, setIsLoading]       = useState(false);
  const [showPass, setShowPass]         = useState(false);
  const [showPassKey, setShowPassKey]   = useState(0); // forces eye icon re-mount → animation
  const [emailFocused, setEmailFocused] = useState(false);
  const [passFocused,  setPassFocused]  = useState(false);

  const form = useForm<z.infer<typeof authSchema>>({
    resolver: zodResolver(authSchema),
    defaultValues: { email: "", password: "", termsAccepted: false, privacyAccepted: false },
  });

  const emailVal = form.watch("email");
  const passVal  = form.watch("password");

  const emailPH = useTypewriter(EMAIL_PHRASES, !emailFocused && !emailVal);
  const passPH  = useTypewriter(PASS_PHRASES,  !passFocused  && !passVal);

  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => { form.reset(); setIsLogin(true); setIsLoading(false); setShowPass(false); }, 200);
    }
  }, [isOpen]);

  const togglePassword = () => {
    setShowPass(v => !v);
    setShowPassKey(k => k + 1); // remount icon → eyeIn animation plays
  };

  const onSubmit = async (data: z.infer<typeof authSchema>) => {
    if (!isLogin && (!data.termsAccepted || !data.privacyAccepted)) {
      toast({ title: "Validation Error", description: "Please accept all terms and conditions to continue", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    try {
      if (isLogin) {
        // Try Firebase login first; if it fails, fall back to premium credentials
        try {
          await login({ email: data.email, password: data.password });
        } catch {
          // Firebase failed — try premium login (email+password set by admin)
          await premiumLogin({ email: data.email, password: data.password });
        }
      } else {
        const hdrs = { "x-terms-accepted": String(data.termsAccepted), "x-privacy-accepted": String(data.privacyAccepted) };
        await register({ email: data.email, password: data.password, termsAccepted: data.termsAccepted, privacyAccepted: data.privacyAccepted, headers: hdrs } as any);
      }
      onClose();
      setLocation("/dashboard");
      toast({ title: "Success", description: isLogin ? "Logged in successfully" : "Account created successfully" });
    } catch (error: any) {
      toast({ title: "Error", description: "Invalid email or password", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    if (!isLogin) {
      const tv = form.getValues("termsAccepted");
      const pv = form.getValues("privacyAccepted");
      if (!tv || !pv) {
        toast({ title: "Agreement Required", description: "Please accept Terms and Privacy Policy before continuing with Google.", variant: "destructive" });
        form.trigger(["termsAccepted", "privacyAccepted"]);
        return;
      }
    }
    try {
      const hdrs: Record<string,string> = {};
      if (!isLogin) { hdrs["x-terms-accepted"] = String(form.getValues("termsAccepted")); hdrs["x-privacy-accepted"] = String(form.getValues("privacyAccepted")); }
      await googleLogin(hdrs);
      onClose();
      setLocation("/dashboard");
    } catch (error: any) {
      if (error.code !== "auth/popup-closed-by-user") {
        toast({ title: "Error", description: "Google login failed", variant: "destructive" });
      }
    }
  };

  const switchMode = (toLogin: boolean) => { setIsLogin(toLogin); form.reset(); setShowPass(false); };

  return (
    <>
      <style>{STYLES}</style>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="w-[calc(100vw-2rem)] max-w-[420px] overflow-y-auto max-h-[90dvh] p-0 border-0 bg-transparent shadow-none">
          <div className="relative rounded-2xl overflow-hidden border border-white/[0.09]"
            style={{ background: "linear-gradient(160deg,#130a2e 0%,#09051A 50%,#0d0521 100%)" }}>

            <FloatingOrbs />
            <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-violet-500 to-transparent" />
            <div className="absolute top-3 right-10 w-1 h-1 rounded-full bg-violet-400/60 animate-ping" style={{ animationDuration: "2s" }} />
            <div className="absolute top-8 right-6 w-1.5 h-1.5 rounded-full bg-purple-400/40 animate-ping" style={{ animationDuration: "3s", animationDelay: "0.5s" }} />
            <div className="absolute top-5 left-8 w-1 h-1 rounded-full bg-fuchsia-400/50 animate-ping" style={{ animationDuration: "4s", animationDelay: "1s" }} />

            <div className="relative z-10 p-6 pt-5">
              <DialogHeader className="mb-5">
                <div className="flex items-center gap-3 mb-2">
                  <div className="relative">
                    <img src={logoPath} alt="TWH OSINT" className="w-10 h-10 rounded-xl object-cover shrink-0"
                      style={{ boxShadow: "0 0 20px rgba(139,92,246,0.6)" }} />
                    <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full flex items-center justify-center"
                      style={{ background: "linear-gradient(135deg,#8B5CF6,#C084FC)" }}>
                      <Zap className="w-2 h-2 text-white" />
                    </div>
                  </div>
                  <div>
                    <DialogTitle className="text-xl font-bold text-white">
                      {isLogin ? "Welcome back" : "Join the Platform"}
                    </DialogTitle>
                    <DialogDescription className="text-xs text-white/45 mt-0.5">
                      {isLogin ? "Sign in to access intelligence tools" : "Create account & start investigating"}
                    </DialogDescription>
                  </div>
                </div>

                {/* Mode tabs */}
                <div className="flex mt-3 p-1 rounded-xl bg-white/[0.04] border border-white/[0.06]">
                  <button onClick={() => switchMode(true)}
                    className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200 ${isLogin ? "bg-gradient-to-r from-violet-600 to-purple-500 text-white shadow-[0_2px_8px_rgba(139,92,246,0.4)]" : "text-white/40 hover:text-white/60"}`}
                    data-testid="tab-login">Sign In</button>
                  <button onClick={() => switchMode(false)}
                    className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200 ${!isLogin ? "bg-gradient-to-r from-violet-600 to-purple-500 text-white shadow-[0_2px_8px_rgba(139,92,246,0.4)]" : "text-white/40 hover:text-white/60"}`}
                    data-testid="tab-register">Register</button>
                </div>
              </DialogHeader>

              <div className="space-y-5">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3.5">

                    {/* ── Email ── */}
                    <FormField control={form.control} name="email" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs text-white/60 font-medium">Email address</FormLabel>
                        {/* wrapper for glow + typewriter overlay */}
                        <div className="relative auth-field-glow transition-all duration-200">
                          <FormControl>
                            <Input
                              placeholder=""
                              {...field}
                              onFocus={() => setEmailFocused(true)}
                              onBlur={() => { setEmailFocused(false); field.onBlur(); }}
                              className="h-11 bg-white/[0.05] border-white/[0.1] focus:border-violet-500/70 rounded-xl text-white placeholder:text-transparent"
                              style={{ caretColor: "rgba(167,139,250,0.9)", boxShadow: "none" }}
                              data-testid="input-email"
                            />
                          </FormControl>
                          <TypewriterOverlay text={emailPH} visible={!emailFocused && !emailVal} />
                        </div>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )} />

                    {/* ── Password ── */}
                    <FormField control={form.control} name="password" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs text-white/60 font-medium">Password</FormLabel>
                        {/* outer wrapper: glow + positions the eye button */}
                        <div className="relative auth-field-glow transition-all duration-200">
                          <FormControl>
                            <Input
                              type={showPass ? "text" : "password"}
                              placeholder=""
                              {...field}
                              onFocus={() => setPassFocused(true)}
                              onBlur={() => { setPassFocused(false); field.onBlur(); }}
                              className="h-11 bg-white/[0.05] border-white/[0.1] focus:border-violet-500/70 rounded-xl text-white placeholder:text-transparent pr-11"
                              style={{ caretColor: "rgba(167,139,250,0.9)", boxShadow: "none" }}
                              data-testid="input-password"
                            />
                          </FormControl>
                          <TypewriterOverlay text={passPH} visible={!passFocused && !passVal} />

                          {/* Eye toggle — positioned relative to outer wrapper div, not inside FormControl */}
                          <button
                            type="button"
                            onClick={togglePassword}
                            className="eye-toggle absolute right-3 top-1/2 -translate-y-1/2 focus:outline-none z-10"
                            tabIndex={-1}
                            data-testid="button-toggle-password"
                          >
                            {/* key forces remount on toggle → eyeIn animation */}
                            <span key={showPassKey} className="eye-icon-in block">
                              {showPass
                                ? <Eye    className="w-4 h-4" />
                                : <EyeOff className="w-4 h-4" />
                              }
                            </span>
                          </button>
                        </div>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )} />

                    {/* ── Terms (register) ── */}
                    {!isLogin && (
                      <div className="space-y-2.5 p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                        <FormField control={form.control} name="termsAccepted" render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-2.5 space-y-0">
                            <FormControl>
                              <Checkbox checked={field.value} onCheckedChange={field.onChange}
                                className="border-violet-500/50 data-[state=checked]:bg-violet-600 data-[state=checked]:border-violet-600 mt-0.5"
                                data-testid="checkbox-terms" />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel className="text-xs text-white/55">
                                I accept the{" "}
                                <Link href="/terms" className="text-violet-400 hover:text-violet-300 underline underline-offset-2">Terms of Service</Link>
                              </FormLabel>
                              <FormMessage className="text-[10px]" />
                            </div>
                          </FormItem>
                        )} />
                        <FormField control={form.control} name="privacyAccepted" render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-2.5 space-y-0">
                            <FormControl>
                              <Checkbox checked={field.value} onCheckedChange={field.onChange}
                                className="border-violet-500/50 data-[state=checked]:bg-violet-600 data-[state=checked]:border-violet-600 mt-0.5"
                                data-testid="checkbox-privacy" />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel className="text-xs text-white/55">
                                I accept the{" "}
                                <Link href="/privacy" className="text-violet-400 hover:text-violet-300 underline underline-offset-2">Privacy Policy</Link>
                              </FormLabel>
                              <FormMessage className="text-[10px]" />
                            </div>
                          </FormItem>
                        )} />
                      </div>
                    )}

                    <CyberButton type="submit" className="w-full h-11 text-sm mt-1" isLoading={isLoading} data-testid="button-auth-submit">
                      <Sparkles className="w-4 h-4 mr-2 opacity-80" />
                      {isLogin ? "Sign In" : "Create Account"}
                    </CyberButton>
                  </form>
                </Form>

                {/* Divider */}
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <Separator className="w-full bg-white/[0.07]" />
                  </div>
                  <div className="relative flex justify-center">
                    <span className="px-3 text-white/25 text-[10px] uppercase tracking-widest" style={{ background: "transparent" }}>
                      or continue with
                    </span>
                  </div>
                </div>

                {/* Google button */}
                <button
                  onClick={handleGoogleLogin}
                  className="group w-full h-11 relative flex items-center justify-center gap-2.5 rounded-xl text-sm font-medium overflow-hidden transition-all duration-200 active:scale-[0.98]"
                  style={{ background: "linear-gradient(135deg,rgba(255,255,255,0.06),rgba(255,255,255,0.03))", border: "1px solid rgba(255,255,255,0.1)" }}
                  onMouseEnter={e => {
                    const b = e.currentTarget;
                    b.style.background  = "linear-gradient(135deg,rgba(255,255,255,0.09),rgba(255,255,255,0.05))";
                    b.style.border      = "1px solid rgba(139,92,246,0.35)";
                    b.style.boxShadow   = "0 0 20px rgba(139,92,246,0.12),inset 0 1px 0 rgba(255,255,255,0.06)";
                  }}
                  onMouseLeave={e => {
                    const b = e.currentTarget;
                    b.style.background  = "linear-gradient(135deg,rgba(255,255,255,0.06),rgba(255,255,255,0.03))";
                    b.style.border      = "1px solid rgba(255,255,255,0.1)";
                    b.style.boxShadow   = "none";
                  }}
                  data-testid="button-google-login"
                >
                  <div className="absolute inset-0 rounded-xl pointer-events-none"
                    style={{ background: "linear-gradient(to bottom,rgba(255,255,255,0.05),transparent 50%)" }} />
                  <span className="relative flex items-center justify-center w-5 h-5 rounded-full shrink-0"
                    style={{ background: "rgba(255,255,255,0.08)" }}>
                    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                  </span>
                  <span className="relative text-white/70 group-hover:text-white/90 transition-colors duration-200">
                    Continue with Google
                  </span>
                  <span className="absolute right-4 text-white/20 group-hover:text-white/40 group-hover:translate-x-0.5 transition-all duration-200 text-xs">→</span>
                </button>
              </div>
            </div>

            <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
