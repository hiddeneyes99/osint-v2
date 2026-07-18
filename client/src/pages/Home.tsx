import { motion } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { useSEO } from "@/hooks/use-seo";
import logoHeroPath from "@assets/ChatGPT_Image_Jun_1,_2026,_06_09_38_AM_1780274401269.png";

export default function Home() {
  useSEO({
    title: "TWH OSINT — Official Notice",
    description: "An official public notice from Technical White Hat (Afsar) regarding TWH OSINT.",
    canonical: "https://twh-osint.vercel.app/",
  });

  return (
    <div
      className="min-h-screen flex flex-col relative"
      style={{ background: "#050314" }}
    >
      <Navbar />

      {/* Ambient glow */}
      <div
        className="fixed inset-0 pointer-events-none -z-10"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 50% 0%, rgba(139,92,246,0.08) 0%, transparent 70%)",
        }}
      />

      <main className="flex-1 flex flex-col items-center px-4 pt-10 pb-24">

        {/* ── OFFICIAL NOTICE STAMP ── */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="flex items-center gap-3 mb-10"
        >
          <div className="h-px w-10 sm:w-20" style={{ background: "rgba(139,92,246,0.35)" }} />
          <span
            className="text-[10px] font-black tracking-[0.25em] uppercase px-4 py-1.5 rounded-full"
            style={{
              border: "1px solid rgba(239,68,68,0.4)",
              color: "#FCA5A5",
              background: "rgba(239,68,68,0.07)",
              letterSpacing: "0.22em",
            }}
          >
            ⚠ Official Public Notice
          </span>
          <div className="h-px w-10 sm:w-20" style={{ background: "rgba(139,92,246,0.35)" }} />
        </motion.div>

        {/* ── NOTICE CARD ── */}
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.1 }}
          className="w-full max-w-2xl"
          style={{
            background: "rgba(255,255,255,0.022)",
            border: "1px solid rgba(139,92,246,0.2)",
            borderRadius: "22px",
            boxShadow:
              "0 0 0 1px rgba(139,92,246,0.06), 0 32px 80px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.04)",
            overflow: "hidden",
          }}
        >
          {/* ── Card top bar ── */}
          <div
            className="px-6 py-3 flex items-center justify-between"
            style={{
              background: "rgba(139,92,246,0.09)",
              borderBottom: "1px solid rgba(139,92,246,0.14)",
            }}
          >
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: "#EF4444" }} />
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: "#F59E0B" }} />
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: "#10B981" }} />
            </div>
            <span
              className="text-[10px] font-bold tracking-widest uppercase"
              style={{ color: "rgba(167,139,250,0.7)" }}
            >
              TWH OSINT &nbsp;·&nbsp; Public Statement
            </span>
            <span
              className="text-[10px] font-semibold"
              style={{ color: "rgba(255,255,255,0.2)" }}
            >
              July 2026
            </span>
          </div>

          {/* ── PROFILE ROW (like a post author) ── */}
          <div className="px-6 pt-6 pb-5 flex items-start gap-4">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div
                className="w-14 h-14 rounded-2xl overflow-hidden flex items-center justify-center"
                style={{
                  background: "rgba(139,92,246,0.15)",
                  border: "2px solid rgba(139,92,246,0.5)",
                  boxShadow: "0 0 20px rgba(139,92,246,0.35)",
                }}
              >
                <img
                  src={logoHeroPath}
                  alt="TWH"
                  className="w-full h-full object-contain"
                  style={{
                    filter: "drop-shadow(0 0 6px rgba(139,92,246,0.6))",
                  }}
                  draggable={false}
                />
              </div>
              {/* Online / active dot */}
              <span
                className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2"
                style={{
                  background: "#8B5CF6",
                  borderColor: "#050314",
                }}
              />
            </div>

            {/* Author info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-white font-bold text-[15px] leading-tight">
                  Technical White Hat
                </span>
                {/* Verified badge */}
                <span
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black tracking-widest uppercase"
                  style={{
                    background: "rgba(139,92,246,0.18)",
                    border: "1px solid rgba(139,92,246,0.45)",
                    color: "#C084FC",
                  }}
                >
                  ✦ Verified
                </span>
                {/* Official member tag */}
                <span
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black tracking-widest uppercase"
                  style={{
                    background: "rgba(239,68,68,0.1)",
                    border: "1px solid rgba(239,68,68,0.3)",
                    color: "#FCA5A5",
                  }}
                >
                  Official Member
                </span>
              </div>
              <p
                className="text-[11px] mt-0.5"
                style={{ color: "rgba(255,255,255,0.38)" }}
              >
                @afsar &nbsp;·&nbsp; Founder, TWH OSINT &nbsp;·&nbsp; Released officially on behalf of TWH
              </p>
            </div>
          </div>

          {/* ── NOTICE BODY ── */}
          <div
            className="mx-6 mb-6 rounded-xl overflow-hidden"
            style={{
              border: "1px solid rgba(139,92,246,0.14)",
              background: "rgba(0,0,0,0.22)",
            }}
          >
            {/* Notice label */}
            <div
              className="px-5 py-3 flex items-center gap-2.5"
              style={{
                borderBottom: "1px solid rgba(139,92,246,0.1)",
                background: "rgba(139,92,246,0.06)",
              }}
            >
              <span style={{ fontSize: "15px" }}>📢</span>
              <span
                className="text-[11px] font-black tracking-[0.18em] uppercase"
                style={{ color: "#A78BFA" }}
              >
                Public Notice — Discontinuation of TWH OSINT
              </span>
            </div>

            {/* ── HINGLISH ── */}
            <div className="px-5 pt-5 pb-4 space-y-3 text-[13px] leading-[1.9]" style={{ color: "rgba(255,255,255,0.82)" }}>
              <div className="flex items-center gap-2 mb-3">
                <span
                  className="text-[9px] font-black tracking-widest uppercase px-2 py-0.5 rounded"
                  style={{
                    background: "rgba(255,165,0,0.1)",
                    border: "1px solid rgba(255,165,0,0.25)",
                    color: "#FCD34D",
                  }}
                >
                  🇮🇳 &nbsp;Hinglish
                </span>
              </div>

              <p>
                Sabse pehle — main{" "}
                <span style={{ color: "#A78BFA", fontWeight: 700 }}>Afsar (Technical White Hat)</span> —
                TWH OSINT ka founder aur official member — yeh notice publicly jaari kar raha hoon.
              </p>

              <p>
                <span style={{ color: "#E879F9", fontWeight: 600 }}>TWH OSINT officially discontinue</span>{" "}
                kiya ja raha hai. Hum out of fund ho gaye hain, aur is wajah se service aage nahi chal sakti.
                Yeh tool kabhi wapas aayega ya nahi — is waqt hum yeh confirm nahi kar sakte.
              </p>

              <p>
                Is tool ko maine ek soch ke saath banaya tha — online scam, bullying, blackmailing, aur khaas
                karke{" "}
                <span style={{ color: "#6EE7B7", fontWeight: 600 }}>ladkiyon ki safety</span> ke liye. Yeh
                completely free rakha gaya tha, aur humne{" "}
                <span style={{ color: "#E879F9", fontWeight: 600 }}>1,00,000+ successful results</span> users
                ko diye.
              </p>

              <p>
                Lekin bahut saare complaints aur formal cyber cases aane ke baad humne verify kiya — aur yeh
                paya ki tool ka{" "}
                <span style={{ color: "#FCA5A5", fontWeight: 600 }}>misuse fair use se kahin zyada</span> ho
                raha hai.{" "}
                <span style={{ color: "#FCD34D", fontWeight: 600 }}>Right to Privacy</span> ek fundamental
                cheez hai — aur hum uski respect karte hain.
              </p>

              <p>
                Main hamesha ek responsible developer raha hoon. Mera — ya mere team ka — kabhi koi galat
                irada nahi raha. Lekin{" "}
                <span style={{ color: "#6EE7B7", fontWeight: 600 }}>galat ko rokna bhi hamara hi kaam hai.</span>
              </p>

              <p>
                Agar future mein hum ya humara koi tool wapas aata hai — woh hamesha{" "}
                <span style={{ color: "#A78BFA", fontWeight: 600 }}>logo ke bhalay ke liye</span> hoga.
              </p>

              <p>
                Aap sabhi ka{" "}
                <span style={{ color: "#A78BFA", fontWeight: 700 }}>shukriya</span> — support, trust aur
                ek achhi niyat ke saath is tool ka istemal karne ke liye. Safar yahan khatam hota hai.
              </p>

              <p style={{ color: "#A78BFA", fontWeight: 700 }}>🇮🇳 Jai Hind</p>
            </div>

            {/* Divider */}
            <div
              className="mx-5"
              style={{
                height: "1px",
                background: "linear-gradient(90deg, transparent, rgba(139,92,246,0.25), transparent)",
              }}
            />

            {/* ── ENGLISH ── */}
            <div className="px-5 pt-5 pb-5 space-y-3 text-[13px] leading-[1.9]" style={{ color: "rgba(255,255,255,0.82)" }}>
              <div className="flex items-center gap-2 mb-3">
                <span
                  className="text-[9px] font-black tracking-widest uppercase px-2 py-0.5 rounded"
                  style={{
                    background: "rgba(59,130,246,0.1)",
                    border: "1px solid rgba(59,130,246,0.25)",
                    color: "#93C5FD",
                  }}
                >
                  🌐 &nbsp;English
                </span>
              </div>

              <p>
                I, <span style={{ color: "#A78BFA", fontWeight: 700 }}>Afsar (Technical White Hat)</span> —
                founder and official member of TWH OSINT — am issuing this notice to the public.
              </p>

              <p>
                <span style={{ color: "#E879F9", fontWeight: 600 }}>TWH OSINT is officially being discontinued.</span>{" "}
                We have run out of funds, and the service can no longer continue operations. Whether this
                tool will return in the future — we are unable to confirm at this time.
              </p>

              <p>
                This tool was built with a clear purpose — to fight online scams, bullying, blackmailing,
                and to protect{" "}
                <span style={{ color: "#6EE7B7", fontWeight: 600 }}>women's safety</span> online. It was
                kept completely free, and we delivered{" "}
                <span style={{ color: "#E879F9", fontWeight: 600 }}>1,00,000+ successful results</span> to
                our users.
              </p>

              <p>
                However, after receiving numerous complaints and formal cyber cases, we thoroughly reviewed
                the situation — and identified that the tool was being{" "}
                <span style={{ color: "#FCA5A5", fontWeight: 600 }}>misused far beyond its intended purpose</span>.
                The{" "}
                <span style={{ color: "#FCD34D", fontWeight: 600 }}>Right to Privacy</span> is a fundamental
                right — and one we deeply respect.
              </p>

              <p>
                I have always been a responsible developer. Neither I nor my team has ever had any wrong
                intention.{" "}
                <span style={{ color: "#6EE7B7", fontWeight: 600 }}>
                  But stopping what is wrong is equally our responsibility.
                </span>
              </p>

              <p>
                If in the future we or any of our tools return to this space — it will always be for the{" "}
                <span style={{ color: "#A78BFA", fontWeight: 600 }}>betterment of the people</span>.
              </p>

              <p>
                Thank you to each one of you for your{" "}
                <span style={{ color: "#A78BFA", fontWeight: 700 }}>support and trust</span>. This journey
                ends here.
              </p>

              <p style={{ color: "#A78BFA", fontWeight: 700 }}>🇮🇳 Jai Hind</p>
            </div>
          </div>

          {/* ── SIGNATURE ROW ── */}
          <div
            className="mx-6 mb-6 flex items-center gap-4 rounded-xl px-5 py-4"
            style={{
              background: "rgba(139,92,246,0.06)",
              border: "1px solid rgba(139,92,246,0.14)",
            }}
          >
            {/* Small avatar repeat */}
            <div
              className="w-9 h-9 rounded-xl overflow-hidden flex-shrink-0"
              style={{
                border: "1.5px solid rgba(139,92,246,0.45)",
                background: "rgba(139,92,246,0.12)",
              }}
            >
              <img
                src={logoHeroPath}
                alt="TWH"
                className="w-full h-full object-contain"
                draggable={false}
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-bold text-[12px]">Technical White Hat (Afsar)</p>
              <p className="text-[10px]" style={{ color: "rgba(255,255,255,0.35)" }}>
                Founder · TWH OSINT &nbsp;·&nbsp; Signed &amp; Released Officially
              </p>
            </div>
            {/* Stamp */}
            <div
              className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-center"
              style={{
                border: "2px solid rgba(139,92,246,0.4)",
                background: "rgba(139,92,246,0.08)",
                fontSize: "9px",
                fontWeight: 900,
                color: "rgba(167,139,250,0.55)",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                lineHeight: 1.2,
              }}
            >
              TWH<br />2026
            </div>
          </div>

          {/* ── FOOTER ── */}
          <div
            className="flex items-center justify-between px-6 py-3"
            style={{
              borderTop: "1px solid rgba(139,92,246,0.1)",
              background: "rgba(0,0,0,0.18)",
            }}
          >
            <span className="text-[10px]" style={{ color: "rgba(255,255,255,0.18)" }}>
              TWH OSINT · Est. 2024
            </span>
            <span
              className="text-[10px] font-semibold flex items-center gap-1.5"
              style={{ color: "rgba(167,139,250,0.45)" }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: "rgba(239,68,68,0.7)", boxShadow: "0 0 5px rgba(239,68,68,0.5)" }}
              />
              Service Discontinued
            </span>
          </div>
        </motion.div>

        {/* ── BOTTOM NOTE ── */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-7 text-[11px] text-center max-w-xs"
          style={{ color: "rgba(255,255,255,0.18)", lineHeight: "1.8" }}
        >
          For official queries — reach out via Telegram.
          <br />
          Thank you for being part of this journey. 🙏
        </motion.p>

      </main>
    </div>
  );
}
