import { Navbar } from "@/components/Navbar";
import { Link } from "wouter";
import { Shield, Users, Zap, Globe, Target, Lock, Send, Mail, ExternalLink, Youtube, Play, AtSign, ShieldCheck, Code, Bug } from "lucide-react";
import { motion } from "framer-motion";
import { useSEO } from "@/hooks/use-seo";
import twhLogoPath from "@assets/TechnicalWhiteHatNewlog_1780276516084.jpeg";

const TEAM_STATS = [
  { icon: Users, label: "Active Users", value: "10,000+", color: "#8B5CF6" },
  { icon: Zap, label: "Queries Processed", value: "50,000+", color: "#A78BFA" },
  { icon: Globe, label: "Data Sources", value: "35,000+", color: "#C084FC" },
  { icon: Shield, label: "Uptime", value: "99.9%", color: "#7C3AED" },
];

const WHAT_WE_DO = [
  {
    icon: Target,
    title: "Mobile Number Intelligence",
    desc: "Instantly lookup telecom operator, location circle, SIM type, and network details for any Indian mobile number.",
    color: "rgba(139,92,246,0.12)",
    border: "rgba(139,92,246,0.25)",
    iconColor: "#A78BFA",
  },
  {
    icon: Shield,
    title: "Aadhar Verification",
    desc: "Verify Aadhar card details and check registration status through secure, encrypted data streams.",
    color: "rgba(168,85,247,0.1)",
    border: "rgba(168,85,247,0.22)",
    iconColor: "#C084FC",
  },
  {
    icon: Globe,
    title: "Vehicle Registration Lookup",
    desc: "Get complete vehicle registration information including owner details, RC status, insurance, and more.",
    color: "rgba(249,115,22,0.08)",
    border: "rgba(249,115,22,0.2)",
    iconColor: "#FB923C",
  },
  {
    icon: Zap,
    title: "IP Address Probe",
    desc: "Deep dive into any IP address — geolocation, ISP details, hostname, and network routing information.",
    color: "rgba(59,130,246,0.08)",
    border: "rgba(59,130,246,0.2)",
    iconColor: "#93C5FD",
  },
  {
    icon: AtSign,
    title: "Email Address Search",
    desc: "Trace email addresses to uncover linked accounts, breach records, and associated identity information.",
    color: "rgba(16,185,129,0.08)",
    border: "rgba(16,185,129,0.2)",
    iconColor: "#6EE7B7",
  },
];

export default function AboutUs() {
  useSEO({
    title: "About TWH OSINT — Platform, Team & Mission | Free OSINT Tool India",
    description: "Learn about TWH OSINT — India's free OSINT platform by Technical White Hat (Afsar Ali). Meet the team: founder Afsar Ali & Senior Admin Sckeptic (Prince). Our mission: free intelligence tools for everyone.",
    canonical: "https://twh-osint.vercel.app/about",
    keywords: "about TWH OSINT, Technical White Hat team, Afsar Ali, Sckeptic Prince, OSINT platform India, TWH OSINT mission, free OSINT tool India",
  });
  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#050314" }}>
      <Navbar />

      <main className="flex-1 pb-24 lg:pb-0">

        {/* Hero */}
        <section className="relative container px-4 pt-12 md:pt-20 pb-10">
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] pointer-events-none -z-10"
            style={{
              background: "radial-gradient(ellipse at top, rgba(139,92,246,0.15) 0%, transparent 70%)",
            }}
          />
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-3xl mx-auto"
          >
            <div
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold mb-5"
              style={{
                background: "linear-gradient(135deg, rgba(139,92,246,0.2), rgba(168,85,247,0.1))",
                border: "1px solid rgba(139,92,246,0.35)",
                color: "#C084FC",
              }}
            >
              <Users className="w-3.5 h-3.5" />
              About TWH OSINT
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4 leading-tight">
              Built by <span className="gradient-text">Technical White Hat</span>
            </h1>
            <p className="text-white/50 text-base md:text-lg leading-relaxed">
              TWH OSINT is a free, open-source intelligence platform built for researchers, security professionals, and curious minds across India. We believe information access should be free — no credits, no paywalls.
            </p>
          </motion.div>
        </section>

        {/* Stats */}
        <section className="container px-4 pb-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {TEAM_STATS.map(({ icon: Icon, label, value, color }, i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08, duration: 0.4 }}
                className="flex flex-col items-center gap-2 p-5 rounded-2xl text-center"
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.07)",
                }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: "rgba(139,92,246,0.15)", border: "1px solid rgba(139,92,246,0.25)" }}
                >
                  <Icon className="w-5 h-5" style={{ color }} />
                </div>
                <div className="text-2xl font-extrabold gradient-text">{value}</div>
                <div className="text-[11px] text-white/40 font-medium">{label}</div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Our Story + YouTube highlight */}
        <section className="container px-4 pb-10">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">

            {/* Story */}
            <div
              className="lg:col-span-3 rounded-2xl p-6 md:p-8"
              style={{
                background: "rgba(255,255,255,0.025)",
                border: "1px solid rgba(255,255,255,0.07)",
              }}
            >
              <h2 className="text-2xl font-bold text-white mb-4">Our Story</h2>
              <div className="space-y-4 text-white/55 text-sm leading-relaxed">
                <p>
                  <strong className="text-white/80">TWH OSINT</strong> was founded by <strong className="text-violet-300">Afsar Ali</strong>, the creator of <strong className="text-white/80">Technical White Hat (TWH)</strong> — a cybersecurity and ethical hacking community helping thousands of Indians learn digital security, OSINT, and responsible hacking.
                </p>
                <p>
                  We saw that intelligence tools were either too expensive, too complex, or locked behind paid subscriptions. So we built TWH OSINT — a platform that gives everyone access to the same powerful data lookup tools, completely free of charge.
                </p>
                <p>
                  TWH OSINT V2 is our biggest upgrade yet. Faster infrastructure, better UI, Telegram integration, and zero credit system. Everything free, everything instant.
                </p>
                <p className="text-orange-300/70 text-xs border-l-2 border-orange-400/30 pl-3">
                  ⚠️ This platform is designed to help victims identify and expose scammers, fraudsters, and people who harass you. Misuse for illegal purposes is strictly prohibited — users are solely responsible for how they use this tool.
                </p>
              </div>
            </div>

            {/* YouTube card */}
            <motion.div
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="lg:col-span-2 rounded-2xl overflow-hidden flex flex-col"
              style={{
                background: "linear-gradient(160deg, rgba(255,0,0,0.08) 0%, rgba(139,92,246,0.08) 100%)",
                border: "1px solid rgba(255,80,80,0.2)",
              }}
            >
              {/* Channel banner / logo */}
              <div className="relative h-44 overflow-hidden">
                <img
                  src={twhLogoPath}
                  alt="Technical White Hat"
                  className="w-full h-full object-cover object-top"
                  style={{ filter: "brightness(0.75)" }}
                />
                {/* Gradient overlay */}
                <div
                  className="absolute inset-0"
                  style={{
                    background: "linear-gradient(to bottom, transparent 30%, rgba(5,3,20,0.95) 100%)",
                  }}
                />
                {/* YT badge */}
                <div
                  className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold"
                  style={{
                    background: "rgba(255,0,0,0.85)",
                    color: "#fff",
                    backdropFilter: "blur(8px)",
                  }}
                >
                  <Youtube className="w-3 h-3" style={{ width: "12px", height: "12px" }} />
                  YouTube
                </div>
                {/* Channel name on image */}
                <div className="absolute bottom-3 left-4">
                  <p className="text-white font-bold text-base leading-tight">Technical White Hat</p>
                  <p className="text-white/50 text-[11px]">Cybersecurity · OSINT · Ethical Hacking</p>
                </div>
              </div>

              {/* Card body */}
              <div className="flex flex-col gap-3 p-4 flex-1">
                <p className="text-white/50 text-xs leading-relaxed">
                  Learn cybersecurity, OSINT techniques, ethical hacking, and digital privacy — in Hindi. India's leading ethical hacking YouTube channel.
                </p>

                {/* Highlights */}
                <div className="space-y-2">
                  {[
                    "Mobile & IP tracing tutorials",
                    "Scammer exposure techniques",
                    "OSINT for beginners",
                    "Live cybersecurity demos",
                  ].map((item) => (
                    <div key={item} className="flex items-center gap-2 text-[11px] text-white/50">
                      <Play className="w-2.5 h-2.5 text-red-400 shrink-0" style={{ width: "10px", height: "10px" }} />
                      {item}
                    </div>
                  ))}
                </div>

                {/* CTA */}
                <a
                  href="https://www.youtube.com/channel/UC6itmDFY0MWGfA7_T3yJpkg"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-auto"
                >
                  <button
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all hover:opacity-90 active:scale-[0.98]"
                    style={{
                      background: "linear-gradient(135deg, rgba(220,38,38,0.8), rgba(185,28,28,0.9))",
                      border: "1px solid rgba(255,80,80,0.3)",
                      color: "#fff",
                    }}
                  >
                    <Youtube className="w-3.5 h-3.5" style={{ width: "14px", height: "14px" }} />
                    Subscribe Now
                  </button>
                </a>
              </div>
            </motion.div>
          </div>
        </section>

        {/* What We Do */}
        <section className="container px-4 pb-10">
          <h2 className="text-2xl font-bold text-white mb-2">What We Offer</h2>
          <p className="text-white/40 text-sm mb-6">Five powerful intelligence modules, all 100% free</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {WHAT_WE_DO.map(({ icon: Icon, title, desc, color, border, iconColor }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.4 }}
                className="flex gap-4 p-5 rounded-2xl"
                style={{ background: color, border: `1px solid ${border}` }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: "rgba(0,0,0,0.2)", border: `1px solid ${border}` }}
                >
                  <Icon className="w-5 h-5" style={{ color: iconColor }} />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white mb-1">{title}</h3>
                  <p className="text-xs text-white/45 leading-relaxed">{desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Team Section */}
        <section className="container px-4 pb-10">
          <h2 className="text-2xl font-bold text-white mb-2">Our Team</h2>
          <p className="text-white/40 text-sm mb-6">The people behind TWH OSINT platform</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-3xl">

            {/* Founder */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0, duration: 0.45 }}
              className="p-5 rounded-2xl"
              style={{ background: "rgba(139,92,246,0.08)", border: "1px solid rgba(139,92,246,0.22)" }}
              itemScope
              itemType="https://schema.org/Person"
            >
              <div className="flex gap-4 mb-4">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-lg font-extrabold shrink-0"
                  style={{ background: "rgba(139,92,246,0.18)", border: "1px solid rgba(139,92,246,0.35)", color: "#C084FC" }}
                >T</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="text-white font-bold text-sm" itemProp="name">Technical White Hat</span>
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full" style={{ background: "rgba(139,92,246,0.15)", border: "1px solid rgba(139,92,246,0.3)", color: "#C084FC" }}>FOUNDER</span>
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full" style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.25)", color: "#6ee7b7" }}>ETHICAL HACKER</span>
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full" style={{ background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.25)", color: "#fcd34d" }}>DEVELOPER</span>
                  </div>
                  <p className="text-[11px] text-white/40" itemProp="alternateName">Afsar Ali · Creator & Owner · Ahmar Bhai · 908 Hacker</p>
                </div>
              </div>
              <p className="text-xs text-white/50 leading-relaxed mb-3" itemProp="description">
                Technical White Hat (Afsar Ali) is the founder, creator, and lead developer of TWH OSINT. A self-taught
                ethical hacker and full-stack developer from India, he started his tech journey at age 12 in 2016. He
                builds powerful, free tools for the cybersecurity and developer community — from OSINT platforms to
                open-source hacking utilities — with a philosophy that great software should be accessible to everyone.
              </p>
              <div className="mb-3">
                <p className="text-[10px] text-white/30 font-semibold uppercase tracking-widest mb-2">Responsibilities</p>
                <div className="grid grid-cols-2 gap-1">
                  {[
                    "Platform development",
                    "Product architecture",
                    "Full-stack engineering",
                    "OSINT research & tools",
                    "System design",
                    "Open-source projects",
                    "Community leadership",
                    "Content creation",
                  ].map(r => (
                    <div key={r} className="flex items-center gap-1.5 text-[10px] text-white/40">
                      <ShieldCheck className="w-2.5 h-2.5 shrink-0" style={{ color: "#C084FC", width: "10px", height: "10px" }} />
                      {r}
                    </div>
                  ))}
                </div>
              </div>
              <div className="mb-3">
                <p className="text-[10px] text-white/30 font-semibold uppercase tracking-widest mb-2">Expertise</p>
                <div className="flex flex-wrap gap-1.5">
                  {["Ethical Hacking", "OSINT", "Cybersecurity", "Full-Stack Dev", "Node.js", "React", "Web Security", "Penetration Testing", "Community Building"].map(skill => (
                    <span key={skill} className="text-[9px] font-medium px-2 py-0.5 rounded-full" style={{ background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.22)", color: "#c4b5fd" }}>
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
              <Link href="/twh" className="inline-flex items-center gap-1 mt-1 text-[11px] text-violet-400 hover:text-violet-300 transition-colors font-medium">
                View Full Profile <ExternalLink className="w-2.5 h-2.5" />
              </Link>
            </motion.div>

            {/* Sckeptic */}
            <motion.div
              id="sckeptic"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1, duration: 0.45 }}
              className="p-5 rounded-2xl"
              style={{ background: "rgba(168,85,247,0.07)", border: "1px solid rgba(168,85,247,0.2)" }}
              itemScope
              itemType="https://schema.org/Person"
            >
              <div className="flex gap-4 mb-4">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-lg font-extrabold shrink-0"
                  style={{ background: "rgba(168,85,247,0.15)", border: "1px solid rgba(168,85,247,0.3)", color: "#E879F9" }}
                >
                  S
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="text-white font-bold text-sm" itemProp="name">Sckeptic</span>
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full" style={{ background: "rgba(168,85,247,0.12)", border: "1px solid rgba(168,85,247,0.28)", color: "#E879F9" }}>SR. ADMIN</span>
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full" style={{ background: "rgba(6,182,212,0.1)", border: "1px solid rgba(6,182,212,0.25)", color: "#67e8f9" }}>SUPPORT</span>
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full" style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.25)", color: "#6ee7b7" }}>ETHICAL HACKER</span>
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full" style={{ background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.25)", color: "#fcd34d" }}>WEB DEV</span>
                  </div>
                  <p className="text-[11px] text-white/40" itemProp="alternateName">Prince · Senior Administrator & Support Team Member</p>
                </div>
              </div>
              <p className="text-xs text-white/50 leading-relaxed mb-3" itemProp="description">
                Sckeptic (Prince) is a Senior Administrator and Support Team Member actively involved in platform
                operations, user assistance, technical troubleshooting, web development, security-focused tasks,
                system management, automation, and technology-related initiatives. With a strong interest in
                cybersecurity, ethical hacking, OSINT, digital infrastructure, and modern web technologies, he
                contributes to maintaining platform stability, improving user experience, and supporting community members.
              </p>
              <div className="mb-3">
                <p className="text-[10px] text-white/30 font-semibold uppercase tracking-widest mb-2">Responsibilities</p>
                <div className="grid grid-cols-2 gap-1">
                  {[
                    "Administrative oversight",
                    "User support & coordination",
                    "Platform monitoring",
                    "Technical troubleshooting",
                    "Workflow improvements",
                    "Security operations",
                    "System management",
                    "Automation",
                  ].map(r => (
                    <div key={r} className="flex items-center gap-1.5 text-[10px] text-white/40">
                      <ShieldCheck className="w-2.5 h-2.5 shrink-0" style={{ color: "#E879F9", width: "10px", height: "10px" }} />
                      {r}
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-[10px] text-white/30 font-semibold uppercase tracking-widest mb-2">Expertise</p>
                <div className="flex flex-wrap gap-1.5">
                  {["Cybersecurity", "Ethical Hacking", "OSINT", "Web Development", "System Admin", "Digital Infrastructure", "Automation", "Technical Support"].map(skill => (
                    <span key={skill} className="text-[9px] font-medium px-2 py-0.5 rounded-full" style={{ background: "rgba(168,85,247,0.1)", border: "1px solid rgba(168,85,247,0.22)", color: "#d8b4fe" }}>
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
              <Link href="/twh#sckeptic-profile" className="inline-flex items-center gap-1 mt-3 text-[11px] text-violet-400 hover:text-violet-300 transition-colors font-medium">
                View Full Profile <ExternalLink className="w-2.5 h-2.5" />
              </Link>
            </motion.div>

          </div>
        </section>

        {/* Mission */}
        <section className="container px-4 pb-10">
          <div
            className="rounded-2xl p-6 md:p-8 text-center"
            style={{
              background: "linear-gradient(135deg, rgba(139,92,246,0.1), rgba(109,40,217,0.06))",
              border: "1px solid rgba(139,92,246,0.2)",
            }}
          >
            <Lock className="w-8 h-8 text-violet-400 mx-auto mb-3" />
            <h2 className="text-xl font-bold text-white mb-3">Our Mission</h2>
            <p className="text-white/50 text-sm leading-relaxed max-w-2xl mx-auto">
              To democratize access to open-source intelligence in India. We are committed to responsible data use, ethical research, and digital literacy. TWH OSINT is for educational and research purposes only — we do not support or condone misuse of any data.
            </p>
            <div className="flex flex-wrap gap-3 justify-center mt-6">
              <Link href="/dashboard">
                <button
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all"
                  style={{
                    background: "rgba(139,92,246,0.2)",
                    border: "1px solid rgba(139,92,246,0.4)",
                    color: "#C084FC",
                  }}
                >
                  Try Platform Free <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </Link>
              <Link href="/contact">
                <button
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    color: "rgba(255,255,255,0.6)",
                  }}
                >
                  Contact Us <Mail className="w-3.5 h-3.5" />
                </button>
              </Link>
            </div>
          </div>
        </section>

        {/* Telegram CTA */}
        <section className="container px-4 pb-14">
          <div
            className="flex flex-col sm:flex-row items-center gap-4 p-5 rounded-2xl"
            style={{
              background: "rgba(14,165,233,0.06)",
              border: "1px solid rgba(14,165,233,0.18)",
            }}
          >
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 text-2xl"
              style={{ background: "rgba(14,165,233,0.12)", border: "1px solid rgba(14,165,233,0.2)" }}>
              ✈️
            </div>
            <div className="text-center sm:text-left flex-1">
              <h3 className="text-white font-semibold text-sm">Join Our Telegram Community</h3>
              <p className="text-white/40 text-xs mt-0.5">10,000+ members learning cybersecurity, OSINT &amp; ethical hacking</p>
            </div>
            <div className="flex gap-2">
              <a href="https://t.me/technicalwhitehat" target="_blank" rel="noopener noreferrer">
                <button
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold"
                  style={{
                    background: "rgba(14,165,233,0.15)",
                    border: "1px solid rgba(14,165,233,0.3)",
                    color: "#7DD3FC",
                  }}
                >
                  <Send className="w-3 h-3" style={{ width: "12px", height: "12px" }} />
                  Channel
                </button>
              </a>
              <a href="https://t.me/Technical_whitehat" target="_blank" rel="noopener noreferrer">
                <button
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold"
                  style={{
                    background: "rgba(14,165,233,0.1)",
                    border: "1px solid rgba(14,165,233,0.2)",
                    color: "#7DD3FC",
                  }}
                >
                  <Users className="w-3 h-3" style={{ width: "12px", height: "12px" }} />
                  Group
                </button>
              </a>
            </div>
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
            <Link href="/contact" className="text-[11px] text-white/30 hover:text-violet-400 transition-colors">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
