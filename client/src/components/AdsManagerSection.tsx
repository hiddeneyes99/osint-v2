import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import {
  MonitorPlay, Plus, Trash2, ToggleLeft, ToggleRight, RefreshCw,
  Image, Video, Code2, ExternalLink, Clock, Eye, X, ChevronRight,
  Activity, MousePointerClick, Youtube, AlertCircle, TrendingUp, Lock,
  Pencil, Save, CheckCircle2, Upload, Link2,
} from "lucide-react";
import type { Ad } from "@shared/schema";

const AD_TYPES = [
  { value: "IMAGE", label: "Image", icon: <Image className="w-3.5 h-3.5" />, color: "#60a5fa" },
  { value: "VIDEO", label: "Video", icon: <Video className="w-3.5 h-3.5" />, color: "#f97316" },
  { value: "HTML",  label: "HTML",  icon: <Code2 className="w-3.5 h-3.5" />, color: "#a78bfa" },
];

const DURATIONS = [5, 10, 15, 20, 30];

const PRESET_COLORS = [
  "#7c3aed", "#4f46e5", "#0ea5e9", "#10b981", "#f59e0b",
  "#ef4444", "#ec4899", "#f97316", "#ffffff", "#000000",
];

const emptyForm = {
  title: "", type: "IMAGE", mediaUrl: "", htmlContent: "", linkUrl: "",
  logoUrl: "", description: "", buttonText: "Learn More", buttonColor: "#7c3aed",
  forceRedirect: false, duration: 15,
};

type FormState = typeof emptyForm;

function getYoutubeId(url: string): string | null {
  const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&?/]+)/);
  return m ? m[1] : null;
}

function ctr(views: number, clicks: number) {
  if (!views) return "—";
  return `${((clicks / views) * 100).toFixed(1)}%`;
}

function adToForm(ad: Ad): FormState {
  return {
    title: ad.title || "",
    type: ad.type || "IMAGE",
    mediaUrl: ad.mediaUrl || "",
    htmlContent: ad.htmlContent || "",
    linkUrl: ad.linkUrl || "",
    logoUrl: (ad as any).logoUrl || "",
    description: (ad as any).description || "",
    buttonText: (ad as any).buttonText || "Learn More",
    buttonColor: (ad as any).buttonColor || "#7c3aed",
    forceRedirect: !!(ad as any).forceRedirect,
    duration: ad.duration || 15,
  };
}

/* ─── Media Field: URL tab or File Upload tab ─── */
function MediaField({ form, setForm }: { form: FormState; setForm: (fn: (f: FormState) => FormState) => void }) {
  const { toast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [tab, setTab] = useState<"url" | "upload">("url");
  const [uploading, setUploading] = useState(false);
  const [uploadedName, setUploadedName] = useState<string | null>(null);

  const isVideo = form.type === "VIDEO";
  const ytId = isVideo && form.mediaUrl ? getYoutubeId(form.mediaUrl) : null;
  const isHostedUpload = form.mediaUrl?.startsWith("/uploads/");

  async function handleFile(file: File) {
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    try {
      const res = await fetch("/api/admin/ads/upload-media", { method: "POST", body: fd });
      if (!res.ok) throw new Error("Upload failed");
      const { url } = await res.json();
      setForm(f => ({ ...f, mediaUrl: url }));
      setUploadedName(file.name);
      toast({ title: "Uploaded!", description: file.name });
    } catch (e: any) {
      toast({ variant: "destructive", title: "Upload failed", description: e.message });
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-2">
      <label className="text-[10px] uppercase text-white/30 tracking-widest">
        {isVideo ? "Video / YouTube" : "Image"} Media
      </label>

      {/* Tab switcher */}
      <div className="flex gap-1 p-1 rounded-xl" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
        {[
          { key: "url", label: "URL", icon: <Link2 className="w-3 h-3" /> },
          { key: "upload", label: "Upload File", icon: <Upload className="w-3 h-3" /> },
        ].map(t => (
          <button key={t.key} onClick={() => setTab(t.key as "url" | "upload")}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-all"
            style={tab === t.key
              ? { background: "rgba(139,92,246,0.35)", color: "#c4b5fd", border: "1px solid rgba(139,92,246,0.4)" }
              : { color: "rgba(255,255,255,0.3)", border: "1px solid transparent" }
            }>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {tab === "url" ? (
        <>
          <Input
            placeholder={isVideo ? "https://youtube.com/watch?v=... or direct .mp4 URL" : "https://example.com/image.jpg"}
            value={isHostedUpload ? "" : form.mediaUrl}
            onChange={e => { setUploadedName(null); setForm(f => ({ ...f, mediaUrl: e.target.value })); }}
            className="bg-black/40 border-violet-500/20 text-white text-sm h-10"
          />
          {form.mediaUrl && !isVideo && !isHostedUpload && (
            <div className="rounded-xl overflow-hidden" style={{ background: "rgba(0,0,0,0.4)", border: "1px solid rgba(139,92,246,0.15)" }}>
              <img src={form.mediaUrl} alt="Preview" className="w-full object-contain" style={{ maxHeight: "140px" }}
                onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
            </div>
          )}
          {ytId && (
            <div className="rounded-xl overflow-hidden" style={{ background: "#000", border: "1px solid rgba(139,92,246,0.15)", aspectRatio: "16/9" }}>
              <iframe src={`https://www.youtube.com/embed/${ytId}`} className="w-full h-full border-0" allowFullScreen title="YouTube preview" />
            </div>
          )}
        </>
      ) : (
        <>
          <div
            onClick={() => fileRef.current?.click()}
            className="w-full rounded-xl flex flex-col items-center justify-center gap-2 cursor-pointer transition-all"
            style={{
              minHeight: "90px", border: "2px dashed rgba(139,92,246,0.3)",
              background: uploading ? "rgba(139,92,246,0.08)" : "rgba(255,255,255,0.02)",
            }}
            onDragOver={e => e.preventDefault()}
            onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
          >
            {uploading
              ? <><RefreshCw className="w-5 h-5 text-violet-400 animate-spin" /><p className="text-xs text-violet-400">Uploading...</p></>
              : uploadedName || isHostedUpload
                ? <><CheckCircle2 className="w-5 h-5 text-emerald-400" /><p className="text-xs text-emerald-400 font-bold">{uploadedName || "File uploaded"}</p><p className="text-[10px] text-white/20">Click to replace</p></>
                : <><Upload className="w-5 h-5 text-white/25" /><p className="text-xs text-white/40">Click or drag & drop</p><p className="text-[10px] text-white/20">{isVideo ? "MP4, WebM, MOV (max 200MB)" : "JPG, PNG, GIF, WebP"}</p></>
            }
          </div>
          <input ref={fileRef} type="file" accept={isVideo ? "video/*" : "image/*"} className="hidden"
            onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
          {isHostedUpload && form.mediaUrl && !isVideo && (
            <div className="rounded-xl overflow-hidden" style={{ background: "rgba(0,0,0,0.4)", border: "1px solid rgba(139,92,246,0.15)" }}>
              <img src={form.mediaUrl} alt="Preview" className="w-full object-contain" style={{ maxHeight: "140px" }} />
            </div>
          )}
          {isHostedUpload && form.mediaUrl && isVideo && (
            <div className="rounded-xl overflow-hidden" style={{ background: "#000", border: "1px solid rgba(139,92,246,0.15)", aspectRatio: "16/9" }}>
              <video src={form.mediaUrl} controls className="w-full h-full" />
            </div>
          )}
        </>
      )}
    </div>
  );
}

/* ─── Shared form body (used for both Create and Edit) ─── */
function AdFormFields({ form, setForm }: { form: FormState; setForm: (fn: (f: FormState) => FormState) => void }) {
  return (
    <>
      {/* Ad Type */}
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

      {/* Title */}
      <div className="space-y-1">
        <label className="text-[10px] uppercase text-white/30 tracking-widest">Title (shown in ad header)</label>
        <Input placeholder="e.g. TWH OSINT Premium" value={form.title}
          onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
          className="bg-black/40 border-violet-500/20 text-white text-sm h-10" />
      </div>

      {/* Logo URL */}
      {form.type !== "HTML" && (
        <div className="space-y-1">
          <label className="text-[10px] uppercase text-white/30 tracking-widest">Logo URL (optional — square image)</label>
          <div className="flex gap-2">
            <Input placeholder="https://example.com/logo.png" value={form.logoUrl}
              onChange={e => setForm(f => ({ ...f, logoUrl: e.target.value }))}
              className="bg-black/40 border-violet-500/20 text-white text-sm h-10 flex-1" />
            {form.logoUrl && (
              <img src={form.logoUrl} alt="" className="w-10 h-10 rounded-xl object-cover shrink-0"
                style={{ border: "1px solid rgba(139,92,246,0.3)" }}
                onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
            )}
          </div>
        </div>
      )}

      {/* Description */}
      {form.type !== "HTML" && (
        <div className="space-y-1">
          <label className="text-[10px] uppercase text-white/30 tracking-widest">Description (shown below title)</label>
          <Input placeholder="e.g. The best OSINT tool in India" value={form.description}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            className="bg-black/40 border-violet-500/20 text-white text-sm h-10" />
        </div>
      )}

      {/* Media — URL or Upload */}
      {(form.type === "IMAGE" || form.type === "VIDEO") && (
        <MediaField form={form} setForm={setForm} />
      )}

      {/* HTML content */}
      {form.type === "HTML" && (
        <div className="space-y-1">
          <label className="text-[10px] uppercase text-white/30 tracking-widest">HTML Content (fills full screen)</label>
          <textarea placeholder="<div style='...'>Your ad HTML here</div>" value={form.htmlContent}
            onChange={e => setForm(f => ({ ...f, htmlContent: e.target.value }))} rows={5}
            className="w-full rounded-xl text-sm text-white resize-none px-3 py-2.5 font-mono"
            style={{ background: "rgba(0,0,0,0.4)", border: "1px solid rgba(139,92,246,0.2)", outline: "none" }} />
        </div>
      )}

      {/* Link URL + Button Text */}
      {form.type !== "HTML" && (
        <>
          <div className="space-y-1">
            <label className="text-[10px] uppercase text-white/30 tracking-widest">CTA Link URL (button redirects here)</label>
            <div className="relative">
              <ExternalLink className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/20" />
              <Input placeholder="https://..." value={form.linkUrl}
                onChange={e => setForm(f => ({ ...f, linkUrl: e.target.value }))}
                className="bg-black/40 border-violet-500/20 text-white text-sm h-10 pl-8" />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] uppercase text-white/30 tracking-widest">CTA Button Text</label>
            <Input placeholder="e.g. Install, Subscribe, Learn More" value={form.buttonText}
              onChange={e => setForm(f => ({ ...f, buttonText: e.target.value }))}
              className="bg-black/40 border-violet-500/20 text-white text-sm h-10" />
          </div>

          {/* Button Color Picker */}
          <div className="space-y-2">
            <label className="text-[10px] uppercase text-white/30 tracking-widest">Button Color</label>
            {/* Preset swatches */}
            <div className="flex gap-2 flex-wrap">
              {PRESET_COLORS.map(c => (
                <button key={c} onClick={() => setForm(f => ({ ...f, buttonColor: c }))}
                  title={c}
                  className="w-7 h-7 rounded-full transition-all shrink-0"
                  style={{
                    background: c,
                    border: form.buttonColor === c ? "2px solid #fff" : "2px solid rgba(255,255,255,0.12)",
                    boxShadow: form.buttonColor === c ? `0 0 0 2px ${c}` : "none",
                    transform: form.buttonColor === c ? "scale(1.18)" : "scale(1)",
                  }}
                />
              ))}
              {/* Native color wheel for any custom color */}
              <label title="Custom color" className="w-7 h-7 rounded-full overflow-hidden cursor-pointer shrink-0 flex items-center justify-center relative"
                style={{ border: "2px dashed rgba(255,255,255,0.3)", background: "rgba(255,255,255,0.06)" }}>
                <span className="text-[9px] text-white/40 font-bold select-none">+</span>
                <input type="color" value={form.buttonColor} className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                  onChange={e => setForm(f => ({ ...f, buttonColor: e.target.value }))} />
              </label>
            </div>
            {/* Live preview */}
            <div className="flex items-center gap-3 pt-1">
              <button className="flex items-center justify-center gap-2 px-5 h-9 rounded-full text-white font-bold text-sm pointer-events-none"
                style={{
                  background: `linear-gradient(135deg, ${form.buttonColor} 0%, ${form.buttonColor}cc 100%)`,
                  boxShadow: `0 4px 18px ${form.buttonColor}77`,
                }}>
                {form.buttonText || "Learn More"}
              </button>
              <span className="text-[10px] text-white/25 font-mono">{form.buttonColor}</span>
            </div>
          </div>
        </>
      )}

      {/* Force Redirect */}
      {form.type !== "HTML" && form.linkUrl && (
        <div onClick={() => setForm(f => ({ ...f, forceRedirect: !f.forceRedirect }))}
          className="flex items-center gap-3 p-3.5 rounded-xl cursor-pointer transition-all select-none"
          style={{
            background: form.forceRedirect ? "rgba(239,68,68,0.08)" : "rgba(255,255,255,0.02)",
            border: `1px solid ${form.forceRedirect ? "rgba(239,68,68,0.25)" : "rgba(255,255,255,0.08)"}`,
          }}>
          <Lock className="w-4 h-4 shrink-0" style={{ color: form.forceRedirect ? "#f87171" : "rgba(255,255,255,0.25)" }} />
          <div className="flex-1">
            <p className="text-xs font-bold" style={{ color: form.forceRedirect ? "#f87171" : "rgba(255,255,255,0.5)" }}>Force Redirect</p>
            <p className="text-[10px] text-white/25 mt-0.5">User must click the link button before they can close the ad</p>
          </div>
          <div className="w-10 h-5 rounded-full transition-all relative shrink-0"
            style={{ background: form.forceRedirect ? "rgba(239,68,68,0.4)" : "rgba(255,255,255,0.1)", border: `1px solid ${form.forceRedirect ? "rgba(239,68,68,0.5)" : "rgba(255,255,255,0.1)"}` }}>
            <div className="absolute top-0.5 w-4 h-4 rounded-full transition-all"
              style={{ background: form.forceRedirect ? "#f87171" : "rgba(255,255,255,0.35)", left: form.forceRedirect ? "calc(100% - 18px)" : "2px" }} />
          </div>
        </div>
      )}

      {/* Duration */}
      <div className="space-y-1.5">
        <label className="text-[10px] uppercase text-white/30 tracking-widest">Display Duration</label>
        <div className="flex gap-2">
          {DURATIONS.map(d => (
            <button key={d} onClick={() => setForm(f => ({ ...f, duration: d }))}
              className="flex-1 py-2 rounded-xl text-xs font-bold border transition-all"
              style={form.duration === d
                ? { background: "rgba(139,92,246,0.28)", border: "1px solid rgba(139,92,246,0.55)", color: "#c4b5fd" }
                : { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.35)" }
              }>{d}s</button>
          ))}
        </div>
      </div>
    </>
  );
}

/* ─── Main Component ─── */
export function AdsManagerSection() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [selectedAd, setSelectedAd] = useState<Ad | null>(null);
  const [imgError, setImgError] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<FormState>(emptyForm);

  const { data: adsData = [], isLoading, refetch } = useQuery<Ad[]>({
    queryKey: ["/api/admin/ads"],
    queryFn: async () => {
      const res = await fetch("/api/admin/ads");
      if (!res.ok) throw new Error("Failed to load ads");
      return res.json();
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: FormState) => {
      const res = await fetch("/api/admin/ads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, duration: Number(data.duration) }),
      });
      if (!res.ok) throw new Error("Failed to create ad");
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Ad created" });
      setForm(emptyForm);
      setShowForm(false);
      queryClient.invalidateQueries({ queryKey: ["/api/admin/ads"] });
    },
    onError: (e: any) => toast({ variant: "destructive", title: "Error", description: e.message }),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: FormState }) => {
      const res = await fetch(`/api/admin/ads/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, duration: Number(data.duration) }),
      });
      if (!res.ok) throw new Error("Failed to update ad");
      return res.json();
    },
    onSuccess: (updated: Ad) => {
      toast({ title: "Ad updated", description: "Changes saved successfully" });
      setEditingId(null);
      setSelectedAd(updated);
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
      setEditingId(null);
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
    onSuccess: (data: Ad) => {
      setSelectedAd(prev => prev ? { ...prev, isActive: data.isActive } : null);
      queryClient.invalidateQueries({ queryKey: ["/api/admin/ads"] });
    },
    onError: (e: any) => toast({ variant: "destructive", title: "Error", description: e.message }),
  });

  const totalViews = adsData.reduce((s, a) => s + (a.views ?? 0), 0);
  const totalClicks = adsData.reduce((s, a) => s + (a.clicks ?? 0), 0);
  const activeCount = adsData.filter(a => a.isActive).length;

  function startEdit(ad: Ad) {
    setEditingId(ad.id);
    setEditForm(adToForm(ad));
    setShowForm(false);
  }

  function cancelEdit() {
    setEditingId(null);
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <MonitorPlay className="w-5 h-5 text-violet-400" /> Ads Manager
          </h2>
          <p className="text-xs text-white/30 mt-0.5">Full-screen rewarded ad before each search</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => refetch()} className="p-2 rounded-xl border border-white/10 text-white/40 hover:text-white/70 hover:border-white/20 transition-all">
            <RefreshCw className="w-4 h-4" />
          </button>
          <Button onClick={() => { setShowForm(v => !v); setSelectedAd(null); setEditingId(null); }}
            className="flex items-center gap-2 text-xs font-bold h-9 px-4"
            style={{ background: showForm ? "rgba(139,92,246,0.15)" : "rgba(139,92,246,0.55)", border: "1px solid rgba(139,92,246,0.4)", color: "#e9d5ff" }}>
            <Plus className="w-3.5 h-3.5" /> New Ad
          </Button>
        </div>
      </div>

      {/* Analytics summary */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {[
          { label: "Total Ads", value: adsData.length, icon: <MonitorPlay className="w-3.5 h-3.5" />, color: "#a78bfa" },
          { label: "Active", value: activeCount, icon: <Activity className="w-3.5 h-3.5" />, color: "#34d399" },
          { label: "Total Views", value: totalViews.toLocaleString(), icon: <Eye className="w-3.5 h-3.5" />, color: "#60a5fa" },
          { label: "Total Clicks", value: totalClicks.toLocaleString(), icon: <MousePointerClick className="w-3.5 h-3.5" />, color: "#f97316" },
        ].map(s => (
          <div key={s.label} className="rounded-xl px-3 py-2.5 flex items-center gap-2.5" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
            <span className="shrink-0" style={{ color: s.color }}>{s.icon}</span>
            <div className="min-w-0">
              <p className="text-sm font-bold text-white leading-none truncate">{s.value}</p>
              <p className="text-[10px] text-white/30 mt-0.5">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Create form */}
      {showForm && (
        <div className="rounded-2xl p-5 space-y-4" style={{ background: "rgba(139,92,246,0.06)", border: "1px solid rgba(139,92,246,0.22)" }}>
          <h3 className="text-sm font-bold text-violet-300 uppercase tracking-widest">Create New Ad</h3>
          <AdFormFields form={form} setForm={setForm} />
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
          <p className="text-[10px] uppercase text-white/20 tracking-widest px-1">Click an ad to view analytics &amp; manage</p>
          {adsData.map(ad => (
            <div key={ad.id}>
              <AdRow ad={ad}
                isSelected={selectedAd?.id === ad.id}
                isEditing={editingId === ad.id}
                onClick={() => {
                  if (editingId === ad.id) return;
                  setSelectedAd(prev => prev?.id === ad.id ? null : ad);
                  setShowForm(false);
                  setImgError(false);
                  setEditingId(null);
                }} />

              {/* Inline Edit Panel */}
              {editingId === ad.id && (
                <div className="rounded-b-2xl p-5 space-y-4 -mt-1" style={{ background: "rgba(234,179,8,0.04)", border: "1px solid rgba(234,179,8,0.2)", borderTop: "none" }}>
                  <div className="flex items-center gap-2 pb-1">
                    <Pencil className="w-3.5 h-3.5 text-yellow-400" />
                    <span className="text-xs font-bold text-yellow-300 uppercase tracking-widest">Editing Ad #{ad.id}</span>
                  </div>
                  <AdFormFields form={editForm} setForm={setEditForm} />
                  <div className="flex gap-2 pt-1">
                    <Button onClick={() => updateMutation.mutate({ id: ad.id, data: editForm })}
                      disabled={updateMutation.isPending}
                      className="flex-1 h-10 font-bold text-sm"
                      style={{ background: "rgba(234,179,8,0.25)", border: "1px solid rgba(234,179,8,0.4)", color: "#fde68a" }}>
                      {updateMutation.isPending ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                      {updateMutation.isPending ? "Saving..." : "Save Changes"}
                    </Button>
                    <Button onClick={cancelEdit}
                      className="h-10 px-4 font-bold text-sm"
                      style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.4)" }}>
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

              {/* Detail Panel */}
              {selectedAd?.id === ad.id && editingId !== ad.id && (
                <AdDetailPanel
                  ad={selectedAd}
                  imgError={imgError}
                  setImgError={setImgError}
                  onClose={() => setSelectedAd(null)}
                  onEdit={() => startEdit(selectedAd)}
                  onToggle={() => toggleMutation.mutate(selectedAd.id)}
                  onDelete={() => deleteMutation.mutate(selectedAd.id)}
                  isToggling={toggleMutation.isPending}
                  isDeleting={deleteMutation.isPending}
                />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function AdRow({ ad, isSelected, isEditing, onClick }: { ad: Ad; isSelected: boolean; isEditing: boolean; onClick: () => void }) {
  const ti = AD_TYPES.find(t => t.value === ad.type) ?? AD_TYPES[0];
  const ytId = ad.type === "VIDEO" && ad.mediaUrl ? getYoutubeId(ad.mediaUrl) : null;
  const views = ad.views ?? 0;
  const clicks = ad.clicks ?? 0;

  return (
    <button onClick={onClick} className="w-full text-left rounded-xl p-3 flex items-center gap-3 transition-all"
      style={{
        background: isEditing ? "rgba(234,179,8,0.08)" : isSelected ? "rgba(139,92,246,0.12)" : ad.isActive ? "rgba(139,92,246,0.04)" : "rgba(255,255,255,0.02)",
        border: `1px solid ${isEditing ? "rgba(234,179,8,0.35)" : isSelected ? "rgba(139,92,246,0.45)" : ad.isActive ? "rgba(139,92,246,0.15)" : "rgba(255,255,255,0.06)"}`,
        borderRadius: isEditing ? "12px 12px 0 0" : "12px",
      }}>
      {/* Thumbnail */}
      <div className="shrink-0 w-14 h-14 rounded-lg overflow-hidden flex items-center justify-center"
        style={{ background: `${ti.color}12`, border: `1px solid ${ti.color}25` }}>
        {(ad as any).logoUrl ? (
          <img src={(ad as any).logoUrl} alt="" className="w-full h-full object-cover"
            onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
        ) : ad.type === "IMAGE" && ad.mediaUrl ? (
          <img src={ad.mediaUrl} alt="" className="w-full h-full object-cover"
            onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
        ) : ytId ? (
          <img src={`https://img.youtube.com/vi/${ytId}/mqdefault.jpg`} alt="" className="w-full h-full object-cover" />
        ) : (
          <span style={{ color: ti.color }}>{ti.icon}</span>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <p className="text-sm font-semibold text-white truncate">{ad.title || <span className="text-white/30 italic">Untitled</span>}</p>
          {(ad as any).forceRedirect && <Lock className="w-3 h-3 shrink-0 text-red-400/60" />}
          {isEditing && <Pencil className="w-3 h-3 shrink-0 text-yellow-400/80" />}
        </div>
        <div className="flex items-center gap-3 mt-1.5 flex-wrap">
          <span className="flex items-center gap-1 text-[10px] text-white/30"><Eye className="w-3 h-3" /> {views.toLocaleString()}</span>
          <span className="flex items-center gap-1 text-[10px] text-white/30"><MousePointerClick className="w-3 h-3" /> {clicks.toLocaleString()}</span>
          <span className="flex items-center gap-1 text-[10px] text-white/30"><TrendingUp className="w-3 h-3" /> {ctr(views, clicks)}</span>
          <span className="flex items-center gap-1 text-[10px] text-white/30"><Clock className="w-3 h-3" /> {ad.duration}s</span>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
            style={ad.isActive
              ? { background: "rgba(16,185,129,0.1)", color: "#34d399", border: "1px solid rgba(16,185,129,0.2)" }
              : { background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.2)", border: "1px solid rgba(255,255,255,0.08)" }
            }>{ad.isActive ? "ACTIVE" : "PAUSED"}</span>
        </div>
      </div>
      <ChevronRight className="w-4 h-4 text-white/20 shrink-0" style={{ transform: isSelected ? "rotate(90deg)" : "none", transition: "transform 0.2s" }} />
    </button>
  );
}

function AdDetailPanel({ ad, imgError, setImgError, onClose, onEdit, onToggle, onDelete, isToggling, isDeleting }: {
  ad: Ad; imgError: boolean; setImgError: (v: boolean) => void;
  onClose: () => void; onEdit: () => void; onToggle: () => void; onDelete: () => void;
  isToggling: boolean; isDeleting: boolean;
}) {
  const ti = AD_TYPES.find(t => t.value === ad.type) ?? AD_TYPES[0];
  const ytId = ad.type === "VIDEO" && ad.mediaUrl ? getYoutubeId(ad.mediaUrl) : null;
  const views = ad.views ?? 0;
  const clicks = ad.clicks ?? 0;
  const forceRedirect = (ad as any).forceRedirect;
  const description = (ad as any).description;
  const buttonText = (ad as any).buttonText;

  return (
    <div className="rounded-b-2xl overflow-hidden -mt-1" style={{ background: "rgba(10,6,30,0.98)", border: "1px solid rgba(139,92,246,0.35)", borderTop: "none" }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3" style={{ background: "rgba(139,92,246,0.1)", borderBottom: "1px solid rgba(139,92,246,0.2)" }}>
        <div className="flex items-center gap-2">
          <Eye className="w-4 h-4 text-violet-400" />
          <span className="text-sm font-bold text-violet-300">Ad Details & Analytics</span>
        </div>
        <div className="flex items-center gap-1.5">
          {/* Edit button */}
          <button onClick={onEdit}
            className="flex items-center gap-1.5 h-7 px-3 rounded-lg text-xs font-bold transition-all"
            style={{ background: "rgba(234,179,8,0.1)", border: "1px solid rgba(234,179,8,0.25)", color: "#fde68a" }}>
            <Pencil className="w-3 h-3" /> Edit
          </button>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors text-white/40 hover:text-white/70">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Analytics */}
      <div className="grid grid-cols-3 gap-2 px-4 pt-4">
        {[
          { label: "Views", value: views.toLocaleString(), icon: <Eye className="w-4 h-4" />, color: "#60a5fa" },
          { label: "Clicks", value: clicks.toLocaleString(), icon: <MousePointerClick className="w-4 h-4" />, color: "#f97316" },
          { label: "CTR", value: ctr(views, clicks), icon: <TrendingUp className="w-4 h-4" />, color: "#34d399" },
        ].map(s => (
          <div key={s.label} className="rounded-xl px-3 py-3 text-center" style={{ background: `${s.color}08`, border: `1px solid ${s.color}20` }}>
            <span style={{ color: s.color }} className="flex justify-center mb-1">{s.icon}</span>
            <p className="text-base font-bold text-white">{s.value}</p>
            <p className="text-[10px] text-white/30 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Info chips */}
      <div className="flex flex-wrap gap-2 px-4 pt-3">
        <span className="flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-full" style={{ background: `${ti.color}12`, border: `1px solid ${ti.color}30`, color: ti.color }}>
          {ti.icon} {ti.label}
        </span>
        <span className="flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-full" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.4)" }}>
          <Clock className="w-3 h-3" /> {ad.duration}s
        </span>
        {forceRedirect && (
          <span className="flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-full" style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "#f87171" }}>
            <Lock className="w-3 h-3" /> Force Redirect
          </span>
        )}
        {buttonText && (
          <span className="flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-full" style={{ background: "rgba(139,92,246,0.08)", border: "1px solid rgba(139,92,246,0.2)", color: "#c4b5fd" }}>
            CTA: {buttonText}
          </span>
        )}
        {description && (
          <span className="flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-full max-w-full truncate" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.35)" }}>
            "{description}"
          </span>
        )}
      </div>

      {/* Preview */}
      <div className="relative mx-4 mt-4 rounded-xl overflow-hidden" style={{ background: "#000", minHeight: "120px" }}>
        {ad.type === "IMAGE" && ad.mediaUrl && !imgError && (
          <img src={ad.mediaUrl} alt="Ad preview" className="w-full object-contain"
            style={{ maxHeight: "200px", display: "block" }} onError={() => setImgError(true)} />
        )}
        {ad.type === "IMAGE" && (imgError || !ad.mediaUrl) && (
          <div className="flex flex-col items-center justify-center h-24 gap-2" style={{ color: "rgba(255,255,255,0.15)" }}>
            <AlertCircle className="w-7 h-7" />
            <p className="text-xs">{imgError ? "Image failed to load" : "No image URL"}</p>
          </div>
        )}
        {ad.type === "VIDEO" && ad.mediaUrl && (
          ytId ? (
            <div style={{ aspectRatio: "16/9" }}>
              <iframe src={`https://www.youtube.com/embed/${ytId}`} className="w-full h-full border-0" allowFullScreen title="Ad preview" />
            </div>
          ) : (
            <video src={ad.mediaUrl} controls className="w-full" style={{ maxHeight: "200px" }} />
          )
        )}
        {ad.type === "HTML" && (
          <div className="flex flex-col items-center justify-center h-24 gap-2" style={{ color: "rgba(255,255,255,0.15)" }}>
            <Code2 className="w-7 h-7" />
            <p className="text-xs">HTML Ad — full screen</p>
          </div>
        )}
      </div>

      {/* Link */}
      {ad.linkUrl && (
        <div className="mx-4 mt-3 flex items-center gap-2 p-2.5 rounded-xl" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
          <ExternalLink className="w-3.5 h-3.5 text-white/20 shrink-0" />
          <a href={ad.linkUrl} target="_blank" rel="noopener noreferrer"
            className="text-xs text-violet-400/70 hover:text-violet-300 truncate transition-colors">{ad.linkUrl}</a>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2 p-4">
        <button onClick={onToggle} disabled={isToggling}
          className="flex-1 flex items-center justify-center gap-2 h-10 rounded-xl text-xs font-bold transition-all"
          style={ad.isActive
            ? { background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "#f87171" }
            : { background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)", color: "#34d399" }}>
          {isToggling ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : ad.isActive ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
          {ad.isActive ? "Pause Ad" : "Activate Ad"}
        </button>
        <button onClick={onEdit}
          className="flex items-center justify-center gap-2 h-10 px-4 rounded-xl text-xs font-bold transition-all"
          style={{ background: "rgba(234,179,8,0.08)", border: "1px solid rgba(234,179,8,0.2)", color: "#fde68a" }}>
          <Pencil className="w-3.5 h-3.5" /> Edit
        </button>
        <button onClick={onDelete} disabled={isDeleting}
          className="flex items-center justify-center gap-2 h-10 px-4 rounded-xl text-xs font-bold transition-all"
          style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.15)", color: "#f87171" }}>
          {isDeleting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
        </button>
      </div>
    </div>
  );
}
