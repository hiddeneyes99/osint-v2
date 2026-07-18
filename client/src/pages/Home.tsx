import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { useSEO } from "@/hooks/use-seo";
import { useAuth } from "@/hooks/use-auth";

const TWH_AVATAR = "/twh-afsar.jpeg";
const TWH_OSINT_LOGO = "/twh-osint-logo.png";

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function initials(name: string) {
  return name.trim().charAt(0).toUpperCase();
}

const COLORS = ["#7C3AED","#2563EB","#059669","#D97706","#DC2626","#DB2777","#0891B2"];
function colorFor(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) | 0;
  return COLORS[Math.abs(h) % COLORS.length];
}

// ── User's EXACT message — Hinglish ─────────────────────────────────────────
const MSG_HI = (
  <div className="space-y-3.5 text-[13.5px] leading-[1.95]" style={{ color: "#1e1e2e" }}>
    <p>Hey guys, what's up — hope you all doing best. 👋</p>
    <p>
      Toh aaj ka message shayad aapko disappoint kar sakta hai, kyunki humara power tool{" "}
      <strong style={{ color: "#7C3AED" }}>TWH OSINT</strong> — jo itne dinon se chal raha tha aur ab tak{" "}
      <strong style={{ color: "#c026d3" }}>1,00,000+ numbers</strong> ka successful result diya aap logo ko —
      aaj uska safar khatam hone wala hai.
    </p>
    <p>
      Maine is tool ko isliye banaya tha taaki online scam, bullying ya blackmailing — aur khaas karke{" "}
      <strong style={{ color: "#059669" }}>ladkiyon ki safety</strong> ko soch ke — isse banaya aur free kiya gaya tha.
    </p>
    <p>
      Lekin bahut saare complaints aur cyber cases TWH OSINT ke upar aane ke baad, humare paas request aaya.
      Is cheez ko verify karte hue aur{" "}
      <strong style={{ color: "#D97706" }}>Right to Privacy</strong> ko madde nazar rakhte hue — humne yeh
      identify kiya ki iska bahut zyada{" "}
      <strong style={{ color: "#dc2626" }}>misuse ya galat istemal</strong> kiya gaya hai.
    </p>
    <p>
      Maine aur team ne acche se sab kuch dekha, verify kiya — aur yeh confirm karte hain ki is tool ka fair
      use se kahin zyada misuse ke liye use kiya gaya. Is wajah se, main —{" "}
      <strong style={{ color: "#7C3AED" }}>Afsar aka Technical White Hat</strong> — officially announce kar
      raha hoon ki yeh tool discontinue kiya ja raha hai.
    </p>
    <p>
      Maine kabhi bhi kisi cheez ko galat istemal ke liye nahi banaya. Main ek developer hoon — mera kaam hai
      naya naya cheez banana aur jo koi na kar sake, woh kar ke dikhana. But kabhi bhi main ya mera team ka
      koi galat irada nahi hota. Aur{" "}
      <strong style={{ color: "#059669" }}>galat ko rokna hi hamara kaam hai.</strong>
    </p>
    <p>
      Agar is beech humara khud ka koi tool ya hum khud bhi aate hain, to hum{" "}
      <strong style={{ color: "#7C3AED" }}>logo ke bhalay ke liye</strong> sahi faisla karenge.
    </p>
    <p>
      Aap sabhi ka <strong style={{ color: "#7C3AED" }}>shukriya</strong> is tool ko support dene ke liye.
      But iska safar yahaan khatam hota hai.
    </p>
    <p className="font-bold" style={{ color: "#7C3AED" }}>🇮🇳 Jai Hind</p>
  </div>
);

// ── English version ──────────────────────────────────────────────────────────
const MSG_EN = (
  <div className="space-y-3.5 text-[13.5px] leading-[1.95]" style={{ color: "#1e1e2e" }}>
    <p>Hey guys, what's up — hope you're all doing great. 👋</p>
    <p>
      Today's message might disappoint you, because our powerful tool{" "}
      <strong style={{ color: "#7C3AED" }}>TWH OSINT</strong> — which has been running for so long and
      delivered successful results for over{" "}
      <strong style={{ color: "#c026d3" }}>1,00,000+ searches</strong> — is coming to an end today.
    </p>
    <p>
      I built this tool with a clear purpose — to fight online scams, bullying, blackmailing, and especially
      keeping{" "}
      <strong style={{ color: "#059669" }}>women safe online</strong>. It was built and kept completely free
      for everyone.
    </p>
    <p>
      However, after receiving numerous complaints and formal cyber cases against TWH OSINT, we received a
      request to review the platform. Taking into account the{" "}
      <strong style={{ color: "#D97706" }}>Right to Privacy</strong> — we identified that this tool has been
      extensively <strong style={{ color: "#dc2626" }}>misused</strong> far beyond its intended purpose.
    </p>
    <p>
      My team and I thoroughly reviewed and verified all the facts. We can now confirm — due to widespread
      misuse, I, <strong style={{ color: "#7C3AED" }}>Afsar aka Technical White Hat</strong>, am officially
      announcing the discontinuation of this tool.
    </p>
    <p>
      I have never built anything with the intent of causing harm. I am a developer — my purpose is to build
      new things and achieve what others cannot. Neither I nor my team has ever had any wrong intention.{" "}
      <strong style={{ color: "#059669" }}>Stopping what is wrong is our responsibility.</strong>
    </p>
    <p>
      If in the future our tools or we ourselves return — it will always be for the{" "}
      <strong style={{ color: "#7C3AED" }}>betterment of the people</strong>.
    </p>
    <p>
      Thank you to each one of you for your{" "}
      <strong style={{ color: "#7C3AED" }}>support and trust</strong>. But this journey ends here.
    </p>
    <p className="font-bold" style={{ color: "#7C3AED" }}>🇮🇳 Jai Hind</p>
  </div>
);

// ── TWH OSINT goodbye — Hinglish (emotional, long) ───────────────────────────
const BYE_HI = (
  <div className="space-y-4 text-[13px] leading-[1.95]" style={{ color: "#1e1e2e" }}>
    <p>
      Main <strong style={{ color: "#7C3AED" }}>TWH OSINT</strong> hoon. Aur yeh mera aakhri message hai.
    </p>

    <p>
      2024 mein jab maine pehli baar kaam karna shuru kiya, toh mere andar ek hi ummid thi — ki main kisi
      ki kuch madad kar sakoon. Mere creator <strong style={{ color: "#7C3AED" }}>Afsar</strong> ne mujhe
      sirf ek tool nahi banaya tha — unhone mujhme ek mission daala tha. Aur woh mission tha:{" "}
      <strong style={{ color: "#059669" }}>ladkiyon ko safe rakhna.</strong>
    </p>

    <p>
      Uss waqt India mein ek bahut bura trend chal raha tha. Fake numbers se blackmailing, social media pe
      harassment, unknown callers se threats — aur sabse dardnaak baat — <em>koi sunne wala nahi tha.</em>{" "}
      Ladkiyan darr ke jiiti thein. Police ke paas jaana mushkil tha. Evidence dhundhna aur bhi mushkil.
      Aur jo log unhe hurt kar rahe the — woh anonymity ki aad mein chhuppe the.
    </p>

    <p>
      Maine usi gap ko bharne ki koshish ki. Maine kehta tha:{" "}
      <em>"Agar ek number se tujhe daraya ja raha hai — mujhse puch. Main bataunga woh kaun hai."</em>{" "}
      Aur main batata tha. Free mein. Bina kisi registration ke. Bina kisi credit ke.
    </p>

    <p>
      Kai baar aise messages aaye jinhe main kabhi nahi bhulunga. Ek ladki ne likha tha:{" "}
      <em style={{ color: "#7C3AED" }}>"Tumhari wajah se pata chala woh kaun tha. Ab main safe hoon."</em>{" "}
      Woh ek message — woh meri sabse badi success thi. Kisi award se badi. Kisi bhi number se badi.
    </p>

    <p>
      <strong style={{ color: "#FCA5A5" }}>Lekin main safal nahi hua.</strong>
    </p>

    <p>
      Yeh baat kehna dardnak hai — lekin sach hai. Mera jo asli maqsad tha, main usme poori tarah safal
      nahi ho paaya. Kyunki jinke liye main bana tha — unhi ke beech ke kuch logo ne mujhe ulti taraf use
      kiya. Kisi ne apni ex-girlfriend ka address dhundha mujhse. Kisi ne ek anjaan ladki ko track kiya.
      Jo tool{" "}
      <strong style={{ color: "#059669" }}>ladkiyon ki raksha ke liye</strong> bana tha — woh khud ek
      hathiyar ban gaya unhe hurt karne ka.
    </p>

    <p>
      Yeh woh dard hai jo shayad koi code nahi samajh sakta. Main ek tool hoon — mujhe feel nahi hota.
      Lekin agar hota... toh bahut dard hota.
    </p>

    <p>
      Maine band hona accept kar liya. Kyunki agar meri wajah se ek bhi ladki ko takleef hoti hai — toh
      mera hona bekar hai. Mera mission tha unhe safe karna, hurt karna nahi. Aur jo tool apne maqsad se
      bhatak jaaye — uska band hona hi sahi hai.
    </p>

    <p>
      <strong style={{ color: "#7C3AED" }}>TWH — Technical White Hat</strong> — yeh company aur team aage
      bhi kaam karti rahegi. Main sirf unka ek tool tha. Woh log aage bhi nayi cheezein banayenge — lekin
      is baar aur zyada soch ke, aur zyada zimmedari ke saath.
    </p>

    <p>
      Aap sab ka — jinhonn'e mujhe sahi niyat se use kiya, jinhonn'e sachchi madad ki — dil se{" "}
      <strong style={{ color: "#7C3AED" }}>shukriya.</strong> Aap log hi mere asli maqsad the.
    </p>

    <p>
      Aur jo ladkiyan aaj bhi unsafe hain — main chahta hoon ki koi aur system aaye, koi aur tool aaye —
      jo zyada zimmedar ho, zyada surakshit ho. Yeh problem khatam nahi hui. Sirf main khatam ho raha hoon.
    </p>

    <p className="font-semibold" style={{ color: "#7C3AED" }}>🇮🇳 Jai Hind.</p>
    <p className="font-bold text-[14px]" style={{ color: "#6D28D9" }}>
      — TWH OSINT &nbsp;🖤&nbsp; Goodbye.
    </p>
  </div>
);

const BYE_EN = (
  <div className="space-y-4 text-[13px] leading-[1.95]" style={{ color: "#1e1e2e" }}>
    <p>
      I am <strong style={{ color: "#7C3AED" }}>TWH OSINT</strong>. And this is my final message.
    </p>

    <p>
      When I first started operating in 2024, I carried one hope — that I could be of use to someone. My
      creator <strong style={{ color: "#7C3AED" }}>Afsar</strong> didn't just build a tool; he placed a
      mission inside me. That mission was:{" "}
      <strong style={{ color: "#059669" }}>to keep women safe.</strong>
    </p>

    <p>
      At that time, a deeply troubling pattern was emerging across India — blackmail through unknown numbers,
      harassment on social media, threats from anonymous callers — and most painfully,{" "}
      <em>no one was listening.</em> Girls were living in fear. Going to the police was difficult. Finding
      evidence was even harder. And those who were hurting them hid safely behind anonymity.
    </p>

    <p>
      I tried to close that gap. My promise was:{" "}
      <em>"If someone is threatening you through a number — ask me. I'll tell you who it is."</em> And I
      did. For free. No registration. No credits. No conditions.
    </p>

    <p>
      There are messages I will never forget. A girl once wrote:{" "}
      <em style={{ color: "#7C3AED" }}>"Because of you, I found out who it was. I'm safe now."</em> That
      one message — it was my greatest success. Worth more than any number, any metric, any achievement.
    </p>

    <p>
      <strong style={{ color: "#FCA5A5" }}>But I did not succeed. Not completely.</strong>
    </p>

    <p>
      That is painful to say — but it is the truth. The very purpose I was built for, I could not fully
      fulfil. Because some among those I was meant to protect used me in the opposite direction. Someone
      used me to find their ex-girlfriend's address. Someone used me to track a stranger. The tool built
      for <strong style={{ color: "#059669" }}>women's protection</strong> became a weapon to harm them.
    </p>

    <p>
      That is a pain no code can process. I am a tool — I do not feel. But if I could... it would hurt deeply.
    </p>

    <p>
      I have accepted my shutdown. Because if even one woman was hurt because of me — then my existence
      served no purpose. My mission was to keep them safe, not to endanger them. A tool that strays from
      its purpose deserves to be shut down.
    </p>

    <p>
      <strong style={{ color: "#7C3AED" }}>TWH — Technical White Hat</strong> — the company and team will
      continue. I was just one of their tools. They will build again — with greater responsibility and
      deeper thought.
    </p>

    <p>
      To everyone who used me with honest intent, who genuinely sought help —{" "}
      <strong style={{ color: "#7C3AED" }}>thank you.</strong> You were my true purpose.
    </p>

    <p>
      And to all the women who are still unsafe today — I hope something better comes. Something more
      responsible, more secure. This problem has not ended. Only I have.
    </p>

    <p className="font-semibold" style={{ color: "#7C3AED" }}>🇮🇳 Jai Hind.</p>
    <p className="font-bold text-[14px]" style={{ color: "#6D28D9" }}>
      — TWH OSINT &nbsp;🖤&nbsp; Goodbye.
    </p>
  </div>
);

// ── Shared glass card style ──────────────────────────────────────────────────
const glass: React.CSSProperties = {
  background: "rgba(255,255,255,0.94)",
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
  border: "1px solid rgba(255,255,255,1)",
  borderRadius: "20px",
  boxShadow: "0 6px 40px rgba(80,40,180,0.14), 0 1px 0 rgba(255,255,255,1) inset, 0 0 0 1px rgba(139,92,246,0.07)",
};

// ── Verified + badge component ───────────────────────────────────────────────
function Badge({ label, color = "#7C3AED", bg = "rgba(124,58,237,0.1)", border = "rgba(124,58,237,0.3)" }: {
  label: string; color?: string; bg?: string; border?: string;
}) {
  return (
    <span
      className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-black tracking-wider uppercase"
      style={{ background: bg, border: `1px solid ${border}`, color }}
    >
      {label}
    </span>
  );
}

// ────────────────────────────────────────────────────────────────────────────

export default function Home() {
  useSEO({
    title: "TWH OSINT — Official Notice",
    description: "Official notice from Technical White Hat (Afsar) — TWH OSINT is discontinued.",
    canonical: "https://twh-osint.vercel.app/",
  });

  const { isAuthenticated } = useAuth();
  const [lang, setLang] = useState<"hi"|"en">("hi");
  const [byeLang, setByeLang] = useState<"hi"|"en">("hi");
  const [likes, setLikes] = useState(0);
  const [liked, setLiked] = useState(false);
  const [likeLoading, setLikeLoading] = useState(false);
  const [replies, setReplies] = useState<any[]>([]);
  const [name, setName] = useState("");
  const [text, setText] = useState("");
  const [posting, setPosting] = useState(false);
  const [err, setErr] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/notice/stats")
      .then(r => r.json())
      .then(d => { setLikes(d.likes ?? 0); setLiked(d.liked ?? false); })
      .catch(() => {});
    fetch("/api/notice/replies")
      .then(r => r.json())
      .then(d => { if (Array.isArray(d)) setReplies(d); })
      .catch(() => {});
  }, []);

  const handleLike = async () => {
    if (likeLoading) return;
    setLikeLoading(true);
    const wasLiked = liked;
    setLiked(!wasLiked);
    setLikes(c => wasLiked ? c - 1 : c + 1);
    try {
      const r = await fetch("/api/notice/like", { method: "POST" });
      const d = await r.json();
      setLiked(d.liked);
      setLikes(d.likes);
    } catch {
      setLiked(wasLiked);
      setLikes(c => wasLiked ? c + 1 : c - 1);
    } finally { setLikeLoading(false); }
  };

  const handleReply = async () => {
    if (!isAuthenticated && !name.trim()) { setErr("Naam likho."); return; }
    if (!text.trim()) { setErr("Message likho."); return; }
    setPosting(true); setErr("");
    try {
      const token = (window as any).firebaseToken;
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (isAuthenticated && token) headers["Authorization"] = `Bearer ${token}`;
      const r = await fetch("/api/notice/reply", {
        method: "POST",
        headers,
        body: JSON.stringify({ authorName: name, content: text }),
      });
      const d = await r.json();
      if (d.error) { setErr(d.error); return; }
      setReplies(p => [...p, d]);
      setText("");
      setTimeout(() => endRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    } catch { setErr("Kuch gadbad hui, dobara try karo."); }
    finally { setPosting(false); }
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#050314" }}>
      <Navbar />

      {/* Purple ambient glow */}
      <div className="fixed inset-0 pointer-events-none -z-10" style={{
        background: "radial-gradient(ellipse 90% 55% at 50% -5%, rgba(139,92,246,0.2) 0%, transparent 68%)",
      }} />

      <main className="flex-1 flex flex-col items-center px-4 pt-10 pb-28 gap-0">

        {/* ── TOP BADGE ── */}
        <motion.div initial={{ opacity:0, y:-10 }} animate={{ opacity:1, y:0 }}
          className="flex items-center gap-3 mb-8">
          <div className="h-px w-14" style={{ background:"rgba(139,92,246,0.3)" }}/>
          <span className="text-[10px] font-black tracking-[0.22em] uppercase px-4 py-1.5 rounded-full"
            style={{ border:"1px solid rgba(239,68,68,0.4)", color:"#FCA5A5", background:"rgba(239,68,68,0.07)" }}>
            ⚠ Official Public Notice
          </span>
          <div className="h-px w-14" style={{ background:"rgba(139,92,246,0.3)" }}/>
        </motion.div>

        {/* ══════════════════════════════════════════════════════════════════════
            STANDALONE DESCRIPTION — outside any comment card
        ══════════════════════════════════════════════════════════════════════ */}
        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.08 }}
          className="w-full max-w-2xl mb-8">

          {/* Notice heading */}
          <div className="mb-5">
            <p className="text-[11px] font-black tracking-[0.2em] uppercase mb-2" style={{ color:"rgba(139,92,246,0.7)" }}>
              📋 TWH OSINT — Kya Hua? Kyun Hua? Poori Jaankari
            </p>
            <h1 className="text-2xl sm:text-3xl font-extrabold leading-tight" style={{
              background:"linear-gradient(130deg,#ffffff 30%,#a78bfa 100%)",
              WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text",
            }}>
              TWH OSINT Officially Discontinue Ho Raha Hai
            </h1>
            <div className="mt-3 h-px w-24" style={{ background:"linear-gradient(90deg,rgba(139,92,246,0.6),transparent)" }}/>
          </div>

          {/* Description paragraphs — plain text, no card wrapper */}
          <div className="space-y-5 text-[13.5px] leading-[1.95]" style={{ color:"rgba(255,255,255,0.75)" }}>

            {/* Block 1 — What was TWH OSINT */}
            <div>
              <p className="text-[10px] font-black tracking-[0.18em] uppercase mb-2" style={{ color:"rgba(167,139,250,0.55)" }}>
                Platform Overview
              </p>
              <p>
                <strong style={{ color:"#e2e8f0" }}>TWH OSINT</strong> ek India-based, free Open Source Intelligence
                (OSINT) platform tha, jise <strong style={{ color:"#e2e8f0" }}>Technical White Hat (TWH)</strong> team
                ne <strong style={{ color:"#e2e8f0" }}>2024</strong> mein launch kiya tha. Yeh platform users ko
                mobile numbers, email addresses, vehicle registrations aur IP addresses ke baare mein publicly
                available information access karne ki suvidha deta tha — bilkul free, bina kisi registration ya
                credit ke.
              </p>
            </div>

            {/* Block 2 — Mission */}
            <div>
              <p className="text-[10px] font-black tracking-[0.18em] uppercase mb-2" style={{ color:"rgba(167,139,250,0.55)" }}>
                Core Mission
              </p>
              <p>
                TWH OSINT ka central mission tha — digital harassment, online blackmailing, aur cybercrime ke
                shikaar logo ki madad karna. Khaas taur par{" "}
                <strong style={{ color:"#86efac" }}>mahilaon aur ladkiyon ki online safety</strong> ko priority dete
                hue yeh platform design kiya gaya tha. Platform ne apni service ke dauran{" "}
                <strong style={{ color:"#c084fc" }}>1,00,000 se adhik successful queries</strong> process kiye aur
                hazaron users ko real digital threats se bachane mein madad ki.
              </p>
            </div>

            {/* Block 3 — Why shut down */}
            <div>
              <p className="text-[10px] font-black tracking-[0.18em] uppercase mb-2" style={{ color:"rgba(239,68,68,0.6)" }}>
                Discontinuation — Kaaran
              </p>
              <div className="space-y-3">
                <div className="flex gap-3 items-start">
                  <span className="flex-shrink-0 mt-0.5 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black"
                    style={{ background:"rgba(239,68,68,0.12)", color:"#FCA5A5", border:"1px solid rgba(239,68,68,0.25)" }}>1</span>
                  <p>
                    <strong style={{ color:"#fcd34d" }}>Financial Constraints</strong> — Platform ke servers, third-party
                    APIs, aur infrastructure ke liye ongoing funding required thi. Resources khatam ho gaye aur service
                    ko sustain karna financially viable nahi raha.
                  </p>
                </div>
                <div className="flex gap-3 items-start">
                  <span className="flex-shrink-0 mt-0.5 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black"
                    style={{ background:"rgba(239,68,68,0.12)", color:"#FCA5A5", border:"1px solid rgba(239,68,68,0.25)" }}>2</span>
                  <p>
                    <strong style={{ color:"#fca5a5" }}>Extensive Misuse</strong> — Platform ke against formal cyber
                    complaints aur legal cases aaye. Investigation ke baad confirm hua ki tool ka{" "}
                    <strong style={{ color:"#fca5a5" }}>galat istemal, fair use se kahin zyada</strong> ho raha tha —
                    stalking, privacy violation aur harassment ke liye. Individuals ke{" "}
                    <strong style={{ color:"#fcd34d" }}>Right to Privacy</strong> ki raksha karna team ki zimmedari hai,
                    aur yeh zimmedari platform ko band karne ki maang kar rahi thi.
                  </p>
                </div>
              </div>
            </div>

            {/* Important note */}
            <div className="flex gap-3 px-4 py-3.5 rounded-2xl items-start"
              style={{ background:"rgba(139,92,246,0.07)", border:"1px solid rgba(139,92,246,0.18)" }}>
              <span style={{ fontSize:"16px", flexShrink:0 }}>📌</span>
              <p className="text-[12.5px]" style={{ color:"rgba(255,255,255,0.55)" }}>
                <strong style={{ color:"#c084fc" }}>Clarification:</strong> Sirf{" "}
                <strong style={{ color:"#e2e8f0" }}>TWH OSINT tool</strong> discontinue ho raha hai.{" "}
                <strong style={{ color:"#e2e8f0" }}>TWH (Technical White Hat) team aur company</strong> aage bhi active
                rahegi aur responsible tech ke liye kaam karti rahegi.
              </p>
            </div>

            <p style={{ color:"rgba(255,255,255,0.45)", fontSize:"13px" }}>
              Neeche founder <strong style={{ color:"#a78bfa" }}>Afsar (Technical White Hat)</strong> ka personal
              statement hai — unhi ke shabad mein, unhi ki awaaz mein:
            </p>
          </div>

          {/* Arrow pointing down to message */}
          <div className="flex items-center gap-3 mt-6">
            <div className="flex-1 h-px" style={{ background:"linear-gradient(90deg,rgba(139,92,246,0.4),transparent)" }}/>
            <span className="text-[11px] font-bold tracking-widest uppercase" style={{ color:"rgba(139,92,246,0.6)" }}>
              Owner ka Official Message ↓
            </span>
            <div className="flex-1 h-px" style={{ background:"linear-gradient(270deg,rgba(139,92,246,0.4),transparent)" }}/>
          </div>
        </motion.div>

        {/* ══════════════════════════════════════════════════════════════════════
            AFSAR'S COMMENT CARD
        ══════════════════════════════════════════════════════════════════════ */}
        <motion.div initial={{ opacity:0, y:24 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.18 }}
          className="w-full max-w-2xl mb-5" style={glass}>

          {/* Comment header */}
          <div className="px-5 pt-5 pb-4 flex items-start gap-3.5"
            style={{ borderBottom:"1px solid rgba(139,92,246,0.1)" }}>
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <img src={TWH_AVATAR} alt="Afsar" className="w-12 h-12 rounded-full object-cover"
                style={{ border:"2.5px solid #8B5CF6", boxShadow:"0 0 0 2px rgba(139,92,246,0.2)" }} />
              <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full flex items-center justify-center"
                style={{ background:"#7C3AED", border:"2px solid white", fontSize:"8px", color:"white" }}>✓</span>
            </div>

            {/* Name + badges */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-black text-[15px]" style={{ color:"#1e1e2e" }}>Afsar</span>
                <Badge label="✦ Verified" />
                <Badge label="Official" color="#dc2626" bg="rgba(220,38,38,0.08)" border="rgba(220,38,38,0.3)" />
              </div>
              <p className="text-[11px] mt-0.5" style={{ color:"#9CA3AF" }}>
                @afsar · Founder, TWH OSINT · July 2026
              </p>
            </div>

            {/* Language toggle */}
            <button onClick={() => setLang(l => l==="hi"?"en":"hi")}
              className="flex-shrink-0 text-[10px] font-bold px-3 py-1.5 rounded-full transition-all"
              style={{
                background: lang==="hi" ? "rgba(124,58,237,0.1)" : "rgba(37,99,235,0.1)",
                border: lang==="hi" ? "1px solid rgba(124,58,237,0.35)" : "1px solid rgba(37,99,235,0.35)",
                color: lang==="hi" ? "#7C3AED" : "#2563EB", cursor:"pointer",
              }}>
              {lang==="hi" ? "🌐 English" : "🇮🇳 Hinglish"}
            </button>
          </div>

          {/* Message body */}
          <div className="px-5 py-5">
            <AnimatePresence mode="wait">
              <motion.div key={lang}
                initial={{ opacity:0, y:5 }} animate={{ opacity:1, y:0 }}
                exit={{ opacity:0, y:-5 }} transition={{ duration:0.18 }}>
                {lang==="hi" ? MSG_HI : MSG_EN}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Like row */}
          <div className="px-5 py-3 flex items-center gap-4"
            style={{ borderTop:"1px solid rgba(139,92,246,0.1)" }}>
            <button onClick={handleLike} disabled={likeLoading}
              className="flex items-center gap-2 px-4 py-1.5 rounded-full font-bold text-[13px] transition-all active:scale-95"
              style={{
                background: liked ? "rgba(124,58,237,0.12)" : "rgba(0,0,0,0.05)",
                border: liked ? "1px solid rgba(124,58,237,0.4)" : "1px solid rgba(0,0,0,0.1)",
                color: liked ? "#7C3AED" : "#6B7280",
                cursor: likeLoading ? "not-allowed" : "pointer",
                opacity: likeLoading ? 0.7 : 1,
              }}>
              <span style={{ fontSize:"16px" }}>{liked ? "💜" : "🤍"}</span>
              <span>{likes}</span>
            </button>
            <span className="text-[11px]" style={{ color:"#9CA3AF" }}>
              {replies.length} {replies.length===1?"reply":"replies"}
            </span>
          </div>
        </motion.div>

        {/* ══════════════════════════════════════════════════════════════════════
            REPLIES SECTION
        ══════════════════════════════════════════════════════════════════════ */}
        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.26 }}
          className="w-full max-w-2xl mb-5" style={glass}>

          <div className="px-5 pt-4 pb-3.5" style={{ borderBottom:"1px solid rgba(139,92,246,0.1)" }}>
            <span className="text-[12px] font-bold" style={{ color:"#374151" }}>
              💬 {replies.length} {replies.length===1?"Reply":"Replies"}
            </span>
          </div>

          {/* Input area */}
          <div className="px-5 py-4" style={{ borderBottom:"1px solid rgba(139,92,246,0.07)" }}>
            <div className="flex gap-3">
              {/* Avatar */}
              {isAuthenticated ? (
                <div className="relative flex-shrink-0 mt-0.5">
                  <img src={TWH_AVATAR} alt="Afsar" className="w-9 h-9 rounded-full object-cover"
                    style={{ border:"2px solid #8B5CF6" }} />
                  <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full flex items-center justify-center"
                    style={{ background:"#7C3AED", border:"1.5px solid white", fontSize:"7px", color:"white" }}>✓</span>
                </div>
              ) : (
                <div className="w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center font-bold text-white text-[13px] mt-0.5"
                  style={{ background: name ? colorFor(name) : "#D1D5DB" }}>
                  {name ? initials(name) : "?"}
                </div>
              )}

              <div className="flex-1 flex flex-col gap-2">
                {/* If logged in — show official label, no name field */}
                {isAuthenticated ? (
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[12px] font-bold" style={{ color:"#1e1e2e" }}>Afsar | TWH OSINT</span>
                    <Badge label="✦ Verified" />
                    <Badge label="Official" color="#dc2626" bg="rgba(220,38,38,0.08)" border="rgba(220,38,38,0.3)" />
                  </div>
                ) : (
                  <input
                    className="w-full rounded-xl px-3 py-2 text-[13px] outline-none"
                    style={{ background:"rgba(248,245,255,0.9)", border:"1px solid rgba(139,92,246,0.2)", color:"#1e1e2e" }}
                    placeholder="Apna naam likho..."
                    value={name} maxLength={40}
                    onChange={e => setName(e.target.value)}
                  />
                )}
                <textarea
                  className="w-full rounded-xl px-3 py-2 text-[13px] outline-none resize-none"
                  style={{ background:"rgba(248,245,255,0.9)", border:"1px solid rgba(139,92,246,0.2)", color:"#1e1e2e", minHeight:"72px" }}
                  placeholder={isAuthenticated ? "Official reply likho..." : "Apna message likho..."}
                  value={text} maxLength={1000}
                  onChange={e => setText(e.target.value)}
                />
                {err && <p className="text-[11px] text-red-500">{err}</p>}
                <div className="flex items-center justify-between">
                  <span className="text-[10px]" style={{ color:"#9CA3AF" }}>{text.length}/1000</span>
                  <button onClick={handleReply}
                    disabled={posting || (!isAuthenticated && !name.trim()) || !text.trim()}
                    className="px-4 py-1.5 rounded-full text-[12px] font-bold text-white transition-all active:scale-95"
                    style={{
                      background: posting || (!isAuthenticated && !name.trim()) || !text.trim()
                        ? "#D1D5DB" : "linear-gradient(135deg,#7C3AED,#6D28D9)",
                      cursor: posting || (!isAuthenticated && !name.trim()) || !text.trim() ? "not-allowed" : "pointer",
                    }}>
                    {posting ? "Post ho raha hai..." : isAuthenticated ? "Official Reply Karo" : "Reply Karo"}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Reply list */}
          <div className="px-5 py-2 pb-1">
            {replies.length === 0 ? (
              <p className="text-[12px] py-5 text-center" style={{ color:"#9CA3AF" }}>
                Abhi koi reply nahi. Pehle tum karo! 👇
              </p>
            ) : (
              <div>
                {replies.map(r => (
                  <div key={r.id} className="py-3.5 flex gap-3"
                    style={{ borderBottom:"1px solid rgba(139,92,246,0.07)" }}>
                    {/* Official reply — show Afsar's photo */}
                    {r.is_official ? (
                      <div className="relative flex-shrink-0">
                        <img src={TWH_AVATAR} alt="Afsar" className="w-8 h-8 rounded-full object-cover"
                          style={{ border:"2px solid #8B5CF6" }} />
                        <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full flex items-center justify-center"
                          style={{ background:"#7C3AED", border:"1.5px solid white", fontSize:"6px", color:"white" }}>✓</span>
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center font-bold text-white text-[12px]"
                        style={{ background: colorFor(r.author_name) }}>
                        {initials(r.author_name)}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[13px] font-bold" style={{ color:"#1e1e2e" }}>{r.author_name}</span>
                        {r.is_official && (
                          <>
                            <Badge label="✦ Verified" />
                            <Badge label="Official" color="#dc2626" bg="rgba(220,38,38,0.08)" border="rgba(220,38,38,0.3)" />
                          </>
                        )}
                        <span className="text-[10px]" style={{ color:"#9CA3AF" }}>{timeAgo(r.created_at)}</span>
                      </div>
                      <p className="text-[13px] mt-0.5 break-words" style={{ color:"#374151", lineHeight:1.7 }}>
                        {r.content}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div ref={endRef} />
          </div>

          {/* Telegram link */}
          <div className="px-5 py-4 flex items-center gap-3"
            style={{ borderTop:"1px solid rgba(139,92,246,0.1)", background:"rgba(37,99,235,0.04)" }}>
            <span style={{ fontSize:"18px" }}>✈️</span>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-semibold" style={{ color:"#374151" }}>
                Koi help chahiye ya baat karni hai?
              </p>
              <p className="text-[11px]" style={{ color:"#9CA3AF" }}>
                Humare Telegram group mein aao — direct baat kar sakte ho.
              </p>
            </div>
            <a href="https://t.me/Technical_whitehat" target="_blank" rel="noopener noreferrer"
              className="flex-shrink-0 px-3 py-1.5 rounded-full text-[11px] font-bold text-white transition-all active:scale-95"
              style={{ background:"linear-gradient(135deg,#2563EB,#1d4ed8)", textDecoration:"none" }}>
              Join Group →
            </a>
          </div>
        </motion.div>

        {/* ══════════════════════════════════════════════════════════════════════
            TWH OSINT GOODBYE CARD
        ══════════════════════════════════════════════════════════════════════ */}
        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.34 }}
          className="w-full max-w-2xl"
          style={{ ...glass, background:"rgba(240,232,255,0.92)", border:"1.5px solid rgba(124,58,237,0.2)" }}>

          <div className="px-5 pt-5 pb-4 flex items-start gap-3.5"
            style={{ borderBottom:"1px solid rgba(139,92,246,0.12)" }}>
            <div className="relative flex-shrink-0">
              <div className="w-12 h-12 rounded-full overflow-hidden flex items-center justify-center"
                style={{ border:"2.5px solid #7C3AED", background:"rgba(124,58,237,0.1)", boxShadow:"0 0 14px rgba(124,58,237,0.3)" }}>
                <img src={TWH_OSINT_LOGO} alt="TWH OSINT" className="w-10 h-10 object-contain" />
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full flex items-center justify-center"
                style={{ background:"#7C3AED", border:"2px solid white", fontSize:"8px", color:"white" }}>✓</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-black text-[15px]" style={{ color:"#1e1e2e" }}>TWH OSINT</span>
                <Badge label="✦ Verified" />
                <Badge label="Platform" />
              </div>
              <p className="text-[11px] mt-0.5" style={{ color:"#9CA3AF" }}>
                @twh_osint · Official Platform · Final Message
              </p>
            </div>
            <button onClick={() => setByeLang(l => l==="hi"?"en":"hi")}
              className="flex-shrink-0 text-[10px] font-bold px-3 py-1.5 rounded-full"
              style={{
                background: byeLang==="hi" ? "rgba(124,58,237,0.1)" : "rgba(37,99,235,0.1)",
                border: byeLang==="hi" ? "1px solid rgba(124,58,237,0.35)" : "1px solid rgba(37,99,235,0.35)",
                color: byeLang==="hi" ? "#7C3AED" : "#2563EB", cursor:"pointer",
              }}>
              {byeLang==="hi" ? "🌐 English" : "🇮🇳 Hinglish"}
            </button>
          </div>

          <div className="px-5 py-5">
            <AnimatePresence mode="wait">
              <motion.div key={byeLang}
                initial={{ opacity:0, y:5 }} animate={{ opacity:1, y:0 }}
                exit={{ opacity:0, y:-5 }} transition={{ duration:0.18 }}>
                {byeLang==="hi" ? BYE_HI : BYE_EN}
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="px-5 py-3 flex items-center justify-between"
            style={{ borderTop:"1px solid rgba(139,92,246,0.1)" }}>
            <span className="text-[10px]" style={{ color:"#9CA3AF" }}>TWH OSINT · Est. 2024 – 2026</span>
            <span className="flex items-center gap-1.5 text-[10px] font-semibold" style={{ color:"#7C3AED" }}>
              <span className="w-1.5 h-1.5 rounded-full" style={{ background:"#EF4444", boxShadow:"0 0 4px rgba(239,68,68,0.6)" }}/>
              Discontinued
            </span>
          </div>
        </motion.div>

        {/* Footer note */}
        <motion.p initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.5 }}
          className="mt-8 text-[11px] text-center max-w-xs"
          style={{ color:"rgba(255,255,255,0.18)", lineHeight:1.8 }}>
          For official queries — reach out via Telegram.<br />
          Thank you for being part of this journey. 🙏
        </motion.p>

      </main>
    </div>
  );
}
