import { Navbar } from "@/components/Navbar";
import { Link } from "wouter";
import { Mail, Send, Users, MessageCircle, Clock, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";

const CONTACT_METHODS = [
  {
    icon: Mail,
    title: "Email Us",
    desc: "For business inquiries, partnerships, or general support",
    value: "mrwhitehath@gmail.com",
    link: "mailto:mrwhitehath@gmail.com",
    label: "Send Email",
    color: "rgba(139,92,246,0.1)",
    border: "rgba(139,92,246,0.25)",
    iconColor: "#A78BFA",
    btnColor: "rgba(139,92,246,0.15)",
    btnBorder: "rgba(139,92,246,0.35)",
    btnText: "#C084FC",
  },
  {
    icon: Send,
    title: "Telegram Channel",
    desc: "Follow for updates, news, and platform announcements",
    value: "t.me/technicalwhitehat",
    link: "https://t.me/technicalwhitehat",
    label: "Join Channel",
    color: "rgba(14,165,233,0.07)",
    border: "rgba(14,165,233,0.18)",
    iconColor: "#7DD3FC",
    btnColor: "rgba(14,165,233,0.12)",
    btnBorder: "rgba(14,165,233,0.28)",
    btnText: "#7DD3FC",
  },
  {
    icon: Users,
    title: "Telegram Group",
    desc: "Join our community — ask questions, discuss OSINT & cybersecurity",
    value: "t.me/Technical_whitehat",
    link: "https://t.me/Technical_whitehat",
    label: "Join Group",
    color: "rgba(16,185,129,0.07)",
    border: "rgba(16,185,129,0.18)",
    iconColor: "#6EE7B7",
    btnColor: "rgba(16,185,129,0.12)",
    btnBorder: "rgba(16,185,129,0.28)",
    btnText: "#6EE7B7",
  },
];

const FAQS = [
  {
    q: "Is TWH OSINT completely free?",
    a: "Yes. TWH OSINT V2 is 100% free with no credit system, no subscriptions, and no hidden charges. Unlimited searches for all users.",
  },
  {
    q: "Is this platform legal to use?",
    a: "TWH OSINT uses publicly available data sources for educational and research purposes. Users are responsible for ensuring their queries comply with applicable laws. Misuse is strictly prohibited.",
  },
  {
    q: "How do I report a bug or issue?",
    a: "Email us at mrwhitehath@gmail.com or reach out via our Telegram group. We typically respond within 24–48 hours.",
  },
  {
    q: "Can I use this for commercial purposes?",
    a: "TWH OSINT is designed for personal research and educational use. For commercial licensing or API access, please contact us via email.",
  },
  {
    q: "How is my data protected?",
    a: "We store only minimal data required for authentication. Query logs are retained for 7 days for audit purposes and then deleted. We do not sell or share your data.",
  },
];

export default function ContactUs() {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#050314" }}>
      <Navbar />

      <main className="flex-1 pb-24 lg:pb-0">

        {/* Hero */}
        <section className="relative container px-4 pt-12 md:pt-20 pb-10">
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[250px] pointer-events-none -z-10"
            style={{
              background: "radial-gradient(ellipse at top, rgba(139,92,246,0.12) 0%, transparent 70%)",
            }}
          />
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-2xl mx-auto"
          >
            <div
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold mb-5"
              style={{
                background: "linear-gradient(135deg, rgba(139,92,246,0.2), rgba(168,85,247,0.1))",
                border: "1px solid rgba(139,92,246,0.35)",
                color: "#C084FC",
              }}
            >
              <MessageCircle className="w-3.5 h-3.5" />
              Get In Touch
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4 leading-tight">
              Contact <span className="gradient-text">TWH OSINT</span>
            </h1>
            <p className="text-white/50 text-base leading-relaxed">
              Have a question, bug report, or partnership inquiry? Reach us through any of the channels below. We're active on Telegram daily.
            </p>
          </motion.div>
        </section>

        {/* Contact Cards */}
        <section className="container px-4 pb-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
            {CONTACT_METHODS.map(({ icon: Icon, title, desc, value, link, label, color, border, iconColor, btnColor, btnBorder, btnText }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1, duration: 0.45 }}
                className="flex flex-col gap-4 p-5 rounded-2xl"
                style={{ background: color, border: `1px solid ${border}` }}
              >
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center"
                  style={{ background: "rgba(0,0,0,0.2)", border: `1px solid ${border}` }}
                >
                  <Icon className="w-5 h-5" style={{ color: iconColor }} />
                </div>
                <div className="flex-1">
                  <h3 className="text-white font-semibold text-sm mb-1">{title}</h3>
                  <p className="text-white/40 text-xs leading-relaxed mb-3">{desc}</p>
                  <p className="text-[11px] font-mono" style={{ color: iconColor }}>{value}</p>
                </div>
                <a href={link} target="_blank" rel="noopener noreferrer">
                  <button
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold transition-all hover:opacity-90"
                    style={{ background: btnColor, border: `1px solid ${btnBorder}`, color: btnText }}
                  >
                    {label} <ExternalLink className="w-3 h-3" style={{ width: "12px", height: "12px" }} />
                  </button>
                </a>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Support Team */}
        <section className="container px-4 pb-10">
          <div
            className="max-w-4xl mx-auto rounded-2xl p-5"
            style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}
          >
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-3">Support Team</p>
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl" style={{ background: "rgba(139,92,246,0.07)", border: "1px solid rgba(139,92,246,0.18)" }}>
                <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0" style={{ background: "rgba(139,92,246,0.18)", border: "1px solid rgba(139,92,246,0.3)", color: "#C084FC" }}>T</div>
                <div>
                  <p className="text-xs font-semibold text-white/80">Technical White Hat</p>
                  <p className="text-[10px] text-white/35">Founder · Afsar Ali</p>
                </div>
              </div>
              <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl" style={{ background: "rgba(168,85,247,0.07)", border: "1px solid rgba(168,85,247,0.18)" }}>
                <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0" style={{ background: "rgba(168,85,247,0.15)", border: "1px solid rgba(168,85,247,0.3)", color: "#E879F9" }}>S</div>
                <div>
                  <p className="text-xs font-semibold text-white/80">Sckeptic <span className="text-white/30 font-normal">(Prince)</span></p>
                  <p className="text-[10px] text-white/35">Sr. Admin · Support Team</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Response time note */}
        <section className="container px-4 pb-10">
          <div
            className="flex items-center gap-4 p-4 rounded-2xl max-w-4xl mx-auto"
            style={{
              background: "rgba(255,255,255,0.02)",
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: "rgba(139,92,246,0.12)", border: "1px solid rgba(139,92,246,0.2)" }}
            >
              <Clock className="w-4 h-4 text-violet-400" style={{ width: "16px", height: "16px" }} />
            </div>
            <div>
              <p className="text-white/70 text-xs font-medium">Response Time</p>
              <p className="text-white/35 text-xs mt-0.5">
                Email replies within <strong className="text-white/55">24–48 hours</strong>. Telegram queries answered <strong className="text-white/55">within hours</strong> during active hours (IST 10am–10pm).
              </p>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="container px-4 pb-14 max-w-4xl mx-auto">
          <h2 className="text-xl font-bold text-white mb-2">Frequently Asked Questions</h2>
          <p className="text-white/35 text-xs mb-6">Quick answers to common queries</p>
          <div className="space-y-3">
            {FAQS.map(({ q, a }, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06, duration: 0.35 }}
                className="p-4 rounded-2xl"
                style={{
                  background: "rgba(255,255,255,0.025)",
                  border: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                <h3 className="text-sm font-semibold text-white mb-1.5">{q}</h3>
                <p className="text-xs text-white/45 leading-relaxed">{a}</p>
              </motion.div>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/[0.06] py-6" style={{ background: "#09051A" }}>
        <div className="container px-4 text-center">
          <p className="text-[11px] text-white/25">
            &copy; 2026 TWH OSINT · Technical White Hat · All rights reserved.
          </p>
          <div className="flex justify-center gap-4 mt-2">
            <Link href="/privacy" className="text-[11px] text-white/30 hover:text-violet-400 transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="text-[11px] text-white/30 hover:text-violet-400 transition-colors">Terms</Link>
            <Link href="/about" className="text-[11px] text-white/30 hover:text-violet-400 transition-colors">About Us</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
