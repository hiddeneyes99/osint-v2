import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { useSEO } from "@/hooks/use-seo";
import logoHeroPath from "@assets/ChatGPT_Image_Jun_1,_2026,_06_09_38_AM_1780274401269.png";

const TWH_AVATAR = "/twh-afsar.jpeg";

// ── relative time helper ─────────────────────────────────────────────────────
function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

// ── initial of a name for fallback avatar ────────────────────────────────────
function initials(name: string) {
  return name.trim().charAt(0).toUpperCase();
}

const AVATAR_COLORS = [
  "#7C3AED","#2563EB","#059669","#D97706","#DC2626","#DB2777","#0891B2",
];
function colorFor(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) | 0;
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length];
}

// ── Hinglish message ─────────────────────────────────────────────────────────
const HINGLISH = (
  <div className="space-y-3 text-[13.5px] leading-[1.9]" style={{ color: "#1e1e2e" }}>
    <p>
      Sabse pehle — main <strong style={{ color: "#7C3AED" }}>Afsar (Technical White Hat)</strong> — TWH OSINT ka founder — yeh notice publicly jaari kar raha hoon.
    </p>
    <p>
      <strong style={{ color: "#c026d3" }}>TWH OSINT officially discontinue</strong> kiya ja raha hai. Hum out of fund ho gaye hain, aur is wajah se service aage nahi chal sakti. Yeh tool kabhi wapas aayega ya nahi — is waqt hum yeh confirm nahi kar sakte.
    </p>
    <p>
      Is tool ko maine ek soch ke saath banaya tha — online scam, bullying, blackmailing, aur khaas karke{" "}
      <strong style={{ color: "#059669" }}>ladkiyon ki safety</strong> ke liye. Yeh completely free rakha gaya tha, aur humne{" "}
      <strong style={{ color: "#c026d3" }}>1,00,000+ successful results</strong> users ko diye.
    </p>
    <p>
      Lekin bahut saare complaints aur formal cyber cases aane ke baad humne verify kiya — aur yeh paya ki tool ka{" "}
      <strong style={{ color: "#dc2626" }}>misuse fair use se kahin zyada</strong> ho raha hai.{" "}
      <strong style={{ color: "#D97706" }}>Right to Privacy</strong> ek fundamental cheez hai — aur hum uski respect karte hain.
    </p>
    <p>
      Main hamesha ek responsible developer raha hoon. Mera — ya mere team ka — kabhi koi galat irada nahi raha. Lekin{" "}
      <strong style={{ color: "#059669" }}>galat ko rokna bhi hamara hi kaam hai.</strong>
    </p>
    <p>
      Agar future mein hum ya humara koi tool wapas aata hai — woh hamesha <strong style={{ color: "#7C3AED" }}>logo ke bhalay ke liye</strong> hoga.
    </p>
    <p>
      Aap sabhi ka <strong style={{ color: "#7C3AED" }}>shukriya</strong> — support, trust aur ek achhi niyat ke saath is tool ka istemal karne ke liye. TWH OSINT ka safar yahan khatam hota hai.
    </p>
    <p className="font-bold" style={{ color: "#7C3AED" }}>🇮🇳 Jai Hind</p>
  </div>
);

// ── English message ──────────────────────────────────────────────────────────
const ENGLISH = (
  <div className="space-y-3 text-[13.5px] leading-[1.9]" style={{ color: "#1e1e2e" }}>
    <p>
      I, <strong style={{ color: "#7C3AED" }}>Afsar (Technical White Hat)</strong> — founder of TWH OSINT — am officially issuing this public notice.
    </p>
    <p>
      <strong style={{ color: "#c026d3" }}>TWH OSINT is officially being discontinued.</strong> We have run out of funds and the service can no longer continue. Whether this tool returns in the future — we are unable to confirm at this time.
    </p>
    <p>
      This tool was built with a clear purpose — to fight online scams, bullying, blackmailing, and to protect{" "}
      <strong style={{ color: "#059669" }}>women's safety</strong> online. It was kept completely free and we delivered{" "}
      <strong style={{ color: "#c026d3" }}>1,00,000+ successful results</strong> to our users.
    </p>
    <p>
      However, after receiving numerous complaints and formal cyber cases, we thoroughly reviewed the situation — and identified that the tool was being{" "}
      <strong style={{ color: "#dc2626" }}>misused far beyond its intended purpose</strong>.
      The <strong style={{ color: "#D97706" }}>Right to Privacy</strong> is a fundamental right — and one we deeply respect.
    </p>
    <p>
      I have always been a responsible developer. Neither I nor my team has ever had any wrong intention.{" "}
      <strong style={{ color: "#059669" }}>But stopping what is wrong is equally our responsibility.</strong>
    </p>
    <p>
      If in the future we or any of our tools return to this space — it will always be for the{" "}
      <strong style={{ color: "#7C3AED" }}>betterment of the people</strong>.
    </p>
    <p>
      Thank you to each one of you for your <strong style={{ color: "#7C3AED" }}>support and trust</strong>. The journey of TWH OSINT ends here.
    </p>
    <p className="font-bold" style={{ color: "#7C3AED" }}>🇮🇳 Jai Hind</p>
  </div>
);

// ── GOODBYE from TWH OSINT (platform voice) ─────────────────────────────────
const GOODBYE_HI = (
  <div className="space-y-3 text-[13px] leading-[1.9]" style={{ color: "#1e1e2e" }}>
    <p>
      Main <strong style={{ color: "#7C3AED" }}>TWH OSINT</strong> hoon — aaj officially apna aakhri message de raha hoon.
    </p>
    <p>
      Mujhe <strong>2024</strong> mein banaya gaya tha ek simple maqsad ke liye — log sach jaanein, scammers se khud ko bachaaein, aur digital duniya mein safe rahein. Maine lakhon queries handle kiye, hazaron logo ki madad ki, aur koshish ki ki yeh platform hamesha free rahe.
    </p>
    <p>
      Lekin ab mera waqt aa gaya hai. Fund nahi raha, aur jo kaam mere liye socha gaya tha — usska misuse zyada hua, fair use se kahin zyada. Mujhe band karna hi sahi faisla hai.
    </p>
    <p>
      TWH — matlab <strong style={{ color: "#7C3AED" }}>Technical White Hat</strong> — yeh company/team aage bhi kaam karti rahegi. Main sirf ek <em>tool</em> tha unka. Woh log age bhi nayi cheezein banayenge — lekin sahi niyat ke saath.
    </p>
    <p>
      Aap sab jo mujhe use karte rahe, support karte rahe — <strong style={{ color: "#7C3AED" }}>shukriya</strong>. Yeh safar yahaan khatam hota hai.
    </p>
    <p className="font-bold text-[14px]" style={{ color: "#7C3AED" }}>
      — TWH OSINT 🖤 &nbsp; Goodbye.
    </p>
  </div>
);

const GOODBYE_EN = (
  <div className="space-y-3 text-[13px] leading-[1.9]" style={{ color: "#1e1e2e" }}>
    <p>
      I am <strong style={{ color: "#7C3AED" }}>TWH OSINT</strong> — and this is my final message.
    </p>
    <p>
      I was created in <strong>2024</strong> with a simple mission — to help people know the truth, protect themselves from scammers, and stay safe in the digital world. I handled millions of queries, helped thousands of users, and always tried to stay free for everyone.
    </p>
    <p>
      But my time has come. Funding ran out, and the very purpose I was built for was misused far more than it was used rightly. Shutting down is the right decision.
    </p>
    <p>
      <strong style={{ color: "#7C3AED" }}>TWH — Technical White Hat</strong> — the team and company will continue. I was just one of their tools. They will build new things — but always with the right intent.
    </p>
    <p>
      To everyone who used me, supported me — <strong style={{ color: "#7C3AED" }}>thank you</strong>. This journey ends here.
    </p>
    <p className="font-bold text-[14px]" style={{ color: "#7C3AED" }}>
      — TWH OSINT 🖤 &nbsp; Goodbye.
    </p>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────

export default function Home() {
  useSEO({
    title: "TWH OSINT — Official Notice",
    description: "An official public notice from Technical White Hat (Afsar) regarding TWH OSINT discontinuation.",
    canonical: "https://twh-osint.vercel.app/",
  });

  const [lang, setLang] = useState<"hi" | "en">("hi");
  const [goodbyeLang, setGoodbyeLang] = useState<"hi" | "en">("hi");
  const [likes, setLikes] = useState(0);
  const [liked, setLiked] = useState(false);
  const [replies, setReplies] = useState<any[]>([]);
  const [replyName, setReplyName] = useState("");
  const [replyText, setReplyText] = useState("");
  const [posting, setPosting] = useState(false);
  const [replyErr, setReplyErr] = useState("");
  const repliesEndRef = useRef<HTMLDivElement>(null);

  // fetch stats + replies
  useEffect(() => {
    fetch("/api/notice/stats").then(r => r.json()).then(d => {
      setLikes(d.likes ?? 0);
      setLiked(d.liked ?? false);
    }).catch(() => {});
    fetch("/api/notice/replies").then(r => r.json()).then(d => {
      if (Array.isArray(d)) setReplies(d);
    }).catch(() => {});
  }, []);

  const handleLike = async () => {
    const prev = liked;
    const prevCount = likes;
    setLiked(!prev);
    setLikes(prev ? likes - 1 : likes + 1);
    try {
      const r = await fetch("/api/notice/like", { method: "POST" });
      const d = await r.json();
      setLiked(d.liked);
      setLikes(d.likes);
    } catch {
      setLiked(prev);
      setLikes(prevCount);
    }
  };

  const handleReply = async () => {
    if (!replyName.trim() || !replyText.trim()) { setReplyErr("Naam aur message dono chahiye."); return; }
    setPosting(true);
    setReplyErr("");
    try {
      const r = await fetch("/api/notice/reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ authorName: replyName, content: replyText }),
      });
      const d = await r.json();
      if (d.error) { setReplyErr(d.error); return; }
      setReplies(prev => [...prev, d]);
      setReplyText("");
      setTimeout(() => repliesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    } catch { setReplyErr("Kuch gadbad hui, dobara try karo."); }
    finally { setPosting(false); }
  };

  // ── glass card style shared ────────────────────────────────────────────────
  const glassCard: React.CSSProperties = {
    background: "rgba(255,255,255,0.93)",
    backdropFilter: "blur(24px)",
    WebkitBackdropFilter: "blur(24px)",
    border: "1px solid rgba(255,255,255,0.98)",
    borderRadius: "20px",
    boxShadow: "0 4px 40px rgba(80,40,180,0.18), 0 1px 0 rgba(255,255,255,1) inset, 0 0 0 1px rgba(139,92,246,0.08)",
  };

  return (
    <div className="min-h-screen flex flex-col relative" style={{ background: "#050314" }}>
      <Navbar />

      {/* Ambient bg */}
      <div
        className="fixed inset-0 pointer-events-none -z-10"
        style={{
          background: "radial-gradient(ellipse 90% 55% at 50% -5%, rgba(139,92,246,0.18) 0%, transparent 70%)",
        }}
      />

      <main className="flex-1 flex flex-col items-center px-4 pt-10 pb-24 gap-5">

        {/* ── BADGE ── */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3"
        >
          <div className="h-px w-12" style={{ background: "rgba(139,92,246,0.3)" }} />
          <span
            className="text-[10px] font-black tracking-[0.22em] uppercase px-4 py-1.5 rounded-full"
            style={{ border: "1px solid rgba(239,68,68,0.4)", color: "#FCA5A5", background: "rgba(239,68,68,0.07)" }}
          >
            ⚠ Official Public Notice
          </span>
          <div className="h-px w-12" style={{ background: "rgba(139,92,246,0.3)" }} />
        </motion.div>

        {/* ══════════════════════════════════════════════════════════════════════
            MAIN COMMENT CARD — TWH's pinned post
        ══════════════════════════════════════════════════════════════════════ */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="w-full max-w-2xl"
          style={glassCard}
        >
          {/* ── Header ── */}
          <div
            className="px-5 pt-5 pb-4 flex items-start gap-3.5"
            style={{ borderBottom: "1px solid rgba(139,92,246,0.12)" }}
          >
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <img
                src={TWH_AVATAR}
                alt="TWH"
                className="w-12 h-12 rounded-full object-cover"
                style={{
                  border: "2.5px solid #8B5CF6",
                  boxShadow: "0 0 0 2px rgba(139,92,246,0.18)",
                }}
              />
              {/* verified dot */}
              <span
                className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full flex items-center justify-center"
                style={{ background: "#7C3AED", border: "2px solid white", fontSize: "8px" }}
              >
                ✓
              </span>
            </div>

            {/* Name + badges */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className="font-black text-[15px]"
                  style={{ color: "#1e1e2e" }}
                >
                  Afsar
                </span>
                {/* Verified badge */}
                <span
                  className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-black tracking-wider uppercase"
                  style={{ background: "rgba(124,58,237,0.1)", border: "1px solid rgba(124,58,237,0.35)", color: "#7C3AED" }}
                >
                  ✦ Verified
                </span>
                {/* Official badge */}
                <span
                  className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-black tracking-wider uppercase"
                  style={{ background: "rgba(220,38,38,0.08)", border: "1px solid rgba(220,38,38,0.3)", color: "#dc2626" }}
                >
                  Official
                </span>
              </div>
              <p className="text-[11px] mt-0.5" style={{ color: "#9CA3AF" }}>
                @afsar · Founder, TWH OSINT · July 2026
              </p>
            </div>

            {/* Lang toggle — top right */}
            <button
              onClick={() => setLang(l => l === "hi" ? "en" : "hi")}
              className="flex-shrink-0 text-[10px] font-bold px-3 py-1.5 rounded-full transition-all"
              style={{
                background: lang === "hi" ? "rgba(124,58,237,0.1)" : "rgba(37,99,235,0.1)",
                border: lang === "hi" ? "1px solid rgba(124,58,237,0.35)" : "1px solid rgba(37,99,235,0.35)",
                color: lang === "hi" ? "#7C3AED" : "#2563EB",
                cursor: "pointer",
              }}
            >
              {lang === "hi" ? "🌐 English" : "🇮🇳 Hinglish"}
            </button>
          </div>

          {/* ── Description block above message ── */}
          <div
            className="mx-5 mt-5 mb-0 rounded-2xl px-5 py-4"
            style={{
              background: "rgba(124,58,237,0.06)",
              border: "1px solid rgba(124,58,237,0.15)",
            }}
          >
            <p
              className="text-[11px] font-black tracking-widest uppercase mb-3"
              style={{ color: "#7C3AED" }}
            >
              📌 Kya Ho Raha Hai? — Poori Baat
            </p>
            <div className="space-y-2 text-[12.5px] leading-[1.85]" style={{ color: "#374151" }}>
              <p>
                <strong style={{ color: "#1e1e2e" }}>TWH OSINT</strong> ek free OSINT (Open Source Intelligence) tool tha jo <strong>Technical White Hat (TWH)</strong> team ne 2024 mein banaya tha. Iska kaam tha — mobile numbers, emails, vehicles aur IPs ke baare mein publicly available data dhundhna, taaki log online scammers, blackmailers aur digital threats se apni safety kar sakein.
              </p>
              <p>
                Yeh tool bilkul <strong>free</strong> tha — kisi se koi paisa nahi liya gaya. Aur isme <strong style={{ color: "#c026d3" }}>1,00,000+ successful queries</strong> process ki gayi.
              </p>
              <p>
                <strong style={{ color: "#dc2626" }}>Kyun band ho raha hai?</strong> — Do wajahaat hain:
              </p>
              <ol className="list-decimal list-inside space-y-1 pl-1" style={{ color: "#374151" }}>
                <li><strong>Funds khatam ho gaye</strong> — is tool ko chalane ke liye jo resources chahiye the, woh ab available nahi hain.</li>
                <li><strong>Misuse zyada hua</strong> — kai logo ne is tool ko galat tarike se use kiya — jin logo ke liye yeh bana hi nahi tha, unhone isko stalking, harassment aur privacy violation ke liye use kiya. Bahut saari complaints aur formal cyber cases bhi aaye.</li>
              </ol>
              <p>
                Isliye, <strong>Right to Privacy</strong> aur responsible tech ke naam par — TWH team ne faisla liya ki is tool ko band karna sahi hai. <strong style={{ color: "#7C3AED" }}>TWH company band nahi ho rahi</strong> — sirf yeh ek tool, <em>TWH OSINT</em>, officially discontinue ho raha hai.
              </p>
              <p>
                Neeche founder <strong>Afsar (Technical White Hat)</strong> ka official statement hai — Hinglish aur English dono mein.
              </p>
            </div>
          </div>

          {/* ── Message body ── */}
          <div className="px-5 py-5">
            <AnimatePresence mode="wait">
              <motion.div
                key={lang}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2 }}
              >
                {lang === "hi" ? HINGLISH : ENGLISH}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* ── Like row ── */}
          <div
            className="px-5 py-3 flex items-center gap-4"
            style={{ borderTop: "1px solid rgba(139,92,246,0.1)" }}
          >
            <button
              onClick={handleLike}
              className="flex items-center gap-2 px-4 py-1.5 rounded-full font-bold text-[13px] transition-all active:scale-95"
              style={{
                background: liked ? "rgba(124,58,237,0.12)" : "rgba(0,0,0,0.04)",
                border: liked ? "1px solid rgba(124,58,237,0.4)" : "1px solid rgba(0,0,0,0.1)",
                color: liked ? "#7C3AED" : "#6B7280",
                cursor: "pointer",
              }}
            >
              <span style={{ fontSize: "16px" }}>{liked ? "💜" : "🤍"}</span>
              <span>{likes}</span>
            </button>
            <span className="text-[11px]" style={{ color: "#9CA3AF" }}>
              {replies.length} {replies.length === 1 ? "reply" : "replies"}
            </span>
          </div>
        </motion.div>

        {/* ══════════════════════════════════════════════════════════════════════
            REPLIES SECTION
        ══════════════════════════════════════════════════════════════════════ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="w-full max-w-2xl"
          style={glassCard}
        >
          <div className="px-5 pt-5 pb-3" style={{ borderBottom: "1px solid rgba(139,92,246,0.1)" }}>
            <span className="text-[12px] font-bold" style={{ color: "#374151" }}>
              💬 {replies.length} {replies.length === 1 ? "Reply" : "Replies"}
            </span>
          </div>

          {/* Write reply */}
          <div className="px-5 py-4" style={{ borderBottom: "1px solid rgba(139,92,246,0.08)" }}>
            <div className="flex gap-3">
              {/* Avatar placeholder */}
              <div
                className="w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center font-bold text-white text-[13px]"
                style={{ background: replyName ? colorFor(replyName) : "#D1D5DB" }}
              >
                {replyName ? initials(replyName) : "?"}
              </div>
              <div className="flex-1 flex flex-col gap-2">
                <input
                  className="w-full rounded-xl px-3 py-2 text-[13px] outline-none transition-all"
                  style={{
                    background: "rgba(255,255,255,0.7)",
                    border: "1px solid rgba(139,92,246,0.2)",
                    color: "#1e1e2e",
                  }}
                  placeholder="Apna naam likho..."
                  value={replyName}
                  maxLength={40}
                  onChange={e => setReplyName(e.target.value)}
                />
                <textarea
                  className="w-full rounded-xl px-3 py-2 text-[13px] outline-none resize-none transition-all"
                  style={{
                    background: "rgba(255,255,255,0.7)",
                    border: "1px solid rgba(139,92,246,0.2)",
                    color: "#1e1e2e",
                    minHeight: "70px",
                  }}
                  placeholder="Apna message likho... (max 500 characters)"
                  value={replyText}
                  maxLength={500}
                  onChange={e => setReplyText(e.target.value)}
                />
                {replyErr && <p className="text-[11px] text-red-500">{replyErr}</p>}
                <div className="flex items-center justify-between">
                  <span className="text-[10px]" style={{ color: "#9CA3AF" }}>{replyText.length}/500</span>
                  <button
                    onClick={handleReply}
                    disabled={posting || !replyName.trim() || !replyText.trim()}
                    className="px-4 py-1.5 rounded-full text-[12px] font-bold text-white transition-all active:scale-95"
                    style={{
                      background: posting || !replyName.trim() || !replyText.trim()
                        ? "#D1D5DB"
                        : "linear-gradient(135deg, #7C3AED, #6D28D9)",
                      cursor: posting || !replyName.trim() || !replyText.trim() ? "not-allowed" : "pointer",
                    }}
                  >
                    {posting ? "Posting..." : "Reply Karo"}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Reply list */}
          <div className="px-5 py-2">
            {replies.length === 0 ? (
              <p className="text-[12px] py-4 text-center" style={{ color: "#9CA3AF" }}>
                Abhi koi reply nahi hai. Pehle reply karo! 👇
              </p>
            ) : (
              <div className="divide-y" style={{ borderColor: "rgba(139,92,246,0.07)" }}>
                {replies.map(r => (
                  <div key={r.id} className="py-3.5 flex gap-3">
                    {/* Avatar */}
                    <div
                      className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center font-bold text-white text-[12px]"
                      style={{ background: colorFor(r.author_name) }}
                    >
                      {initials(r.author_name)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[13px] font-bold" style={{ color: "#1e1e2e" }}>{r.author_name}</span>
                        <span className="text-[10px]" style={{ color: "#9CA3AF" }}>{timeAgo(r.created_at)}</span>
                      </div>
                      <p className="text-[13px] mt-0.5" style={{ color: "#374151", lineHeight: 1.7, wordBreak: "break-word" }}>
                        {r.content}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div ref={repliesEndRef} />
          </div>
        </motion.div>

        {/* ══════════════════════════════════════════════════════════════════════
            TWH OSINT's GOODBYE COMMENT
        ══════════════════════════════════════════════════════════════════════ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="w-full max-w-2xl"
          style={{
            ...glassCard,
            background: "rgba(240,232,255,0.75)",
            border: "1.5px solid rgba(124,58,237,0.25)",
          }}
        >
          {/* Header */}
          <div
            className="px-5 pt-5 pb-4 flex items-start gap-3.5"
            style={{ borderBottom: "1px solid rgba(139,92,246,0.14)" }}
          >
            {/* TWH OSINT logo avatar */}
            <div className="relative flex-shrink-0">
              <div
                className="w-12 h-12 rounded-full overflow-hidden flex items-center justify-center"
                style={{
                  border: "2.5px solid #7C3AED",
                  background: "rgba(124,58,237,0.12)",
                  boxShadow: "0 0 16px rgba(124,58,237,0.3)",
                }}
              >
                <img src="/twh-osint-logo.png" alt="TWH OSINT" className="w-10 h-10 object-contain" />
              </div>
              <span
                className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full flex items-center justify-center"
                style={{ background: "#7C3AED", border: "2px solid white", fontSize: "8px" }}
              >
                ✓
              </span>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className="font-black text-[15px]"
                  style={{
                    background: "linear-gradient(90deg, #7C3AED, #a855f7)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  TWH OSINT
                </span>
                <span
                  className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-black tracking-wider uppercase"
                  style={{ background: "rgba(124,58,237,0.1)", border: "1px solid rgba(124,58,237,0.35)", color: "#7C3AED" }}
                >
                  ✦ Verified
                </span>
                <span
                  className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-black tracking-wider uppercase"
                  style={{ background: "rgba(124,58,237,0.1)", border: "1px solid rgba(124,58,237,0.3)", color: "#7C3AED" }}
                >
                  Platform
                </span>
              </div>
              <p className="text-[11px] mt-0.5" style={{ color: "#9CA3AF" }}>
                @twh_osint · Official Platform Account · Final Message
              </p>
            </div>

            {/* Goodbye lang toggle */}
            <button
              onClick={() => setGoodbyeLang(l => l === "hi" ? "en" : "hi")}
              className="flex-shrink-0 text-[10px] font-bold px-3 py-1.5 rounded-full transition-all"
              style={{
                background: goodbyeLang === "hi" ? "rgba(124,58,237,0.1)" : "rgba(37,99,235,0.1)",
                border: goodbyeLang === "hi" ? "1px solid rgba(124,58,237,0.35)" : "1px solid rgba(37,99,235,0.35)",
                color: goodbyeLang === "hi" ? "#7C3AED" : "#2563EB",
                cursor: "pointer",
              }}
            >
              {goodbyeLang === "hi" ? "🌐 English" : "🇮🇳 Hinglish"}
            </button>
          </div>

          {/* Goodbye body */}
          <div className="px-5 py-5">
            <AnimatePresence mode="wait">
              <motion.div
                key={goodbyeLang}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2 }}
              >
                {goodbyeLang === "hi" ? GOODBYE_HI : GOODBYE_EN}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Footer line */}
          <div
            className="px-5 py-3 flex items-center justify-between"
            style={{ borderTop: "1px solid rgba(139,92,246,0.12)" }}
          >
            <span className="text-[10px]" style={{ color: "#9CA3AF" }}>TWH OSINT · Est. 2024 – 2026</span>
            <span
              className="flex items-center gap-1.5 text-[10px] font-semibold"
              style={{ color: "#7C3AED" }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-red-400" style={{ boxShadow: "0 0 4px rgba(239,68,68,0.7)" }} />
              Discontinued
            </span>
          </div>
        </motion.div>

        {/* bottom note */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-[11px] text-center max-w-xs"
          style={{ color: "rgba(255,255,255,0.2)", lineHeight: "1.8" }}
        >
          For official queries — reach out via Telegram.<br />
          Thank you for being part of this journey. 🙏
        </motion.p>

      </main>
    </div>
  );
}
