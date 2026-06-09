import { Navbar } from "@/components/Navbar";
import { Link } from "wouter";
import { Shield, Lock, Eye, Database, Bell, Mail, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";

const SECTIONS = [
  {
    icon: Eye,
    title: "1. Information We Collect",
    content: [
      "Account information: When you register, we collect your email address and display name (via Firebase Authentication).",
      "Usage data: We log the type of queries made (mobile, Aadhar, vehicle, IP) along with timestamps for audit purposes. We do not store the actual query input after 7 days.",
      "Device data: Standard web server logs including IP address, browser type, and referring URL for security and analytics purposes.",
      "We do NOT collect sensitive personal data like Aadhaar numbers, financial information, or location data beyond what your browser provides.",
    ],
  },
  {
    icon: Database,
    title: "2. How We Use Your Data",
    content: [
      "To provide and operate the TWH OSINT intelligence platform.",
      "To authenticate your account securely via Firebase Authentication.",
      "To maintain query history so you can review your past searches.",
      "To improve platform performance and detect abuse or unauthorized access.",
      "To display Google AdSense advertisements on our website. Google may use cookies to serve ads based on your prior visits to this or other websites. You can opt out via Google's Ad Settings.",
      "We do NOT sell, rent, or trade your personal information to any third party.",
    ],
  },
  {
    icon: Bell,
    title: "3. Google AdSense & Third-Party Advertising",
    content: [
      "TWH OSINT uses Google AdSense to display advertisements. Google AdSense uses cookies to serve ads based on a user's prior visits to our website or other websites on the internet.",
      "Google's use of advertising cookies enables it and its partners to serve ads based on visits to this site and/or other sites on the Internet.",
      "Users may opt out of personalized advertising by visiting Google's Ads Settings at https://www.google.com/settings/ads.",
      "Third-party vendors, including Google, use cookies to serve ads based on a user's prior visits to our website. These cookies do not contain personally identifiable information.",
      "We comply with Google AdSense content policies and serve only family-safe content.",
    ],
  },
  {
    icon: Lock,
    title: "4. Cookies",
    content: [
      "We use essential cookies to maintain your login session and platform preferences.",
      "Google AdSense and analytics services may set their own cookies for advertising and measurement. These are governed by Google's Privacy Policy.",
      "You can control cookies through your browser settings. Disabling cookies may affect platform functionality.",
    ],
  },
  {
    icon: Shield,
    title: "5. Data Security",
    content: [
      "All data is transmitted over HTTPS with TLS encryption.",
      "Passwords are never stored — authentication is handled entirely by Firebase Auth (Google's secure infrastructure).",
      "Database access is restricted to server-side only, with no direct public access.",
      "Query logs are automatically deleted after 7 days.",
    ],
  },
  {
    icon: AlertTriangle,
    title: "6. Intended Use — Anti-Scam & Anti-Harassment Only",
    content: [
      "TWH OSINT is specifically designed to help victims identify scammers, fraudsters, and people who harass or threaten them online or offline.",
      "This platform may be used to look up information about individuals who have scammed you, sent threatening messages, or engaged in harassment, cyberstalking, or fraud.",
      "If you misuse this platform — for stalking, unauthorized surveillance, blackmail, targeted harassment, or any activity that violates Indian law — you alone are legally responsible for your actions.",
      "TWH (Technical White Hat) and its owner Afsar Ali bear NO liability for any misuse. By using this platform, you explicitly accept full legal responsibility for your actions.",
      "This disclaimer is in accordance with the Information Technology Act, 2000 and the Indian Penal Code.",
    ],
  },
  {
    icon: Eye,
    title: "7. Your Rights (India — IT Act 2000)",
    content: [
      "Under the Information Technology Act, 2000 and the IT (Amendment) Act, 2008, you have rights over your personal data.",
      "You may request deletion of your account and associated data by emailing mrwhitehath@gmail.com.",
      "You may request a copy of the data we hold about you.",
      "You may opt out of non-essential cookies and advertising at any time.",
    ],
  },
  {
    icon: Mail,
    title: "8. Contact & Grievance Officer",
    content: [
      "Organization: Technical White Hat (TWH)",
      "Owner: Afsar Ali",
      "Email: mrwhitehath@gmail.com",
      "Telegram: t.me/technicalwhitehat",
      "For any privacy-related concerns, complaints, or data deletion requests, please contact us via email. We will respond within 30 days.",
    ],
  },
];

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#050314" }}>
      <Navbar />

      <main className="flex-1 pb-24 lg:pb-0">

        {/* Hero */}
        <section className="relative container px-4 pt-12 md:pt-16 pb-8">
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[200px] pointer-events-none -z-10"
            style={{ background: "radial-gradient(ellipse at top, rgba(139,92,246,0.12) 0%, transparent 70%)" }}
          />
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="max-w-3xl mx-auto"
          >
            <div className="flex items-center gap-2 mb-4">
              <div
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold"
                style={{
                  background: "linear-gradient(135deg, rgba(139,92,246,0.2), rgba(168,85,247,0.1))",
                  border: "1px solid rgba(139,92,246,0.35)",
                  color: "#C084FC",
                }}
              >
                <Shield className="w-3.5 h-3.5" />
                Legal Document
              </div>
              <span className="text-[11px] text-white/30">Last updated: June 2026</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-3">Privacy Policy</h1>
            <p className="text-white/45 text-sm leading-relaxed">
              This Privacy Policy explains how <strong className="text-white/70">TWH OSINT</strong> (operated by Technical White Hat, owned by Afsar Ali) collects, uses, and protects your personal information when you use our platform. By using this website, you agree to this policy.
            </p>
          </motion.div>
        </section>

        {/* Sections */}
        <section className="container px-4 pb-14 max-w-3xl mx-auto space-y-4">
          {SECTIONS.map(({ icon: Icon, title, content }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05, duration: 0.35 }}
              className="p-5 rounded-2xl"
              style={{
                background: "rgba(255,255,255,0.025)",
                border: "1px solid rgba(255,255,255,0.07)",
              }}
            >
              <div className="flex items-center gap-3 mb-3">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: "rgba(139,92,246,0.15)", border: "1px solid rgba(139,92,246,0.25)" }}
                >
                  <Icon className="w-4 h-4 text-violet-400" style={{ width: "16px", height: "16px" }} />
                </div>
                <h2 className="text-sm font-bold text-white">{title}</h2>
              </div>
              <ul className="space-y-2">
                {content.map((line, j) => (
                  <li key={j} className="flex gap-2 text-xs text-white/45 leading-relaxed">
                    <span className="mt-1.5 w-1 h-1 rounded-full bg-violet-500/50 shrink-0" />
                    {line}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}

          {/* Compliance note */}
          <div
            className="p-4 rounded-2xl text-center"
            style={{
              background: "rgba(139,92,246,0.05)",
              border: "1px solid rgba(139,92,246,0.15)",
            }}
          >
            <p className="text-[11px] text-white/30 leading-relaxed">
              This policy is compliant with the <strong className="text-white/40">Information Technology Act, 2000</strong> (India) and aligns with <strong className="text-white/40">Google AdSense program policies</strong>. For questions, contact us at{" "}
              <a href="mailto:mrwhitehath@gmail.com" className="text-violet-400 hover:underline">mrwhitehath@gmail.com</a>.
            </p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/[0.06] py-6" style={{ background: "#09051A" }}>
        <div className="container px-4 text-center">
          <p className="text-[11px] text-white/25">&copy; 2026 TWH OSINT · Technical White Hat · All rights reserved.</p>
          <div className="flex justify-center gap-4 mt-2">
            <Link href="/terms" className="text-[11px] text-white/30 hover:text-violet-400 transition-colors">Terms & Conditions</Link>
            <Link href="/about" className="text-[11px] text-white/30 hover:text-violet-400 transition-colors">About Us</Link>
            <Link href="/contact" className="text-[11px] text-white/30 hover:text-violet-400 transition-colors">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
