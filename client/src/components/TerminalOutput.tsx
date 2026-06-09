import * as React from "react";
import { cn } from "@/lib/utils";
import {
  Globe, Copy, Download, Check, Loader2,
  User, Phone, MapPin, CreditCard,
  Building2, Clock, Hash, Mail, UserCheck,
  ShieldCheck, ExternalLink, Smartphone,
  Server, Wifi, FileText, Activity,
  Signal, XCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface TerminalOutputProps {
  data: any;
  title?: string;
  className?: string;
  isLoading?: boolean;
}

const SCAN_LINES = [
  "Initializing secure connection...",
  "Establishing encrypted tunnel...",
  "Routing through proxy nodes...",
  "Decrypting data packets...",
  "Cross-referencing database...",
  "Compiling intelligence report...",
];

function ScanningAnimation() {
  const [visibleLines, setVisibleLines] = React.useState(0);
  const [dots, setDots] = React.useState("");

  React.useEffect(() => {
    const lineTimer = setInterval(() => {
      setVisibleLines(v => Math.min(v + 1, SCAN_LINES.length));
    }, 380);
    const dotTimer = setInterval(() => {
      setDots(d => d.length >= 3 ? "" : d + ".");
    }, 400);
    return () => { clearInterval(lineTimer); clearInterval(dotTimer); };
  }, []);

  return (
    <div className="py-8 px-2 space-y-2.5">
      {SCAN_LINES.slice(0, visibleLines).map((line, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.2 }}
          className={cn("text-xs flex items-center gap-2.5", i === visibleLines - 1 ? "text-violet-300" : "text-violet-500/40")}
        >
          <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", i < visibleLines - 1 ? "bg-emerald-400" : "bg-violet-400 animate-pulse")} />
          <span>{line}</span>
          {i === visibleLines - 1 && <span className="text-violet-400 font-bold">{dots}</span>}
        </motion.div>
      ))}
      {visibleLines === SCAN_LINES.length && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 0] }}
          transition={{ duration: 0.8, repeat: Infinity }}
          className="text-xs text-violet-400/60 mt-2 flex items-center gap-2"
        >
          <Loader2 className="w-3 h-3 animate-spin" />
          Awaiting response...
        </motion.div>
      )}
    </div>
  );
}

function FieldRow({
  icon: Icon,
  label,
  value,
  valueClass,
  link,
  linkLabel,
  mono,
}: {
  icon: React.ComponentType<any>;
  label: string;
  value?: string | React.ReactNode;
  valueClass?: string;
  link?: string;
  linkLabel?: string;
  mono?: boolean;
}) {
  if (!value && value !== 0) return null;
  return (
    <div className="flex items-start gap-3 py-2.5 px-3 rounded-xl hover:bg-white/[0.03] transition-colors">
      <div
        className="w-7 h-7 rounded-[8px] flex items-center justify-center shrink-0 mt-0.5"
        style={{ background: "rgba(139,92,246,0.12)", border: "1px solid rgba(139,92,246,0.18)" }}
      >
        <Icon className="w-3.5 h-3.5 text-violet-400" style={{ width: "14px", height: "14px" }} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[10px] font-semibold uppercase tracking-wider mb-0.5" style={{ color: "rgba(255,255,255,0.3)" }}>
          {label}
        </div>
        <div className={cn("text-[13px] leading-snug break-words", mono ? "font-mono" : "font-medium", valueClass ?? "text-white/85")}>
          {value}
        </div>
        {link && (
          <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-[11px] text-violet-400 hover:text-violet-300 mt-1 transition-colors"
          >
            {linkLabel ?? "View on map"} <ExternalLink className="w-2.5 h-2.5" />
          </a>
        )}
      </div>
    </div>
  );
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        background: "rgba(255,255,255,0.025)",
        border: "1px solid rgba(139,92,246,0.12)",
      }}
    >
      <div
        className="px-4 py-2 text-[10px] font-bold uppercase tracking-[0.12em]"
        style={{
          borderBottom: "1px solid rgba(255,255,255,0.05)",
          background: "rgba(139,92,246,0.07)",
          color: "rgba(255,255,255,0.45)",
        }}
      >
        {title}
      </div>
      <div className="p-2 grid grid-cols-1 md:grid-cols-2">{children}</div>
    </div>
  );
}

function MobileRecord({ item, index }: { item: any; index: number }) {
  const address = item.address?.replace(/!/g, " ");
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      className="rounded-2xl overflow-hidden"
      style={{
        background: "rgba(255,255,255,0.02)",
        border: "1px solid rgba(139,92,246,0.14)",
        boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
      }}
    >
      <div
        className="flex items-center justify-between px-4 py-2.5"
        style={{
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          background: "linear-gradient(135deg, rgba(139,92,246,0.1), rgba(109,40,217,0.05))",
        }}
      >
        <span
          className="text-[11px] font-bold tracking-wider px-2.5 py-1 rounded-full"
          style={{ background: "rgba(139,92,246,0.2)", border: "1px solid rgba(139,92,246,0.3)", color: "#C084FC" }}
        >
          Record #{index + 1}
        </span>
        {item.id && (
          <span className="text-[9px] font-mono" style={{ color: "rgba(255,255,255,0.2)" }}>
            {String(item.id).slice(0, 14)}…
          </span>
        )}
      </div>

      <div className="p-2">
        <div className="grid grid-cols-1 md:grid-cols-2">
          <FieldRow icon={User} label="Name" value={item.name} valueClass="text-white font-semibold" />
          <FieldRow
            icon={MapPin}
            label="Address"
            value={address}
            link={address ? `https://www.google.com/maps?q=${encodeURIComponent(address)}` : undefined}
            linkLabel="View on map"
          />
          <FieldRow icon={UserCheck} label="Father" value={item.father_name} />
          <FieldRow icon={Globe} label="Location" value={item.circle ? `Delhi, India` : undefined} />
          <FieldRow icon={Phone} label="Mobile" value={item.mobile} valueClass="text-violet-300 font-semibold" mono />
          <FieldRow icon={Signal} label="Operator" value={item.circle?.replace(/&amp;/g, "&")?.replace(/\s*([A-Z]+)\s*$/, "") } />
          <FieldRow icon={Phone} label="Alternate" value={item.alt_mobile} mono />
          <FieldRow icon={Clock} label="Last Updated" value="2 minutes ago" />
          <FieldRow icon={CreditCard} label="Aadhar" value={item.id_number} mono />
          <FieldRow icon={Hash} label="Record ID" value={item.id} mono valueClass="text-white/50 text-[11px]" />
          {item.email && <FieldRow icon={Mail} label="Email" value={item.email} />}
        </div>
      </div>
    </motion.div>
  );
}

function IpResult({ data }: { data: any }) {
  const lat = data.lat ?? data.latitude;
  const lon = data.lon ?? data.longitude;
  const mapLink = lat && lon ? `https://www.google.com/maps?q=${lat},${lon}` : undefined;

  return (
    <div className="space-y-3">
      <SectionCard title="Location">
        <FieldRow icon={Building2} label="City" value={[data.city, data.regionName].filter(Boolean).join(", ")} />
        <FieldRow icon={Globe} label="Country" value={data.country} link={mapLink} linkLabel="View on map" />
        <FieldRow icon={MapPin} label="ZIP Code" value={data.zip} />
        <FieldRow icon={Clock} label="Timezone" value={data.timezone} />
      </SectionCard>

      <SectionCard title="Network">
        <FieldRow icon={Wifi} label="ISP" value={data.isp} />
        <FieldRow icon={Building2} label="Organization" value={data.org} />
        <FieldRow icon={Activity} label="ASN" value={data.as} />
        <FieldRow icon={Server} label="Reverse DNS" value={data.reverse} />
        <FieldRow
          icon={ShieldCheck}
          label="Proxy / VPN"
          value={data.proxy ? "Detected" : "Not detected"}
          valueClass={data.proxy ? "text-red-400 font-semibold" : "text-emerald-400 font-semibold"}
        />
        <FieldRow
          icon={Smartphone}
          label="Mobile Network"
          value={data.mobile ? "Yes" : "No"}
          valueClass={data.mobile ? "text-amber-400" : "text-white/60"}
        />
      </SectionCard>

      <SectionCard title="Identifiers">
        <FieldRow icon={Hash} label="IP Address" value={data.query} valueClass="text-violet-300 font-semibold" mono />
        <FieldRow icon={CreditCard} label="Currency" value={data.currency} />
        <FieldRow icon={Globe} label="Continent" value={data.continent ? `${data.continent} (${data.continentCode})` : undefined} />
      </SectionCard>
    </div>
  );
}

function GenericResult({ data }: { data: any }) {
  const skip = new Set([
    "credit", "API DEVELOPER", "api_developer", "query", "success", "status_code", "usage",
    "developer_info", "developer", "message", "highlight", "first_match",
    "query_value", "query_type", "total_results", "results", "result",
  ]);
  const entries = Object.entries(data).filter(([k]) => !skip.has(k));

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(139,92,246,0.12)" }}
    >
      <div className="p-2 space-y-0.5">
        {entries.map(([key, value]) => (
          <div key={key} className="flex items-start gap-3 py-2 px-3 rounded-xl hover:bg-white/[0.03] transition-colors">
            <span
              className="w-1.5 h-1.5 rounded-full bg-violet-500/40 mt-2 shrink-0"
            />
            <div className="flex-1 min-w-0">
              <span className="text-[10px] text-white/30 uppercase tracking-wider">
                {key.replace(/_/g, " ")}:{" "}
              </span>
              <span className="text-[13px] text-white/75 break-words">
                {typeof value === "object" ? JSON.stringify(value) : String(value ?? "N/A")}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function normalizeData(raw: any): any {
  if (!raw) return raw;
  // Already normalized (server did it for new queries)
  if (raw?.query?.type) return raw;
  // Old workers.dev format stored in DB: {query_type, results: [...], ...}
  if (raw?.query_type === "aadhaar" || raw?.query_type === "email") {
    const items: any[] = Array.isArray(raw.results) ? raw.results : [];
    return {
      query: { type: raw.query_type === "aadhaar" ? "aadhar_lookup" : "email_lookup", value: raw.query_value },
      result: items.map((item: any) => ({
        name: item.name || null,
        mobile: item.mobile || null,
        alt_mobile: item.alt || item.alt_mobile || null,
        circle: item.circle || null,
        father_name: item.fname || item.father_name || null,
        id_number: item.id || null,
        address: item.address || null,
        email: item.email || null,
      })),
      total_results: raw.total_results ?? items.length,
    };
  }
  return raw;
}

export function TerminalOutput({ data, title = "Results", className, isLoading }: TerminalOutputProps) {
  const [copied, setCopied] = React.useState(false);
  const [copiedAll, setCopiedAll] = React.useState(false);
  data = normalizeData(data);

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(data, null, 2)).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleCopyAll = () => {
    navigator.clipboard.writeText(JSON.stringify(data, null, 2)).then(() => {
      setCopiedAll(true);
      setTimeout(() => setCopiedAll(false), 2000);
    });
  };

  const handleDownload = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `osint_${title.toLowerCase().replace(/\s+/g, "_")}_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const isMobileResult =
    data?.query?.type === "mobile_lookup" ||
    data?.query?.type === "email_lookup" ||
    data?.query?.type === "aadhar_lookup" ||
    data?.source?.type === "mobile";
  const isIpResult =
    !isMobileResult && (data?.country || data?.countryCode || data?.isp);

  return (
    <div
      className={cn("rounded-2xl overflow-hidden", className)}
      style={{
        background: "rgba(255,255,255,0.02)",
        border: "1px solid rgba(255,255,255,0.07)",
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
      >
        <div className="flex items-center gap-2.5">
          <div
            className="w-7 h-7 rounded-[8px] flex items-center justify-center"
            style={{ background: "rgba(139,92,246,0.15)", border: "1px solid rgba(139,92,246,0.25)" }}
          >
            <FileText className="w-3.5 h-3.5 text-violet-400" style={{ width: "14px", height: "14px" }} />
          </div>
          <span className="text-sm font-semibold text-white/85">{title}</span>
          {isLoading && (
            <motion.span
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="text-[10px] text-violet-400/70 font-medium"
            >
              Scanning...
            </motion.span>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          {data && !isLoading && (
            <>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 text-[11px] px-2.5 py-1.5 rounded-[8px] transition-all"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  color: "rgba(255,255,255,0.5)",
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = "rgba(139,92,246,0.4)";
                  e.currentTarget.style.color = "rgba(192,132,252,0.9)";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
                  e.currentTarget.style.color = "rgba(255,255,255,0.5)";
                }}
                data-testid="button-copy-result"
              >
                {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                <span className="hidden md:inline">{copied ? "Copied" : "Copy"}</span>
              </button>
              <button
                onClick={handleDownload}
                className="flex items-center gap-1.5 text-[11px] px-2.5 py-1.5 rounded-[8px] transition-all"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  color: "rgba(255,255,255,0.5)",
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = "rgba(139,92,246,0.4)";
                  e.currentTarget.style.color = "rgba(192,132,252,0.9)";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
                  e.currentTarget.style.color = "rgba(255,255,255,0.5)";
                }}
                data-testid="button-download-result"
              >
                <Download className="w-3 h-3" />
                <span className="hidden md:inline">JSON</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="p-3 md:p-4">
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <ScanningAnimation />
            </motion.div>
          ) : data ? (
            <motion.div key="data" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">

              {/* Success / Not-found banner */}
              {isMobileResult && Array.isArray(data.result) && data.result.length === 0 ? (
                <div
                  className="flex items-center gap-3 px-4 py-3 rounded-xl"
                  style={{
                    background: "linear-gradient(135deg, rgba(239,68,68,0.08), rgba(220,38,38,0.04))",
                    border: "1px solid rgba(239,68,68,0.22)",
                  }}
                >
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.25)" }}
                  >
                    <XCircle className="w-4 h-4 text-red-400" style={{ width: "16px", height: "16px" }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-semibold text-red-300">Record Not Found</div>
                    <div className="text-[11px] mt-0.5" style={{ color: "rgba(252,165,165,0.5)" }}>
                      No data available for this query
                    </div>
                  </div>
                </div>
              ) : (
                <div
                  className="flex items-center gap-3 px-4 py-3 rounded-xl"
                  style={{
                    background: "linear-gradient(135deg, rgba(16,185,129,0.08), rgba(5,150,105,0.04))",
                    border: "1px solid rgba(16,185,129,0.18)",
                  }}
                >
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: "rgba(16,185,129,0.15)", border: "1px solid rgba(16,185,129,0.22)" }}
                  >
                    <ShieldCheck className="w-4 h-4 text-emerald-400" style={{ width: "16px", height: "16px" }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-semibold text-emerald-300">Data retrieved successfully</div>
                    <div className="text-[11px] mt-0.5" style={{ color: "rgba(52,211,153,0.5)" }}>
                      Information found and verified
                    </div>
                  </div>
                  {data?.query?.type === "mobile_lookup" && (
                    <div
                      className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold"
                      style={data._api_source === "Backup"
                        ? { background: "rgba(234,179,8,0.15)", border: "1px solid rgba(234,179,8,0.4)", color: "#FDE047" }
                        : { background: "rgba(139,92,246,0.18)", border: "1px solid rgba(139,92,246,0.4)", color: "#C084FC" }
                      }
                    >
                      <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: data._api_source === "Backup" ? "#FDE047" : "#C084FC" }} />
                      {data._api_source === "Backup" ? "Backup API" : "Primary API"}
                    </div>
                  )}
                  {(data?.query?.type === "email_lookup" || data?.query?.type === "aadhar_lookup") && data?.total_results > 0 && (
                    <div
                      className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold"
                      style={{ background: "rgba(139,92,246,0.18)", border: "1px solid rgba(139,92,246,0.4)", color: "#C084FC" }}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-violet-400 shrink-0" />
                      {data.total_results} Record{data.total_results !== 1 ? "s" : ""}
                    </div>
                  )}
                </div>
              )}

              {/* Result content */}
              {isMobileResult && Array.isArray(data.result) && data.result.length === 0 ? null
              : isMobileResult ? (
                <div className="space-y-3">
                  {(data.result as any[]).map((item: any, i: number) => (
                    <MobileRecord key={i} item={item} index={i} />
                  ))}
                </div>
              ) : isIpResult ? (
                <IpResult data={data} />
              ) : (
                <GenericResult data={data} />
              )}

              {/* Bottom action buttons */}
              <div className="flex gap-2 pt-1">
                <button
                  onClick={handleCopyAll}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[12px] font-medium transition-all"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    color: "rgba(255,255,255,0.5)",
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = "rgba(139,92,246,0.08)";
                    e.currentTarget.style.borderColor = "rgba(139,92,246,0.25)";
                    e.currentTarget.style.color = "rgba(192,132,252,0.85)";
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                    e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
                    e.currentTarget.style.color = "rgba(255,255,255,0.5)";
                  }}
                  data-testid="button-copy-all-data"
                >
                  {copiedAll ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedAll ? "Copied!" : "Copy All Data"}
                </button>
                <button
                  onClick={handleDownload}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[12px] font-medium transition-all"
                  style={{
                    background: "linear-gradient(135deg, rgba(139,92,246,0.18), rgba(168,85,247,0.1))",
                    border: "1px solid rgba(139,92,246,0.28)",
                    color: "#C084FC",
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.boxShadow = "0 0 20px -4px rgba(139,92,246,0.3)";
                    e.currentTarget.style.borderColor = "rgba(139,92,246,0.45)";
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.boxShadow = "none";
                    e.currentTarget.style.borderColor = "rgba(139,92,246,0.28)";
                  }}
                  data-testid="button-download-report"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download Report
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-12 gap-3"
            >
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center"
                style={{
                  background: "rgba(139,92,246,0.07)",
                  border: "1px solid rgba(139,92,246,0.14)",
                }}
              >
                <Globe className="w-6 h-6 text-violet-400/35" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-white/30">Awaiting query</p>
                <p className="text-xs text-white/18 mt-1">Enter data above to begin analysis</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
