import { motion } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { useSEO } from "@/hooks/use-seo";
import logoHeroPath from "@assets/ChatGPT_Image_Jun_1,_2026,_06_09_38_AM_1780274401269.png";

export default function Home() {
  useSEO({
    title: "TWH OSINT — Service Discontinued",
    description: "TWH OSINT has been officially discontinued. An important message from Technical White Hat (Afsar).",
    canonical: "https://twh-osint.vercel.app/",
  });

  return (
    <div className="min-h-screen flex flex-col relative" style={{ background: "#050314" }}>
      <Navbar />

      {/* Background ambient glow */}
      <div
        className="fixed inset-0 pointer-events-none -z-10"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 50% 0%, rgba(139,92,246,0.10) 0%, transparent 70%)",
        }}
      />

      <main className="flex-1 flex flex-col items-center justify-start px-4 pt-10 pb-24">

        {/* ── OFFICIAL NOTICE BADGE ── */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase mb-8"
          style={{
            background: "rgba(239,68,68,0.10)",
            border: "1px solid rgba(239,68,68,0.35)",
            color: "#FCA5A5",
            letterSpacing: "0.12em",
          }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse inline-block" />
          Official Statement &nbsp;·&nbsp; TWH OSINT
        </motion.div>

        {/* ── LOGO ── */}
        <motion.div
          initial={{ opacity: 0, scale: 0.88 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.55, delay: 0.08 }}
          className="mb-7"
        >
          <img
            src={logoHeroPath}
            alt="TWH OSINT"
            className="w-20 h-20 object-contain mx-auto"
            style={{
              filter:
                "drop-shadow(0 0 18px rgba(139,92,246,0.7)) drop-shadow(0 0 40px rgba(109,40,217,0.4))",
              WebkitMaskImage:
                "radial-gradient(ellipse 88% 88% at 50% 48%, black 45%, transparent 80%)",
              maskImage:
                "radial-gradient(ellipse 88% 88% at 50% 48%, black 45%, transparent 80%)",
            }}
            draggable={false}
          />
        </motion.div>

        {/* ── TITLE ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.14 }}
          className="text-center mb-2"
        >
          <h1
            className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-1"
            style={{
              background: "linear-gradient(135deg, #ffffff 30%, #a78bfa 80%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            TWH OSINT
          </h1>
          <p className="text-sm font-semibold tracking-[0.18em] uppercase" style={{ color: "#7C3AED" }}>
            Discontinued
          </p>
        </motion.div>

        {/* ── DIVIDER ── */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.5, delay: 0.22 }}
          className="w-24 h-px my-6"
          style={{ background: "linear-gradient(90deg, transparent, rgba(139,92,246,0.7), transparent)" }}
        />

        {/* ── MESSAGE CARD ── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.28 }}
          className="w-full max-w-2xl"
          style={{
            background: "rgba(255,255,255,0.025)",
            border: "1px solid rgba(139,92,246,0.22)",
            borderRadius: "20px",
            boxShadow:
              "0 0 0 1px rgba(139,92,246,0.08), 0 24px 60px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.05)",
            overflow: "hidden",
          }}
        >
          {/* Card header bar */}
          <div
            className="flex items-center gap-3 px-6 py-4"
            style={{
              background: "rgba(139,92,246,0.10)",
              borderBottom: "1px solid rgba(139,92,246,0.15)",
            }}
          >
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: "#EF4444" }} />
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: "#F59E0B" }} />
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: "#10B981" }} />
            </div>
            <span className="text-[11px] font-semibold tracking-widest uppercase" style={{ color: "#7C3AED" }}>
              📢 &nbsp;Official Message — Technical White Hat
            </span>
          </div>

          {/* ── HINGLISH VERSION ── */}
          <div className="px-6 pt-6 pb-5">
            <div
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase mb-5"
              style={{
                background: "rgba(139,92,246,0.12)",
                border: "1px solid rgba(139,92,246,0.3)",
                color: "#C084FC",
              }}
            >
              🇮🇳 &nbsp;Hinglish
            </div>

            <h2 className="text-base font-bold text-white mb-1">
              🚨 Zaroori Soochna — TWH OSINT Discontinue
            </h2>
            <p className="text-[11px] mb-5" style={{ color: "#6D28D9" }}>
              Yeh message TWH ke respected owner ke aadesh pe officially jaari kiya ja raha hai.
            </p>

            <div
              className="rounded-xl p-5 text-[13px] leading-[1.85] space-y-4"
              style={{
                background: "rgba(0,0,0,0.25)",
                border: "1px solid rgba(255,255,255,0.06)",
                color: "rgba(255,255,255,0.78)",
              }}
            >
              <p>
                <span style={{ color: "#A78BFA", fontWeight: 700 }}>Hum out of fund hai,</span> isliye ab se{" "}
                <span style={{ color: "#E879F9", fontWeight: 600 }}>TWH OSINT discontinue</span> kiya ja raha hai.
                Future mein yeh tool wapas aayega ya nahi — hum abhi nahi bata sakte.
              </p>

              <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "11px", fontStyle: "italic" }}>
                — Technical White Hat (Afsar) ki taraf se
              </p>

              <div className="border-t border-white/5 pt-4 space-y-3">
                <p>
                  Hey guys, what's up — hope you all doing best. 👋 Aaj ka message shayad aapko disappoint kar
                  sakta hai, kyunki humara power tool{" "}
                  <span style={{ color: "#A78BFA", fontWeight: 600 }}>TWH OSINT</span> — jo itne dinon se chal
                  raha tha aur ab tak <span style={{ color: "#E879F9", fontWeight: 600 }}>1,00,000+ numbers</span>{" "}
                  ka successful result aap logo ko diya — aaj iska safar yahan khatam hota hai.
                </p>
                <p>
                  Maine is tool ko isliye banaya tha taaki online scam, bullying, blackmailing aur khaas karke{" "}
                  <span style={{ color: "#6EE7B7", fontWeight: 600 }}>ladkiyon ki safety</span> ko sochke isse
                  banaya aur free kiya gaya tha.
                </p>
                <p>
                  Lekin bahut saare complaints aur cyber cases TWH OSINT ke upar aane ke baad, humhare paas
                  request aaya. Is chiz ko verify karte hue aur{" "}
                  <span style={{ color: "#FCD34D", fontWeight: 600 }}>Right to Privacy</span> ko madde nazar
                  rakhte hue — humne yeh identify kiya ki is tool ka fair use se kahin zyada{" "}
                  <span style={{ color: "#FCA5A5", fontWeight: 600 }}>misuse</span> kiya gaya hai.
                </p>
                <p>
                  Maine aur team ne acche se sab kuch dekha, verify kiya aur hum yeh confirm karte hain — is
                  tool ke galat istemal ki wajah se, main{" "}
                  <span style={{ color: "#A78BFA", fontWeight: 600 }}>Afsar aka Technical White Hat</span>{" "}
                  officially announce kar raha hoon ki{" "}
                  <span style={{ color: "#E879F9", fontWeight: 600 }}>TWH OSINT discontinue</span> kiya ja raha
                  hai.
                </p>
                <p>
                  Maine kabhi bhi kisi cheez ko galat istemal ke liye nahi banaya hai. Main ek developer hoon —
                  mera kaam hai naya naya cheez banana aur jo koi na kar sake, woh kar ke dikhana. But kabhi bhi
                  main ya mera team ka koi galat irada nahi hota. Aur{" "}
                  <span style={{ color: "#6EE7B7", fontWeight: 600 }}>galat ko rokna hi humara kaam hai.</span>
                </p>
                <p>
                  Agar is beech humara khud ka koi tool ya hum khud bhi aate hain, to hum hamesha logo ke bhalay
                  ke liye sahi faisla karenge.
                </p>
                <p>
                  Aap sabhi ka{" "}
                  <span style={{ color: "#A78BFA", fontWeight: 600 }}>shukriya</span> is tool ko support dene ke
                  liye. But iska safar yahaan khatam hota hai.
                </p>
              </div>

              <div
                className="flex items-center gap-2 pt-2"
                style={{ color: "#A78BFA", fontWeight: 700, fontSize: "14px" }}
              >
                🇮🇳 &nbsp;Jai Hind
              </div>
            </div>
          </div>

          {/* Divider between versions */}
          <div
            className="mx-6"
            style={{
              height: "1px",
              background: "linear-gradient(90deg, transparent, rgba(139,92,246,0.3), transparent)",
            }}
          />

          {/* ── ENGLISH VERSION ── */}
          <div className="px-6 pt-5 pb-6">
            <div
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase mb-5"
              style={{
                background: "rgba(59,130,246,0.10)",
                border: "1px solid rgba(59,130,246,0.25)",
                color: "#93C5FD",
              }}
            >
              🌐 &nbsp;English
            </div>

            <h2 className="text-base font-bold text-white mb-1">
              🚨 Important Notice — TWH OSINT Discontinued
            </h2>
            <p className="text-[11px] mb-5" style={{ color: "#6D28D9" }}>
              This statement is being officially released on the orders of the respected owner of TWH.
            </p>

            <div
              className="rounded-xl p-5 text-[13px] leading-[1.85] space-y-4"
              style={{
                background: "rgba(0,0,0,0.25)",
                border: "1px solid rgba(255,255,255,0.06)",
                color: "rgba(255,255,255,0.78)",
              }}
            >
              <p>
                <span style={{ color: "#A78BFA", fontWeight: 700 }}>We are out of funds,</span> and effective
                immediately, <span style={{ color: "#E879F9", fontWeight: 600 }}>TWH OSINT is being officially
                discontinued.</span> Whether this tool will return in the future — we cannot say at this time.
              </p>

              <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "11px", fontStyle: "italic" }}>
                — From Technical White Hat (Afsar)
              </p>

              <div className="border-t border-white/5 pt-4 space-y-3">
                <p>
                  Hey guys, what's up — I hope you're all doing well. 👋 Today's message may disappoint many of
                  you, because our powerful tool{" "}
                  <span style={{ color: "#A78BFA", fontWeight: 600 }}>TWH OSINT</span> — which has been running
                  for so long and has successfully delivered results for over{" "}
                  <span style={{ color: "#E879F9", fontWeight: 600 }}>1,00,000+ searches</span> — is coming to
                  an end today.
                </p>
                <p>
                  I built this tool with a clear and honest purpose: to fight online scams, bullying,
                  blackmailing, and most importantly, to ensure the{" "}
                  <span style={{ color: "#6EE7B7", fontWeight: 600 }}>safety of women</span> online. It was
                  built and kept completely free for everyone.
                </p>
                <p>
                  However, after receiving numerous complaints and formal cyber cases filed against TWH OSINT,
                  we received a request to review the platform. Taking into careful consideration user safety,
                  verification processes, and the fundamental{" "}
                  <span style={{ color: "#FCD34D", fontWeight: 600 }}>Right to Privacy</span> — we identified
                  that this tool has been extensively{" "}
                  <span style={{ color: "#FCA5A5", fontWeight: 600 }}>misused</span> far beyond its intended
                  purpose.
                </p>
                <p>
                  My team and I thoroughly reviewed and verified all the facts. We can now confirm — due to
                  the widespread misuse of this platform beyond its fair-use boundaries, I,{" "}
                  <span style={{ color: "#A78BFA", fontWeight: 600 }}>Afsar aka Technical White Hat</span>,
                  am officially announcing the{" "}
                  <span style={{ color: "#E879F9", fontWeight: 600 }}>discontinuation of TWH OSINT.</span>
                </p>
                <p>
                  I have never built anything with the intent of causing harm. I am a developer — my purpose is
                  to build new things and achieve what others cannot. Neither I nor anyone on my team has ever
                  had any wrong intention.{" "}
                  <span style={{ color: "#6EE7B7", fontWeight: 600 }}>
                    Stopping what is wrong is our responsibility.
                  </span>
                </p>
                <p>
                  If, in the future, our tools or we ourselves return to this space — it will always be for the
                  betterment and well-being of the people.
                </p>
                <p>
                  Thank you to each and every one of you for your{" "}
                  <span style={{ color: "#A78BFA", fontWeight: 600 }}>support and trust</span> in this tool. But
                  this journey ends here.
                </p>
              </div>

              <div
                className="flex items-center gap-2 pt-2"
                style={{ color: "#A78BFA", fontWeight: 700, fontSize: "14px" }}
              >
                🇮🇳 &nbsp;Jai Hind
              </div>
            </div>
          </div>

          {/* Card footer */}
          <div
            className="flex items-center justify-between px-6 py-3.5"
            style={{
              background: "rgba(0,0,0,0.2)",
              borderTop: "1px solid rgba(139,92,246,0.12)",
            }}
          >
            <span className="text-[10px]" style={{ color: "rgba(255,255,255,0.2)" }}>
              TWH OSINT · Est. 2024
            </span>
            <span className="text-[10px] font-semibold" style={{ color: "#6D28D9" }}>
              — Technical White Hat (Afsar)
            </span>
          </div>
        </motion.div>

        {/* ── BOTTOM NOTE ── */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.55 }}
          className="mt-8 text-[11px] text-center max-w-sm"
          style={{ color: "rgba(255,255,255,0.2)", lineHeight: "1.7" }}
        >
          For any official queries, reach out via Telegram.
          <br />
          Thank you for being part of this journey. 🙏
        </motion.p>

      </main>
    </div>
  );
}
