import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Navbar } from "@/components/Navbar";
import { TerminalOutput } from "@/components/TerminalOutput";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion, AnimatePresence } from "framer-motion";
import { History, Search, Smartphone, Car, Globe, ShieldCheck, Filter, ChevronDown, ChevronUp, Database, CheckCircle2, XCircle } from "lucide-react";
import { useLocation } from "wouter";

const SERVICE_FILTERS = [
  { key: "all", label: "All", icon: Database },
  { key: "mobile", label: "Mobile", icon: Smartphone },
  { key: "aadhar", label: "Aadhar", icon: ShieldCheck },
  { key: "vehicle", label: "Vehicle", icon: Car },
  { key: "ip", label: "IP Trace", icon: Globe },
];

const DATE_FILTERS = [
  { key: "all", label: "All Time" },
  { key: "today", label: "Today" },
  { key: "week", label: "This Week" },
  { key: "month", label: "This Month" },
];

const STATUS_FILTERS = [
  { key: "all", label: "All" },
  { key: "success", label: "Success" },
  { key: "error", label: "Error" },
];

export default function HistoryPage() {
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [serviceFilter, setServiceFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());

  const { data: history = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/user/history"],
    enabled: isAuthenticated,
  });

  const filtered = useMemo(() => {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    return history.filter((log: any) => {
      if (serviceFilter !== "all" && log.service !== serviceFilter) return false;
      if (search && !log.query?.toLowerCase().includes(search.toLowerCase())) return false;
      if (statusFilter !== "all" && log.status?.toLowerCase() !== statusFilter) return false;
      if (dateFilter !== "all") {
        const logDate = new Date(log.createdAt);
        if (dateFilter === "today" && logDate < startOfDay) return false;
        if (dateFilter === "week" && logDate < startOfWeek) return false;
        if (dateFilter === "month" && logDate < startOfMonth) return false;
      }
      return true;
    });
  }, [history, serviceFilter, dateFilter, statusFilter, search]);

  const toggleExpanded = (id: number) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const getServiceIcon = (service: string) => {
    const icons: Record<string, React.ElementType> = { mobile: Smartphone, aadhar: ShieldCheck, vehicle: Car, ip: Globe };
    const Icon = icons[service] || Database;
    return <Icon className="w-3 h-3" />;
  };

  const getServiceColor = (service: string) => {
    const colors: Record<string, string> = {
      mobile: "text-violet-300 border-violet-500/30 bg-violet-500/10",
      aadhar: "text-cyan-300 border-cyan-500/30 bg-cyan-500/10",
      vehicle: "text-orange-300 border-orange-500/30 bg-orange-500/10",
      ip: "text-blue-300 border-blue-500/30 bg-blue-500/10",
    };
    return colors[service] || "text-violet-300 border-violet-500/30 bg-violet-500/10";
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center mx-auto">
              <History className="w-7 h-7 text-violet-400/40" />
            </div>
            <p className="text-white/40 text-sm font-medium">Authentication required</p>
            <button onClick={() => setLocation("/")} className="text-xs text-violet-400 hover:text-violet-300 underline transition-colors">
              Return to home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-6 max-w-5xl">
        {/* Header */}
        <div className="mb-7">
          <div className="flex items-center gap-3 mb-1.5">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-violet-500/10 border border-violet-500/20">
              <History className="w-4.5 h-4.5 text-violet-400" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-white">Search History</h1>
              <p className="text-white/40 text-xs mt-0.5">Full archive of all executed intelligence queries</p>
            </div>
          </div>
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { label: "Total Queries", value: history.length },
            { label: "Today", value: history.filter((l: any) => new Date(l.createdAt) >= new Date(new Date().setHours(0,0,0,0))).length },
            { label: "Filtered", value: filtered.length },
          ].map(stat => (
            <div key={stat.label} className="rounded-xl border border-white/[0.07] bg-white/[0.03] px-4 py-3">
              <div className="text-[10px] text-white/30 font-medium mb-1">{stat.label}</div>
              <div className="text-xl md:text-2xl font-bold text-white">{stat.value}</div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="space-y-3 mb-5 p-4 rounded-xl border border-white/[0.06] bg-white/[0.02]">
          {/* Service filter */}
          <div className="flex items-center gap-2 flex-wrap">
            <Filter className="w-3.5 h-3.5 text-white/20 shrink-0" />
            {SERVICE_FILTERS.map(f => {
              const Icon = f.icon;
              return (
                <button
                  key={f.key}
                  onClick={() => setServiceFilter(f.key)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${
                    serviceFilter === f.key
                      ? "border-violet-500/60 bg-violet-500/15 text-violet-300"
                      : "border-white/10 text-white/40 hover:border-white/20 hover:text-white/60"
                  }`}
                >
                  <Icon className="w-3 h-3" />
                  {f.label}
                </button>
              );
            })}
          </div>

          <div className="flex gap-2 items-center flex-wrap">
            {STATUS_FILTERS.map(f => (
              <button
                key={f.key}
                onClick={() => setStatusFilter(f.key)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${
                  statusFilter === f.key
                    ? f.key === "error"
                      ? "border-red-500/50 bg-red-500/10 text-red-400"
                      : f.key === "success"
                      ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-400"
                      : "border-violet-500/60 bg-violet-500/15 text-violet-300"
                    : "border-white/10 text-white/40 hover:border-white/20"
                }`}
              >
                {f.label}
              </button>
            ))}
            <div className="h-5 w-px bg-white/10" />
            {DATE_FILTERS.map(f => (
              <button
                key={f.key}
                onClick={() => setDateFilter(f.key)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${
                  dateFilter === f.key
                    ? "border-violet-500/60 bg-violet-500/15 text-violet-300"
                    : "border-white/10 text-white/40 hover:border-white/20"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/20" />
            <Input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search queries..."
              className="bg-white/[0.04] border-white/[0.08] text-white placeholder:text-white/25 text-sm h-9 pl-9 rounded-lg focus:border-violet-500/50"
            />
          </div>
        </div>

        {/* Results */}
        {isLoading ? (
          <div className="space-y-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="rounded-xl border border-white/[0.06] bg-white/[0.02] h-14 animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-white/20">
            <div className="w-14 h-14 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mb-4">
              <History className="w-7 h-7" />
            </div>
            <p className="text-sm font-medium text-white/30">No records found</p>
            <p className="text-xs mt-1 text-white/20">Adjust your filters or execute a query</p>
          </div>
        ) : (
          <div className="space-y-2">
            <AnimatePresence>
              {filtered.map((log: any) => {
                const isExpanded = expandedIds.has(log.id);
                return (
                  <motion.div
                    key={log.id}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="rounded-xl border border-white/[0.07] bg-white/[0.02] hover:border-violet-500/25 hover:bg-white/[0.03] transition-all overflow-hidden"
                  >
                    <div
                      className="flex items-center gap-3 p-3 cursor-pointer select-none"
                      onClick={() => log.result && toggleExpanded(log.id)}
                    >
                      <span className={`flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-lg border font-medium shrink-0 ${getServiceColor(log.service)}`}>
                        {getServiceIcon(log.service)}
                        <span className="capitalize">{log.service}</span>
                      </span>

                      <div className="flex-1 min-w-0">
                        <p className="text-white/80 text-sm font-medium truncate">{log.query}</p>
                        <p className="text-white/30 text-xs mt-0.5">{new Date(log.createdAt).toLocaleString()}</p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {log.status?.toUpperCase() === "SUCCESS" ? (
                          <span className="flex items-center gap-1 text-xs text-emerald-400 font-medium">
                            <CheckCircle2 className="w-3.5 h-3.5" /> OK
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-xs text-red-400 font-medium">
                            <XCircle className="w-3.5 h-3.5" /> Error
                          </span>
                        )}
                        {log.result && (
                          <span className="text-white/25">
                            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                          </span>
                        )}
                      </div>
                    </div>

                    <AnimatePresence>
                      {isExpanded && log.result && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden border-t border-white/[0.05]"
                        >
                          <TerminalOutput
                            data={log.result}
                            title={`${log.service} — ${log.query}`}
                            className="border-0 rounded-none"
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </main>
    </div>
  );
}
