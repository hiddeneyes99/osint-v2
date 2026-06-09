import * as React from "react"
import { useToast } from "@/hooks/use-toast"
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"
import type { ToastProps } from "@/components/ui/toast"

const TOAST_DURATION = 6000

// ── Sound Effects via Web Audio API ───────────────────────────
function playNotificationSound(variant: string) {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext
    if (!AudioCtx) return
    const ctx = new AudioCtx()
    const master = ctx.createGain()
    master.gain.setValueAtTime(0.12, ctx.currentTime)
    master.connect(ctx.destination)

    const tone = (freq: number, start: number, dur: number, type: OscillatorType = "sine", vol = 1) => {
      const osc = ctx.createOscillator()
      const g = ctx.createGain()
      osc.type = type
      osc.frequency.setValueAtTime(freq, ctx.currentTime + start)
      g.gain.setValueAtTime(vol * 0.1, ctx.currentTime + start)
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + start + dur)
      osc.connect(g)
      g.connect(master)
      osc.start(ctx.currentTime + start)
      osc.stop(ctx.currentTime + start + dur)
    }

    switch (variant) {
      case "success":
        tone(523, 0,    0.09)
        tone(659, 0.09, 0.09)
        tone(784, 0.18, 0.16)
        break
      case "destructive":
        tone(280, 0,    0.12, "triangle", 1.2)
        tone(240, 0.1,  0.18, "triangle", 0.9)
        break
      case "warning":
        tone(440, 0,    0.1,  "sine")
        tone(370, 0.12, 0.1,  "sine")
        tone(440, 0.24, 0.08, "sine", 0.6)
        break
      case "telegram":
        tone(660, 0,    0.07)
        tone(880, 0.08, 0.1)
        break
      default: // info / default
        tone(540, 0,    0.1)
        tone(680, 0.08, 0.12)
        break
    }
    setTimeout(() => { try { ctx.close() } catch {} }, 1500)
  } catch {}
}

// ── Progress Bar ───────────────────────────────────────────────
const variantProgressColor: Record<string, string> = {
  default:     "from-violet-500 via-purple-400 to-violet-500",
  destructive: "from-red-500 via-rose-400 to-red-500",
  success:     "from-emerald-500 via-green-400 to-emerald-500",
  warning:     "from-amber-500 via-yellow-400 to-amber-500",
  telegram:    "from-sky-500 via-blue-400 to-sky-500",
}

function ProgressBar({ variant }: { variant: string }) {
  const color = variantProgressColor[variant] ?? variantProgressColor.default
  return (
    <div className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-white/5 overflow-hidden rounded-b-2xl">
      <div
        className={`toast-progress-bar h-full bg-gradient-to-r ${color} rounded-b-2xl`}
        style={{ "--toast-duration": `${TOAST_DURATION}ms` } as React.CSSProperties}
      />
    </div>
  )
}

// ── Icons ──────────────────────────────────────────────────────
const variantIconBg: Record<string, string> = {
  default:     "bg-violet-500/15 border-violet-500/20",
  destructive: "bg-red-500/15 border-red-500/20",
  success:     "bg-emerald-500/15 border-emerald-500/20",
  warning:     "bg-amber-500/15 border-amber-500/20",
  telegram:    "bg-sky-500/15 border-sky-500/20",
}

const variantLeftBar: Record<string, string> = {
  default:     "bg-gradient-to-b from-violet-400 to-purple-600",
  destructive: "bg-gradient-to-b from-red-400 to-rose-600",
  success:     "bg-gradient-to-b from-emerald-400 to-green-600",
  warning:     "bg-gradient-to-b from-amber-400 to-yellow-600",
  telegram:    "bg-gradient-to-b from-sky-400 to-blue-600",
}

function ErrorIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" style={{ animation: "icon-pulse-error 2.2s ease-in-out infinite" }}>
      <path d="M12 9v4M12 17h.01" stroke="#FF5E7A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" stroke="#FF5E7A" strokeWidth="1.8" fill="rgba(255,94,122,0.08)"/>
    </svg>
  )
}

function SuccessIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" style={{ animation: "icon-pulse-success 2.5s ease-in-out infinite" }}>
      <circle cx="12" cy="12" r="10" stroke="#00E676" strokeWidth="1.8" fill="rgba(0,230,118,0.08)"/>
      <path
        d="M8 12.5l2.8 2.8 5.2-5.6"
        stroke="#00E676"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray="40"
        style={{ animation: "check-draw 0.55s cubic-bezier(0.16,1,0.3,1) 0.2s forwards", strokeDashoffset: 40, opacity: 0 }}
      />
    </svg>
  )
}

function WarningIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" style={{ animation: "icon-pulse-warning 2s ease-in-out infinite" }}>
      <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" stroke="#FFB020" strokeWidth="1.8" fill="rgba(255,176,32,0.08)"/>
      <path d="M12 9v4M12 17h.01" stroke="#FFB020" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  )
}

function InfoIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" style={{ animation: "icon-pulse-info 2.8s ease-in-out infinite" }}>
      <circle cx="12" cy="12" r="10" stroke="#60A5FA" strokeWidth="1.8" fill="rgba(96,165,250,0.08)"/>
      <path d="M12 16v-4M12 8h.01" stroke="#60A5FA" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  )
}

function TelegramIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" style={{ animation: "icon-pulse-info 2.4s ease-in-out infinite" }}>
      <circle cx="12" cy="12" r="10" fill="rgba(42,171,238,0.08)" stroke="#2AABEE" strokeWidth="1.8"/>
      <path d="M17.5 7.5 6.5 11.5l3.5 1.5 1.5 3.5 2-2.5 3 2L17.5 7.5z" fill="#2AABEE" stroke="#2AABEE" strokeWidth="0.5" strokeLinejoin="round"/>
    </svg>
  )
}

function DefaultIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" style={{ animation: "icon-glow-default 2.6s ease-in-out infinite" }}>
      <circle cx="12" cy="12" r="10" stroke="#8B5CF6" strokeWidth="1.8" fill="rgba(139,92,246,0.08)"/>
      <path d="M9.5 9.5C9.5 8.12 10.62 7 12 7s2.5 1.12 2.5 2.5c0 1.38-1.12 2.5-2.5 2.5v1.5" stroke="#8B5CF6" strokeWidth="1.8" strokeLinecap="round"/>
      <circle cx="12" cy="17" r="0.8" fill="#8B5CF6"/>
    </svg>
  )
}

function ToastIcon({ variant }: { variant: string }) {
  const bgCls = variantIconBg[variant] ?? variantIconBg.default
  return (
    <div className={`shrink-0 w-9 h-9 rounded-xl border flex items-center justify-center ${bgCls}`}>
      {variant === "destructive" && <ErrorIcon />}
      {variant === "success"     && <SuccessIcon />}
      {variant === "warning"     && <WarningIcon />}
      {variant === "telegram"    && <TelegramIcon />}
      {(variant === "default" || !["destructive","success","warning","telegram"].includes(variant)) && <DefaultIcon />}
    </div>
  )
}

// ── Toaster ────────────────────────────────────────────────────
type ToastVariant = NonNullable<ToastProps["variant"]>

export function Toaster() {
  const { toasts } = useToast()

  const seenIds = React.useRef(new Set<string>())
  React.useEffect(() => {
    toasts.forEach(({ id, variant }) => {
      if (!seenIds.current.has(id)) {
        seenIds.current.add(id)
        playNotificationSound((variant as string) ?? "default")
      }
    })
  }, [toasts])

  return (
    <ToastProvider duration={TOAST_DURATION}>
      {toasts.map(({ id, title, description, action, variant, ...props }) => {
        const v: string = (variant as string) ?? "default"
        const leftBar = variantLeftBar[v] ?? variantLeftBar.default

        return (
          <Toast key={id} variant={variant} {...props}>
            {/* Left accent bar */}
            <div className={`absolute left-0 top-0 bottom-0 w-[3px] rounded-l-2xl ${leftBar}`} />

            {/* Inner layout */}
            <div className="flex items-start gap-3 w-full pl-3 pr-8 pt-4 pb-5">
              <ToastIcon variant={v} />

              <div className="flex-1 min-w-0 pt-0.5">
                {title && <ToastTitle>{title}</ToastTitle>}
                {description && <ToastDescription>{description}</ToastDescription>}
                {action && <div className="mt-2">{action}</div>}
              </div>
            </div>

            {/* Progress bar */}
            <ProgressBar variant={v} />

            <ToastClose />
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}

// ── Sound-triggering wrapper ───────────────────────────────────
// Attaches sound to toast() calls by monkey-patching useToast output
export function useToastWithSound() {
  const ctx = useToast()
  const wrappedToast: typeof ctx.toast = React.useCallback(
    (opts) => {
      playNotificationSound((opts as any).variant ?? "default")
      return ctx.toast(opts)
    },
    [ctx]
  )
  return { ...ctx, toast: wrappedToast }
}
