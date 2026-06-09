import { Navbar } from "@/components/Navbar";
import { Link } from "wouter";
import { FileText, AlertTriangle, Scale, Shield, Ban, Info } from "lucide-react";
import { motion } from "framer-motion";

const SECTIONS = [
  {
    icon: Info,
    title: "1. About TWH OSINT",
    content: [
      "TWH OSINT is an open-source intelligence platform operated by Technical White Hat (TWH), owned by Afsar Ali.",
      "This platform provides data lookup services for mobile numbers, Aadhar cards, vehicle registrations, and IP addresses using publicly available data sources.",
      "By accessing or using TWH OSINT, you confirm that you are at least 18 years old and agree to be bound by these Terms & Conditions.",
      "Contact: mrwhitehath@gmail.com | Telegram: t.me/technicalwhitehat",
    ],
  },
  {
    icon: FileText,
    title: "2. Acceptance of Terms",
    content: [
      "By accessing and using this website, you accept and agree to be bound by these Terms & Conditions and our Privacy Policy.",
      "If you do not agree with any part of these terms, please discontinue use of the platform immediately.",
      "These terms are governed by the laws of India, specifically the Information Technology Act, 2000 and its amendments.",
      "We reserve the right to update or modify these terms at any time. Continued use of the platform constitutes acceptance of revised terms.",
    ],
  },
  {
    icon: Scale,
    title: "3. Permitted Use & Legal Authorization",
    content: [
      "TWH OSINT is strictly for educational, research, and lawful investigative purposes only.",
      "You must have legal authorization or a legitimate purpose before querying any individual's personal data on this platform.",
      "You may not use this platform to stalk, harass, defame, or harm any individual or organization.",
      "You may not use lookup results for unauthorized commercial purposes, debt collection, or targeted advertising without explicit consent of the data subject.",
      "Users bear full legal responsibility for how they use the information obtained from this platform.",
    ],
  },
  {
    icon: AlertTriangle,
    title: "4. Intended Use — Anti-Scam & Anti-Harassment Platform",
    content: [
      "TWH OSINT is specifically built to help victims of scams, fraud, online harassment, and cyberstalking identify and gather information about the people troubling them.",
      "This platform may be used to investigate mobile numbers, vehicle details, or IP addresses of individuals who have scammed you, threatened you, sent abusive messages, or harassed you in any form.",
      "If you use this tool to harass, stalk, blackmail, or harm any innocent person — you are solely responsible under the Indian Penal Code (IPC) and the Information Technology Act, 2000.",
      "TWH (Technical White Hat), its owner Afsar Ali, and associated team members bear absolutely NO legal or moral responsibility for any misuse of this platform.",
      "By continuing to use TWH OSINT, you explicitly declare that your use is defensive — i.e., to protect yourself from those harming you — and you accept complete personal legal liability for your actions.",
    ],
  },
  {
    icon: Ban,
    title: "5. Prohibited Activities — What You Must NOT Do",
    content: [
      "Automated scraping, bulk querying, or bot-based access to the platform is strictly prohibited.",
      "Attempting to reverse-engineer, hack, or breach the security of our platform will result in immediate account termination and legal action.",
      "Creating multiple accounts to circumvent any usage restrictions is prohibited.",
      "Using the platform to look up information on minors is strictly prohibited.",
      "Re-selling or commercializing data obtained from TWH OSINT without our written permission is prohibited.",
      "Any activity that violates Indian laws including the IT Act 2000, IPC, or any other applicable statute is prohibited.",
    ],
  },
  {
    icon: AlertTriangle,
    title: "6. Disclaimer of Liability",
    content: [
      "TWH OSINT provides information 'as is' from publicly available data sources. We make no guarantees about the accuracy, completeness, or timeliness of the data.",
      "We are not responsible for any decisions made based on the information obtained through our platform.",
      "TWH OSINT is not liable for any direct, indirect, incidental, or consequential damages arising from use or inability to use the service.",
      "We are not responsible for the accuracy of data returned by third-party API providers.",
      "Service availability depends on upstream API providers. We aim for 99.9% uptime but do not guarantee uninterrupted service.",
    ],
  },
  {
    icon: Shield,
    title: "7. Intellectual Property",
    content: [
      "The TWH OSINT platform, its design, code, and branding are the intellectual property of Technical White Hat.",
      "You may not copy, reproduce, or redistribute our platform's UI, code, or brand assets without written permission.",
      "Data results returned by the platform are sourced from public databases and are not owned by TWH OSINT.",
    ],
  },
  {
    icon: FileText,
    title: "8. Account Termination",
    content: [
      "We reserve the right to suspend or terminate any account that violates these terms without prior notice.",
      "Users may request account deletion by emailing mrwhitehath@gmail.com.",
      "Upon termination, all query history associated with the account will be permanently deleted within 7 days.",
    ],
  },
  {
    icon: Scale,
    title: "9. Governing Law & Dispute Resolution",
    content: [
      "These Terms & Conditions are governed by the laws of India.",
      "Any disputes arising from the use of this platform shall be subject to the exclusive jurisdiction of the courts in India.",
      "For informal dispute resolution, please contact us first at mrwhitehath@gmail.com — most issues can be resolved without legal action.",
    ],
  },
];

export default function TermsOfService() {
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
                <FileText className="w-3.5 h-3.5" />
                Legal Document
              </div>
              <span className="text-[11px] text-white/30">Last updated: June 2026</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-3">Terms &amp; Conditions</h1>
            <p className="text-white/45 text-sm leading-relaxed">
              Please read these Terms &amp; Conditions carefully before using TWH OSINT. These terms govern your use of our platform and outline the rights and responsibilities of both users and TWH (Technical White Hat).
            </p>
            {/* Warning banner */}
            <div
              className="flex items-start gap-3 mt-5 p-4 rounded-xl"
              style={{
                background: "rgba(251,146,60,0.07)",
                border: "1px solid rgba(251,146,60,0.2)",
              }}
            >
              <AlertTriangle className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" style={{ width: "16px", height: "16px" }} />
              <p className="text-xs text-white/50 leading-relaxed">
                <strong className="text-orange-300">Important:</strong> This tool is for educational and research purposes only. Misuse for stalking, harassment, or unauthorized data collection is illegal under the Indian IT Act and IPC. Users are solely responsible for their actions.
              </p>
            </div>
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

          <div
            className="p-4 rounded-2xl text-center"
            style={{
              background: "rgba(139,92,246,0.05)",
              border: "1px solid rgba(139,92,246,0.15)",
            }}
          >
            <p className="text-[11px] text-white/30 leading-relaxed">
              For questions about these terms, contact us at{" "}
              <a href="mailto:mrwhitehath@gmail.com" className="text-violet-400 hover:underline">mrwhitehath@gmail.com</a>
              {" "}or join our Telegram{" "}
              <a href="https://t.me/technicalwhitehat" target="_blank" rel="noopener noreferrer" className="text-violet-400 hover:underline">t.me/technicalwhitehat</a>
            </p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/[0.06] py-6" style={{ background: "#09051A" }}>
        <div className="container px-4 text-center">
          <p className="text-[11px] text-white/25">&copy; 2026 TWH OSINT · Technical White Hat · All rights reserved.</p>
          <div className="flex justify-center gap-4 mt-2">
            <Link href="/privacy" className="text-[11px] text-white/30 hover:text-violet-400 transition-colors">Privacy Policy</Link>
            <Link href="/about" className="text-[11px] text-white/30 hover:text-violet-400 transition-colors">About Us</Link>
            <Link href="/contact" className="text-[11px] text-white/30 hover:text-violet-400 transition-colors">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
