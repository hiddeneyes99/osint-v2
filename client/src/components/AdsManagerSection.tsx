import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { MonitorPlay, Plus, Trash2, ToggleLeft, ToggleRight, RefreshCw, Image, Video, Code2, ExternalLink, Clock } from "lucide-react";
import type { Ad } from "@shared/schema";

const AD_TYPES = [
  { value: "IMAGE", label: "Image", icon: <Image className="w-3.5 h-3.5" /> },
  { value: "VIDEO", label: "Video", icon: <Video className="w-3.5 h-3.5" /> },
  { value: "HTML",  label: "HTML",  icon: <Code2 className="w-3.5 h-3.5" /> },
];

const DURATIONS = [10, 15, 20];

const emptyForm = { title: "", type: "IMAGE", mediaUrl: "", htmlContent: "", linkUrl: "", duration: 15 };

export function AdsManagerSection() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const { data: adsData = [], isLoading, refetch } = useQuery<Ad[]>({
    queryKey: ["/api/admin/ads"],
    queryFn: async () => {
      const res = await fetch("/api/admin/ads");
      if (!res.ok) throw new Error("Failed to load ads");
      return res.json();
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof form) => {
      const res = await fetch("/api/admin/ads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, duration: Number(data.duration) }),
      });
      if (!res.ok) throw new Error("Failed to create ad");
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Ad created successfully" });
      setForm(emptyForm);
      setShowForm(false);
      queryClient.invalidateQueries({ queryKey: ["/api/admin/ads"] });
    },
    onError: (e: any) => toast({ variant: "destructive", title: "Error", description: e.message }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/admin/ads/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
    },
    onSuccess: () => { toast({ title: "Ad deleted" }); queryClient.invalidateQueries({ queryKey: ["/api/admin/ads"] }); },
    onError: (e: any) => toast({ variant: "destructive", title: "Error", description: e.message }),
  });

  const toggleMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/admin/ads/${id}/toggle`, { method: "PATCH" });
      if (!res.ok) throw new Error("Failed to toggle");
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/admin/ads"] }),
    onError: (e: any) => toast({ variant: "destructive", title: "Error", description: e.message }),
  });

  const activeCount = adsData.filter(a => a.isActive).length;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <MonitorPlay className="w-5 h-5 text-violet-400" />
            Ads Manager
          </h2>
          <p className="text-xs text-white/30 mt-0.5">
            {adsData.length} total · {activeCount} active — random ad shown before each search
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => refetch()}
            className="p-2 rounded-xl border border-white/10 text-white/40 hover:text-white/70 hover:border-white/20 transition-all"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <Button
            onClick={() => setShowForm(v => !v)}
            className="flex items-center gap-2 text-xs font-bold h-9 px-4"
            style={{ background: showForm ? "rgba(139,92,246,0.15)" : "rgba(139,92,246,0.55)", border: "1px solid rgba(139,92,246,0.4)", color: "#e9d5ff" }}
          >
            <Plus className="w-3.5 h-3.5" /> New Ad
          </Button>
        </div>
      </div>

      {/* Create form */}
      {showForm && (
        <div className="rounded-2xl p-5 space-y-4" style={{ background: "rgba(139,92,246,0.06)", border: "1px solid rgba(139,92,246,0.2)" }}>
          <h3 className="text-sm font-bold text-violet-300 uppercase tracking-widest">Create New Ad</h3>

          {/* Title */}
          <div className="space-y-1">
            <label className="text-[10px] uppercase text-white/30 tracking-widest">Title (shown to user)</label>
            <Input
              placeholder="e.g. Exclusive offer — watch to continue"
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              className="bg-black/40 border-violet-500/20 text-white text-sm h-10"
            />
          </div>

          {/* Type selector */}
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase text-white/30 tracking-widest">Ad Type</label>
            <div className="flex gap-2">
              {AD_TYPES.map(t => (
                <button
                  key={t.value}
                  onClick={() => setForm(f => ({ ...f, type: t.value }))}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold border transition-all"
                  style={form.type === t.value
                    ? { background: "rgba(139,92,246,0.28)", border: "1px solid rgba(139,92,246,0.55)", color: "#c4b5fd" }
                    : { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.35)" }
                  }
                >
                  {t.icon} {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Media URL or HTML content */}
          {(form.type === "IMAGE" || form.type === "VIDEO") && (
            <div className="space-y-1">
              <label className="text-[10px] uppercase text-white/30 tracking-widest">
                {form.type === "IMAGE" ? "Image URL" : "Video URL"}
              </label>
              <Input
                placeholder="https://..."
                value={form.mediaUrl}
                onChange={e => setForm(f => ({ ...f, mediaUrl: e.target.value }))}
                className="bg-black/40 border-violet-500/20 text-white text-sm h-10"
              />
            </div>
          )}

          {form.type === "HTML" && (
            <div className="space-y-1">
              <label className="text-[10px] uppercase text-white/30 tracking-widest">HTML Content</label>
              <textarea
                placeholder="<div style='...'>Your ad HTML here</div>"
                value={form.htmlContent}
                onChange={e => setForm(f => ({ ...f, htmlContent: e.target.value }))}
                rows={5}
                className="w-full rounded-xl text-sm text-white resize-none px-3 py-2.5 font-mono"
                style={{ background: "rgba(0,0,0,0.4)", border: "1px solid rgba(139,92,246,0.2)", outline: "none" }}
              />
            </div>
          )}

          {/* Link URL */}
          <div className="space-y-1">
            <label className="text-[10px] uppercase text-white/30 tracking-widest">Click URL (optional)</label>
            <div className="relative">
              <ExternalLink className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/20" />
              <Input
                placeholder="https://..."
                value={form.linkUrl}
                onChange={e => setForm(f => ({ ...f, linkUrl: e.target.value }))}
                className="bg-black/40 border-violet-500/20 text-white text-sm h-10 pl-8"
              />
            </div>
          </div>

          {/* Duration */}
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase text-white/30 tracking-widest">Display Duration</label>
            <div className="flex gap-2">
              {DURATIONS.map(d => (
                <button
                  key={d}
                  onClick={() => setForm(f => ({ ...f, duration: d }))}
                  className="flex-1 py-2 rounded-xl text-xs font-bold border transition-all"
                  style={form.duration === d
                    ? { background: "rgba(139,92,246,0.28)", border: "1px solid rgba(139,92,246,0.55)", color: "#c4b5fd" }
                    : { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.35)" }
                  }
                >
                  {d}s
                </button>
              ))}
            </div>
          </div>

          {/* Submit */}
          <div className="flex gap-2 pt-1">
            <Button
              onClick={() => createMutation.mutate(form)}
              disabled={createMutation.isPending}
              className="flex-1 h-10 font-bold text-sm"
              style={{ background: "rgba(139,92,246,0.5)", border: "1px solid rgba(139,92,246,0.4)", color: "#e9d5ff" }}
            >
              {createMutation.isPending ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
              {createMutation.isPending ? "Creating..." : "Create Ad"}
            </Button>
            <Button
              onClick={() => { setShowForm(false); setForm(emptyForm); }}
              className="h-10 px-4 font-bold text-sm"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.4)" }}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Ads list */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16 text-white/20 text-sm">Loading ads...</div>
      ) : adsData.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <MonitorPlay className="w-10 h-10 text-violet-500/20" />
          <p className="text-white/20 text-sm">No ads yet</p>
          <p className="text-white/10 text-xs">Click "New Ad" to create your first ad</p>
        </div>
      ) : (
        <div className="space-y-3">
          {adsData.map(ad => (
            <AdCard
              key={ad.id}
              ad={ad}
              onDelete={() => deleteMutation.mutate(ad.id)}
              onToggle={() => toggleMutation.mutate(ad.id)}
              isDeleting={deleteMutation.isPending && (deleteMutation.variables as any) === ad.id}
              isToggling={toggleMutation.isPending && (toggleMutation.variables as any) === ad.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function AdCard({ ad, onDelete, onToggle, isDeleting, isToggling }: {
  ad: Ad;
  onDelete: () => void;
  onToggle: () => void;
  isDeleting: boolean;
  isToggling: boolean;
}) {
  const typeIcon = ad.type === "IMAGE" ? <Image className="w-3 h-3" /> : ad.type === "VIDEO" ? <Video className="w-3 h-3" /> : <Code2 className="w-3 h-3" />;
  const typeColor = ad.type === "IMAGE" ? "#60a5fa" : ad.type === "VIDEO" ? "#f97316" : "#a78bfa";

  return (
    <div className="rounded-xl p-4 flex items-start gap-3 transition-all" style={{
      background: ad.isActive ? "rgba(139,92,246,0.05)" : "rgba(255,255,255,0.02)",
      border: `1px solid ${ad.isActive ? "rgba(139,92,246,0.2)" : "rgba(255,255,255,0.06)"}`,
    }}>
      {/* Type badge */}
      <div className="shrink-0 w-9 h-9 rounded-xl flex items-center justify-center mt-0.5" style={{ background: `${typeColor}15`, border: `1px solid ${typeColor}30`, color: typeColor }}>
        {typeIcon}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">{ad.title || <span className="text-white/30 italic">Untitled</span>}</p>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: `${typeColor}15`, color: typeColor }}>
                {typeIcon} {ad.type}
              </span>
              <span className="flex items-center gap-1 text-[10px] text-white/30">
                <Clock className="w-3 h-3" /> {ad.duration}s
              </span>
              {ad.linkUrl && (
                <a href={ad.linkUrl} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1 text-[10px] text-white/20 hover:text-violet-400 transition-colors truncate max-w-[120px]">
                  <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                  <span className="truncate">{ad.linkUrl.replace(/^https?:\/\//, "")}</span>
                </a>
              )}
            </div>
          </div>

          {/* Status badge */}
          <span className="shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full"
            style={ad.isActive
              ? { background: "rgba(16,185,129,0.1)", color: "#34d399", border: "1px solid rgba(16,185,129,0.2)" }
              : { background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.2)", border: "1px solid rgba(255,255,255,0.08)" }
            }>
            {ad.isActive ? "ACTIVE" : "PAUSED"}
          </span>
        </div>

        {/* Media preview (image only) */}
        {ad.type === "IMAGE" && ad.mediaUrl && (
          <div className="mt-2.5 rounded-lg overflow-hidden" style={{ maxHeight: "100px", background: "#000" }}>
            <img src={ad.mediaUrl} alt="preview" className="h-full w-auto object-contain rounded-lg" style={{ maxHeight: "100px" }} />
          </div>
        )}
        {ad.type === "HTML" && ad.htmlContent && (
          <div className="mt-2 px-2.5 py-1.5 rounded-lg text-[10px] font-mono text-white/20 truncate" style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.05)" }}>
            {ad.htmlContent.slice(0, 80)}...
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="shrink-0 flex flex-col gap-1.5">
        <button
          onClick={onToggle}
          disabled={isToggling}
          className="w-8 h-8 rounded-xl flex items-center justify-center transition-all"
          style={ad.isActive
            ? { background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)", color: "#34d399" }
            : { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.25)" }
          }
          title={ad.isActive ? "Pause ad" : "Activate ad"}
        >
          {isToggling
            ? <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            : ad.isActive ? <ToggleRight className="w-3.5 h-3.5" /> : <ToggleLeft className="w-3.5 h-3.5" />
          }
        </button>
        <button
          onClick={onDelete}
          disabled={isDeleting}
          className="w-8 h-8 rounded-xl flex items-center justify-center transition-all"
          style={{ background: "rgba(239,68,68,0.07)", border: "1px solid rgba(239,68,68,0.15)", color: "rgba(239,68,68,0.5)" }}
          title="Delete ad"
        >
          {isDeleting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
        </button>
      </div>
    </div>
  );
}
