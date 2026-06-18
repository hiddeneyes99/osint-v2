import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import {
  MonitorPlay, Plus, Trash2, ToggleLeft, ToggleRight, RefreshCw,
  Image, Video, Code2, ExternalLink, Clock, Eye, X, ChevronRight,
  Activity, Zap, AlertCircle, Youtube
} from "lucide-react";
import type { Ad } from "@shared/schema";

const AD_TYPES = [
  { value: "IMAGE", label: "Image", icon: <Image className="w-3.5 h-3.5" />, color: "#60a5fa" },
  { value: "VIDEO", label: "Video", icon: <Video className="w-3.5 h-3.5" />, color: "#f97316" },
  { value: "HTML",  label: "HTML",  icon: <Code2 className="w-3.5 h-3.5" />, color: "#a78bfa" },
];

const DURATIONS = [5, 10, 15, 20, 30];

const emptyForm = { title: "", type: "IMAGE", mediaUrl: "", htmlContent: "", linkUrl: "", duration: 15 };

function getYoutubeId(url: string): string | null {
  const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&?/]+)/);
  return m ? m[1] : null;
}

export function AdsManagerSection() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [selectedAd, setSelectedAd] = useState<Ad | null>(null);
  const [imgError, setImgError] = useState(false);

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
    onSuccess: () => {
      toast({ title: "Ad deleted" });
      setSelectedAd(null);
      queryClient.invalidateQueries({ queryKey: ["/api/admin/ads"] });
    },
    onError: (e: any) => toast({ variant: "destructive", title: "Error", description: e.message }),
  });

  const toggleMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/admin/ads/${id}/toggle`, { method: "PATCH" });
      if (!res.ok) throw new Error("Failed to toggle");
      return res.json();
    },
    onSuccess: (data) => {
      if (selectedAd) setSelectedAd(prev => prev ? { ...prev, isActive: data.isActive } : null);
      queryClient.invalidateQueries({ queryKey: ["/api/admin/ads"] });
    },
    onError: (e: any) => toast({ variant: "destructive", title: "Error", description: e.message }),
  });

  const activeCount = adsData.filter(a => a.isActive).length;
  const typeInfo = (type: string) => AD_TYPES.find(t => t.value === type) ?? AD_TYPES[0];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <MonitorPlay className="w-5 h-5 text-violet-400" />
            Ads Manager
          </h2>
          <p className="text-xs text-white/30 mt-0.5">Random ad shown before each search</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => refetch()} className="p-2 rounded-xl border border-white/10 text-white/40 hover:text-white/70 hover:border-white/20 transition-all">
            <RefreshCw className="w-4 h-4" />
          </button>
          <Button
            onClick={() => { setShowForm(v => !v); setSelectedAd(null); }}
            className="flex items-center gap-2 text-xs font-bold h-9 px-4"
            style={{ background: showForm ? "rgba(139,92,246,0.15)" : "rgba(139,92,246,0.55)", border: "1px solid rgba(139,92,246,0.4)", color: "#e9d5ff" }}
          >
            <Plus className="w-3.5 h-3.5" /> New Ad
          </Button>
        </div>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: "Total", value: adsData.length, icon: <MonitorPlay className="w-3.5 h-3.5" />, color: "#a78bfa" },
          { label: "Active", value: activeCount, icon: <Activity className="w-3.5 h-3.5" />, color: "#34d399" },
          { label: "Paused", value: adsData.length - activeCount, icon: <Zap className="w-3.5 h-3.5" />, color: "#f97316" },
        ].map(s => (
          <div key={s.label} className="rounded-xl px-3 py-2.5 flex items-center gap-2" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
            <span style={{ color: s.color }}>{s.icon}</span>
            <div>
              <p className="text-base font-bold text-white leading-none">{s.value}</p>
              <p className="text-[10px] text-white/30 mt-0.5">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Create form */}
      {showForm && (
        <div className="rounded-2xl p-5 space-y-4" style={{ background: "rgba(139,92,246,0.06)", border: "1px solid rgba(139,92,246,0.22)" }}>
          <h3 className="text-sm font-bold text-violet-300 uppercase tracking-widest">Create New Ad</h3>

          <div className="space-y-1">
            <label className="text-[10px] uppercase text-white/30 tracking-widest">Ad Title (shown to user)</label>
            <Input
              placeholder="e.g. Exclusive offer — watch to continue"
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              className="bg-black/40 border-violet-500/20 text-white text-sm h-10"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] uppercase text-white/30 tracking-widest">Ad Type</label>
            <div className="flex gap-2">
              {AD_TYPES.map(t => (
                <button key={t.value} onClick={() => setForm(f => ({ ...f, type: t.value }))}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold border transition-all"
                  style={form.type === t.value
                    ? { background: `${t.color}22`, border: `1px solid ${t.color}55`, color: t.color }
                    : { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.35)" }
                  }>
                  {t.icon} {t.label}
                </button>
              ))}
            </div>
          </div>

          {(form.type === "IMAGE" || form.type === "VIDEO") && (
            <div className="space-y-1">
              <label className="text-[10px] uppercase text-white/30 tracking-widest">
                {form.type === "IMAGE" ? "Image URL" : "Video / YouTube URL"}
              </label>
              <Input
                placeholder={form.type === "IMAGE" ? "https://example.com/image.jpg" : "https://youtube.com/watch?v=... or direct video URL"}
                value={form.mediaUrl}
                onChange={e => setForm(f => ({ ...f, mediaUrl: e.target.value }))}
                className="bg-black/40 border-violet-500/20 text-white text-sm h-10"
              />
              {/* Live preview */}
              {form.mediaUrl && form.type === "IMAGE" && (
                <div className="mt-2 rounded-xl overflow-hidden" style={{ background: "rgba(0,0,0,0.4)", border: "1px solid rgba(139,92,246,0.15)" }}>
                  <img
                    src={form.mediaUrl}
                    alt="Preview"
                    className="w-full object-contain"
                    style={{ maxHeight: "160px" }}
                    onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
                  />
                </div>
              )}
              {form.mediaUrl && form.type === "VIDEO" && getYoutubeId(form.mediaUrl) && (
                <div className="mt-2 rounded-xl overflow-hidden" style={{ background: "#000", border: "1px solid rgba(139,92,246,0.15)", aspectRatio: "16/9" }}>
                  <iframe
                    src={`https://www.youtube.com/embed/${getYoutubeId(form.mediaUrl)}`}
                    className="w-full h-full border-0"
                    allowFullScreen
                    title="YouTube preview"
                  />
                </div>
              )}
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

          <div className="space-y-1">
            <label className="text-[10px] uppercase text-white/30 tracking-widest">Click URL (optional — user is taken here on click)</label>
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

          <div className="space-y-1.5">
            <label className="text-[10px] uppercase text-white/30 tracking-widest">Display Duration</label>
            <div className="flex gap-2 flex-wrap">
              {DURATIONS.map(d => (
                <button key={d} onClick={() => setForm(f => ({ ...f, duration: d }))}
                  className="flex-1 min-w-[50px] py-2 rounded-xl text-xs font-bold border transition-all"
                  style={form.duration === d
                    ? { background: "rgba(139,92,246,0.28)", border: "1px solid rgba(139,92,246,0.55)", color: "#c4b5fd" }
                    : { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.35)" }
                  }>
                  {d}s
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-2 pt-1">
            <Button onClick={() => createMutation.mutate(form)} disabled={createMutation.isPending}
              className="flex-1 h-10 font-bold text-sm"
              style={{ background: "rgba(139,92,246,0.5)", border: "1px solid rgba(139,92,246,0.4)", color: "#e9d5ff" }}>
              {createMutation.isPending ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
              {createMutation.isPending ? "Creating..." : "Create Ad"}
            </Button>
            <Button onClick={() => { setShowForm(false); setForm(emptyForm); }}
              className="h-10 px-4 font-bold text-sm"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.4)" }}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Ads list */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16 text-white/20 text-sm gap-2">
          <RefreshCw className="w-4 h-4 animate-spin" /> Loading ads...
        </div>
      ) : adsData.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <MonitorPlay className="w-10 h-10 text-violet-500/20" />
          <p className="text-white/20 text-sm">No ads yet</p>
          <p className="text-white/10 text-xs">Click "New Ad" to create your first ad</p>
        </div>
      ) : (
        <div className="space-y-2">
          <p className="text-[10px] uppercase text-white/20 tracking-widest px-1">Click an ad to preview & manage</p>
          {adsData.map(ad => (
            <AdRow
              key={ad.id}
              ad={ad}
              isSelected={selectedAd?.id === ad.id}
              onClick={() => { setSelectedAd(prev => prev?.id === ad.id ? null : ad); setShowForm(false); setImgError(false); }}
            />
          ))}
        </div>
      )}

      {/* Ad detail panel */}
      {selectedAd && (
        <AdDetailPanel
          ad={selectedAd}
          imgError={imgError}
          setImgError={setImgError}
          onClose={() => setSelectedAd(null)}
          onToggle={() => toggleMutation.mutate(selectedAd.id)}
          onDelete={() => deleteMutation.mutate(selectedAd.id)}
          isToggling={toggleMutation.isPending}
          isDeleting={deleteMutation.isPending}
        />
      )}
    </div>
  );
}

function AdRow({ ad, isSelected, onClick }: { ad: Ad; isSelected: boolean; onClick: () => void }) {
  const ti = AD_TYPES.find(t => t.value === ad.type) ?? AD_TYPES[0];
  const ytId = ad.type === "VIDEO" && ad.mediaUrl ? getYoutubeId(ad.mediaUrl) : null;

  return (
    <button
      onClick={onClick}
      className="w-full text-left rounded-xl p-3 flex items-center gap-3 transition-all"
      style={{
        background: isSelected ? "rgba(139,92,246,0.12)" : ad.isActive ? "rgba(139,92,246,0.04)" : "rgba(255,255,255,0.02)",
        border: `1px solid ${isSelected ? "rgba(139,92,246,0.45)" : ad.isActive ? "rgba(139,92,246,0.15)" : "rgba(255,255,255,0.06)"}`,
      }}
    >
      {/* Thumbnail */}
      <div className="shrink-0 w-14 h-14 rounded-lg overflow-hidden flex items-center justify-center" style={{ background: `${ti.color}12`, border: `1px solid ${ti.color}25` }}>
        {ad.type === "IMAGE" && ad.mediaUrl ? (
          <img src={ad.mediaUrl} alt="" className="w-full h-full object-cover" onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
        ) : ytId ? (
          <img src={`https://img.youtube.com/vi/${ytId}/mqdefault.jpg`} alt="" className="w-full h-full object-cover" />
        ) : (
          <span style={{ color: ti.color }}>{ti.icon}</span>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-white truncate">{ad.title || <span className="text-white/30 italic">Untitled</span>}</p>
        <div className="flex items-center gap-2 mt-1 flex-wrap">
          <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: `${ti.color}15`, color: ti.color }}>
            {ti.icon} {ad.type}
          </span>
          <span className="flex items-center gap-1 text-[10px] text-white/30">
            <Clock className="w-3 h-3" /> {ad.duration}s
          </span>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${ad.isActive ? "text-emerald-400" : "text-white/20"}`}
            style={ad.isActive
              ? { background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)" }
              : { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }
            }>
            {ad.isActive ? "ACTIVE" : "PAUSED"}
          </span>
        </div>
      </div>

      <ChevronRight className="w-4 h-4 text-white/20 shrink-0" style={{ transform: isSelected ? "rotate(90deg)" : "none", transition: "transform 0.2s" }} />
    </button>
  );
}

function AdDetailPanel({ ad, imgError, setImgError, onClose, onToggle, onDelete, isToggling, isDeleting }: {
  ad: Ad;
  imgError: boolean;
  setImgError: (v: boolean) => void;
  onClose: () => void;
  onToggle: () => void;
  onDelete: () => void;
  isToggling: boolean;
  isDeleting: boolean;
}) {
  const ti = AD_TYPES.find(t => t.value === ad.type) ?? AD_TYPES[0];
  const ytId = ad.type === "VIDEO" && ad.mediaUrl ? getYoutubeId(ad.mediaUrl) : null;

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: "rgba(10,6,30,0.95)", border: "1px solid rgba(139,92,246,0.35)" }}>
      {/* Panel header */}
      <div className="flex items-center justify-between px-4 py-3" style={{ background: "rgba(139,92,246,0.1)", borderBottom: "1px solid rgba(139,92,246,0.2)" }}>
        <div className="flex items-center gap-2">
          <Eye className="w-4 h-4 text-violet-400" />
          <span className="text-sm font-bold text-violet-300">Ad Preview & Details</span>
        </div>
        <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors text-white/40 hover:text-white/70">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Media Preview */}
      <div className="relative" style={{ background: "#000", minHeight: "180px" }}>
        {ad.type === "IMAGE" && ad.mediaUrl && !imgError && (
          <a href={ad.linkUrl || undefined} target="_blank" rel="noopener noreferrer" className={ad.linkUrl ? "block" : "pointer-events-none block"}>
            <img
              src={ad.mediaUrl}
              alt="Ad preview"
              className="w-full object-contain"
              style={{ maxHeight: "280px", display: "block" }}
              onError={() => setImgError(true)}
            />
          </a>
        )}

        {ad.type === "IMAGE" && (imgError || !ad.mediaUrl) && (
          <div className="flex flex-col items-center justify-center h-40 gap-2" style={{ color: "rgba(255,255,255,0.15)" }}>
            <AlertCircle className="w-8 h-8" />
            <p className="text-xs">{imgError ? "Image failed to load" : "No image URL set"}</p>
          </div>
        )}

        {ad.type === "VIDEO" && ad.mediaUrl && (
          ytId ? (
            <div style={{ aspectRatio: "16/9" }}>
              <iframe
                src={`https://www.youtube.com/embed/${ytId}?autoplay=0`}
                className="w-full h-full border-0"
                allowFullScreen
                title="YouTube Ad"
              />
            </div>
          ) : (
            <video
              src={ad.mediaUrl}
              controls
              className="w-full object-contain bg-black"
              style={{ maxHeight: "260px" }}
            />
          )
        )}

        {ad.type === "HTML" && ad.htmlContent && (
          <iframe
            srcDoc={ad.htmlContent}
            sandbox="allow-scripts allow-same-origin allow-popups"
            className="w-full border-0"
            style={{ height: "200px" }}
            title="HTML Ad"
          />
        )}

        {/* YouTube badge */}
        {ytId && (
          <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold" style={{ background: "#ff0000cc", color: "#fff" }}>
            <Youtube className="w-3 h-3" /> YouTube
          </div>
        )}

        {/* Link badge */}
        {ad.linkUrl && (
          <a href={ad.linkUrl} target="_blank" rel="noopener noreferrer"
            className="absolute bottom-2 right-2 flex items-center gap-1 text-[10px] font-bold px-2.5 py-1.5 rounded-lg"
            style={{ background: "rgba(139,92,246,0.9)", color: "#fff" }}>
            <ExternalLink className="w-3 h-3" /> Open Link
          </a>
        )}
      </div>

      {/* Details */}
      <div className="px-4 py-4 space-y-3">
        <div>
          <p className="text-xs text-white/30 mb-0.5">Title</p>
          <p className="text-sm font-semibold text-white">{ad.title || <span className="text-white/30 italic">Untitled</span>}</p>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div className="rounded-xl px-3 py-2" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
            <p className="text-[10px] text-white/30">Type</p>
            <p className="text-xs font-bold mt-0.5" style={{ color: ti.color }}>{ad.type}</p>
          </div>
          <div className="rounded-xl px-3 py-2" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
            <p className="text-[10px] text-white/30">Duration</p>
            <p className="text-xs font-bold text-white mt-0.5">{ad.duration}s</p>
          </div>
          <div className="rounded-xl px-3 py-2" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
            <p className="text-[10px] text-white/30">Status</p>
            <p className="text-xs font-bold mt-0.5" style={{ color: ad.isActive ? "#34d399" : "rgba(255,255,255,0.25)" }}>
              {ad.isActive ? "Active" : "Paused"}
            </p>
          </div>
        </div>

        {ad.mediaUrl && (
          <div>
            <p className="text-[10px] text-white/30 mb-0.5">Media URL</p>
            <p className="text-xs text-white/50 font-mono break-all leading-relaxed">{ad.mediaUrl}</p>
          </div>
        )}
        {ad.linkUrl && (
          <div>
            <p className="text-[10px] text-white/30 mb-0.5">Click URL</p>
            <a href={ad.linkUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-violet-400 hover:text-violet-300 break-all font-mono transition-colors">{ad.linkUrl}</a>
          </div>
        )}
        {ad.type === "HTML" && ad.htmlContent && (
          <div>
            <p className="text-[10px] text-white/30 mb-0.5">HTML Content</p>
            <div className="rounded-lg px-3 py-2 text-[10px] font-mono text-white/30 max-h-24 overflow-y-auto" style={{ background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.05)" }}>
              {ad.htmlContent}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-1">
          <button onClick={onToggle} disabled={isToggling}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold border transition-all"
            style={ad.isActive
              ? { background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "#f87171" }
              : { background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.25)", color: "#34d399" }
            }>
            {isToggling
              ? <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              : ad.isActive ? <ToggleRight className="w-3.5 h-3.5" /> : <ToggleLeft className="w-3.5 h-3.5" />
            }
            {ad.isActive ? "Pause Ad" : "Activate Ad"}
          </button>
          <button onClick={onDelete} disabled={isDeleting}
            className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold border transition-all"
            style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "#f87171" }}>
            {isDeleting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
