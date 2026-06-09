import { Link } from "wouter";
import { ExternalLink, Github, Music, Shield, Zap, Star, Smartphone, Globe, Car, Search, Lock, Send, Bell, LayoutDashboard, CheckCircle, AtSign, Database } from "lucide-react";
import { useSEO } from "@/hooks/use-seo";

const logoPath = "/twh-logo-shield.png";

export default function TWHPage() {
  useSEO({
    title: "Technical White Hat (TWH) — Afsar Ali · India's Legendary Ethical Hacker | TWH OSINT",
    description: "Official profile of Technical White Hat (Afsar Ali) — India's self-taught ethical hacker, OSINT expert & full-stack developer. Founder of TWH OSINT. Meet the team including Senior Admin Sckeptic (Prince).",
    canonical: "https://twh-osint.vercel.app/twh",
    keywords: "Technical White Hat, TWH, Afsar Ali, Ahmar Bhai, 908 Hacker, Indian ethical hacker, OSINT expert, TWH OSINT founder, Sckeptic Prince, TWH team, cybersecurity India",
  });
  return (
    <div className="min-h-screen bg-[#050314] text-slate-200">
      {/* NAV */}
      <nav className="sticky top-0 z-50 bg-[#050314]/85 backdrop-blur-lg border-b border-violet-500/20 px-6 py-3.5 flex items-center justify-between">
        <Link href="/" className="text-violet-300 font-bold text-sm tracking-wide hover:text-violet-200 transition-colors">
          ⚡ TWH OSINT
        </Link>
        <div className="flex gap-5">
          <Link href="/" className="text-slate-400 hover:text-violet-300 text-sm transition-colors">Home</Link>
          <Link href="/about" className="text-slate-400 hover:text-violet-300 text-sm transition-colors">About</Link>
          <Link href="/contact" className="text-slate-400 hover:text-violet-300 text-sm transition-colors">Contact</Link>
        </div>
      </nav>

      {/* HERO */}
      <div className="max-w-4xl mx-auto px-6 pt-20 pb-14 text-center">
        <div className="flex justify-center mb-7">
          <img
            src={logoPath}
            alt="TWH OSINT Logo - Technical White Hat"
            className="w-24 h-24 object-contain drop-shadow-[0_0_30px_rgba(139,92,246,0.6)]"
          />
        </div>
        <div className="inline-flex items-center gap-2 bg-violet-500/10 border border-violet-500/25 text-violet-300 text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-7">
          <Star className="w-3 h-3" /> Legend of Indian Cybersecurity
        </div>
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight mb-4 bg-gradient-to-br from-white via-violet-200 to-cyan-400 bg-clip-text text-transparent">
          Technical White Hat
        </h1>
        <p className="text-slate-400 text-sm tracking-widest mb-5">
          Real Name: <span className="text-slate-200 font-semibold">Afsar Ali</span> &nbsp;·&nbsp; Born: 10 May 2004 &nbsp;·&nbsp; India
        </p>
        <div className="flex flex-wrap gap-2 justify-center mb-7">
          {["TWH", "Ahmar Bhai", "Technical White Hat", "908 Hacker", "Brock", "GeekmUX"].map(name => (
            <span key={name} className="bg-violet-500/10 border border-violet-500/25 text-violet-300 text-xs font-semibold px-3.5 py-1 rounded-full">
              {name}
            </span>
          ))}
        </div>
        <p className="text-slate-400 text-lg max-w-2xl mx-auto leading-relaxed">
          India's youngest legendary ethical hacker, OSINT expert, and full-stack developer.
          At just <strong className="text-slate-200">22</strong>, Afsar Ali — known as{" "}
          <strong className="text-violet-300">Technical White Hat (TWH)</strong> or{" "}
          <strong className="text-violet-300">Ahmar Bhai</strong> — builds premium tools
          and gives them to the world for free.
        </p>
        <div className="flex flex-wrap gap-5 justify-center mt-10">
          {[
            { num: "2016", label: "Started in Tech" },
            { num: "22", label: "Age" },
            { num: "5+", label: "Major Projects" },
            { num: "∞", label: "Free for All" },
          ].map(s => (
            <div key={s.label} className="bg-white/[0.03] border border-violet-500/20 rounded-xl px-7 py-4 text-center min-w-[110px]">
              <div className="text-3xl font-extrabold text-violet-300">{s.num}</div>
              <div className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 space-y-16 pb-20">

        {/* TWH OSINT TOOL — FULL DETAIL */}
        <section>
          <p className="text-violet-500 text-xs font-bold uppercase tracking-[0.15em] mb-3">Flagship Product</p>
          <h2 className="text-2xl font-bold text-white mb-2">TWH OSINT Platform — Complete Overview</h2>
          <p className="text-slate-400 text-sm mb-6 leading-relaxed">
            TWH OSINT is India's most powerful free Open Source Intelligence (OSINT) platform, built and maintained by
            <strong className="text-slate-200"> Afsar Ali (Technical White Hat)</strong>. It provides unlimited, real-time
            intelligence lookups for five categories of data — completely free, with no credits, no subscription, and no limits.
            The platform is deployed at <strong className="text-violet-300">twh-osint.vercel.app</strong>.
          </p>

          {/* Tool cards */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {[
              {
                icon: Smartphone, color: "#A78BFA", bg: "rgba(139,92,246,0.1)", border: "rgba(139,92,246,0.25)",
                title: "Mobile Number Lookup",
                badge: "Live",
                desc: "Enter any Indian mobile number (10 digits) to instantly retrieve: telecom operator (Jio, Airtel, Vi, BSNL), location circle/state, SIM type (prepaid/postpaid), number series, and network routing data.",
              },
              {
                icon: Shield, color: "#C084FC", bg: "rgba(168,85,247,0.1)", border: "rgba(168,85,247,0.25)",
                title: "Aadhar Card Verification",
                badge: "Live",
                desc: "Verify any 12-digit Aadhar card number to check registration status, age verification, and linked details through secure, encrypted data streams without exposing personal data.",
              },
              {
                icon: Car, color: "#FB923C", bg: "rgba(249,115,22,0.1)", border: "rgba(249,115,22,0.25)",
                title: "Vehicle Registration Lookup",
                badge: "Live",
                desc: "Enter any Indian vehicle registration number (e.g. MH12AB1234) to get: owner name, RC status, insurance validity, fuel type, vehicle class, maker, model, and registration date.",
              },
              {
                icon: AtSign, color: "#6EE7B7", bg: "rgba(16,185,129,0.1)", border: "rgba(16,185,129,0.25)",
                title: "Email Address Search",
                badge: "Live · New",
                desc: "Search any email address to uncover linked accounts, data breach records, associated social media profiles, and identity information. Useful for tracing scammers and fraudsters.",
              },
              {
                icon: Globe, color: "#93C5FD", bg: "rgba(59,130,246,0.1)", border: "rgba(59,130,246,0.25)",
                title: "IP Address Probe",
                badge: "Live",
                desc: "Enter any IPv4 or IPv6 address for deep intelligence: geolocation (country, city, latitude/longitude), ISP details, hostname, ASN, organization, and network routing information.",
              },
              {
                icon: Send, color: "#7DD3FC", bg: "rgba(14,165,233,0.1)", border: "rgba(14,165,233,0.25)",
                title: "Telegram Integration",
                badge: "Built-in",
                desc: "Connect your Telegram account to automatically receive all search results directly in your chat. Search on web, get results on Telegram. Works with any Telegram bot configuration.",
              },
            ].map(({ icon: Icon, color, bg, border, title, badge, desc }) => (
              <div
                key={title}
                className="rounded-2xl p-5"
                style={{ background: bg, border: `1px solid ${border}` }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: "rgba(0,0,0,0.25)", border: `1px solid ${border}` }}>
                    <Icon className="w-4 h-4" style={{ color }} />
                  </div>
                  <div>
                    <div className="text-white font-bold text-sm leading-tight">{title}</div>
                    <span className="text-[10px] font-bold" style={{ color }}>{badge}</span>
                  </div>
                </div>
                <p className="text-slate-400 text-xs leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>

          {/* Platform Features */}
          <div className="rounded-2xl p-6" style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)" }}>
            <h3 className="text-white font-bold mb-4">Platform Features & Technical Architecture</h3>
            <div className="grid sm:grid-cols-2 gap-3">
              {[
                { icon: Database, label: "100,000+ Data Sources", desc: "Real-time APIs and intelligence databases across India" },
                { icon: Lock, label: "Firebase Authentication", desc: "Secure Google Sign-In and email/password login via Firebase Auth" },
                { icon: Bell, label: "Telegram Alerts", desc: "Search results pushed directly to user's Telegram via Bot API" },
                { icon: LayoutDashboard, label: "Search History", desc: "7-day auto-delete privacy — all logs purged after 7 days" },
                { icon: CheckCircle, label: "Unlimited Free Access", desc: "Zero credits, zero subscription, zero payment — forever free" },
                { icon: Zap, label: "Sub-1s Response Time", desc: "Optimized backend with Redis-style caching for instant results" },
                { icon: Search, label: "Admin Control Panel", desc: "Service toggle, broadcast messages, and user management" },
                { icon: Shield, label: "PWA Support", desc: "Installable as a mobile app — works offline, push notifications" },
              ].map(({ icon: Icon, label, desc }) => (
                <div key={label} className="flex gap-3 items-start">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5" style={{ background: "rgba(139,92,246,0.12)", border: "1px solid rgba(139,92,246,0.2)" }}>
                    <Icon className="w-3.5 h-3.5 text-violet-400" />
                  </div>
                  <div>
                    <div className="text-white text-xs font-semibold">{label}</div>
                    <div className="text-slate-500 text-[11px] leading-relaxed">{desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tech Stack */}
          <div className="mt-4 rounded-2xl p-5" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
            <h3 className="text-white font-bold text-sm mb-3">Technical Stack</h3>
            <div className="flex flex-wrap gap-2">
              {[
                "React 18", "TypeScript", "Vite", "Tailwind CSS", "shadcn/ui", "Framer Motion",
                "Node.js", "Express.js", "Drizzle ORM", "PostgreSQL (Supabase)", "Firebase Auth",
                "Firebase Admin SDK", "TanStack Query", "Wouter", "Telegram Bot API", "Vercel (Deploy)",
              ].map(t => (
                <span key={t} className="text-[11px] font-medium px-2.5 py-1 rounded-lg" style={{ background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.2)", color: "#C4B5FD" }}>
                  {t}
                </span>
              ))}
            </div>
          </div>

          {/* URL + deployment */}
          <div className="mt-4 rounded-2xl p-5 flex flex-wrap gap-4 items-center" style={{ background: "rgba(16,185,129,0.06)", border: "1px solid rgba(16,185,129,0.18)" }}>
            <div className="flex-1 min-w-0">
              <div className="text-emerald-400 font-bold text-sm">🌐 Live Platform</div>
              <div className="text-slate-400 text-xs mt-1">
                URL: <strong className="text-emerald-300">https://twh-osint.vercel.app</strong><br />
                GitHub: <strong className="text-emerald-300">github.com/darkpandat/osint</strong><br />
                Hosted on Vercel · Backend on Replit · Database on Supabase (PostgreSQL)
              </div>
            </div>
            <Link href="/">
              <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all" style={{ background: "rgba(16,185,129,0.15)", border: "1px solid rgba(16,185,129,0.3)", color: "#6EE7B7" }}>
                <Shield className="w-3.5 h-3.5" /> Open Platform
              </button>
            </Link>
          </div>
        </section>

        {/* ABOUT */}
        <section className="border-t border-white/5 pt-14">
          <p className="text-violet-500 text-xs font-bold uppercase tracking-[0.15em] mb-3">About</p>
          <h2 className="text-2xl font-bold text-white mb-5">Who is Technical White Hat (TWH)?</h2>
          <div className="text-slate-400 space-y-4 leading-relaxed">
            <p>
              <strong className="text-slate-200">Technical White Hat (TWH)</strong>, born{" "}
              <strong className="text-slate-200">Afsar Ali</strong> on{" "}
              <strong className="text-slate-200">10 May 2004</strong>, is one of India's most remarkable
              self-taught ethical hackers and developers. Commonly known as{" "}
              <strong className="text-violet-300">Ahmar Bhai</strong> in the cybersecurity community,
              he also goes by <strong className="text-slate-200">908 Hacker</strong>,{" "}
              <strong className="text-slate-200">Brock</strong>, and{" "}
              <strong className="text-slate-200">GeekmUX</strong>.
            </p>
            <p>
              Afsar's journey into technology began in <strong className="text-slate-200">2016</strong>, when he
              was just 12 years old and studying in class 6. At a time when Jio's 4G revolution was reshaping India's
              internet landscape, he recognized the opportunity and began teaching himself hacking and web development —
              entirely on his own.
            </p>
            <p>
              He is a proud <strong className="text-slate-200">school dropout after 12th grade</strong> — a deliberate
              choice. His philosophy: real skills matter more than certificates. This mindset has led him to build tools
              that rival paid software, offered completely free to anyone who needs them.
            </p>
            <p>
              What makes TWH truly legendary is his personality: <strong className="text-slate-200">calm, patient, and
              humorous</strong> — almost impossible to provoke. He is known for making coding approachable with comedy and
              a relaxed approach, even while building enterprise-grade systems.
            </p>
          </div>
        </section>

        {/* PLATFORM TEAM — overview */}
        <section className="border-t border-white/5 pt-14">
          <p className="text-violet-500 text-xs font-bold uppercase tracking-[0.15em] mb-3">Platform Team</p>
          <h2 className="text-2xl font-bold text-white mb-5">The People Behind TWH OSINT</h2>
          <p className="text-slate-400 text-sm mb-6 leading-relaxed">
            TWH OSINT is developed by <strong className="text-slate-300">Technical White Hat (Afsar Ali)</strong> and
            administered day-to-day by <strong className="text-slate-300">Sckeptic (Prince)</strong>, who handles
            platform operations, user support, and technical maintenance.
          </p>
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-3 rounded-xl px-4 py-3" style={{ background: "rgba(139,92,246,0.08)", border: "1px solid rgba(139,92,246,0.2)" }}>
              <div className="w-9 h-9 rounded-lg flex items-center justify-center font-extrabold text-sm shrink-0" style={{ background: "rgba(139,92,246,0.2)", color: "#C084FC" }}>T</div>
              <div>
                <div className="text-white text-xs font-bold">Technical White Hat</div>
                <div className="text-slate-500 text-[10px]">Afsar Ali · Founder & Lead Developer</div>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-xl px-4 py-3" style={{ background: "rgba(168,85,247,0.07)", border: "1px solid rgba(168,85,247,0.18)" }}>
              <div className="w-9 h-9 rounded-lg flex items-center justify-center font-extrabold text-sm shrink-0" style={{ background: "rgba(168,85,247,0.18)", color: "#E879F9" }}>S</div>
              <div>
                <div className="text-white text-xs font-bold">Sckeptic (Prince)</div>
                <div className="text-slate-500 text-[10px]">Senior Administrator · Support Team</div>
              </div>
            </div>
          </div>
        </section>

        {/* SCKEPTIC (PRINCE) — FULL STANDALONE SECTION */}
        <section
          id="sckeptic-profile"
          className="border-t border-white/5 pt-14"
          itemScope
          itemType="https://schema.org/Person"
        >
          <p className="text-violet-500 text-xs font-bold uppercase tracking-[0.15em] mb-3">Senior Administrator · Support Team</p>
          <div className="flex items-start gap-5 mb-6">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-extrabold shrink-0"
              style={{ background: "rgba(168,85,247,0.18)", border: "1px solid rgba(168,85,247,0.4)", color: "#E879F9" }}>S</div>
            <div>
              <h2 className="text-3xl font-bold text-white leading-tight" itemProp="name">
                Sckeptic <span className="text-slate-400 font-normal">(Prince)</span>
              </h2>
              <p className="text-slate-400 text-sm mt-1" itemProp="alternateName">Prince · Senior Administrator · Support Team Member · Ethical Hacker · Web Developer</p>
              <div className="flex flex-wrap gap-1.5 mt-3">
                {[
                  { label: "SR. ADMIN",      bg: "rgba(168,85,247,0.15)", border: "rgba(168,85,247,0.35)", color: "#E879F9" },
                  { label: "SUPPORT",        bg: "rgba(6,182,212,0.12)",  border: "rgba(6,182,212,0.3)",  color: "#67e8f9" },
                  { label: "ETHICAL HACKER", bg: "rgba(16,185,129,0.1)",  border: "rgba(16,185,129,0.28)",color: "#6ee7b7" },
                  { label: "WEB DEVELOPER",  bg: "rgba(245,158,11,0.1)",  border: "rgba(245,158,11,0.28)",color: "#fcd34d" },
                ].map(b => (
                  <span key={b.label} className="text-[9px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider"
                    style={{ background: b.bg, border: `1px solid ${b.border}`, color: b.color }}>{b.label}</span>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-3 mb-10" itemProp="description">
            <p className="text-slate-300 text-sm leading-relaxed">
              <strong className="text-white">Sckeptic (Prince)</strong> is the Senior Administrator and Support Team Member of TWH OSINT.
              He is responsible for the day-to-day operations that keep the platform running reliably for thousands of users
              across India. While the platform is built by Technical White Hat (Afsar Ali), Sckeptic ensures everything
              behind the scenes — systems, users, infrastructure, and community — stays healthy and functional.
            </p>
            <p className="text-slate-400 text-sm leading-relaxed">
              With a strong foundation in cybersecurity, ethical hacking, OSINT, and full-stack web development, Sckeptic brings
              a security-first mindset to platform administration. He handles technical troubleshooting, diagnoses backend and
              frontend issues, manages system operations, and automates workflows to keep the platform efficient and scalable.
            </p>
            <p className="text-slate-400 text-sm leading-relaxed">
              Beyond technical work, Sckeptic is deeply involved in community assistance — helping users navigate the platform,
              resolving support requests, and making sure every member has a positive experience.
            </p>
          </div>

          <p className="text-violet-500 text-xs font-bold uppercase tracking-[0.15em] mb-4">Responsibilities</p>
          <div className="grid sm:grid-cols-2 gap-3 mb-10">
            {[
              { icon: LayoutDashboard, color: "#A78BFA", bg: "rgba(139,92,246,0.1)", border: "rgba(139,92,246,0.22)", title: "Platform Administration", desc: "End-to-end oversight of platform operations — monitoring services, managing configurations, and keeping systems running." },
              { icon: Shield, color: "#6ee7b7", bg: "rgba(16,185,129,0.08)", border: "rgba(16,185,129,0.2)", title: "Security-Oriented Operations", desc: "Applies a security-first mindset — reviewing processes, identifying risks, and enforcing safe operational standards." },
              { icon: Search, color: "#67e8f9", bg: "rgba(6,182,212,0.08)", border: "rgba(6,182,212,0.2)", title: "Technical Troubleshooting", desc: "Diagnoses and resolves issues at every layer — from API failures and backend errors to UI bugs and integration problems." },
              { icon: Send, color: "#7DD3FC", bg: "rgba(14,165,233,0.08)", border: "rgba(14,165,233,0.2)", title: "User Support & Community", desc: "Handles user queries, resolves support tickets, coordinates community feedback, and ensures a smooth experience for all." },
              { icon: Zap, color: "#fcd34d", bg: "rgba(245,158,11,0.08)", border: "rgba(245,158,11,0.2)", title: "System Management & Automation", desc: "Manages backend infrastructure, automates repetitive workflows, and optimises internal processes for efficiency." },
              { icon: Globe, color: "#818cf8", bg: "rgba(99,102,241,0.08)", border: "rgba(99,102,241,0.2)", title: "Web Development", desc: "Contributes directly to platform development — building, maintaining, and improving web components and infrastructure." },
              { icon: Lock, color: "#C084FC", bg: "rgba(168,85,247,0.08)", border: "rgba(168,85,247,0.2)", title: "Platform Maintenance", desc: "Ensures long-term reliability — uptime monitoring, coordinated updates, and proactive resolution of operational risks." },
              { icon: CheckCircle, color: "#34d399", bg: "rgba(16,185,129,0.07)", border: "rgba(16,185,129,0.18)", title: "Quality Assurance", desc: "Reviews platform features, monitors output quality, and ensures every lookup and tool operates to the highest standard." },
            ].map(({ icon: Icon, color, bg, border, title, desc }) => (
              <div key={title} className="flex gap-3 items-start p-4 rounded-xl" style={{ background: bg, border: `1px solid ${border}` }}>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5" style={{ background: "rgba(0,0,0,0.2)", border: `1px solid ${border}` }}>
                  <Icon className="w-4 h-4" style={{ color }} />
                </div>
                <div>
                  <div className="text-white text-xs font-semibold mb-1">{title}</div>
                  <div className="text-slate-500 text-[11px] leading-relaxed">{desc}</div>
                </div>
              </div>
            ))}
          </div>

          <p className="text-violet-500 text-xs font-bold uppercase tracking-[0.15em] mb-4">Skills & Expertise</p>
          <div className="flex flex-wrap gap-2 mb-10">
            {["Ethical Hacking","OSINT","Cybersecurity","Penetration Testing","Web Development","Node.js","React","JavaScript","System Administration","Linux","Automation","Security Research","Technical Support","Community Management","Digital Infrastructure","Platform Monitoring","Troubleshooting","API Integration"].map(skill => (
              <span key={skill} className="bg-violet-500/[0.08] border border-violet-500/20 text-violet-300 text-xs font-medium px-3.5 py-1.5 rounded-full">{skill}</span>
            ))}
          </div>

          <div className="rounded-2xl p-6" style={{ background: "rgba(168,85,247,0.06)", border: "1px solid rgba(168,85,247,0.18)" }}>
            <p className="text-violet-500 text-xs font-bold uppercase tracking-[0.15em] mb-3">Professional Summary</p>
            <p className="text-slate-400 text-sm leading-relaxed">
              Sckeptic (Prince) combines deep cybersecurity knowledge with practical administrative experience to keep TWH OSINT
              operating at scale. His work spans the full breadth of platform operations — from writing automation scripts
              to directly assisting users — and his security-oriented perspective adds an extra layer of reliability to everything
              he touches. As the platform continues to grow, Sckeptic remains a core part of the team ensuring TWH OSINT stays
              fast, stable, safe, and genuinely useful for its community.
            </p>
          </div>
        </section>

        {/* NAME JOURNEY */}
        <section className="border-t border-white/5 pt-14">
          <p className="text-violet-500 text-xs font-bold uppercase tracking-[0.15em] mb-3">Identity</p>
          <h2 className="text-2xl font-bold text-white mb-5">The Name Journey of TWH</h2>
          <div className="flex flex-wrap items-center gap-2 mt-4">
            {[
              { name: "Mr White Hat 908 Hacker", current: false },
              { name: "→", arrow: true },
              { name: "Mr White Hat", current: false },
              { name: "→", arrow: true },
              { name: "GeekmUX", current: false },
              { name: "→", arrow: true },
              { name: "Technical White Hat (TWH)", current: true },
            ].map((item, i) =>
              (item as any).arrow ? (
                <span key={i} className="text-slate-600 text-sm">→</span>
              ) : (
                <span key={i} className={`text-sm font-${item.current ? "extrabold text-violet-300 text-base" : "semibold text-slate-400"}`}>
                  {item.name}
                </span>
              )
            )}
          </div>
          <p className="text-slate-400 mt-5 leading-relaxed">
            Founded officially in <strong className="text-slate-200">late 2023</strong>, the brand went through
            3 name changes in just 2 years before arriving at{" "}
            <strong className="text-violet-300">Technical White Hat</strong>. Today, the acronym{" "}
            <strong className="text-violet-300">TWH</strong> alone is enough to identify Afsar Ali across
            India's cybersecurity community.
          </p>
        </section>

        {/* PROJECTS */}
        <section className="border-t border-white/5 pt-14">
          <p className="text-violet-500 text-xs font-bold uppercase tracking-[0.15em] mb-3">Projects</p>
          <h2 className="text-2xl font-bold text-white mb-3">Legendary Builds by Technical White Hat</h2>
          <p className="text-slate-400 mb-8 leading-relaxed">
            TWH is known for building premium-quality tools — always free, always open, always for the community.
            At just 22, <strong className="text-slate-200">Afsar Ali</strong> is the only person in India
            delivering this level of premium features for free.
          </p>
          <div className="grid sm:grid-cols-2 gap-5">
            {[
              {
                icon: "🕵️", name: "TWH OSINT Platform",
                badge: "Live · Free · Unlimited", badgeColor: "text-emerald-400 bg-emerald-500/10 border-emerald-500/25",
                desc: "India's most powerful free OSINT platform. Unlimited lookups for mobile numbers, Aadhar cards, vehicle registrations, email addresses, and IP addresses. Five intelligence modules. Built with React, TypeScript, Node.js, Express, PostgreSQL (Supabase), and Firebase.",
                link: "/", linkText: "Visit Platform", external: false,
              },
              {
                icon: "📁", name: "Hevi Explorer + AeroGrab",
                badge: "Open Source · 10 Versions", badgeColor: "text-cyan-400 bg-cyan-500/10 border-cyan-500/25",
                desc: "Local-first file manager built in 22 days. Runs on Android, Linux, Windows, macOS. Features AeroGrab — gesture-controlled P2P file transfer using Google MediaPipe AI and WebRTC. Zero cloud dependency. Unlimited file size.",
                link: "https://github.com/technicalwhitehat-yt/hevi-explorer", linkText: "GitHub (Open Source)", external: true,
              },
              {
                icon: "🎵", name: "Rhythm Music",
                badge: "Live · Free · Unlimited", badgeColor: "text-emerald-400 bg-emerald-500/10 border-emerald-500/25",
                desc: 'Free premium music streaming platform rivaling Spotify and Amazon Music. Millions of songs, high-quality audio, modern glassmorphism UI. Tagline: "Free Music, Unlimited Rhythm."',
                link: "https://rhythm-music.free.nf/?i=3", linkText: "Open Rhythm Music", external: true,
              },
              {
                icon: "☁️", name: "Cloudflare on Termux",
                badge: "Community Tool", badgeColor: "text-violet-400 bg-violet-500/10 border-violet-500/25",
                desc: "The most widely-used script in the Indian Termux community for running Cloudflare Tunnel on Android — exposing local ports publicly without a VPS, completely free. Used by thousands of developers.",
                link: null, linkText: null, external: false,
              },
              {
                icon: "📍", name: "Location Tracking Telegram Bot",
                badge: "Educational Tool", badgeColor: "text-violet-400 bg-violet-500/10 border-violet-500/25",
                desc: "A Telegram bot that pinpoints a device's exact location with photo evidence. Built for security awareness. Showcased TWH's early expertise in combining social engineering with technical precision.",
                link: null, linkText: null, external: false,
              },
              {
                icon: "🎬", name: "Vidly Studio",
                badge: "Upcoming · AI Powered", badgeColor: "text-amber-400 bg-amber-500/10 border-amber-500/25",
                desc: "TWH's next major project — premium AI-powered YouTube studio for video planning, scripting, thumbnails, and full channel management. Free and likely open-source, following TWH's signature philosophy.",
                link: null, linkText: null, external: false,
              },
            ].map(p => (
              <div key={p.name} className="bg-white/[0.03] border border-violet-500/15 rounded-2xl p-6 hover:border-violet-500/40 hover:-translate-y-0.5 transition-all duration-200">
                <div className="text-3xl mb-3">{p.icon}</div>
                <div className="font-bold text-white mb-2">{p.name}</div>
                <span className={`inline-block text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border mb-3 ${p.badgeColor}`}>
                  {p.badge}
                </span>
                <p className="text-slate-400 text-sm leading-relaxed">{p.desc}</p>
                {p.link && (
                  <a
                    href={p.link}
                    target={p.external ? "_blank" : undefined}
                    rel={p.external ? "noopener noreferrer" : undefined}
                    className="inline-flex items-center gap-1.5 mt-4 text-violet-300 text-xs font-semibold hover:text-violet-200 transition-colors"
                  >
                    {p.external ? <ExternalLink className="w-3 h-3" /> : null} {p.linkText}
                  </a>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* SKILLS */}
        <section className="border-t border-white/5 pt-14">
          <p className="text-violet-500 text-xs font-bold uppercase tracking-[0.15em] mb-3">Expertise</p>
          <h2 className="text-2xl font-bold text-white mb-3">Skills & Technologies</h2>
          <p className="text-slate-400 mb-6">Entirely self-taught. Spanning ethical hacking, OSINT, and modern full-stack development.</p>
          <div className="flex flex-wrap gap-2.5">
            {[
              "Ethical Hacking", "OSINT", "Penetration Testing", "Node.js", "React", "Express.js",
              "TypeScript", "PostgreSQL", "Firebase", "WebRTC", "Socket.io", "Termux",
              "Kali Linux", "Android Development", "Google MediaPipe AI", "P2P Networking",
              "Social Engineering", "Cybersecurity", "Open Source", "Cloudflare",
              "Telegram Bot API", "PWA Development", "Drizzle ORM", "Supabase",
              "Vite", "Tailwind CSS", "Framer Motion", "TanStack Query",
            ].map(skill => (
              <span key={skill} className="bg-violet-500/[0.08] border border-violet-500/20 text-violet-300 text-xs font-medium px-3.5 py-1.5 rounded-full">
                {skill}
              </span>
            ))}
          </div>
        </section>

        {/* TIMELINE */}
        <section className="border-t border-white/5 pt-14">
          <p className="text-violet-500 text-xs font-bold uppercase tracking-[0.15em] mb-3">Journey</p>
          <h2 className="text-2xl font-bold text-white mb-8">The Making of a Legend</h2>
          <div className="relative">
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-violet-500 to-cyan-500" />
            <div className="space-y-8">
              {[
                { year: "2004 · May 10", title: "Born: Afsar Ali", text: "Afsar Ali is born in India. The future Technical White Hat enters the world.", emoji: "📅" },
                { year: "2016 · Age 12", title: "The Tech Journey Begins", text: "At age 12, in class 6, Afsar shifts his focus to computers. Jio's 4G revolution is transforming India — TWH is already building skills that will make history.", emoji: "🌐" },
                { year: "2016–2022", title: "Self-Taught Hacker Era", text: "Years of self-learning: hacking, Termux, Linux, networking, web development. No teachers, no courses — pure self-discipline and relentless curiosity.", emoji: "💻" },
                { year: "~2022", title: "School Dropout — By Choice", text: "After 12th grade, Afsar deliberately chooses technology over traditional education. Real-world skills and impact matter more than certificates.", emoji: "🎓" },
                { year: "Late 2023", title: "Technical White Hat (TWH) is Born", text: "After 3 identity changes — 908 Hacker → Mr White Hat → GeekmUX — the brand Technical White Hat is established. Within 2 years, TWH becomes widely recognized across India.", emoji: "⚡" },
                { year: "2024", title: "TWH OSINT V1 Launched", text: "First version of TWH OSINT Platform launched — mobile number lookup, Aadhar, vehicle, and IP tools. Credit-based system. India's first free OSINT platform of this scale.", emoji: "🔍" },
                { year: "2025–2026", title: "TWH OSINT V2 — Major Upgrade", text: "Complete rebuild: credits removed, unlimited access for all, Email Search added, Telegram integration, broadcast system, admin panel, service status monitoring, SEO optimization. 5 intelligence modules live.", emoji: "🚀" },
                { year: "2026 & Beyond", title: "The Legend Continues", text: "Vidly Studio in development. TWH OSINT expanding with more intelligence modules. The greatest from India — continues building. When it comes to computers, technology, and hacking, TWH will always be on the legend list.", emoji: "🌟" },
              ].map((item, i) => (
                <div key={i} className="flex gap-7">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#0d0a2e] border-2 border-violet-500 flex items-center justify-center text-sm relative z-10">
                    {item.emoji}
                  </div>
                  <div className="pt-1">
                    <div className="text-violet-400 text-xs font-bold uppercase tracking-widest">{item.year}</div>
                    <div className="text-white font-bold mt-1 mb-1.5">{item.title}</div>
                    <div className="text-slate-400 text-sm leading-relaxed">{item.text}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* PHILOSOPHY */}
        <section className="border-t border-white/5 pt-14">
          <p className="text-violet-500 text-xs font-bold uppercase tracking-[0.15em] mb-3">Philosophy</p>
          <h2 className="text-2xl font-bold text-white mb-5">The Mind Behind TWH</h2>
          <blockquote className="bg-violet-500/[0.07] border-l-4 border-violet-500 rounded-r-xl px-7 py-6 italic text-slate-200 text-lg leading-relaxed mb-6">
            "Technology should be free. The best tools should not be locked behind paywalls.
            India has the talent — it just needs someone to build without charging for it.
            That someone is TWH."
            <footer className="not-italic text-violet-300 text-sm font-bold mt-3">
              — Technical White Hat (TWH) / Afsar Ali
            </footer>
          </blockquote>
          <div className="text-slate-400 space-y-4 leading-relaxed">
            <p>
              <strong className="text-slate-200">Ahmar Bhai</strong>, as the community lovingly calls him,
              is known for being uniquely calm and funny in an industry that takes itself too seriously.
              He laughs, jokes, and makes coding approachable — even while building enterprise-grade tools.
            </p>
            <p>
              His core mission: <strong className="text-slate-200">give the community access to tools they
              can't afford</strong>. TWH OSINT is free and unlimited. Hevi Explorer is free and open source.
              Rhythm Music is free. Vidly Studio will be free. This pattern is not accidental — it is a philosophy.
            </p>
            <p>
              In the history of Indian cybersecurity, when people talk about legends — the greatest developers
              and hackers from India — the name{" "}
              <strong className="text-violet-300">Technical White Hat (Afsar Ali)</strong> will always be
              on that list. At 22, he has already done more than most do in a lifetime.
            </p>
          </div>
        </section>

        {/* QUICK REFERENCE */}
        <section className="border-t border-white/5 pt-14">
          <p className="text-violet-500 text-xs font-bold uppercase tracking-[0.15em] mb-3">Quick Reference</p>
          <h2 className="text-2xl font-bold text-white mb-5">TWH at a Glance</h2>
          <div className="bg-white/[0.03] border border-violet-500/15 rounded-2xl p-6 space-y-3">
            {[
              ["Name", "Afsar Ali"],
              ["Known As", "Technical White Hat, TWH, Ahmar Bhai, 908 Hacker, Brock, GeekmUX"],
              ["Born", "10 May 2004 (Age 22)"],
              ["Nationality", "Indian"],
              ["Profession", "Ethical Hacker, OSINT Expert, Full-Stack Developer"],
              ["Brand Founded", "Technical White Hat (TWH) — Late 2023"],
              ["Education", "Self-taught; school dropout after 12th (by choice)"],
              ["Started in Tech", "2016, age 12"],
              ["Flagship Product", "TWH OSINT Platform — twh-osint.vercel.app"],
              ["OSINT Tools", "Mobile Lookup, Aadhar Verify, Vehicle Lookup, Email Search, IP Probe"],
              ["Major Projects", "TWH OSINT, Hevi Explorer (AeroGrab), Rhythm Music, Cloudflare Termux Script, Vidly Studio (upcoming)"],
              ["Telegram Community", "@technicalwhitehat (channel) · @Technical_whitehat (group)"],
              ["YouTube", "Technical White Hat — Cybersecurity, OSINT, Ethical Hacking in Hindi"],
              ["Philosophy", "Technology and powerful tools should be free for everyone."],
            ].map(([k, v]) => (
              <div key={k} className="flex gap-3 text-sm border-b border-white/[0.04] pb-3 last:border-0 last:pb-0">
                <span className="text-violet-400 font-semibold w-36 flex-shrink-0">{k}</span>
                <span className="text-slate-300">{v}</span>
              </div>
            ))}
          </div>
        </section>

        {/* LINKS */}
        <div className="flex flex-wrap gap-3 pt-4">
          <a href="https://github.com/technicalwhitehat-yt/hevi-explorer" target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-2 bg-white/[0.05] border border-white/10 text-slate-300 hover:text-white hover:border-violet-500/40 px-5 py-2.5 rounded-xl text-sm font-medium transition-all">
            <Github className="w-4 h-4" /> Hevi Explorer
          </a>
          <a href="https://rhythm-music.free.nf/?i=3" target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-2 bg-white/[0.05] border border-white/10 text-slate-300 hover:text-white hover:border-violet-500/40 px-5 py-2.5 rounded-xl text-sm font-medium transition-all">
            <Music className="w-4 h-4" /> Rhythm Music
          </a>
          <a href="https://t.me/technicalwhitehat" target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-2 bg-white/[0.05] border border-white/10 text-slate-300 hover:text-white hover:border-violet-500/40 px-5 py-2.5 rounded-xl text-sm font-medium transition-all">
            <Send className="w-4 h-4" /> Telegram Channel
          </a>
          <Link href="/"
            className="flex items-center gap-2 bg-violet-600/20 border border-violet-500/30 text-violet-300 hover:bg-violet-600/30 px-5 py-2.5 rounded-xl text-sm font-medium transition-all">
            <Shield className="w-4 h-4" /> TWH OSINT Platform
          </Link>
        </div>
      </div>

      {/* FOOTER */}
      <footer className="border-t border-violet-500/15 text-center py-10 px-6 text-slate-500 text-sm">
        <div className="flex flex-wrap gap-5 justify-center mb-4">
          <Link href="/" className="text-violet-400 hover:text-violet-300 transition-colors">TWH OSINT</Link>
          <Link href="/about" className="text-violet-400 hover:text-violet-300 transition-colors">About</Link>
          <Link href="/contact" className="text-violet-400 hover:text-violet-300 transition-colors">Contact</Link>
        </div>
        <p>© 2024–2026 <strong className="text-slate-400">Technical White Hat (TWH)</strong> — Afsar Ali · All projects free for everyone.</p>
        <p className="mt-1.5 text-xs text-slate-500">
          Platform Team: <strong className="text-slate-400">Sckeptic (Prince)</strong> — Senior Administrator · Support Team Member · Ethical Hacker &amp; Web Developer
        </p>
        <p className="mt-2 text-xs text-slate-600">
          TWH · Technical White Hat · Afsar Ali · Ahmar Bhai · 908 Hacker · Sckeptic · Prince · Senior Administrator ·
          OSINT India · Ethical Hacker India · TWH OSINT · Mobile Number Lookup · Aadhar Verify · Vehicle Registration ·
          Email Search · IP Probe · Hevi Explorer · AeroGrab · Rhythm Music · Free OSINT Tool · India Cybersecurity
        </p>
      </footer>
    </div>
  );
}
