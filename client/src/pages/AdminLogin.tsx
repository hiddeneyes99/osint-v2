import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import {
  Users, ShieldCheck, Ban, ArrowLeft, Search, RefreshCw,
  History as HistoryIcon, Terminal, Lock, ShieldAlert, Megaphone, Trash2,
  Activity, FileText, Gauge, MessageSquare, LogIn, TrendingUp, Zap,
  Send, StickyNote, Clock, Bot, Plus, X, ChevronDown,
  Power, Smartphone, Car, Globe, Mail, ToggleLeft, ToggleRight,
  Bell, MonitorPlay, Menu, Crown, Key, Eye, EyeOff, Copy, CheckCircle2, XCircle, RotateCcw, CalendarClock
} from "lucide-react";
import { useLocation } from "wouter";
import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import type { User, RequestLog, BroadcastMessage, UserNote, LoginActivity, Notification } from "@shared/schema";
import { motion, AnimatePresence } from "framer-motion";
import { AdsManagerSection } from "@/components/AdsManagerSection";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell } from "recharts";

const loginSchema = z.object({
  id: z.string().min(1, "ID is required"),
  password: z.string().min(1, "Password is required"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function AdminLogin() {
  const [, setLocation] = useLocation();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isVerifying, setIsVerifying] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUserHistory, setSelectedUserHistory] = useState<{ id: string; email: string } | null>(null);
  const [isProtectedModalOpen, setIsProtectedModalOpen] = useState(false);
  const [isBroadcastOpen, setIsBroadcastOpen] = useState(false);
  const [isBlockedUsersOpen, setIsBlockedUsersOpen] = useState(false);
  const [isIpBlockedOpen, setIsIpBlockedOpen] = useState(false);
  const [blockSearch, setBlockSearch] = useState("");
  const [protectedInput, setProtectedInput] = useState({ number: "", reason: "" });
  const [selectedLog, setSelectedLog] = useState<RequestLog | null>(null);
  const [activeSection, setActiveSection] = useState("dashboard");
  const [selectedUserForDetail, setSelectedUserForDetail] = useState<(User & { queryCount?: number }) | null>(null);
  const [expandedLogId, setExpandedLogId] = useState<number | null>(null);
  const [userDetailTab, setUserDetailTab] = useState("history");

  // Live feed & charts
  const feedRef = useRef<HTMLDivElement>(null);
  const [liveFeed, setLiveFeed] = useState<Array<{ service: string; query: string; username: string; timestamp: string }>>([]);
  const [chartDays, setChartDays] = useState(7);

  // User management extras
  const [selectedActivityUser, setSelectedActivityUser] = useState<{ id: string; email: string } | null>(null);
  const [selectedNotesUser, setSelectedNotesUser] = useState<{ id: string; email: string } | null>(null);
  const [newNote, setNewNote] = useState("");
  const [notifTarget, setNotifTarget] = useState<{ id: string; email: string } | null>(null);
  const [notifInput, setNotifInput] = useState({ title: "", message: "" });
  const [rateLimitTarget, setRateLimitTarget] = useState<{ id: string; email: string; limit: number | null } | null>(null);
  const [rateLimitValue, setRateLimitValue] = useState<string>("");

  const [broadcastInput, setBroadcastInput] = useState({
    title: "",
    message: "",
    type: "INFO",
    mediaUrl: "",
    mediaType: "IMAGE",
    actionLink: "",
    buttonText: "LEARN MORE",
    durationMinutes: 60,
    startsAt: "",
  });

  const [isTelegramOpen, setIsTelegramOpen] = useState(false);
  const [isTgUsersOpen, setIsTgUsersOpen] = useState(false);
  const [tgUserSearch, setTgUserSearch] = useState("");
  const [tgPingPending, setTgPingPending] = useState<string | null>(null);
  const [tgQuickBroadcast, setTgQuickBroadcast] = useState("");
  const [tgBotToken, setTgBotToken] = useState("");
  const [tgNewAdminId, setTgNewAdminId] = useState("");
  const [tgTestChatId, setTgTestChatId] = useState("");
  const [tgBroadcastText, setTgBroadcastText] = useState("");
  const [tgBroadcastButtons, setTgBroadcastButtons] = useState<Array<{ label: string; url: string }>>([]);
  const [tgBroadcastMediaUrl, setTgBroadcastMediaUrl] = useState("");
  const [tgBroadcastMediaType, setTgBroadcastMediaType] = useState("IMAGE");
  const [serviceReasonDraft, setServiceReasonDraft] = useState<Record<string, string>>({});
  const [tgManualUserId, setTgManualUserId] = useState("");
  const [tgManualChatId, setTgManualChatId] = useState("");

  // Broadcast notification to all users
  const [isBroadcastNotifOpen, setIsBroadcastNotifOpen] = useState(false);
  const [broadcastNotifInput, setBroadcastNotifInput] = useState({ title: "", message: "" });

  // ── Premium Users state ─────────────────────────────────────────────────
  const [premiumCreateOpen, setPremiumCreateOpen] = useState(false);
  const [premiumCreateForm, setPremiumCreateForm] = useState({ email: "", expiresAt: "" });

  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      id: "",
      password: "",
    },
  });

  const { data: users, refetch: refetchUsers } = useQuery<(User & { queryCount?: number })[]>({
    queryKey: ["/api/admin/users"],
    enabled: isLoggedIn,
    staleTime: 0,
  });

  const { data: adminStats, refetch: refetchStats } = useQuery<{
    totalUsers: number;
    blockedUsers: number;
    ipBlockedUsers: number;
    queriesToday: number;
    queriesThisMonth: number;
    totalQueries: number;
  }>({
    queryKey: ["/api/admin/stats"],
    enabled: isLoggedIn,
    staleTime: 0,
  });

  const { data: protectedNumbersList, refetch: refetchProtected } = useQuery<string[]>({
    queryKey: ["/api/admin/protected-numbers"],
    enabled: isLoggedIn,
  });

  const { data: broadcastList = [], refetch: refetchBroadcasts } = useQuery<BroadcastMessage[]>({
    queryKey: ["/api/broadcasts"],
    enabled: isLoggedIn,
  });

  const { data: tgSettings, refetch: refetchTgSettings } = useQuery<{
    botToken: string | null; botTokenSet: boolean; adminChatIds: string[];
  }>({
    queryKey: ["/api/admin/telegram/settings"],
    enabled: isLoggedIn,
  });

  const { data: tgLinkedUsers = [], refetch: refetchTgUsers } = useQuery<Array<{
    id: string; email: string | null; username: string | null; telegramChatId: string;
  }>>({
    queryKey: ["/api/admin/telegram/users"],
    enabled: isLoggedIn,
  });

  // ── Premium Users query ──────────────────────────────────────────────────
  interface PremiumUserRow {
    id: number; email: string | null; role: string; status: string;
    expiresAt: string | null; lastLogin: string | null; createdAt: string;
  }
  const { data: premiumUsersList = [], refetch: refetchPremiumUsers } = useQuery<PremiumUserRow[]>({
    queryKey: ["/api/admin/premium-users"],
    enabled: isLoggedIn && activeSection === "premium",
    staleTime: 0,
  });

  useEffect(() => {
    if (tgSettings?.adminChatIds?.length && !tgTestChatId) {
      setTgTestChatId(tgSettings.adminChatIds[0]);
    }
  }, [tgSettings?.adminChatIds]);

  // ── Premium Users mutations ─────────────────────────────────────────────
  const createPremiumMutation = useMutation({
    mutationFn: async (data: typeof premiumCreateForm) => {
      const res = await fetch("/api/admin/premium-users", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) { const e = await res.json(); throw new Error(e.message); }
      return res.json();
    },
    onSuccess: () => {
      refetchPremiumUsers();
      setPremiumCreateOpen(false);
      setPremiumCreateForm({ email: "", expiresAt: "" });
      toast({ title: "Premium user added", description: "They'll receive premium access automatically on next login." });
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const togglePremiumMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/admin/premium-users/${id}/toggle`, { method: "PATCH" });
      if (!res.ok) throw new Error("Failed to toggle");
      return res.json();
    },
    onSuccess: () => { refetchPremiumUsers(); toast({ title: "Status updated" }); },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const deletePremiumMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/admin/premium-users/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      return res.json();
    },
    onSuccess: () => { refetchPremiumUsers(); toast({ title: "Premium user deleted" }); },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });


  const sendBroadcastMutation = useMutation({
    mutationFn: async (data: typeof broadcastInput) => {
      const res = await fetch("/api/admin/broadcasts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          mediaUrl: data.mediaUrl || undefined,
          actionLink: data.actionLink || undefined,
          startsAt: data.startsAt || undefined,
        }),
      });
      if (!res.ok) throw new Error("Failed to send broadcast");
      return res.json();
    },
    onSuccess: () => {
      refetchBroadcasts();
      setBroadcastInput({ title: "", message: "", type: "INFO", mediaUrl: "", mediaType: "IMAGE", actionLink: "", buttonText: "LEARN MORE", durationMinutes: 60, startsAt: "" });
      toast({ title: "Broadcast transmitted to all operatives" });
    },
  });

  const deleteBroadcastMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/admin/broadcasts/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete broadcast");
      return res.json();
    },
    onSuccess: () => {
      refetchBroadcasts();
      toast({ title: "Broadcast deactivated" });
    },
  });

  const addProtectedMutation = useMutation({
    mutationFn: async (data: { number: string; reason: string }) => {
      const res = await fetch("/api/admin/protected-numbers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to add protection");
      return res.json();
    },
    onSuccess: () => {
      refetchProtected();
      setProtectedInput({ number: "", reason: "" });
      toast({ title: "Target protected successfully" });
    },
  });

  const removeProtectedMutation = useMutation({
    mutationFn: async (number: string) => {
      const res = await fetch(`/api/admin/protected-numbers/${number}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to remove protection");
      return res.json();
    },
    onSuccess: () => {
      refetchProtected();
      toast({ title: "Protection removed" });
    },
  });

  const { data: userHistory, isLoading: isLoadingHistory } = useQuery<RequestLog[]>({
    queryKey: [`/api/admin/users/${selectedUserHistory?.id}/history`],
    enabled: !!selectedUserHistory && isLoggedIn,
  });

  const { data: chartData = [], refetch: refetchCharts } = useQuery<Array<{ date: string; mobile: number; aadhar: number; vehicle: number; ip: number; total: number }>>({
    queryKey: ["/api/admin/stats/charts", chartDays],
    enabled: isLoggedIn,
    staleTime: 0,
    queryFn: async () => {
      const adminToken = localStorage.getItem("adminToken");
      const res = await fetch(`/api/admin/stats/charts?days=${chartDays}`, {
        headers: { ...(adminToken ? { "X-Admin-Token": adminToken } : {}) },
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch chart data");
      return res.json();
    },
  });

  const { data: allLogs = [], isLoading: isLoadingAllLogs, refetch: refetchLogs } = useQuery<Array<{
    id: number; userId: string; service: string; query: string; status: string | null;
    result: any; createdAt: string | null; username: string | null; email: string | null;
  }>>({
    queryKey: ["/api/admin/logs"],
    enabled: isLoggedIn && activeSection === "logs",
  });

  const { data: detailHistory = [], isLoading: isLoadingDetailHistory } = useQuery<RequestLog[]>({
    queryKey: [`/api/admin/users/${selectedUserForDetail?.id}/history`],
    enabled: !!selectedUserForDetail && isLoggedIn,
  });

  const { data: detailActivity = [], isLoading: isLoadingDetailActivity } = useQuery<LoginActivity[]>({
    queryKey: [`/api/admin/users/${selectedUserForDetail?.id}/login-activity`],
    enabled: !!selectedUserForDetail && isLoggedIn,
  });

  const { data: detailNotes = [], refetch: refetchDetailNotes } = useQuery<UserNote[]>({
    queryKey: [`/api/admin/users/${selectedUserForDetail?.id}/notes`],
    enabled: !!selectedUserForDetail && isLoggedIn,
  });

  const { data: loginActivityData = [], isLoading: isLoadingActivity } = useQuery<LoginActivity[]>({
    queryKey: [`/api/admin/users/${selectedActivityUser?.id}/login-activity`],
    enabled: !!selectedActivityUser && isLoggedIn,
  });

  const { data: userNotesData = [], refetch: refetchNotes } = useQuery<UserNote[]>({
    queryKey: [`/api/admin/users/${selectedNotesUser?.id}/notes`],
    enabled: !!selectedNotesUser && isLoggedIn,
  });

  // On mount: verify session via cookie + stored token — no localStorage dependency for initial state
  useEffect(() => {
    const adminToken = localStorage.getItem("adminToken");
    fetch("/api/admin/verify", {
      headers: { ...(adminToken ? { "X-Admin-Token": adminToken } : {}) },
      credentials: "include",
    }).then((res) => {
      if (res.ok) {
        setIsLoggedIn(true);
      } else {
        localStorage.removeItem("adminLoggedIn");
        localStorage.removeItem("adminToken");
        setIsLoggedIn(false);
      }
    }).catch(() => {
      setIsLoggedIn(false);
    }).finally(() => {
      setIsVerifying(false);
    });
  }, []);

  // Live feed — fetch from DB on login/manual refresh only (no auto-polling)
  const { data: liveFeedData, isLoading: isLiveFeedLoading, refetch: refetchLiveFeed } = useQuery<Array<{ service: string; query: string; username: string; timestamp: string }>>({
    queryKey: ["/api/admin/live-feed"],
    enabled: isLoggedIn,
    staleTime: 0,
  });

  useEffect(() => {
    if (!liveFeedData) return;
    setLiveFeed(liveFeedData.slice(0, 60));
  }, [liveFeedData]);

  const addNoteMutation = useMutation({
    mutationFn: async ({ userId, note }: { userId: string; note: string }) => {
      const res = await fetch(`/api/admin/users/${userId}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ note }),
      });
      if (!res.ok) throw new Error("Failed to add note");
      return res.json();
    },
    onSuccess: () => { refetchNotes(); setNewNote(""); },
  });

  const deleteNoteMutation = useMutation({
    mutationFn: async (noteId: number) => {
      await fetch(`/api/admin/notes/${noteId}`, { method: "DELETE" });
    },
    onSuccess: () => refetchNotes(),
  });

  const setRateLimitMutation = useMutation({
    mutationFn: async ({ userId, limit }: { userId: string; limit: number | null }) => {
      const res = await fetch(`/api/admin/users/${userId}/limit`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dailyQueryLimit: limit }),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      setRateLimitTarget(null);
      toast({ title: "Rate limit updated" });
    },
  });

  const sendNotificationMutation = useMutation({
    mutationFn: async ({ userId, title, message }: { userId: string; title: string; message: string }) => {
      const res = await fetch("/api/admin/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, title, message }),
      });
      if (!res.ok) throw new Error("Failed to send");
      return res.json();
    },
    onSuccess: () => {
      setNotifTarget(null);
      setNotifInput({ title: "", message: "" });
      toast({ title: "Notification sent to operative" });
    },
  });

  const sendBroadcastNotifMutation = useMutation({
    mutationFn: async ({ title, message }: { title: string; message: string }) => {
      const res = await fetch("/api/admin/notifications/broadcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, message }),
      });
      if (!res.ok) throw new Error("Failed to broadcast");
      return res.json();
    },
    onSuccess: (data) => {
      setIsBroadcastNotifOpen(false);
      setBroadcastNotifInput({ title: "", message: "" });
      toast({ title: `Notification sent to ${data.sent} users` });
    },
    onError: (e: any) => toast({ variant: "destructive", title: "Error", description: e.message }),
  });


  const saveTgSettingsMutation = useMutation({
    mutationFn: async (data: { botToken?: string; adminChatIds?: string[] }) => {
      const res = await fetch("/api/admin/telegram/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error((await res.json()).message || "Failed to save");
      return res.json();
    },
    onSuccess: () => { refetchTgSettings(); setTgBotToken(""); setTgNewAdminId(""); toast({ title: "✅ Telegram settings saved" }); },
    onError: (e: any) => toast({ variant: "destructive", title: "Error", description: e.message }),
  });

  const testTgMutation = useMutation({
    mutationFn: async (chatId: string) => {
      const res = await fetch("/api/admin/telegram/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chatId }),
      });
      if (!res.ok) throw new Error((await res.json()).message || "Failed");
      return res.json();
    },
    onSuccess: () => toast({ title: "✅ Test message sent!" }),
    onError: (e: any) => toast({ variant: "destructive", title: "Test Failed", description: e.message }),
  });

  const [tgBroadcastResult, setTgBroadcastResult] = useState<{ sent: number; failed: number; total: number; failedIds: string[] } | null>(null);

  const removeTgUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      const res = await fetch(`/api/admin/telegram/users/${userId}`, { method: "DELETE" });
      if (!res.ok) throw new Error((await res.json()).message || "Failed");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/telegram/users"] });
      toast({ title: "Telegram Removed", description: "User's Telegram link has been removed." });
    },
    onError: (e: any) => toast({ variant: "destructive", title: "Error", description: e.message }),
  });

  const addTgUserMutation = useMutation({
    mutationFn: async ({ userId, chatId }: { userId: string; chatId: string }) => {
      const res = await fetch(`/api/admin/telegram/users/${userId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chatId }),
      });
      if (!res.ok) throw new Error((await res.json()).message || "Failed");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/telegram/users"] });
      setTgManualUserId(""); setTgManualChatId("");
      toast({ title: "Telegram Linked", description: "Chat ID saved for the user." });
    },
    onError: (e: any) => toast({ variant: "destructive", title: "Error", description: e.message }),
  });

  const pingTgUserMutation = useMutation({
    mutationFn: async (chatId: string) => {
      setTgPingPending(chatId);
      const res = await fetch("/api/admin/telegram/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chatId }),
      });
      if (!res.ok) throw new Error((await res.json()).message || "Failed");
      return res.json();
    },
    onSuccess: () => {
      setTgPingPending(null);
      toast({ title: "✅ Ping Sent", description: "Test message delivered to user." });
    },
    onError: (e: any) => {
      setTgPingPending(null);
      toast({ variant: "destructive", title: "Ping Failed", description: e.message });
    },
  });

  const quickTgBroadcastMutation = useMutation({
    mutationFn: async (text: string) => {
      const res = await fetch("/api/admin/telegram/broadcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, buttons: [], mediaUrl: undefined, mediaType: "IMAGE" }),
      });
      if (!res.ok) throw new Error((await res.json()).message || "Failed");
      return res.json();
    },
    onSuccess: (data) => {
      setTgQuickBroadcast("");
      toast({ title: "📢 Broadcast Done", description: `✅ ${data.sent} sent | ❌ ${data.failed} failed` });
    },
    onError: (e: any) => toast({ variant: "destructive", title: "Broadcast Failed", description: e.message }),
  });

  const exportLogsMutation = useMutation({
    mutationFn: async () => {
      const adminToken = localStorage.getItem("adminToken");
      const res = await fetch("/api/admin/export-logs", {
        method: "POST",
        headers: { ...(adminToken ? { "X-Admin-Token": adminToken } : {}) },
        credentials: "include",
      });
      if (!res.ok) throw new Error((await res.json()).message || "Export failed");
      return res.json();
    },
    onSuccess: (data) => {
      if (data.sent === 0) {
        toast({ title: "📭 No data", description: "Database mein abhi koi logs nahi hain" });
      } else {
        toast({ title: "✅ CSV Sent!", description: `${data.sent} records Telegram pe bhej diye gaye (CSV + summary)` });
      }
    },
    onError: (e: any) => toast({ variant: "destructive", title: "Export Failed", description: e.message }),
  });

  const tgBroadcastMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/admin/telegram/broadcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: tgBroadcastText,
          buttons: tgBroadcastButtons.filter(b => b.label && b.url),
          mediaUrl: tgBroadcastMediaUrl || undefined,
          mediaType: tgBroadcastMediaType,
        }),
      });
      if (!res.ok) throw new Error((await res.json()).message || "Failed");
      return res.json();
    },
    onSuccess: (data) => {
      setTgBroadcastResult({ sent: data.sent, failed: data.failed, total: data.total, failedIds: data.failedIds || [] });
      toast({ title: `📢 Broadcast complete!`, description: `✅ ${data.sent} delivered | ❌ ${data.failed} failed out of ${data.total} users` });
      setTgBroadcastText(""); setTgBroadcastButtons([]); setTgBroadcastMediaUrl(""); setTgBroadcastMediaType("IMAGE");
    },
    onError: (e: any) => toast({ variant: "destructive", title: "Broadcast Failed", description: e.message }),
  });

  const { data: serviceConfig = {}, refetch: refetchServiceConfig } = useQuery<Record<string, boolean>>({
    queryKey: ["/api/admin/services"],
    enabled: isLoggedIn,
    queryFn: async () => {
      const adminToken = localStorage.getItem("adminToken");
      const res = await fetch("/api/admin/services", {
        headers: { ...(adminToken ? { "X-Admin-Token": adminToken } : {}) },
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch service config");
      return res.json();
    },
  });

  const { data: availabilityConfig = {}, refetch: refetchAvailabilityConfig } = useQuery<Record<string, boolean>>({
    queryKey: ["/api/admin/availability"],
    enabled: isLoggedIn,
    queryFn: async () => {
      const adminToken = localStorage.getItem("adminToken");
      const res = await fetch("/api/admin/availability", {
        headers: { ...(adminToken ? { "X-Admin-Token": adminToken } : {}) },
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch availability config");
      return res.json();
    },
  });

  const toggleAvailabilityMutation = useMutation({
    mutationFn: async ({ service, comingSoon }: { service: string; comingSoon: boolean }) => {
      const adminToken = localStorage.getItem("adminToken");
      const res = await fetch("/api/admin/availability", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(adminToken ? { "X-Admin-Token": adminToken } : {}) },
        credentials: "include",
        body: JSON.stringify({ service, comingSoon }),
      });
      if (!res.ok) throw new Error("Failed to update availability");
    },
    onSuccess: () => {
      refetchAvailabilityConfig();
      queryClient.invalidateQueries({ queryKey: ["/api/services/availability"] });
      toast({ title: "Service availability updated" });
    },
    onError: (e: any) => toast({ variant: "destructive", title: "Update failed", description: e.message }),
  });

  const toggleServiceMutation = useMutation({
    mutationFn: async ({ service, enabled, reason }: { service: string; enabled: boolean; reason?: string }) => {
      const adminToken = localStorage.getItem("adminToken");
      const res = await fetch("/api/admin/services", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(adminToken ? { "X-Admin-Token": adminToken } : {}) },
        credentials: "include",
        body: JSON.stringify({ service, enabled, reason }),
      });
      if (!res.ok) throw new Error("Failed to update service");
      return res.json();
    },
    onSuccess: (_data, variables) => {
      refetchServiceConfig();
      queryClient.invalidateQueries({ queryKey: ["/api/services/status"] });
      if (variables.enabled) {
        setServiceReasonDraft(prev => { const n = { ...prev }; delete n[variables.service]; return n; });
      }
      toast({ title: `Service ${variables.enabled ? "enabled" : "disabled"}` });
    },
    onError: (e: any) => toast({ variant: "destructive", title: "Error", description: e.message }),
  });

  const saveServiceReasonMutation = useMutation({
    mutationFn: async ({ service, reason }: { service: string; reason: string }) => {
      const adminToken = localStorage.getItem("adminToken");
      const res = await fetch("/api/admin/service-reason", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(adminToken ? { "X-Admin-Token": adminToken } : {}) },
        credentials: "include",
        body: JSON.stringify({ service, reason }),
      });
      if (!res.ok) throw new Error("Failed to save reason");
      return res.json();
    },
    onSuccess: () => {
      refetchServiceConfig();
      queryClient.invalidateQueries({ queryKey: ["/api/services/status"] });
      toast({ title: "Reason saved" });
    },
    onError: (e: any) => toast({ variant: "destructive", title: "Error", description: e.message }),
  });

  const onSubmit = async (values: LoginForm) => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (res.ok) {
        const data = await res.json();
        toast({
          title: "Access Granted",
          description: "Welcome to the secure terminal.",
        });
        localStorage.setItem("adminLoggedIn", "1");
        if (data.token) localStorage.setItem("adminToken", data.token);
        setIsLoggedIn(true);
      } else {
        let msg = "Invalid credentials";
        try {
          const data = await res.json();
          msg = data.message || msg;
        } catch {
          msg = res.status === 401 ? "Invalid credentials" : `Server error (${res.status})`;
        }
        throw new Error(msg);
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Access Denied",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const blockUserMutation = useMutation({
    mutationFn: async ({ userId, blocked }: { userId: string; blocked: boolean }) => {
      const res = await fetch(`/api/admin/users/${userId}/block`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ blocked }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      toast({ title: "User status updated" });
    },
  });

  const blockIpMutation = useMutation({
    mutationFn: async ({ userId, blockIp }: { userId: string; blockIp: boolean }) => {
      const res = await fetch(`/api/admin/users/${userId}/block`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ blocked: false, blockIp }),
      });
      if (!res.ok) throw new Error("Failed to update IP status");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      toast({ title: "IP status updated" });
    },
  });

  const filteredUsers = users?.filter(user => 
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.lastIp?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isVerifying) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#050314" }}>
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-violet-500/30 border-t-violet-500 animate-spin" />
          <p className="text-white/30 text-xs">Verifying session...</p>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden" style={{ background: "#050314" }}>
        {/* Ambient orbs */}
        <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full opacity-20 pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(139,92,246,0.4) 0%, transparent 70%)", filter: "blur(80px)" }} />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full opacity-15 pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(168,85,247,0.4) 0%, transparent 70%)", filter: "blur(80px)" }} />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md relative z-10"
        >
          <div className="rounded-2xl border border-white/[0.08] overflow-hidden" style={{ background: "#09051A" }}>
            <div className="h-px w-full bg-gradient-to-r from-transparent via-violet-500/50 to-transparent" />
            <div className="p-8">
              <div className="flex flex-col items-center text-center mb-7">
                <div className="icon3d t-violet w-20 h-20 rounded-3xl mb-4">
                  <span className="e text-4xl select-none">🛡️</span>
                </div>
                <h1 className="text-2xl font-bold text-white mb-1">Admin Console</h1>
                <p className="text-sm text-white/40">Restricted access — Level 4 clearance required</p>
              </div>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-white/60">Operator ID</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            autoComplete="off"
                            className="h-11 bg-white/[0.04] border-white/[0.1] focus:border-violet-500 text-white placeholder:text-white/25 rounded-xl"
                            placeholder="Enter operator ID..."
                          />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-white/60">Access Key</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type="password"
                              {...field}
                              className="h-11 bg-white/[0.04] border-white/[0.1] focus:border-violet-500 text-white placeholder:text-white/25 rounded-xl pr-10"
                              placeholder="••••••••"
                            />
                            <Lock className="absolute right-3 top-3 w-4 h-4 text-white/20" />
                          </div>
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-11 rounded-xl font-semibold text-white text-sm transition-all duration-150 disabled:opacity-50 relative overflow-hidden active:translate-y-[3px]"
                    style={{
                      background: "linear-gradient(145deg, #9F67FA, #7C3AED)",
                      boxShadow: "0 6px 0 rgba(67,20,180,0.9), 0 8px 24px rgba(139,92,246,0.45)"
                    }}
                    data-testid="button-admin-login"
                  >
                    <span className="absolute inset-0 rounded-xl bg-gradient-to-b from-white/[0.18] to-transparent pointer-events-none" />
                    {isLoading ? "Authenticating..." : "Access Console"}
                  </button>
                </form>
              </Form>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex" style={{ background: "#050314" }}>
      {/* Ambient orbs */}
      <div className="fixed top-0 left-0 w-[700px] h-[500px] rounded-full opacity-20 pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(139,92,246,0.35) 0%, transparent 70%)", filter: "blur(100px)" }} />
      <div className="fixed bottom-0 right-0 w-[400px] h-[400px] rounded-full opacity-10 pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(168,85,247,0.5) 0%, transparent 70%)", filter: "blur(80px)" }} />

      {/* ── MOBILE SIDEBAR OVERLAY ── */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-[200] lg:hidden" onClick={() => setMobileSidebarOpen(false)}>
          <div className="absolute inset-0 bg-black/70" />
          <aside
            className="absolute left-0 top-0 h-full w-[260px] flex flex-col z-10"
            style={{ background: "rgba(9,5,26,0.99)", borderRight: "1px solid rgba(255,255,255,0.06)" }}
            onClick={e => e.stopPropagation()}
          >
            <div className="h-px w-full bg-gradient-to-r from-transparent via-violet-500/50 to-transparent" />
            <div className="flex items-center justify-between px-4 py-5 border-b border-white/[0.05]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center"
                  style={{ boxShadow: "0 0 14px rgba(139,92,246,0.3)" }}>
                  <ShieldCheck className="w-4 h-4 text-violet-400" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">TWH_OSINT</div>
                  <div className="text-[9px] text-violet-400/60 uppercase tracking-widest">Admin Console</div>
                </div>
              </div>
              <button onClick={() => setMobileSidebarOpen(false)} className="p-1.5 rounded-lg text-white/40 hover:text-white/70">
                <X className="w-4 h-4" />
              </button>
            </div>
            <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
              {([
                { icon: <Activity className="w-3.5 h-3.5" />, label: "Dashboard", section: "dashboard", action: () => { setActiveSection("dashboard"); setSelectedUserForDetail(null); setMobileSidebarOpen(false); } },
                { icon: <Users className="w-3.5 h-3.5" />, label: "Users", section: "users", action: () => { setActiveSection("users"); setSelectedUserForDetail(null); setMobileSidebarOpen(false); } },
                { icon: <Terminal className="w-3.5 h-3.5" />, label: "Queries", section: "logs", action: () => { setActiveSection("logs"); setSelectedUserForDetail(null); setMobileSidebarOpen(false); } },
                { icon: <ShieldAlert className="w-3.5 h-3.5" />, label: "IP Management", section: null, action: () => { setIsIpBlockedOpen(true); setMobileSidebarOpen(false); } },
                { icon: <Bot className="w-3.5 h-3.5" />, label: "Telegram", section: null, action: () => { setIsTelegramOpen(true); setMobileSidebarOpen(false); } },
                { icon: <Megaphone className="w-3.5 h-3.5" />, label: "Broadcasts", section: null, action: () => { setIsBroadcastOpen(true); setMobileSidebarOpen(false); } },
                { icon: <Bell className="w-3.5 h-3.5" />, label: "Notify All", section: null, action: () => { setIsBroadcastNotifOpen(true); setMobileSidebarOpen(false); } },
                { icon: <MonitorPlay className="w-3.5 h-3.5" />, label: "Ads Manager", section: "ads", action: () => { setActiveSection("ads"); setSelectedUserForDetail(null); setMobileSidebarOpen(false); } },
                { icon: <ShieldCheck className="w-3.5 h-3.5" />, label: "Protected", section: null, action: () => { setIsProtectedModalOpen(true); setMobileSidebarOpen(false); } },
                { icon: <Ban className="w-3.5 h-3.5" />, label: "Blocked Users", section: null, action: () => { setIsBlockedUsersOpen(true); setMobileSidebarOpen(false); } },
                { icon: <TrendingUp className="w-3.5 h-3.5" />, label: "Reports", section: "reports", action: () => { setActiveSection("reports"); setSelectedUserForDetail(null); setMobileSidebarOpen(false); } },
                { icon: <FileText className="w-3.5 h-3.5" />, label: "Logs", section: "logs", action: () => { setActiveSection("logs"); setSelectedUserForDetail(null); setMobileSidebarOpen(false); } },
                { icon: <Power className="w-3.5 h-3.5" />, label: "Services", section: "services", action: () => { setActiveSection("services"); setSelectedUserForDetail(null); setMobileSidebarOpen(false); } },
                { icon: <Crown className="w-3.5 h-3.5" />, label: "Premium Users", section: "premium", action: () => { setActiveSection("premium"); setSelectedUserForDetail(null); setMobileSidebarOpen(false); } },
              ] as const).map(({ icon, label, section, action }) => {
                const isActive = section !== null && activeSection === section;
                return (
                  <button key={label} onClick={action}
                    className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs transition-all text-left ${
                      isActive ? "bg-violet-600/20 text-violet-300 border border-violet-500/30"
                               : "text-white/40 hover:text-white/70 hover:bg-white/[0.04] border border-transparent"
                    }`}>
                    <span className={isActive ? "text-violet-400" : "text-white/25"}>{icon}</span>
                    {label}
                  </button>
                );
              })}
            </nav>
          </aside>
        </div>
      )}

      {/* ── SIDEBAR (desktop only) ── */}
      <aside className="hidden lg:flex w-[220px] shrink-0 flex-col border-r border-white/[0.05] fixed left-0 top-0 h-full z-20"
        style={{ background: "rgba(9,5,26,0.97)", backdropFilter: "blur(20px)" }}>
        <div className="h-px w-full bg-gradient-to-r from-transparent via-violet-500/50 to-transparent" />
        <div className="flex items-center gap-2.5 px-4 py-5 border-b border-white/[0.05]">
          <div className="w-8 h-8 rounded-xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center"
            style={{ boxShadow: "0 0 14px rgba(139,92,246,0.3)" }}>
            <ShieldCheck className="w-4 h-4 text-violet-400" />
          </div>
          <div>
            <div className="text-xs font-bold text-white">TWH_OSINT</div>
            <div className="text-[9px] text-violet-400/60 uppercase tracking-widest">Admin Console</div>
          </div>
        </div>
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {([
            { icon: <Activity className="w-3.5 h-3.5" />, label: "Dashboard", section: "dashboard", action: () => { setActiveSection("dashboard"); setSelectedUserForDetail(null); } },
            { icon: <Users className="w-3.5 h-3.5" />, label: "Users", section: "users", action: () => { setActiveSection("users"); setSelectedUserForDetail(null); } },
            { icon: <Terminal className="w-3.5 h-3.5" />, label: "Queries", section: "logs", action: () => { setActiveSection("logs"); setSelectedUserForDetail(null); } },
            { icon: <ShieldAlert className="w-3.5 h-3.5" />, label: "IP Management", section: null, action: () => setIsIpBlockedOpen(true) },
            { icon: <Bot className="w-3.5 h-3.5" />, label: "Telegram", section: null, action: () => setIsTelegramOpen(true) },
            { icon: <Megaphone className="w-3.5 h-3.5" />, label: "Broadcasts", section: null, action: () => setIsBroadcastOpen(true) },
            { icon: <Bell className="w-3.5 h-3.5" />, label: "Notify All", section: null, action: () => setIsBroadcastNotifOpen(true) },
            { icon: <MonitorPlay className="w-3.5 h-3.5" />, label: "Ads Manager", section: "ads", action: () => { setActiveSection("ads"); setSelectedUserForDetail(null); } },
            { icon: <ShieldCheck className="w-3.5 h-3.5" />, label: "Protected", section: null, action: () => setIsProtectedModalOpen(true) },
            { icon: <Ban className="w-3.5 h-3.5" />, label: "Blocked Users", section: null, action: () => setIsBlockedUsersOpen(true) },
            { icon: <TrendingUp className="w-3.5 h-3.5" />, label: "Reports", section: "reports", action: () => { setActiveSection("reports"); setSelectedUserForDetail(null); } },
            { icon: <FileText className="w-3.5 h-3.5" />, label: "Logs", section: "logs", action: () => { setActiveSection("logs"); setSelectedUserForDetail(null); } },
            { icon: <Power className="w-3.5 h-3.5" />, label: "Services", section: "services", action: () => { setActiveSection("services"); setSelectedUserForDetail(null); } },
            { icon: <Crown className="w-3.5 h-3.5" />, label: "Premium Users", section: "premium", action: () => { setActiveSection("premium"); setSelectedUserForDetail(null); } },
          ]).map(({ icon, label, section, action }) => {
            const isActive = section !== null && activeSection === section;
            return (
              <button key={label} onClick={action}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs transition-all text-left ${
                  isActive ? "bg-violet-600/20 text-violet-300 border border-violet-500/30"
                           : "text-white/40 hover:text-white/70 hover:bg-white/[0.04] border border-transparent"
                }`}>
                <span className={isActive ? "text-violet-400" : "text-white/25"}>{icon}</span>
                {label}
              </button>
            );
          })}
        </nav>
        <div className="p-3 border-t border-white/[0.05]">
          <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-violet-500/10 border border-violet-500/20">
            <div className="w-7 h-7 rounded-lg bg-violet-600/30 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-3.5 h-3.5 text-violet-400" />
            </div>
            <div className="min-w-0">
              <div className="text-[10px] font-bold text-white">Admin</div>
              <div className="text-[8px] text-violet-400/60 uppercase tracking-widest">Super Administrator</div>
            </div>
          </div>
        </div>
      </aside>

      {/* ── MAIN CONTENT ── */}
      <div className="flex-1 overflow-auto min-w-0 lg:ml-[220px]">

        {/* Mobile top bar — hamburger menu */}
        <div className="flex lg:hidden items-center justify-between px-4 py-3 border-b border-white/[0.06] sticky top-0 z-10"
          style={{ background: "rgba(9,5,26,0.98)", backdropFilter: "blur(12px)" }}>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-violet-400" />
            <span className="text-sm font-bold text-white">Admin Console</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-violet-300 uppercase tracking-widest px-2 py-0.5 rounded-full bg-violet-500/15 border border-violet-500/30">
              {activeSection}
            </span>
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="p-2 rounded-xl border border-white/[0.08] bg-white/[0.04] text-white/60 hover:text-white active:scale-95 transition-all"
              style={{ touchAction: "manipulation" }}
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-10 space-y-8 relative">

          {/* ── HEADER ── */}
          <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-8 border-b border-white/[0.08]">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Welcome back, Admin</h1>
                <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-violet-500/15 border border-violet-500/30">
                  <ShieldCheck className="w-3 h-3 text-violet-400" />
                  <span className="text-[9px] font-bold text-violet-300 uppercase tracking-widest">Verified</span>
                </div>
              </div>
              <p className="text-white/35 text-xs">
                {new Date().toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
                &nbsp;·&nbsp;<span className="text-green-400/80">System Operational</span>
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => exportLogsMutation.mutate()}
                disabled={exportLogsMutation.isPending}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-blue-500/30 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 text-xs transition-all disabled:opacity-50"
                title="Abhi ka poora data CSV banake Telegram pe bhejo (delete nahi hoga)"
              >
                {exportLogsMutation.isPending
                  ? <><span className="animate-spin text-sm">⟳</span> Exporting...</>
                  : <><span>📤</span> Export CSV</>}
              </button>
              <button
                onClick={() => {
                  refetchUsers();
                  refetchStats();
                  refetchLiveFeed();
                  refetchCharts();
                  refetchBroadcasts();
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/[0.1] bg-white/[0.04] text-white/50 hover:text-white hover:bg-white/[0.08] text-xs transition-all"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Refresh
              </button>
              <Button
                variant="ghost"
                onClick={() => { localStorage.removeItem("adminLoggedIn"); localStorage.removeItem("adminToken"); setLocation("/"); }}
                className="text-white/50 hover:text-white border border-white/[0.1] hover:border-white/20 hover:bg-white/[0.05] text-xs h-8 px-3"
              >
                <ArrowLeft className="w-3.5 h-3.5 mr-1.5" /> Exit
              </Button>
            </div>
          </header>

          {activeSection === "dashboard" && (<>
          {/* ── KPI CARDS ROW 1 ── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="rounded-2xl border border-white/[0.07] p-6 relative overflow-hidden hover:border-violet-500/30 transition-all"
              style={{ background: "linear-gradient(135deg, rgba(139,92,246,0.08) 0%, rgba(9,5,26,0.9) 100%)" }}>
              <div className="absolute top-0 right-0 w-24 h-24 rounded-full opacity-20 pointer-events-none"
                style={{ background: "radial-gradient(circle, rgba(139,92,246,0.6) 0%, transparent 70%)", filter: "blur(20px)" }} />
              <div className="flex items-start justify-between mb-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-violet-500/15 border border-violet-500/25">
                  <Users className="w-4 h-4 text-violet-400" />
                </div>
                <span className="text-[9px] text-green-400 bg-green-500/10 border border-green-500/20 px-1.5 py-0.5 rounded-full font-bold">LIVE</span>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-white mb-0.5">{adminStats?.totalUsers ?? users?.length ?? 0}</div>
              <div className="text-[10px] text-white/40 uppercase tracking-widest">Total Users</div>
            </div>

            <div className="rounded-2xl border border-red-500/20 p-6 relative overflow-hidden cursor-pointer hover:border-red-500/40 transition-all"
              style={{ background: "linear-gradient(135deg, rgba(239,68,68,0.06) 0%, rgba(9,5,26,0.9) 100%)" }}
              onClick={() => setIsBlockedUsersOpen(true)}>
              <div className="absolute top-0 right-0 w-24 h-24 rounded-full opacity-15 pointer-events-none"
                style={{ background: "radial-gradient(circle, rgba(239,68,68,0.6) 0%, transparent 70%)", filter: "blur(20px)" }} />
              <div className="flex items-start justify-between mb-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-red-500/15 border border-red-500/25">
                  <Ban className="w-4 h-4 text-red-400" />
                </div>
                <span className="text-[9px] text-red-400/80 bg-red-500/10 border border-red-500/20 px-1.5 py-0.5 rounded-full font-bold">MANAGE →</span>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-red-400 mb-0.5">{adminStats?.blockedUsers ?? 0}</div>
              <div className="text-[10px] text-white/40 uppercase tracking-widest">Blocked Users</div>
            </div>

            <div className="rounded-2xl border border-orange-500/20 p-6 relative overflow-hidden cursor-pointer hover:border-orange-500/40 transition-all"
              style={{ background: "linear-gradient(135deg, rgba(249,115,22,0.06) 0%, rgba(9,5,26,0.9) 100%)" }}
              onClick={() => setIsIpBlockedOpen(true)}>
              <div className="absolute top-0 right-0 w-24 h-24 rounded-full opacity-15 pointer-events-none"
                style={{ background: "radial-gradient(circle, rgba(249,115,22,0.6) 0%, transparent 70%)", filter: "blur(20px)" }} />
              <div className="flex items-start justify-between mb-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-orange-500/15 border border-orange-500/25">
                  <ShieldAlert className="w-4 h-4 text-orange-400" />
                </div>
                <span className="text-[9px] text-orange-400/80 bg-orange-500/10 border border-orange-500/20 px-1.5 py-0.5 rounded-full font-bold">MANAGE →</span>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-orange-400 mb-0.5">{adminStats?.ipBlockedUsers ?? 0}</div>
              <div className="text-[10px] text-white/40 uppercase tracking-widest">IP Blocked</div>
            </div>

            <div className="rounded-2xl border border-white/[0.07] p-6 relative overflow-hidden hover:border-blue-500/20 transition-all"
              style={{ background: "linear-gradient(135deg, rgba(59,130,246,0.06) 0%, rgba(9,5,26,0.9) 100%)" }}>
              <div className="absolute top-0 right-0 w-24 h-24 rounded-full opacity-15 pointer-events-none"
                style={{ background: "radial-gradient(circle, rgba(59,130,246,0.5) 0%, transparent 70%)", filter: "blur(20px)" }} />
              <div className="flex items-start justify-between mb-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-blue-500/15 border border-blue-500/25">
                  <Search className="w-4 h-4 text-blue-400" />
                </div>
                <span className="text-[9px] text-blue-400/70 bg-blue-500/10 border border-blue-500/20 px-1.5 py-0.5 rounded-full font-bold">TODAY</span>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-white mb-0.5">{adminStats?.queriesToday ?? 0}</div>
              <div className="text-[10px] text-white/40 uppercase tracking-widest">Queries Today</div>
            </div>
          </div>

          {/* ── KPI CARDS ROW 2 ── */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
            <div className="rounded-2xl border border-violet-500/20 p-5 cursor-pointer hover:border-violet-500/40 hover:bg-violet-500/5 transition-all"
              style={{ background: "rgba(9,5,26,0.7)" }} onClick={() => setIsProtectedModalOpen(true)}>
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-8 h-8 rounded-xl bg-violet-500/15 border border-violet-500/25 flex items-center justify-center">
                  <ShieldCheck className="w-3.5 h-3.5 text-violet-400" />
                </div>
                <span className="text-[10px] text-white/40 uppercase tracking-widest font-semibold">Protected</span>
              </div>
              <div className="text-2xl font-black text-white">{protectedNumbersList?.length || 0}</div>
              <div className="text-[10px] text-violet-400/60 mt-1">Targets shielded</div>
            </div>
            <div className="rounded-2xl border border-fuchsia-500/20 p-5 cursor-pointer hover:border-fuchsia-500/40 hover:bg-fuchsia-500/5 transition-all"
              style={{ background: "rgba(9,5,26,0.7)" }} onClick={() => setIsBroadcastOpen(true)}>
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-8 h-8 rounded-xl bg-fuchsia-500/15 border border-fuchsia-500/25 flex items-center justify-center">
                  <Megaphone className="w-3.5 h-3.5 text-fuchsia-400" />
                </div>
                <span className="text-[10px] text-white/40 uppercase tracking-widest font-semibold">Broadcasts</span>
              </div>
              <div className="text-2xl font-black text-white">{broadcastList.length}</div>
              <div className="text-[10px] text-fuchsia-400/60 mt-1">Active alerts</div>
            </div>
            <div className="rounded-2xl border border-blue-500/25 p-5 cursor-pointer hover:border-blue-500/40 hover:bg-blue-500/5 transition-all relative overflow-hidden"
              style={{ background: "rgba(9,5,26,0.7)" }} onClick={() => setIsTelegramOpen(true)}>
              <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-transparent via-blue-400/50 to-transparent" />
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-blue-500/15 border border-blue-500/25 flex items-center justify-center">
                    <Bot className="w-3.5 h-3.5 text-blue-400" />
                  </div>
                  <span className="text-[10px] text-white/40 uppercase tracking-widest font-semibold">Telegram</span>
                </div>
                {(tgSettings?.adminChatIds?.length ?? 0) > 0 && (
                  <span className="text-[9px] font-mono bg-blue-500/20 text-blue-300 border border-blue-500/30 px-2 py-0.5 rounded-full">
                    {tgSettings!.adminChatIds.length} admin{tgSettings!.adminChatIds.length > 1 ? "s" : ""}
                  </span>
                )}
              </div>
              <div className={`text-2xl font-black ${tgSettings?.botTokenSet ? "text-blue-300" : "text-white/30"}`}>
                {tgSettings?.botTokenSet ? "ONLINE" : "OFFLINE"}
              </div>
              <div className="flex items-center gap-1.5 mt-1">
                <div className={`w-1.5 h-1.5 rounded-full ${tgSettings?.botTokenSet ? "bg-blue-400 animate-pulse" : "bg-white/20"}`} />
                <span className="text-[10px] text-blue-400/60">
                  {tgSettings?.botTokenSet
                    ? `Bot active · ${tgSettings?.adminChatIds?.length ?? 0} admin${(tgSettings?.adminChatIds?.length ?? 0) !== 1 ? "s" : ""} receiving alerts`
                    : "Bot not configured · Click to setup"}
                </span>
              </div>
            </div>
            <div className="rounded-2xl border border-blue-400/30 p-5 cursor-pointer hover:border-blue-400/50 hover:bg-blue-500/5 transition-all relative overflow-hidden"
              style={{ background: "rgba(9,5,26,0.7)" }} onClick={() => setIsTgUsersOpen(true)}>
              <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-transparent via-blue-300/60 to-transparent" />
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-8 h-8 rounded-xl bg-blue-400/15 border border-blue-400/25 flex items-center justify-center">
                  <Users className="w-3.5 h-3.5 text-blue-300" />
                </div>
                <span className="text-[10px] text-white/40 uppercase tracking-widest font-semibold">TG Users</span>
              </div>
              <div className="text-2xl font-black text-blue-300">{tgLinkedUsers.length}</div>
              <div className="text-[10px] text-blue-400/60 mt-1">Linked accounts</div>
            </div>
          </div>

          {/* ── ANALYTICS: LIVE FEED + CHARTS ── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

            {/* Live Query Feed */}
            <div className="rounded-2xl overflow-hidden relative"
              style={{
                background: "linear-gradient(135deg, rgba(13,7,36,0.95) 0%, rgba(9,5,26,0.98) 100%)",
                backdropFilter: "blur(20px)",
                border: "1px solid rgba(139,92,246,0.35)",
                boxShadow: "0 0 40px rgba(139,92,246,0.12), inset 0 1px 0 rgba(139,92,246,0.15)",
              }}>
              {/* top accent line */}
              <div className="absolute top-0 left-0 right-0 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(139,92,246,0.8), rgba(192,132,252,0.5), transparent)" }} />
              <div className="flex items-center justify-between px-5 py-4 border-b"
                style={{ borderColor: "rgba(139,92,246,0.15)", background: "linear-gradient(90deg, rgba(139,92,246,0.1) 0%, rgba(139,92,246,0.03) 60%, transparent 100%)" }}>
                <div className="flex items-center gap-2.5">
                  <div className="relative">
                    <div className="w-2.5 h-2.5 rounded-full bg-violet-400"
                      style={{ boxShadow: "0 0 8px rgba(139,92,246,1), 0 0 16px rgba(139,92,246,0.5)" }} />
                  </div>
                  <span className="text-[11px] uppercase tracking-widest font-bold"
                    style={{ color: "rgba(196,181,253,0.9)", textShadow: "0 0 12px rgba(139,92,246,0.6)" }}>Live Query Feed</span>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => refetchLiveFeed()}
                    disabled={isLiveFeedLoading}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider transition-all"
                    style={{ background: "rgba(139,92,246,0.15)", border: "1px solid rgba(139,92,246,0.35)", color: "rgba(196,181,253,0.9)" }}>
                    <RefreshCw className={`w-2.5 h-2.5 ${isLiveFeedLoading ? "animate-spin" : ""}`} />
                    Refresh
                  </button>
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
                    style={{ background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.25)" }}>
                    <div className="w-1 h-1 rounded-full bg-violet-400" />
                    <span className="text-[9px] text-violet-300/70 font-mono">{liveFeed.length} queries</span>
                  </div>
                </div>
              </div>
              <div ref={feedRef} className="h-[280px] overflow-y-auto p-3 space-y-1.5"
                style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(139,92,246,0.2) transparent" }}>
                {liveFeed.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full gap-3">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
                      style={{ background: "rgba(139,92,246,0.08)", border: "1px solid rgba(139,92,246,0.2)", boxShadow: "0 0 20px rgba(139,92,246,0.1)" }}>
                      <Zap className="w-5 h-5" style={{ color: "rgba(139,92,246,0.4)" }} />
                    </div>
                    <p className="text-[10px] uppercase tracking-widest" style={{ color: "rgba(139,92,246,0.3)" }}>Awaiting live queries...</p>
                  </div>
                ) : (
                  <AnimatePresence initial={false}>
                    {liveFeed.map((ev, i) => {
                      const svcConfig: Record<string, { color: string; glow: string; borderColor: string; bg: string; emoji: string; barColor: string }> = {
                        mobile: { color: "#4ade80", glow: "rgba(74,222,128,0.4)", borderColor: "rgba(74,222,128,0.3)", bg: "rgba(74,222,128,0.06)", emoji: "📱", barColor: "rgba(74,222,128,0.8)" },
                        aadhar: { color: "#60a5fa", glow: "rgba(96,165,250,0.4)", borderColor: "rgba(96,165,250,0.3)", bg: "rgba(96,165,250,0.06)", emoji: "🪪", barColor: "rgba(96,165,250,0.8)" },
                        vehicle: { color: "#fbbf24", glow: "rgba(251,191,36,0.4)", borderColor: "rgba(251,191,36,0.3)", bg: "rgba(251,191,36,0.06)", emoji: "🚗", barColor: "rgba(251,191,36,0.8)" },
                        ip: { color: "#c084fc", glow: "rgba(192,132,252,0.4)", borderColor: "rgba(192,132,252,0.3)", bg: "rgba(192,132,252,0.06)", emoji: "🌐", barColor: "rgba(192,132,252,0.8)" },
                      };
                      const cfg = svcConfig[ev.service] || { color: "rgba(255,255,255,0.5)", glow: "transparent", borderColor: "rgba(255,255,255,0.1)", bg: "rgba(255,255,255,0.03)", emoji: "🔍", barColor: "rgba(255,255,255,0.3)" };
                      return (
                        <motion.div key={i} initial={{ opacity: 0, x: -12, scale: 0.98 }} animate={{ opacity: 1, x: 0, scale: 1 }} transition={{ duration: 0.2 }}
                          className="flex items-center gap-2 text-[10px] px-3 py-2 rounded-xl transition-all group cursor-default"
                          style={{ background: i === 0 ? cfg.bg : "rgba(255,255,255,0.015)", border: `1px solid ${i === 0 ? cfg.borderColor : "rgba(255,255,255,0.04)"}`, boxShadow: i === 0 ? `0 0 12px ${cfg.glow}` : "none" }}>
                          <div className="shrink-0 w-6 h-6 rounded-lg flex items-center justify-center text-[11px]"
                            style={{ background: cfg.bg, border: `1px solid ${cfg.borderColor}`, boxShadow: `0 0 8px ${cfg.glow}` }}>
                            {cfg.emoji}
                          </div>
                          <span className="shrink-0 font-black uppercase text-[9px] tracking-wider w-12"
                            style={{ color: cfg.color, textShadow: `0 0 8px ${cfg.glow}` }}>{ev.service}</span>
                          <span className="text-white/50 truncate flex-1 font-mono">{ev.query}</span>
                          <span className="shrink-0 text-white/25 text-[8px] font-mono">{ev.username?.slice(0, 10)}</span>
                          <div className="shrink-0 flex items-center gap-1.5">
                            <div className="w-1.5 h-1.5 rounded-full" style={{ background: cfg.barColor, boxShadow: `0 0 4px ${cfg.glow}` }} />
                            <span className="text-white/20 text-[8px] font-mono">{new Date(ev.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}</span>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                )}
              </div>
            </div>

            {/* Usage Charts */}
            <div className="rounded-2xl overflow-hidden relative"
              style={{
                background: "linear-gradient(135deg, rgba(13,7,36,0.95) 0%, rgba(9,5,26,0.98) 100%)",
                backdropFilter: "blur(20px)",
                border: "1px solid rgba(139,92,246,0.35)",
                boxShadow: "0 0 40px rgba(139,92,246,0.12), inset 0 1px 0 rgba(139,92,246,0.15)",
              }}>
              <div className="absolute top-0 left-0 right-0 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(139,92,246,0.8), rgba(192,132,252,0.5), transparent)" }} />
              <div className="flex items-center justify-between px-5 py-4 border-b"
                style={{ borderColor: "rgba(139,92,246,0.15)", background: "linear-gradient(90deg, rgba(139,92,246,0.1) 0%, rgba(139,92,246,0.03) 60%, transparent 100%)" }}>
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-xl flex items-center justify-center"
                    style={{ background: "rgba(139,92,246,0.15)", border: "1px solid rgba(139,92,246,0.3)", boxShadow: "0 0 12px rgba(139,92,246,0.2)" }}>
                    <TrendingUp className="w-3.5 h-3.5" style={{ color: "rgba(196,181,253,0.9)" }} />
                  </div>
                  <span className="text-[11px] uppercase tracking-widest font-bold"
                    style={{ color: "rgba(196,181,253,0.9)", textShadow: "0 0 12px rgba(139,92,246,0.6)" }}>Query Analytics</span>
                </div>
                <div className="flex gap-1">
                  {[7, 14, 30].map(d => (
                    <button key={d} onClick={() => setChartDays(d)}
                      className="text-[9px] uppercase px-2.5 py-1 rounded-lg border transition-all font-bold"
                      style={chartDays === d ? {
                        borderColor: "rgba(139,92,246,0.6)",
                        background: "rgba(139,92,246,0.2)",
                        color: "rgba(196,181,253,1)",
                        boxShadow: "0 0 10px rgba(139,92,246,0.3), inset 0 0 10px rgba(139,92,246,0.1)",
                      } : {
                        borderColor: "rgba(255,255,255,0.08)",
                        color: "rgba(255,255,255,0.3)",
                      }}>
                      {d}D
                    </button>
                  ))}
                </div>
              </div>
              <div className="p-4 pt-3">
                <ResponsiveContainer width="100%" height={215}>
                  <BarChart data={chartData} margin={{ top: 8, right: 8, bottom: 4, left: -18 }} barCategoryGap="30%">
                    <defs>
                      {/* Gradients */}
                      <linearGradient id="gradMobile" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#4ade80" stopOpacity="1" />
                        <stop offset="100%" stopColor="#4ade80" stopOpacity="0.25" />
                      </linearGradient>
                      <linearGradient id="gradAadhar" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#60a5fa" stopOpacity="1" />
                        <stop offset="100%" stopColor="#60a5fa" stopOpacity="0.25" />
                      </linearGradient>
                      <linearGradient id="gradVehicle" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#fbbf24" stopOpacity="1" />
                        <stop offset="100%" stopColor="#fbbf24" stopOpacity="0.25" />
                      </linearGradient>
                      <linearGradient id="gradIp" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#c084fc" stopOpacity="1" />
                        <stop offset="100%" stopColor="#c084fc" stopOpacity="0.25" />
                      </linearGradient>
                      {/* Glow filters */}
                      <filter id="glowMobile" x="-30%" y="-30%" width="160%" height="160%">
                        <feGaussianBlur stdDeviation="3.5" result="blur" />
                        <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                      </filter>
                      <filter id="glowBlue" x="-30%" y="-30%" width="160%" height="160%">
                        <feGaussianBlur stdDeviation="3.5" result="blur" />
                        <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                      </filter>
                      <filter id="glowYellow" x="-30%" y="-30%" width="160%" height="160%">
                        <feGaussianBlur stdDeviation="3.5" result="blur" />
                        <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                      </filter>
                      <filter id="glowPurple" x="-30%" y="-30%" width="160%" height="160%">
                        <feGaussianBlur stdDeviation="3.5" result="blur" />
                        <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                      </filter>
                    </defs>
                    <CartesianGrid strokeDasharray="3 6" stroke="rgba(139,92,246,0.08)" vertical={false} />
                    <XAxis dataKey="date" tick={{ fill: "rgba(139,92,246,0.55)", fontSize: 9, fontFamily: "monospace" }} tickFormatter={(v) => v.slice(5)} axisLine={{ stroke: "rgba(139,92,246,0.12)" }} tickLine={false} />
                    <YAxis tick={{ fill: "rgba(139,92,246,0.55)", fontSize: 9, fontFamily: "monospace" }} allowDecimals={false} axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{ background: "rgba(8,4,24,0.98)", border: "1px solid rgba(139,92,246,0.5)", borderRadius: 12, fontSize: 11, color: "rgba(255,255,255,0.9)", boxShadow: "0 0 24px rgba(139,92,246,0.35), 0 0 48px rgba(139,92,246,0.15)" }}
                      labelStyle={{ color: "rgba(196,181,253,1)", fontWeight: "800", marginBottom: 6, fontSize: 12 }}
                      itemStyle={{ fontFamily: "monospace", fontSize: 10 }}
                      cursor={{ fill: "rgba(139,92,246,0.06)", stroke: "rgba(139,92,246,0.2)", strokeWidth: 1 }}
                    />
                    <Bar dataKey="mobile" fill="url(#gradMobile)" filter="url(#glowMobile)" stackId="a" name="MOBILE" radius={[0,0,0,0]} />
                    <Bar dataKey="aadhar" fill="url(#gradAadhar)" filter="url(#glowBlue)" stackId="a" name="AADHAR" />
                    <Bar dataKey="vehicle" fill="url(#gradVehicle)" filter="url(#glowYellow)" stackId="a" name="VEHICLE" />
                    <Bar dataKey="ip" fill="url(#gradIp)" filter="url(#glowPurple)" stackId="a" name="IP" radius={[3,3,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
                <div className="flex justify-center gap-5 mt-1">
                  {([
                    ["MOBILE","#4ade80","rgba(74,222,128,0.5)"],
                    ["AADHAR","#60a5fa","rgba(96,165,250,0.5)"],
                    ["VEHICLE","#fbbf24","rgba(251,191,36,0.5)"],
                    ["IP","#c084fc","rgba(192,132,252,0.5)"],
                  ] as [string,string,string][]).map(([label, color, glow]) => (
                    <div key={label} className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-sm" style={{ background: color, boxShadow: `0 0 7px ${glow}, 0 0 3px ${color}` }} />
                      <span className="text-[9px] font-mono font-bold uppercase" style={{ color: "rgba(255,255,255,0.4)" }}>{label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ── ENHANCED ANALYTICS: PIE + TOP USERS ── */}
          {(() => {
            const totals = chartData.reduce(
              (acc, d) => ({ mobile: acc.mobile + d.mobile, aadhar: acc.aadhar + d.aadhar, vehicle: acc.vehicle + d.vehicle, ip: acc.ip + d.ip }),
              { mobile: 0, aadhar: 0, vehicle: 0, ip: 0 },
            );
            const pieData = [
              { name: "MOBILE", value: totals.mobile, fill: "rgba(74,222,128,0.9)", glow: "rgba(74,222,128,0.5)" },
              { name: "AADHAR", value: totals.aadhar, fill: "rgba(96,165,250,0.9)", glow: "rgba(96,165,250,0.5)" },
              { name: "VEHICLE", value: totals.vehicle, fill: "rgba(251,191,36,0.9)", glow: "rgba(251,191,36,0.5)" },
              { name: "IP", value: totals.ip, fill: "rgba(192,132,252,0.9)", glow: "rgba(192,132,252,0.5)" },
            ].filter(d => d.value > 0);

            const topUsers = [...(users || [])].sort((a, b) => ((b as any).queryCount || 0) - ((a as any).queryCount || 0)).slice(0, 5);
            const maxCount = topUsers[0] ? (topUsers[0] as any).queryCount || 1 : 1;

            const panelStyle = {
              background: "linear-gradient(135deg, rgba(13,7,36,0.95) 0%, rgba(9,5,26,0.98) 100%)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(139,92,246,0.35)",
              boxShadow: "0 0 40px rgba(139,92,246,0.12), inset 0 1px 0 rgba(139,92,246,0.15)",
            };

            return (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {/* Pie Chart */}
                <div className="rounded-2xl overflow-hidden relative" style={panelStyle}>
                  <div className="absolute top-0 left-0 right-0 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(139,92,246,0.8), rgba(192,132,252,0.5), transparent)" }} />
                  <div className="flex items-center justify-between px-5 py-4 border-b"
                    style={{ borderColor: "rgba(139,92,246,0.15)", background: "linear-gradient(90deg, rgba(139,92,246,0.1) 0%, rgba(139,92,246,0.03) 60%, transparent 100%)" }}>
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-xl flex items-center justify-center"
                        style={{ background: "rgba(139,92,246,0.15)", border: "1px solid rgba(139,92,246,0.3)", boxShadow: "0 0 12px rgba(139,92,246,0.2)" }}>
                        <Activity className="w-3.5 h-3.5" style={{ color: "rgba(196,181,253,0.9)" }} />
                      </div>
                      <span className="text-[11px] uppercase tracking-widest font-bold"
                        style={{ color: "rgba(196,181,253,0.9)", textShadow: "0 0 12px rgba(139,92,246,0.6)" }}>
                        Service Distribution ({chartDays}D)
                      </span>
                    </div>
                  </div>
                  <div className="p-5 flex items-center gap-6">
                    {pieData.length === 0 ? (
                      <div className="flex-1 flex flex-col items-center justify-center h-[160px] gap-3">
                        <div className="w-10 h-10 rounded-2xl flex items-center justify-center"
                          style={{ background: "rgba(139,92,246,0.08)", border: "1px solid rgba(139,92,246,0.2)" }}>
                          <Activity className="w-4 h-4" style={{ color: "rgba(139,92,246,0.4)" }} />
                        </div>
                        <span className="text-[10px] uppercase tracking-widest" style={{ color: "rgba(139,92,246,0.3)" }}>No data yet</span>
                      </div>
                    ) : (
                      <>
                        <div className="relative shrink-0">
                          <PieChart width={158} height={158}>
                            <defs>
                              <filter id="pieGlowGreen" x="-40%" y="-40%" width="180%" height="180%">
                                <feGaussianBlur stdDeviation="4" result="blur" />
                                <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                              </filter>
                              <filter id="pieGlowBlue" x="-40%" y="-40%" width="180%" height="180%">
                                <feGaussianBlur stdDeviation="4" result="blur" />
                                <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                              </filter>
                              <filter id="pieGlowYellow" x="-40%" y="-40%" width="180%" height="180%">
                                <feGaussianBlur stdDeviation="4" result="blur" />
                                <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                              </filter>
                              <filter id="pieGlowPurple" x="-40%" y="-40%" width="180%" height="180%">
                                <feGaussianBlur stdDeviation="4" result="blur" />
                                <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                              </filter>
                              <linearGradient id="pieGradGreen" x1="0" y1="0" x2="1" y2="1">
                                <stop offset="0%" stopColor="#4ade80" stopOpacity="1" />
                                <stop offset="100%" stopColor="#4ade80" stopOpacity="0.6" />
                              </linearGradient>
                              <linearGradient id="pieGradBlue" x1="0" y1="0" x2="1" y2="1">
                                <stop offset="0%" stopColor="#60a5fa" stopOpacity="1" />
                                <stop offset="100%" stopColor="#60a5fa" stopOpacity="0.6" />
                              </linearGradient>
                              <linearGradient id="pieGradYellow" x1="0" y1="0" x2="1" y2="1">
                                <stop offset="0%" stopColor="#fbbf24" stopOpacity="1" />
                                <stop offset="100%" stopColor="#fbbf24" stopOpacity="0.6" />
                              </linearGradient>
                              <linearGradient id="pieGradPurple" x1="0" y1="0" x2="1" y2="1">
                                <stop offset="0%" stopColor="#c084fc" stopOpacity="1" />
                                <stop offset="100%" stopColor="#c084fc" stopOpacity="0.6" />
                              </linearGradient>
                            </defs>
                            <Pie data={pieData} cx="50%" cy="50%" innerRadius={44} outerRadius={68} paddingAngle={5} dataKey="value" strokeWidth={0}>
                              {pieData.map((entry, i) => {
                                const gradIds = ["url(#pieGradGreen)","url(#pieGradBlue)","url(#pieGradYellow)","url(#pieGradPurple)"];
                                const filterIds = ["url(#pieGlowGreen)","url(#pieGlowBlue)","url(#pieGlowYellow)","url(#pieGlowPurple)"];
                                return <Cell key={i} fill={gradIds[i] || entry.fill} filter={filterIds[i]} />;
                              })}
                            </Pie>
                            <Tooltip
                              contentStyle={{ background: "rgba(8,4,24,0.98)", border: "1px solid rgba(139,92,246,0.5)", borderRadius: 10, fontSize: 11, color: "rgba(255,255,255,0.9)", boxShadow: "0 0 24px rgba(139,92,246,0.35)" }}
                              itemStyle={{ fontFamily: "monospace", fontSize: 10 }}
                            />
                          </PieChart>
                          {/* center label */}
                          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            <span className="text-[20px] font-black" style={{ color: "rgba(196,181,253,0.95)", textShadow: "0 0 20px rgba(139,92,246,1), 0 0 40px rgba(139,92,246,0.5)" }}>
                              {pieData.reduce((s, x) => s + x.value, 0)}
                            </span>
                            <span className="text-[7px] uppercase tracking-widest font-bold" style={{ color: "rgba(139,92,246,0.6)" }}>total</span>
                          </div>
                        </div>
                        <div className="flex-1 space-y-3">
                          {pieData.map(d => {
                            const total = pieData.reduce((s, x) => s + x.value, 0);
                            const pct = total > 0 ? Math.round((d.value / total) * 100) : 0;
                            return (
                              <div key={d.name} className="space-y-1">
                                <div className="flex justify-between items-center">
                                  <div className="flex items-center gap-1.5">
                                    <div className="w-2 h-2 rounded-full" style={{ background: d.fill, boxShadow: `0 0 6px ${d.glow}` }} />
                                    <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: d.fill }}>{d.name}</span>
                                  </div>
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-[10px] font-mono font-bold text-white/70">{d.value}</span>
                                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-md"
                                      style={{ background: "rgba(139,92,246,0.1)", color: "rgba(196,181,253,0.6)", border: "1px solid rgba(139,92,246,0.2)" }}>{pct}%</span>
                                  </div>
                                </div>
                                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.04)" }}>
                                  <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${pct}%` }}
                                    transition={{ duration: 0.8, ease: "easeOut" }}
                                    className="h-full rounded-full"
                                    style={{ background: d.fill, boxShadow: `0 0 8px ${d.glow}` }}
                                  />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Top Users */}
                <div className="rounded-2xl overflow-hidden relative" style={panelStyle}>
                  <div className="absolute top-0 left-0 right-0 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(251,191,36,0.6), rgba(139,92,246,0.6), transparent)" }} />
                  <div className="flex items-center justify-between px-5 py-4 border-b"
                    style={{ borderColor: "rgba(139,92,246,0.15)", background: "linear-gradient(90deg, rgba(251,191,36,0.06) 0%, rgba(139,92,246,0.04) 50%, transparent 100%)" }}>
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-xl flex items-center justify-center"
                        style={{ background: "rgba(251,191,36,0.12)", border: "1px solid rgba(251,191,36,0.3)", boxShadow: "0 0 12px rgba(251,191,36,0.15)" }}>
                        <TrendingUp className="w-3.5 h-3.5" style={{ color: "rgba(251,191,36,0.9)" }} />
                      </div>
                      <span className="text-[11px] uppercase tracking-widest font-bold"
                        style={{ color: "rgba(196,181,253,0.9)", textShadow: "0 0 12px rgba(139,92,246,0.6)" }}>Top Users by Queries</span>
                    </div>
                    <div className="px-2.5 py-1 rounded-full"
                      style={{ background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.2)" }}>
                      <span className="text-[9px] font-mono text-violet-300/60 uppercase tracking-widest">All Time</span>
                    </div>
                  </div>
                  <div className="p-5">
                    {topUsers.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-[160px] gap-3">
                        <div className="w-10 h-10 rounded-2xl flex items-center justify-center"
                          style={{ background: "rgba(139,92,246,0.08)", border: "1px solid rgba(139,92,246,0.2)" }}>
                          <Users className="w-4 h-4" style={{ color: "rgba(139,92,246,0.4)" }} />
                        </div>
                        <span className="text-[10px] uppercase tracking-widest" style={{ color: "rgba(139,92,246,0.3)" }}>No users yet</span>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {topUsers.map((u: any, i) => {
                          const pct = Math.round(((u.queryCount || 0) / maxCount) * 100);
                          const ranks = [
                            { color: "#fbbf24", glow: "rgba(251,191,36,0.6)", bg: "rgba(251,191,36,0.1)", border: "rgba(251,191,36,0.4)", bar: "linear-gradient(90deg, rgba(251,191,36,0.9), rgba(251,191,36,0.5))", label: "🥇" },
                            { color: "#e4e4e7", glow: "rgba(228,228,231,0.4)", bg: "rgba(228,228,231,0.07)", border: "rgba(228,228,231,0.25)", bar: "linear-gradient(90deg, rgba(228,228,231,0.7), rgba(228,228,231,0.3))", label: "🥈" },
                            { color: "#fb923c", glow: "rgba(251,146,60,0.5)", bg: "rgba(251,146,60,0.1)", border: "rgba(251,146,60,0.3)", bar: "linear-gradient(90deg, rgba(251,146,60,0.8), rgba(251,146,60,0.4))", label: "🥉" },
                            { color: "rgba(139,92,246,0.8)", glow: "rgba(139,92,246,0.3)", bg: "rgba(139,92,246,0.07)", border: "rgba(139,92,246,0.2)", bar: "linear-gradient(90deg, rgba(139,92,246,0.6), rgba(139,92,246,0.2))", label: "4" },
                            { color: "rgba(139,92,246,0.5)", glow: "rgba(139,92,246,0.2)", bg: "rgba(139,92,246,0.04)", border: "rgba(139,92,246,0.12)", bar: "linear-gradient(90deg, rgba(139,92,246,0.4), rgba(139,92,246,0.1))", label: "5" },
                          ];
                          const r = ranks[i] || ranks[4];
                          return (
                            <motion.div key={u.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                              className="rounded-xl p-3 space-y-2 transition-all"
                              style={{ background: r.bg, border: `1px solid ${r.border}`, boxShadow: i < 3 ? `0 0 16px ${r.glow}` : "none" }}>
                              <div className="flex items-center gap-2.5">
                                <div className="w-6 h-6 rounded-lg flex items-center justify-center text-[11px] font-black shrink-0"
                                  style={{ background: "rgba(0,0,0,0.3)", border: `1px solid ${r.border}`, boxShadow: `0 0 8px ${r.glow}`, color: r.color }}>
                                  {i < 3 ? r.label : i + 1}
                                </div>
                                <span className="text-white/80 truncate flex-1 text-[11px] font-medium">{u.username || u.email || u.id.slice(0, 14)}</span>
                                <div className="shrink-0 px-2 py-0.5 rounded-lg"
                                  style={{ background: "rgba(0,0,0,0.3)", border: `1px solid ${r.border}` }}>
                                  <span className="text-[11px] font-mono font-black" style={{ color: r.color, textShadow: `0 0 8px ${r.glow}` }}>{u.queryCount || 0}</span>
                                </div>
                              </div>
                              <div className="h-1 rounded-full overflow-hidden" style={{ background: "rgba(0,0,0,0.3)" }}>
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${pct}%` }}
                                  transition={{ duration: 0.8, ease: "easeOut", delay: i * 0.08 }}
                                  className="h-full rounded-full"
                                  style={{ background: r.bar, boxShadow: `0 0 8px ${r.glow}` }}
                                />
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })()}

          </>)}

          {/* ── REPORTS SECTION ── */}
          {activeSection === "reports" && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { label: "Total Users", value: adminStats?.totalUsers ?? 0, color: "#8B5CF6" },
                  { label: "Queries Today", value: adminStats?.queriesToday ?? 0, color: "#A78BFA" },
                  { label: "This Month", value: adminStats?.queriesThisMonth ?? 0, color: "#C084FC" },
                  { label: "Total Queries", value: adminStats?.totalQueries ?? 0, color: "#7C3AED" },
                ].map(stat => (
                  <div key={stat.label} className="rounded-2xl border border-violet-500/20 p-5" style={{ background: "rgba(9,5,26,0.8)" }}>
                    <div className="text-[10px] text-white/40 uppercase tracking-widest mb-2">{stat.label}</div>
                    <div className="text-2xl font-black" style={{ color: stat.color }}>{stat.value}</div>
                  </div>
                ))}
              </div>

              <div className="rounded-2xl border border-violet-500/20 p-6" style={{ background: "rgba(9,5,26,0.8)" }}>
                <div className="flex items-center gap-2 mb-5 text-sm font-bold text-white">
                  <TrendingUp className="w-4 h-4 text-violet-400" /> Query Analytics (Last 7 Days)
                </div>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={chartData} barGap={2} barCategoryGap="30%">
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(139,92,246,0.1)" vertical={false} />
                    <XAxis dataKey="date" tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }} tickFormatter={(d) => { const dt = new Date(d); return `${dt.getMonth()+1}/${dt.getDate()}`; }} />
                    <YAxis tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }} />
                    <Tooltip contentStyle={{ background: "#0B0722", border: "1px solid rgba(139,92,246,0.3)", borderRadius: "10px", color: "#fff", fontSize: 12 }} />
                    <Bar dataKey="mobile" fill="#8B5CF6" name="Mobile" radius={[3,3,0,0]} />
                    <Bar dataKey="aadhar" fill="#C084FC" name="Aadhar" radius={[3,3,0,0]} />
                    <Bar dataKey="vehicle" fill="#A78BFA" name="Vehicle" radius={[3,3,0,0]} />
                    <Bar dataKey="ip" fill="#7C3AED" name="IP" radius={[3,3,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="rounded-2xl border border-violet-500/20 p-6" style={{ background: "rgba(9,5,26,0.8)" }}>
                  <div className="flex items-center gap-2 mb-5 text-sm font-bold text-white">
                    <Activity className="w-4 h-4 text-violet-400" /> Service Distribution (7D)
                  </div>
                  {(() => {
                    const totals = chartData.reduce((acc, d) => ({ mobile: acc.mobile+d.mobile, aadhar: acc.aadhar+d.aadhar, vehicle: acc.vehicle+d.vehicle, ip: acc.ip+d.ip }), { mobile:0, aadhar:0, vehicle:0, ip:0 });
                    const total = totals.mobile + totals.aadhar + totals.vehicle + totals.ip;
                    const services = [
                      { name: "Mobile", value: totals.mobile, color: "#8B5CF6" },
                      { name: "Aadhar", value: totals.aadhar, color: "#C084FC" },
                      { name: "Vehicle", value: totals.vehicle, color: "#A78BFA" },
                      { name: "IP Lookup", value: totals.ip, color: "#7C3AED" },
                    ];
                    return total === 0 ? (
                      <div className="text-center py-8 text-white/20 text-xs">No data in last 7 days</div>
                    ) : (
                      <div className="space-y-4">
                        {services.map(s => (
                          <div key={s.name}>
                            <div className="flex justify-between text-xs mb-1.5">
                              <span className="text-white/60">{s.name}</span>
                              <span className="font-mono font-bold" style={{ color: s.color }}>{s.value} ({total > 0 ? Math.round(s.value/total*100) : 0}%)</span>
                            </div>
                            <div className="h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.05)" }}>
                              <motion.div className="h-full rounded-full" initial={{ width: 0 }} animate={{ width: `${total > 0 ? s.value/total*100 : 0}%` }} transition={{ duration: 0.8 }} style={{ background: s.color }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </div>

                <div className="rounded-2xl border border-violet-500/20 p-6" style={{ background: "rgba(9,5,26,0.8)" }}>
                  <div className="flex items-center gap-2 mb-5 text-sm font-bold text-white">
                    <Users className="w-4 h-4 text-violet-400" /> Top Users by Queries
                  </div>
                  <div className="space-y-2">
                    {(users || []).filter(u => (u as any).queryCount > 0).sort((a,b) => ((b as any).queryCount||0)-((a as any).queryCount||0)).slice(0,8).map((u,i) => {
                      const medals = ["🥇","🥈","🥉"];
                      return (
                        <div key={u.id} className="flex items-center gap-3 py-2 border-b border-white/[0.05] last:border-0 cursor-pointer hover:bg-white/[0.02] rounded-lg px-1 transition-colors" onClick={() => { setSelectedUserForDetail(u); setUserDetailTab("history"); setActiveSection("users"); }}>
                          <span className="text-sm w-6 text-center">{medals[i] || `#${i+1}`}</span>
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-medium text-white truncate">{u.username || u.email?.split("@")[0] || "Unknown"}</div>
                            <div className="text-[10px] text-white/30 truncate">{u.email}</div>
                          </div>
                          <span className="text-sm font-black font-mono text-violet-300">{(u as any).queryCount || 0}</span>
                        </div>
                      );
                    })}
                    {(users || []).filter(u => (u as any).queryCount > 0).length === 0 && (
                      <div className="text-center py-6 text-white/20 text-xs">No query data yet</div>
                    )}
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-violet-500/20 p-6" style={{ background: "rgba(9,5,26,0.8)" }}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-2 h-2 rounded-full bg-violet-400" />
                  <div className="text-sm font-bold text-white">Live Query Feed</div>
                  <span className="text-[10px] text-white/30 ml-auto">{liveFeed.length} queries</span>
                  <button onClick={() => refetchLiveFeed()} disabled={isLiveFeedLoading}
                    className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] transition-all"
                    style={{ background: "rgba(139,92,246,0.15)", border: "1px solid rgba(139,92,246,0.3)", color: "#A78BFA" }}>
                    <RefreshCw className={`w-3 h-3 ${isLiveFeedLoading ? "animate-spin" : ""}`} />
                  </button>
                </div>
                <div className="space-y-1 max-h-52 overflow-y-auto" ref={feedRef}>
                  {liveFeed.length === 0 ? (
                    <div className="text-center py-8 text-white/20 text-xs">No queries found. Click refresh to load.</div>
                  ) : liveFeed.map((item, i) => (
                    <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/[0.03] text-xs transition-colors">
                      <span className="text-white/20 font-mono text-[10px] shrink-0 w-16">{new Date(item.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                      <span className="shrink-0 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase" style={{ background: "rgba(139,92,246,0.2)", color: "#A78BFA" }}>{item.service}</span>
                      <span className="text-white/50 shrink-0 w-24 truncate">{item.username}</span>
                      <span className="text-white/30 truncate">→ {item.query}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── SERVICE MANAGEMENT SECTION ── */}
          {activeSection === "services" && (
            <div className="space-y-6">
              {/* ── Service ON/OFF Management ── */}
              <div className="rounded-2xl overflow-hidden relative"
                style={{ background: "linear-gradient(135deg, rgba(13,7,36,0.95) 0%, rgba(9,5,26,0.98) 100%)", border: "1px solid rgba(139,92,246,0.35)", boxShadow: "0 0 40px rgba(139,92,246,0.12), inset 0 1px 0 rgba(139,92,246,0.15)" }}>
                <div className="absolute top-0 left-0 right-0 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(139,92,246,0.8), rgba(192,132,252,0.5), transparent)" }} />
                <div className="flex items-center gap-3 px-5 py-4 border-b"
                  style={{ borderColor: "rgba(139,92,246,0.15)", background: "linear-gradient(90deg, rgba(139,92,246,0.1) 0%, rgba(139,92,246,0.03) 60%, transparent 100%)" }}>
                  <div className="w-7 h-7 rounded-xl flex items-center justify-center"
                    style={{ background: "rgba(139,92,246,0.15)", border: "1px solid rgba(139,92,246,0.3)", boxShadow: "0 0 12px rgba(139,92,246,0.2)" }}>
                    <Power className="w-3.5 h-3.5" style={{ color: "rgba(196,181,253,0.9)" }} />
                  </div>
                  <div>
                    <div className="text-[11px] uppercase tracking-widest font-bold" style={{ color: "rgba(196,181,253,0.9)", textShadow: "0 0 12px rgba(139,92,246,0.6)" }}>
                      Service Management
                    </div>
                    <div className="text-[10px] mt-0.5" style={{ color: "rgba(255,255,255,0.3)" }}>
                      Enable or disable platform services — changes apply instantly to dashboard status
                    </div>
                  </div>
                </div>
                <div className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {([
                    { key: "mobile",  label: "Number Search",  desc: "Mobile number OSINT lookup",        icon: <Smartphone className="w-4 h-4" /> },
                    { key: "aadhar",  label: "Aadhaar Search", desc: "Aadhaar UID identity lookup",        icon: <ShieldCheck className="w-4 h-4" /> },
                    { key: "email",   label: "Email Search",   desc: "Gmail / email intelligence lookup",  icon: <Mail className="w-4 h-4" /> },
                    { key: "ip",      label: "IP Trace",       desc: "IP address geolocation & ISP info",  icon: <Globe className="w-4 h-4" /> },
                    { key: "vehicle", label: "Vehicle Search", desc: "Vehicle registration lookup",        icon: <Car className="w-4 h-4" /> },
                  ] as { key: string; label: string; desc: string; icon: React.ReactNode }[]).map(({ key, label, desc, icon }) => {
                    const cfg = serviceConfig as Record<string, any>;
                    const enabled = cfg[key] !== false;
                    const savedReason: string = cfg._reasons?.[key] || "";
                    const draftReason = serviceReasonDraft[key] ?? savedReason;
                    const pending = toggleServiceMutation.isPending && (toggleServiceMutation.variables as any)?.service === key;
                    const savingReason = saveServiceReasonMutation.isPending && (saveServiceReasonMutation.variables as any)?.service === key;
                    return (
                      <div key={key} className="rounded-xl p-4 transition-all flex flex-col gap-3"
                        style={{
                          background: enabled ? "rgba(16,185,129,0.06)" : "rgba(239,68,68,0.05)",
                          border: `1px solid ${enabled ? "rgba(16,185,129,0.22)" : "rgba(239,68,68,0.18)"}`,
                        }}>
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                              style={{
                                background: enabled ? "rgba(16,185,129,0.12)" : "rgba(239,68,68,0.1)",
                                border: `1px solid ${enabled ? "rgba(16,185,129,0.25)" : "rgba(239,68,68,0.2)"}`,
                                color: enabled ? "#34D399" : "#F87171",
                              }}>
                              {icon}
                            </div>
                            <div>
                              <div className="text-[12px] font-bold text-white">{label}</div>
                              <div className="text-[10px] mt-0.5" style={{ color: "rgba(255,255,255,0.28)" }}>{desc}</div>
                            </div>
                          </div>
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                            enabled
                              ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/25"
                              : "text-red-400 bg-red-500/10 border-red-500/20"
                          }`}>
                            {enabled ? "ACTIVE" : "INACTIVE"}
                          </span>
                        </div>

                        {/* Reason input — shown when disabled OR as pre-fill before disabling */}
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[9px] uppercase tracking-widest font-semibold"
                            style={{ color: enabled ? "rgba(255,255,255,0.2)" : "rgba(248,113,113,0.7)" }}>
                            {enabled ? "Disable Reason (optional)" : "Reason shown to users"}
                          </label>
                          <textarea
                            rows={2}
                            value={draftReason}
                            onChange={e => setServiceReasonDraft(prev => ({ ...prev, [key]: e.target.value }))}
                            placeholder={enabled ? "Type reason before disabling…" : "No reason set — default message shown"}
                            className="w-full rounded-lg px-2.5 py-2 text-[11px] resize-none outline-none transition-all"
                            style={{
                              background: enabled ? "rgba(255,255,255,0.03)" : "rgba(239,68,68,0.06)",
                              border: `1px solid ${enabled ? "rgba(255,255,255,0.08)" : "rgba(239,68,68,0.2)"}`,
                              color: enabled ? "rgba(255,255,255,0.35)" : "rgba(255,255,255,0.75)",
                            }}
                          />
                          {/* Save reason button — only shown when service is already disabled */}
                          {!enabled && (
                            <button
                              onClick={() => saveServiceReasonMutation.mutate({ service: key, reason: draftReason })}
                              disabled={savingReason || draftReason === savedReason}
                              className="self-end text-[9px] font-bold px-2.5 py-1 rounded-lg uppercase tracking-wider transition-all disabled:opacity-40"
                              style={{ background: "rgba(139,92,246,0.15)", border: "1px solid rgba(139,92,246,0.3)", color: "rgba(196,181,253,0.9)" }}
                            >
                              {savingReason ? "Saving…" : "Save Reason"}
                            </button>
                          )}
                        </div>

                        <button
                          onClick={() => toggleServiceMutation.mutate({ service: key, enabled: !enabled, reason: !enabled ? undefined : draftReason })}
                          disabled={pending}
                          className="w-full flex items-center justify-center gap-2 py-2 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all disabled:opacity-50"
                          style={enabled
                            ? { background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.28)", color: "#F87171" }
                            : { background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.28)", color: "#34D399" }
                          }
                        >
                          {pending ? (
                            <><span className="animate-spin inline-block">⟳</span> {enabled ? "Disabling…" : "Enabling…"}</>
                          ) : enabled ? (
                            <><ToggleLeft className="w-3.5 h-3.5" /> Disable Service</>
                          ) : (
                            <><ToggleRight className="w-3.5 h-3.5" /> Enable Service</>
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* ── Service Availability Management (Coming Soon) ── */}
              <div className="rounded-2xl overflow-hidden relative"
                style={{ background: "linear-gradient(135deg, rgba(13,7,36,0.95) 0%, rgba(9,5,26,0.98) 100%)", border: "1px solid rgba(139,92,246,0.35)", boxShadow: "0 0 40px rgba(139,92,246,0.12), inset 0 1px 0 rgba(139,92,246,0.15)" }}>
                <div className="absolute top-0 left-0 right-0 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(139,92,246,0.8), rgba(192,132,252,0.5), transparent)" }} />
                <div className="flex items-center gap-3 px-5 py-4 border-b"
                  style={{ borderColor: "rgba(139,92,246,0.15)", background: "linear-gradient(90deg, rgba(139,92,246,0.1) 0%, rgba(139,92,246,0.03) 60%, transparent 100%)" }}>
                  <div className="w-7 h-7 rounded-xl flex items-center justify-center"
                    style={{ background: "rgba(139,92,246,0.15)", border: "1px solid rgba(139,92,246,0.3)", boxShadow: "0 0 12px rgba(139,92,246,0.2)" }}>
                    <Clock className="w-3.5 h-3.5" style={{ color: "rgba(196,181,253,0.9)" }} />
                  </div>
                  <div>
                    <div className="text-[11px] uppercase tracking-widest font-bold" style={{ color: "rgba(196,181,253,0.9)", textShadow: "0 0 12px rgba(139,92,246,0.6)" }}>
                      Service Availability Management
                    </div>
                    <div className="text-[10px] mt-0.5" style={{ color: "rgba(255,255,255,0.3)" }}>
                      Mark services as "Coming Soon" — users see the coming soon screen instead of the service
                    </div>
                  </div>
                </div>
                <div className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {([
                    { key: "mobile",  label: "Number Search",  desc: "Mobile number OSINT lookup",        icon: <Smartphone className="w-4 h-4" /> },
                    { key: "aadhar",  label: "Aadhaar Search", desc: "Aadhaar UID identity lookup",        icon: <ShieldCheck className="w-4 h-4" /> },
                    { key: "email",   label: "Email Search",   desc: "Gmail / email intelligence lookup",  icon: <Mail className="w-4 h-4" /> },
                    { key: "ip",      label: "IP Trace",       desc: "IP address geolocation & ISP info",  icon: <Globe className="w-4 h-4" /> },
                    { key: "vehicle", label: "Vehicle Search", desc: "Vehicle registration lookup",        icon: <Car className="w-4 h-4" /> },
                  ] as { key: string; label: string; desc: string; icon: React.ReactNode }[]).map(({ key, label, desc, icon }) => {
                    const isComingSoon = !!(availabilityConfig as Record<string, boolean>)[key];
                    const pending = toggleAvailabilityMutation.isPending && (toggleAvailabilityMutation.variables as any)?.service === key;
                    return (
                      <div key={key} className="rounded-xl p-4 transition-all"
                        style={{
                          background: isComingSoon ? "rgba(234,179,8,0.05)" : "rgba(139,92,246,0.05)",
                          border: `1px solid ${isComingSoon ? "rgba(234,179,8,0.22)" : "rgba(139,92,246,0.18)"}`,
                        }}>
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                              style={{
                                background: isComingSoon ? "rgba(234,179,8,0.12)" : "rgba(139,92,246,0.1)",
                                border: `1px solid ${isComingSoon ? "rgba(234,179,8,0.28)" : "rgba(139,92,246,0.2)"}`,
                                color: isComingSoon ? "#FCD34D" : "#A78BFA",
                              }}>
                              {icon}
                            </div>
                            <div>
                              <div className="text-[12px] font-bold text-white">{label}</div>
                              <div className="text-[10px] mt-0.5" style={{ color: "rgba(255,255,255,0.28)" }}>{desc}</div>
                            </div>
                          </div>
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                            isComingSoon
                              ? "text-yellow-400 bg-yellow-500/10 border-yellow-500/25"
                              : "text-violet-400 bg-violet-500/10 border-violet-500/20"
                          }`}>
                            {isComingSoon ? "COMING SOON" : "AVAILABLE"}
                          </span>
                        </div>
                        <button
                          onClick={() => toggleAvailabilityMutation.mutate({ service: key, comingSoon: !isComingSoon })}
                          disabled={pending}
                          className="w-full flex items-center justify-center gap-2 py-2 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all disabled:opacity-50"
                          style={isComingSoon
                            ? { background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.28)", color: "#A78BFA" }
                            : { background: "rgba(234,179,8,0.08)", border: "1px solid rgba(234,179,8,0.28)", color: "#FCD34D" }
                          }
                        >
                          {pending ? (
                            <><span className="animate-spin inline-block">⟳</span> {isComingSoon ? "Restoring…" : "Setting…"}</>
                          ) : isComingSoon ? (
                            <><ToggleRight className="w-3.5 h-3.5" /> Mark as Available</>
                          ) : (
                            <><Clock className="w-3.5 h-3.5" /> Mark as Coming Soon</>
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ── ADS MANAGER SECTION ── */}
          {activeSection === "ads" && (
            <AdsManagerSection />
          )}

          {/* ── PREMIUM USERS SECTION ── */}
          {activeSection === "premium" && (
            <div className="space-y-5">
              {/* Header */}
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <Crown className="w-5 h-5 text-violet-400" /> Premium Users
                  </h2>
                  <p className="text-xs text-white/30 mt-0.5">Premium access is granted automatically when a registered email logs in through the normal login.</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => refetchPremiumUsers()}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/[0.1] bg-white/[0.04] text-white/50 hover:text-white hover:bg-white/[0.06] text-xs transition-all">
                    <RefreshCw className="w-3.5 h-3.5" /> Refresh
                  </button>
                  <button onClick={() => setPremiumCreateOpen(true)}
                    className="btn-primary flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs">
                    <Plus className="w-3.5 h-3.5" /> Add User
                  </button>
                </div>
              </div>

              {/* Users table */}
              <div className="rounded-2xl border border-violet-500/20 overflow-hidden" style={{ background: "rgba(9,5,26,0.8)" }}>
                {premiumUsersList.length === 0 ? (
                  <div className="flex flex-col items-center gap-3 py-14 text-center">
                    <div className="w-12 h-12 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
                      <Crown className="w-6 h-6 text-violet-400/50" />
                    </div>
                    <p className="text-sm text-white/30">No premium users yet</p>
                    <button onClick={() => setPremiumCreateOpen(true)} className="btn-primary text-xs px-4 py-2 rounded-lg flex items-center gap-1.5">
                      <Plus className="w-3.5 h-3.5" /> Add first user
                    </button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-white/[0.06]">
                          {["Email", "Status", "Expires", "Last Login", "Created", "Actions"].map(h => (
                            <th key={h} className="px-4 py-3 text-left text-[10px] font-semibold text-white/30 uppercase tracking-widest">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {premiumUsersList.map(u => {
                          const isActive = u.status === "active";
                          const isExpired = u.expiresAt && new Date() > new Date(u.expiresAt);
                          return (
                            <tr key={u.id} className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors">
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-2">
                                  <div className="w-7 h-7 rounded-lg bg-violet-600/20 border border-violet-500/20 flex items-center justify-center shrink-0">
                                    <Crown className="w-3.5 h-3.5 text-violet-400" />
                                  </div>
                                  <span className="font-mono text-white/80 font-medium">{u.email ?? "—"}</span>
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                                  isExpired ? "bg-red-500/10 text-red-400 border-red-500/20"
                                  : isActive ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                  : "bg-white/5 text-white/40 border-white/10"
                                }`}>
                                  {isExpired ? <><XCircle className="w-3 h-3" /> Expired</> : isActive ? <><CheckCircle2 className="w-3 h-3" /> Active</> : <><XCircle className="w-3 h-3" /> Disabled</>}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-white/40">
                                {u.expiresAt ? <span className={isExpired ? "text-red-400" : "text-amber-400/80"}>{new Date(u.expiresAt).toLocaleDateString()}</span> : <span className="text-white/20">Never</span>}
                              </td>
                              <td className="px-4 py-3 text-white/40">
                                {u.lastLogin ? new Date(u.lastLogin).toLocaleString() : <span className="text-white/20">Never</span>}
                              </td>
                              <td className="px-4 py-3 text-white/30">{new Date(u.createdAt).toLocaleDateString()}</td>
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-1.5">
                                  {/* Toggle active/disabled */}
                                  <button
                                    onClick={() => togglePremiumMutation.mutate(u.id)}
                                    title={isActive ? "Disable" : "Enable"}
                                    className="p-1.5 rounded-lg border border-white/[0.08] hover:bg-white/[0.06] transition-all text-white/40 hover:text-white/80"
                                  >
                                    {isActive ? <ToggleRight className="w-3.5 h-3.5 text-emerald-400" /> : <ToggleLeft className="w-3.5 h-3.5 text-white/30" />}
                                  </button>
                                  {/* Remove */}
                                  <button
                                    onClick={() => { if (confirm(`Remove premium access for "${u.email}"?`)) deletePremiumMutation.mutate(u.id); }}
                                    title="Remove"
                                    className="p-1.5 rounded-lg border border-white/[0.08] hover:bg-red-500/10 transition-all text-white/40 hover:text-red-400"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* ── Add Premium User Dialog ── */}
              <Dialog open={premiumCreateOpen} onOpenChange={setPremiumCreateOpen}>
                <DialogContent className="max-w-sm border border-violet-500/20" style={{ background: "#09051A" }}>
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-white">
                      <Crown className="w-4 h-4 text-violet-400" /> Add Premium User
                    </DialogTitle>
                    <DialogDescription className="text-white/40 text-xs">Enter the user's login email. They'll receive premium access automatically on their next login — no extra steps needed.</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 mt-2">
                    <div className="space-y-1">
                      <label className="text-[10px] font-semibold text-white/40 uppercase tracking-wide">Email Address</label>
                      <input
                        type="email"
                        value={premiumCreateForm.email}
                        onChange={e => setPremiumCreateForm(f => ({ ...f, email: e.target.value }))}
                        placeholder="user@example.com"
                        className="w-full px-3 py-2 rounded-lg text-sm text-white bg-white/[0.04] border border-white/[0.1] outline-none focus:border-violet-500/50"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-semibold text-white/40 uppercase tracking-wide flex items-center gap-1.5"><CalendarClock className="w-3 h-3" /> Expiry Date (optional)</label>
                      <input type="datetime-local" value={premiumCreateForm.expiresAt}
                        onChange={e => setPremiumCreateForm(f => ({ ...f, expiresAt: e.target.value }))}
                        className="w-full px-3 py-2 rounded-lg text-sm text-white bg-white/[0.04] border border-white/[0.1] outline-none focus:border-violet-500/50" />
                    </div>

                    <button
                      onClick={() => createPremiumMutation.mutate(premiumCreateForm)}
                      disabled={createPremiumMutation.isPending || !premiumCreateForm.email.trim()}
                      className="btn-primary w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold disabled:opacity-60">
                      {createPremiumMutation.isPending ? <><div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Adding…</> : <><Crown className="w-3.5 h-3.5" /> Add</>}
                    </button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          )}

          {/* ── LOGS SECTION ── */}
          {activeSection === "logs" && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-white">Query Logs</h2>
                  <p className="text-xs text-white/30 mt-0.5">All user queries — click any row to see raw response data</p>
                </div>
                <button onClick={() => queryClient.invalidateQueries({ queryKey: ["/api/admin/logs"] })}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/[0.1] bg-white/[0.04] text-white/50 hover:text-white hover:bg-white/[0.06] text-xs transition-all">
                  <RefreshCw className="w-3.5 h-3.5" /> Refresh
                </button>
              </div>
              <div className="rounded-2xl border border-violet-500/20 overflow-hidden" style={{ background: "rgba(9,5,26,0.8)" }}>
                {isLoadingAllLogs ? (
                  <div className="flex justify-center py-12"><RefreshCw className="w-5 h-5 animate-spin text-violet-400" /></div>
                ) : allLogs.length === 0 ? (
                  <div className="text-center py-12 text-white/20">
                    <FileText className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">No logs found</p>
                  </div>
                ) : (
                  <div className="divide-y divide-white/[0.04]">
                    {allLogs.map((log) => (
                      <div key={log.id}>
                        <button onClick={() => setExpandedLogId(expandedLogId === log.id ? null : log.id)}
                          className="w-full flex items-center gap-3 px-5 py-3 hover:bg-white/[0.03] transition-colors text-left">
                          <span className="shrink-0 text-[10px] text-white/25 font-mono w-20">{log.createdAt ? new Date(log.createdAt).toLocaleTimeString("en", { hour: "2-digit", minute: "2-digit", second: "2-digit" }) : "--"}</span>
                          <span className="shrink-0 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wide" style={{ background: "rgba(139,92,246,0.15)", color: "#A78BFA", border: "1px solid rgba(139,92,246,0.25)" }}>{log.service}</span>
                          <span className="text-xs text-white/50 w-28 truncate shrink-0">{log.username || log.email?.split("@")[0] || log.userId?.slice(0,10)}</span>
                          <span className="text-xs text-white/35 truncate flex-1">{log.query}</span>
                          <span className={`shrink-0 text-[9px] font-bold px-2 py-0.5 rounded-full ${log.status === "success" ? "text-green-400 bg-green-500/10 border border-green-500/20" : "text-red-400 bg-red-500/10 border border-red-500/20"}`}>{log.status}</span>
                          <ChevronDown className={`w-3.5 h-3.5 text-white/20 shrink-0 transition-transform ${expandedLogId === log.id ? "rotate-180" : ""}`} />
                        </button>
                        {expandedLogId === log.id && (
                          <div className="px-5 py-4 border-t border-white/[0.04]" style={{ background: "rgba(0,0,0,0.25)" }}>
                            <div className="text-[10px] text-violet-400/60 uppercase tracking-widest mb-2">Raw Response Data</div>
                            <pre className="text-[11px] font-mono text-green-300/80 bg-black/40 border border-white/[0.06] rounded-xl p-4 overflow-x-auto whitespace-pre-wrap max-h-64">
                              {log.result ? JSON.stringify(log.result, null, 2) : "No result data available"}
                            </pre>
                            <div className="mt-3 flex flex-wrap gap-4 text-[10px] text-white/25 font-mono">
                              <span>User: {log.email || log.userId}</span>
                              <span>·</span>
                              <span>Query: {log.query}</span>
                              <span>·</span>
                              <span>{log.createdAt ? new Date(log.createdAt).toLocaleString() : ""}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

        {/* BROADCAST DIALOG */}
        <Dialog open={isBroadcastOpen} onOpenChange={setIsBroadcastOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto border-0 p-0 gap-0" style={{ background: "#06031A", boxShadow: "0 0 80px rgba(139,92,246,0.25), 0 0 0 1px rgba(139,92,246,0.2)" }}>
            <DialogTitle className="sr-only">Broadcast Control</DialogTitle>
            <DialogDescription className="sr-only">Send live alerts and announcements to all users</DialogDescription>
            {/* Header */}
            <div className="relative overflow-hidden rounded-t-2xl px-6 pt-6 pb-5" style={{ background: "linear-gradient(135deg, rgba(139,92,246,0.18) 0%, rgba(109,40,217,0.1) 60%, transparent 100%)" }}>
              <div className="absolute top-0 left-0 right-0 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(139,92,246,0.8), rgba(192,132,252,0.5), transparent)" }} />
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0" style={{ background: "linear-gradient(135deg, rgba(139,92,246,0.4), rgba(192,132,252,0.2))", border: "1px solid rgba(139,92,246,0.4)", boxShadow: "0 0 20px rgba(139,92,246,0.3)" }}>
                  <Megaphone className="w-5 h-5 text-violet-300" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white">Broadcast Control</h2>
                  <p className="text-xs text-white/35 mt-0.5">Send live alerts and announcements to all users</p>
                </div>
                <div className="ml-auto flex items-center gap-2 px-3 py-1.5 rounded-full" style={{ background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.2)" }}>
                  <div className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
                  <span className="text-[10px] font-bold text-violet-300/70 uppercase tracking-widest">{broadcastList.length} Active</span>
                </div>
              </div>
            </div>

            <div className="px-6 pb-6 space-y-5 mt-4">
              {/* Active Broadcasts */}
              {broadcastList.length > 0 && (
                <div className="space-y-2.5">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="h-px flex-1" style={{ background: "linear-gradient(90deg, rgba(139,92,246,0.3), transparent)" }} />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-violet-400/60">Live Broadcasts</span>
                    <div className="h-px flex-1" style={{ background: "linear-gradient(270deg, rgba(139,92,246,0.3), transparent)" }} />
                  </div>
                  {broadcastList.map((b) => {
                    const typeCfg: Record<string, { color: string; bg: string; border: string; glow: string }> = {
                      INFO:    { color: "#A78BFA", bg: "rgba(139,92,246,0.08)",  border: "rgba(139,92,246,0.3)",  glow: "rgba(139,92,246,0.15)" },
                      WARNING: { color: "#FCD34D", bg: "rgba(251,191,36,0.07)",  border: "rgba(251,191,36,0.3)",  glow: "rgba(251,191,36,0.12)" },
                      ALERT:   { color: "#F87171", bg: "rgba(239,68,68,0.07)",   border: "rgba(239,68,68,0.3)",   glow: "rgba(239,68,68,0.12)" },
                      FLASH:   { color: "#FB923C", bg: "rgba(249,115,22,0.07)",  border: "rgba(249,115,22,0.3)",  glow: "rgba(249,115,22,0.12)" },
                      UPDATE:  { color: "#34D399", bg: "rgba(52,211,153,0.07)",  border: "rgba(52,211,153,0.3)",  glow: "rgba(52,211,153,0.12)" },
                    };
                    const cfg = typeCfg[b.type || "INFO"] || typeCfg.INFO;
                    return (
                      <motion.div key={b.id} initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
                        className="rounded-2xl p-4 flex items-start gap-4"
                        style={{ background: cfg.bg, border: `1px solid ${cfg.border}`, boxShadow: `0 0 20px ${cfg.glow}` }}>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                            <span className="text-sm font-bold text-white">{b.title}</span>
                            <span className="text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest" style={{ color: cfg.color, background: `${cfg.glow}`, border: `1px solid ${cfg.border}` }}>{b.type}</span>
                          </div>
                          <p className="text-xs text-white/60 leading-relaxed">{b.message}</p>
                          <p className="text-[9px] text-white/25 mt-2 font-mono">
                            Expires: {b.expiresAt ? new Date(b.expiresAt).toLocaleString() : "Never"}
                          </p>
                        </div>
                        <button
                          onClick={() => deleteBroadcastMutation.mutate(b.id)}
                          disabled={deleteBroadcastMutation.isPending}
                          className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all disabled:opacity-40"
                          style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#F87171" }}
                        >
                          <Trash2 className="w-3 h-3" /> Stop
                        </button>
                      </motion.div>
                    );
                  })}
                </div>
              )}

              {broadcastList.length === 0 && (
                <div className="flex flex-col items-center justify-center py-6 gap-2 rounded-2xl" style={{ background: "rgba(139,92,246,0.04)", border: "1px dashed rgba(139,92,246,0.15)" }}>
                  <Megaphone className="w-6 h-6 text-violet-500/30" />
                  <span className="text-[11px] text-white/20 uppercase tracking-widest">No active broadcasts</span>
                </div>
              )}

              {/* Create New Broadcast Form */}
              <div className="rounded-2xl p-5 space-y-4" style={{ background: "rgba(139,92,246,0.05)", border: "1px solid rgba(139,92,246,0.15)" }}>
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-5 h-5 rounded-lg flex items-center justify-center" style={{ background: "rgba(139,92,246,0.2)", border: "1px solid rgba(139,92,246,0.3)" }}>
                    <Send className="w-3 h-3 text-violet-300" />
                  </div>
                  <span className="text-xs font-bold text-violet-300/80 uppercase tracking-widest">New Broadcast</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-semibold uppercase tracking-widest text-white/30">Title</label>
                    <Input
                      placeholder="Flash Update..."
                      value={broadcastInput.title}
                      onChange={(e) => setBroadcastInput({ ...broadcastInput, title: e.target.value })}
                      className="h-10 rounded-xl text-sm text-white placeholder:text-white/20 focus:border-violet-500/50"
                      style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)" }}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-semibold uppercase tracking-widest text-white/30">Type</label>
                    <select
                      value={broadcastInput.type}
                      onChange={(e) => setBroadcastInput({ ...broadcastInput, type: e.target.value })}
                      className="w-full h-10 text-white text-sm px-3 rounded-xl focus:outline-none focus:border-violet-500/50"
                      style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)" }}
                    >
                      <option value="INFO" style={{ background: "#0D0726" }}>INFO</option>
                      <option value="WARNING" style={{ background: "#0D0726" }}>WARNING</option>
                      <option value="ALERT" style={{ background: "#0D0726" }}>ALERT</option>
                      <option value="FLASH" style={{ background: "#0D0726" }}>FLASH</option>
                      <option value="UPDATE" style={{ background: "#0D0726" }}>UPDATE</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-semibold uppercase tracking-widest text-white/30">Message</label>
                  <textarea
                    placeholder="Enter announcement content..."
                    value={broadcastInput.message}
                    onChange={(e) => setBroadcastInput({ ...broadcastInput, message: e.target.value })}
                    rows={3}
                    className="w-full text-white text-sm px-4 py-3 rounded-xl focus:outline-none resize-none placeholder:text-white/20"
                    style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)" }}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-semibold uppercase tracking-widest text-white/30">Media URL <span className="normal-case text-white/20">(optional)</span></label>
                    <Input
                      placeholder="https://..."
                      value={broadcastInput.mediaUrl}
                      onChange={(e) => setBroadcastInput({ ...broadcastInput, mediaUrl: e.target.value })}
                      className="h-10 rounded-xl text-sm text-white placeholder:text-white/20"
                      style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)" }}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-semibold uppercase tracking-widest text-white/30">Media Type</label>
                    <select
                      value={broadcastInput.mediaType}
                      onChange={(e) => setBroadcastInput({ ...broadcastInput, mediaType: e.target.value })}
                      className="w-full h-10 text-white text-sm px-3 rounded-xl focus:outline-none"
                      style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)" }}
                    >
                      <option value="IMAGE" style={{ background: "#0D0726" }}>IMAGE</option>
                      <option value="VIDEO" style={{ background: "#0D0726" }}>VIDEO</option>
                      <option value="YOUTUBE" style={{ background: "#0D0726" }}>YOUTUBE</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-semibold uppercase tracking-widest text-white/30">Action Link <span className="normal-case text-white/20">(optional)</span></label>
                    <Input
                      placeholder="https://t.me/..."
                      value={broadcastInput.actionLink}
                      onChange={(e) => setBroadcastInput({ ...broadcastInput, actionLink: e.target.value })}
                      className="h-10 rounded-xl text-sm text-white placeholder:text-white/20"
                      style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)" }}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-semibold uppercase tracking-widest text-white/30">Button Text</label>
                    <Input
                      placeholder="Learn More"
                      value={broadcastInput.buttonText}
                      onChange={(e) => setBroadcastInput({ ...broadcastInput, buttonText: e.target.value })}
                      className="h-10 rounded-xl text-sm text-white placeholder:text-white/20"
                      style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)" }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-semibold uppercase tracking-widest text-white/30">Duration <span className="normal-case text-white/20">(minutes)</span></label>
                    <Input
                      type="number"
                      value={broadcastInput.durationMinutes}
                      onChange={(e) => setBroadcastInput({ ...broadcastInput, durationMinutes: parseInt(e.target.value) || 60 })}
                      className="h-10 rounded-xl text-sm text-white"
                      style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)" }}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-semibold uppercase tracking-widest text-white/30">Schedule Start <span className="normal-case text-white/20">(optional)</span></label>
                    <Input
                      type="datetime-local"
                      value={broadcastInput.startsAt}
                      onChange={(e) => setBroadcastInput({ ...broadcastInput, startsAt: e.target.value })}
                      className="h-10 rounded-xl text-sm text-white [color-scheme:dark]"
                      style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)" }}
                    />
                  </div>
                </div>

                <button
                  onClick={() => sendBroadcastMutation.mutate(broadcastInput)}
                  disabled={sendBroadcastMutation.isPending || !broadcastInput.message.trim()}
                  className="w-full h-12 rounded-2xl text-sm font-bold text-white transition-all disabled:opacity-40 flex items-center justify-center gap-2.5"
                  style={{ background: "linear-gradient(135deg, #7C3AED, #8B5CF6, #A78BFA)", boxShadow: "0 0 30px rgba(139,92,246,0.4)" }}
                >
                  {sendBroadcastMutation.isPending ? (
                    <><RefreshCw className="w-4 h-4 animate-spin" /> Transmitting...</>
                  ) : (
                    <><Send className="w-4 h-4" /> Launch Broadcast</>
                  )}
                </button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* ── TELEGRAM TERMINAL DIALOG ── */}
        <Dialog open={isTelegramOpen} onOpenChange={setIsTelegramOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto gap-6">
            <DialogHeader className="border-b border-blue-500/10 pb-5">
              <DialogTitle className="flex items-center gap-2.5 text-white font-bold">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-blue-500/20 border border-blue-500/30">
                  <Bot className="w-4 h-4 text-blue-400" />
                </div>
                Telegram Terminal
                {(tgSettings?.adminChatIds?.length ?? 0) > 0 && (
                  <span className="ml-auto text-[10px] font-mono bg-blue-500/20 text-blue-300 border border-blue-500/30 px-2.5 py-1 rounded-full">
                    {tgSettings!.adminChatIds.length} admin{tgSettings!.adminChatIds.length > 1 ? "s" : ""} configured
                  </span>
                )}
              </DialogTitle>
              <DialogDescription className="text-white/40 text-sm">
                Bot config · admin alerts · broadcast to all Telegram users
              </DialogDescription>
            </DialogHeader>

            <div className="flex flex-col gap-6">

            {/* ── BOT STATUS ── */}
            <div className="flex items-center gap-3 p-3 border border-blue-500/20 rounded-xl bg-blue-500/5">
              <div className={`w-2.5 h-2.5 rounded-full ${tgSettings?.botTokenSet ? "bg-blue-400 animate-pulse" : "bg-zinc-600"}`} />
              <span className="text-xs uppercase tracking-widest text-blue-400/80">
                {tgSettings?.botTokenSet ? "BOT ACTIVE" : "BOT NOT CONFIGURED"}
              </span>
              {tgSettings?.botTokenSet && <span className="ml-auto text-[10px] text-blue-500/40 font-mono">{tgSettings.botToken}</span>}
            </div>

            {/* ── SECTION 1: BOT TOKEN ── */}
            <div className="space-y-2 border border-blue-500/10 rounded-xl p-4 bg-white/[0.03]">
              <div className="text-[10px] font-bold uppercase tracking-widest text-blue-400/60 mb-2">🔑 BOT TOKEN</div>
              <div className="flex gap-2">
                <Input
                  type="password"
                  placeholder={tgSettings?.botTokenSet ? "Enter new token to replace..." : "123456789:ABCdef..."}
                  value={tgBotToken}
                  onChange={(e) => setTgBotToken(e.target.value)}
                  className="bg-white/[0.04] border-blue-500/20 focus:border-blue-500/60 text-white h-9 flex-1 rounded-lg"
                />
                <Button
                  onClick={() => saveTgSettingsMutation.mutate({ botToken: tgBotToken })}
                  disabled={saveTgSettingsMutation.isPending || !tgBotToken.trim()}
                  className="h-9 px-4 bg-blue-900/40 border border-blue-500/40 text-blue-400 hover:bg-blue-800/40 font-mono uppercase tracking-widest text-[10px]"
                >
                  SAVE
                </Button>
              </div>
              <p className="text-[9px] text-blue-500/30 uppercase tracking-widest">Get from @BotFather on Telegram</p>
            </div>

            {/* ── SECTION 2: ADMIN ALERT CHAT IDs ── */}
            <div className="space-y-3 border border-blue-500/20 rounded-xl p-4 bg-blue-500/[0.04]">
              <div className="flex items-center justify-between">
                <div className="text-[10px] font-bold uppercase tracking-widest text-blue-400/80">📬 ADMIN ALERT IDs</div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono bg-blue-500/25 text-blue-300 border border-blue-500/40 px-2 py-0.5 rounded-full">
                    {tgSettings?.adminChatIds?.length ?? 0} configured
                  </span>
                  <button
                    onClick={() => refetchTgSettings()}
                    className="text-[9px] font-mono text-blue-500/50 hover:text-blue-400 border border-blue-500/20 hover:border-blue-500/40 px-1.5 py-0.5 rounded transition-colors"
                  >↺ REFRESH</button>
                </div>
              </div>

              {/* Current admin IDs list */}
              {(tgSettings?.adminChatIds?.length ?? 0) > 0 ? (
                <div className="space-y-2">
                  {tgSettings!.adminChatIds.map((id, idx) => {
                    const linked = tgLinkedUsers.find((u) => u.telegramChatId === id);
                    return (
                      <div key={id} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-900/30 border border-blue-500/30">
                        <span className="text-[10px] font-mono text-blue-500/50 w-5">#{idx + 1}</span>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-mono text-blue-200 truncate">{id}</div>
                          {linked && (
                            <div className="text-[9px] text-blue-400/60 mt-0.5 truncate">
                              👤 {linked.username || linked.email || "Linked user"}
                            </div>
                          )}
                          {!linked && (
                            <div className="text-[9px] text-blue-500/30 mt-0.5">Not linked to any account</div>
                          )}
                        </div>
                        <button
                          onClick={() => {
                            const updated = tgSettings!.adminChatIds.filter((x) => x !== id);
                            saveTgSettingsMutation.mutate({ adminChatIds: updated });
                          }}
                          disabled={saveTgSettingsMutation.isPending}
                          className="text-[10px] text-red-400/60 hover:text-red-400 font-mono uppercase tracking-widest px-2 py-1 border border-red-500/20 hover:border-red-500/50 rounded transition-colors shrink-0"
                        >
                          ✕ REMOVE
                        </button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex items-center gap-2 px-3 py-3 rounded-lg border border-dashed border-blue-500/20 text-[11px] text-blue-500/40 italic">
                  ⚠️ Koi admin ID configure nahi hai — neeche add karo
                </div>
              )}

              {/* Add — supports comma-separated bulk input */}
              <div className="space-y-1.5">
                <label className="text-[9px] uppercase tracking-widest text-blue-500/40">
                  Add ID — ek ya comma se multiple ek saath
                </label>
                <div className="flex gap-2">
                  <Input
                    placeholder="e.g. 123456789  ya  123456789, 987654321, 555555555"
                    value={tgNewAdminId}
                    onChange={(e) => setTgNewAdminId(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && tgNewAdminId.trim()) {
                        const current = tgSettings?.adminChatIds ?? [];
                        const newIds = tgNewAdminId.split(",").map((s) => s.trim()).filter(Boolean);
                        const merged = [...current, ...newIds.filter((x) => !current.includes(x))];
                        saveTgSettingsMutation.mutate({ adminChatIds: merged });
                      }
                    }}
                    className="bg-white/[0.04] border-blue-500/20 focus:border-blue-500/60 text-white h-9 flex-1 rounded-lg text-xs"
                  />
                  <Button
                    onClick={() => {
                      const current = tgSettings?.adminChatIds ?? [];
                      const newIds = tgNewAdminId.split(",").map((s) => s.trim()).filter(Boolean);
                      const merged = [...current, ...newIds.filter((x) => !current.includes(x))];
                      if (newIds.length) saveTgSettingsMutation.mutate({ adminChatIds: merged });
                    }}
                    disabled={saveTgSettingsMutation.isPending || !tgNewAdminId.trim()}
                    className="h-9 px-4 bg-blue-900/40 border border-blue-500/40 text-blue-400 hover:bg-blue-800/40 font-mono uppercase tracking-widest text-[10px]"
                  >
                    {saveTgSettingsMutation.isPending ? "..." : "ADD"}
                  </Button>
                </div>
                <p className="text-[9px] text-blue-500/25">Har user ka search result sabhi admin IDs pe jaata hai · @userinfobot se apna ID jaano</p>
              </div>
            </div>

            {/* ── SECTION 3: TEST ── */}
            <div className="space-y-2 border border-blue-500/10 rounded-xl p-4 bg-white/[0.03]">
              <div className="flex items-center justify-between mb-2">
                <div className="text-[10px] font-bold uppercase tracking-widest text-blue-400/60">🧪 TEST CONNECTION</div>
                {(tgSettings?.adminChatIds?.length ?? 0) > 0 && (
                  <button
                    onClick={() => setTgTestChatId(tgSettings!.adminChatIds[0])}
                    className="text-[9px] font-mono uppercase tracking-widest text-blue-400/50 hover:text-blue-400 border border-blue-500/20 hover:border-blue-500/40 px-2 py-0.5 transition-colors"
                  >
                    USE FIRST ADMIN ID
                  </button>
                )}
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="Enter numeric chat ID (e.g. 1800946343)..."
                  value={tgTestChatId}
                  onChange={(e) => setTgTestChatId(e.target.value)}
                  className="bg-white/[0.04] border-blue-500/20 focus:border-blue-500/60 text-white h-9 flex-1 rounded-lg"
                />
                <Button
                  onClick={() => testTgMutation.mutate(tgTestChatId)}
                  disabled={testTgMutation.isPending || !tgTestChatId.trim()}
                  className="h-9 px-4 bg-green-900/40 border border-green-500/40 text-green-400 hover:bg-green-800/40 font-mono uppercase tracking-widest text-[10px]"
                >
                  {testTgMutation.isPending ? "..." : "SEND TEST"}
                </Button>
              </div>
              <p className="text-[9px] text-blue-500/30 font-mono">⚠ Must be a numeric chat ID — not a username. The user must have started the bot.</p>
            </div>

            {/* ── SECTION 4: LINKED USERS SHORTCUT ── */}
            <div className="flex items-center justify-between p-3 border border-blue-500/10 rounded-xl bg-blue-500/3">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-400/60" />
                <span className="text-[10px] text-blue-400/60 uppercase tracking-widest font-bold">TELEGRAM LINKED USERS</span>
                <span className="bg-blue-500/20 text-blue-400 text-[9px] px-1.5 py-0.5 rounded-xl font-mono">{tgLinkedUsers.length}</span>
              </div>
              <Button
                onClick={() => { setIsTelegramOpen(false); setTimeout(() => setIsTgUsersOpen(true), 100); }}
                className="h-7 px-3 bg-blue-900/40 border border-blue-500/40 text-blue-400 hover:bg-blue-800/40 font-mono uppercase tracking-widest text-[9px]"
              >
                MANAGE USERS →
              </Button>
            </div>

            {/* ── SECTION 5: TELEGRAM BROADCAST ── */}
            <div className="space-y-3 border border-blue-500/10 rounded-xl p-4 bg-white/[0.03]">
              <div className="text-[10px] font-bold uppercase tracking-widest text-blue-400/60">📢 BROADCAST TO ALL TELEGRAM USERS</div>

              {/* Message */}
              <div className="space-y-1">
                <label className="text-[10px] uppercase text-blue-500/40 tracking-widest">MESSAGE (SUPPORTS EMOJIS)</label>
                <textarea
                  placeholder="🎉 New feature added! Check it out..."
                  value={tgBroadcastText}
                  onChange={(e) => setTgBroadcastText(e.target.value)}
                  rows={4}
                  className="w-full bg-white/[0.04] border border-blue-500/20 text-white text-sm px-3 py-2 rounded-lg focus:outline-none focus:border-blue-500/50 resize-none"
                />
              </div>

              {/* Inline Buttons */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] uppercase text-blue-500/40 tracking-widest">INLINE BUTTONS (OPTIONAL)</label>
                  <Button
                    size="sm"
                    onClick={() => setTgBroadcastButtons([...tgBroadcastButtons, { label: "", url: "" }])}
                    className="h-6 px-2 bg-blue-900/30 border border-blue-500/30 text-blue-400 hover:bg-blue-800/30 font-mono text-[9px] uppercase"
                  >
                    <Plus className="w-3 h-3 mr-1" /> ADD BUTTON
                  </Button>
                </div>
                {tgBroadcastButtons.map((btn, i) => (
                  <div key={i} className="flex gap-2 items-center">
                    <Input
                      placeholder="Button text"
                      value={btn.label}
                      onChange={(e) => {
                        const updated = [...tgBroadcastButtons];
                        updated[i] = { ...updated[i], label: e.target.value };
                        setTgBroadcastButtons(updated);
                      }}
                      className="bg-black/50 border-blue-500/20 font-mono text-primary h-8 text-xs flex-1"
                    />
                    <Input
                      placeholder="https://..."
                      value={btn.url}
                      onChange={(e) => {
                        const updated = [...tgBroadcastButtons];
                        updated[i] = { ...updated[i], url: e.target.value };
                        setTgBroadcastButtons(updated);
                      }}
                      className="bg-black/50 border-blue-500/20 font-mono text-primary h-8 text-xs flex-1"
                    />
                    <Button
                      size="sm"
                      onClick={() => setTgBroadcastButtons(tgBroadcastButtons.filter((_, j) => j !== i))}
                      className="h-8 w-8 p-0 bg-red-900/30 border border-red-500/30 text-red-400 hover:bg-red-800/30 shrink-0"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>

              {/* Media */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase text-blue-500/40 tracking-widest">MEDIA URL (OPTIONAL)</label>
                  <Input
                    placeholder="https://..."
                    value={tgBroadcastMediaUrl}
                    onChange={(e) => setTgBroadcastMediaUrl(e.target.value)}
                    className="bg-black/50 border-blue-500/20 font-mono text-primary h-9"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase text-blue-500/40 tracking-widest">MEDIA TYPE</label>
                  <select
                    value={tgBroadcastMediaType}
                    onChange={(e) => setTgBroadcastMediaType(e.target.value)}
                    className="w-full h-9 bg-black/50 border border-blue-500/20 text-primary font-mono text-sm px-3 rounded-xl focus:outline-none focus:border-blue-500/50"
                  >
                    <option value="IMAGE">🖼 IMAGE</option>
                    <option value="VIDEO">🎬 VIDEO</option>
                    <option value="YOUTUBE">▶️ YOUTUBE</option>
                  </select>
                </div>
              </div>

              <Button
                onClick={() => { setTgBroadcastResult(null); tgBroadcastMutation.mutate(); }}
                disabled={tgBroadcastMutation.isPending || !tgBroadcastText.trim()}
                className="w-full h-12 bg-blue-900/30 border border-blue-500/50 text-blue-400 hover:bg-blue-800/30 font-mono uppercase tracking-widest text-sm"
              >
                {tgBroadcastMutation.isPending ? (
                  <span className="flex items-center gap-2"><span className="animate-spin">⟳</span> SENDING TO ALL USERS...</span>
                ) : "📢 SEND TELEGRAM BROADCAST"}
              </Button>

              {/* ── BROADCAST RESULT ── */}
              {tgBroadcastResult && (
                <div className="border border-blue-500/20 rounded-xl bg-black/40 p-4 space-y-3">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-blue-400/60">📊 BROADCAST RESULTS</div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="text-center border border-blue-500/10 p-2 bg-blue-500/5">
                      <div className="text-2xl font-bold text-blue-400">{tgBroadcastResult.total}</div>
                      <div className="text-[8px] text-blue-400/40 uppercase tracking-widest">TOTAL</div>
                    </div>
                    <div className="text-center border border-green-500/20 p-2 bg-green-500/5">
                      <div className="text-2xl font-bold text-green-400">{tgBroadcastResult.sent}</div>
                      <div className="text-[8px] text-green-400/40 uppercase tracking-widest">DELIVERED</div>
                    </div>
                    <div className="text-center border border-red-500/20 p-2 bg-red-500/5">
                      <div className="text-2xl font-bold text-red-400">{tgBroadcastResult.failed}</div>
                      <div className="text-[8px] text-red-400/40 uppercase tracking-widest">FAILED</div>
                    </div>
                  </div>
                  {tgBroadcastResult.total > 0 && (
                    <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-green-500 transition-all"
                        style={{ width: `${Math.round((tgBroadcastResult.sent / tgBroadcastResult.total) * 100)}%` }}
                      />
                    </div>
                  )}
                  <div className="text-[9px] text-blue-400/40 text-center">
                    {tgBroadcastResult.total === 0
                      ? "⚠️ No users have Telegram set up yet"
                      : `${Math.round((tgBroadcastResult.sent / tgBroadcastResult.total) * 100)}% delivery rate`}
                  </div>
                  {tgBroadcastResult.failedIds.length > 0 && (
                    <div className="space-y-1">
                      <div className="text-[9px] text-red-400/60 uppercase tracking-widest font-bold">Failed Chat IDs:</div>
                      <div className="max-h-24 overflow-y-auto space-y-0.5">
                        {tgBroadcastResult.failedIds.map((id, i) => (
                          <div key={i} className="text-[9px] font-mono text-red-400/50 bg-red-500/5 px-2 py-0.5">{id}</div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            </div>{/* end flex flex-col gap-6 wrapper */}
          </DialogContent>
        </Dialog>

        {/* ── TELEGRAM USERS MANAGEMENT DIALOG ── */}
        <Dialog open={isTgUsersOpen} onOpenChange={(v) => { setIsTgUsersOpen(v); if (!v) { setTgUserSearch(""); setTgManualUserId(""); setTgManualChatId(""); setTgQuickBroadcast(""); } }}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">

            {/* ── HEADER ── */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center border border-blue-500/30"
                  style={{ background: "linear-gradient(135deg, rgba(59,130,246,0.25), rgba(37,99,235,0.15))" }}>
                  <Bot className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white">Telegram Users</h2>
                  <p className="text-xs text-white/30">Manage linked accounts · Ping · Broadcast</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-blue-500/20 bg-blue-500/5">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                <span className="text-[10px] text-blue-300 font-semibold">{tgLinkedUsers.length} Linked</span>
              </div>
            </div>

            {/* ── STATS GRID ── */}
            {(() => {
              const total = users?.length || 0;
              const linked = tgLinkedUsers.length;
              const unlinked = total - linked;
              const pct = total > 0 ? Math.round((linked / total) * 100) : 0;
              return (
                <div className="grid grid-cols-4 gap-3 mb-6">
                  {[
                    { label: "Total Users", value: total, color: "text-white", sub: "All accounts", icon: "👥" },
                    { label: "TG Linked", value: linked, color: "text-blue-300", sub: "Connected", icon: "🔗" },
                    { label: "Not Linked", value: unlinked, color: "text-white/40", sub: "Unconnected", icon: "🔌" },
                    { label: "Coverage", value: `${pct}%`, color: pct > 50 ? "text-green-400" : "text-yellow-400", sub: "Link rate", icon: "📊" },
                  ].map(({ label, value, color, sub, icon }) => (
                    <div key={label} className="rounded-2xl border border-white/[0.07] p-4 text-center"
                      style={{ background: "rgba(9,5,26,0.6)" }}>
                      <div className="text-lg mb-1">{icon}</div>
                      <div className={`text-xl font-black ${color}`}>{value}</div>
                      <div className="text-[10px] text-white/35 font-medium mt-0.5">{label}</div>
                    </div>
                  ))}
                </div>
              );
            })()}

            {/* ── COVERAGE BAR ── */}
            {(() => {
              const total = users?.length || 0;
              const pct = total > 0 ? Math.round((tgLinkedUsers.length / total) * 100) : 0;
              return (
                <div className="mb-6 rounded-2xl border border-white/[0.07] p-4"
                  style={{ background: "rgba(9,5,26,0.6)" }}>
                  <div className="flex justify-between text-xs text-white/40 mb-3">
                    <span className="font-medium">Telegram Coverage</span>
                    <span className="font-bold text-blue-300">{pct}% of all users linked</span>
                  </div>
                  <div className="h-2 bg-white/[0.05] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${pct}%`, background: "linear-gradient(90deg, rgba(59,130,246,0.6), rgba(96,165,250,0.9))" }}
                    />
                  </div>
                </div>
              );
            })()}

            {/* ── LINKED USERS LIST ── */}
            <div className="mb-6">
              {/* Section header + search */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                  <span className="text-sm font-semibold text-white">Linked Users</span>
                  <span className="text-xs text-white/30 bg-white/[0.05] border border-white/[0.07] px-2 py-0.5 rounded-full">
                    {tgLinkedUsers.filter(u =>
                      !tgUserSearch ||
                      (u.username || "").toLowerCase().includes(tgUserSearch.toLowerCase()) ||
                      (u.email || "").toLowerCase().includes(tgUserSearch.toLowerCase()) ||
                      u.telegramChatId.includes(tgUserSearch)
                    ).length} results
                  </span>
                </div>
                <button
                  onClick={() => refetchTgUsers()}
                  className="flex items-center gap-1.5 text-xs text-white/30 hover:text-white/70 border border-white/[0.08] hover:border-white/20 px-3 py-1.5 rounded-xl transition-all"
                >
                  <RefreshCw className="w-3 h-3" /> Refresh
                </button>
              </div>

              {/* Search */}
              <div className="relative mb-4">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                <Input
                  placeholder="Search by username, email or Chat ID..."
                  value={tgUserSearch}
                  onChange={(e) => setTgUserSearch(e.target.value)}
                  className="pl-10 h-11 bg-white/[0.04] border-white/[0.09] text-white placeholder:text-white/20 rounded-xl focus:border-blue-500/40"
                />
              </div>

              {/* User rows */}
              {tgLinkedUsers.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-14 rounded-2xl border border-white/[0.05]"
                  style={{ background: "rgba(9,5,26,0.5)" }}>
                  <Bot className="w-10 h-10 text-white/10 mb-3" />
                  <p className="text-sm text-white/20 font-medium">No Telegram users linked yet</p>
                  <p className="text-xs text-white/10 mt-1">Users link via @twhosint_bot — or use the form below</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto pr-0.5">
                  {tgLinkedUsers
                    .filter(u =>
                      !tgUserSearch ||
                      (u.username || "").toLowerCase().includes(tgUserSearch.toLowerCase()) ||
                      (u.email || "").toLowerCase().includes(tgUserSearch.toLowerCase()) ||
                      u.telegramChatId.includes(tgUserSearch)
                    )
                    .map((u, i) => (
                      <motion.div
                        key={u.id}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.04 }}
                        className="flex items-center gap-3 px-4 py-3 rounded-2xl border border-white/[0.07] hover:border-blue-500/25 transition-all group"
                        style={{ background: "rgba(9,5,26,0.6)" }}
                      >
                        {/* Avatar */}
                        <div className="w-9 h-9 rounded-xl bg-blue-500/15 border border-blue-500/25 flex items-center justify-center shrink-0">
                          <span className="text-sm font-bold text-blue-300 uppercase">
                            {(u.username || u.email || "?").charAt(0)}
                          </span>
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-sm font-semibold text-white truncate">
                              {u.username || u.email?.split("@")[0] || "Unknown"}
                            </span>
                            <span className="shrink-0 text-[9px] text-blue-300 bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded-full font-mono">
                              ID: {u.telegramChatId}
                            </span>
                          </div>
                          <span className="text-xs text-white/30 truncate block">{u.email || u.id.slice(0, 20) + "..."}</span>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2 shrink-0 opacity-50 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => pingTgUserMutation.mutate(u.telegramChatId)}
                            disabled={tgPingPending === u.telegramChatId || pingTgUserMutation.isPending}
                            className="text-xs font-semibold border border-green-500/30 text-green-400 hover:bg-green-500/10 px-3 py-1.5 rounded-xl transition-all disabled:opacity-40"
                          >
                            {tgPingPending === u.telegramChatId ? "..." : "Ping"}
                          </button>
                          <button
                            onClick={() => removeTgUserMutation.mutate(u.id)}
                            disabled={removeTgUserMutation.isPending}
                            className="text-xs font-semibold border border-red-500/20 text-red-400 hover:bg-red-500/10 px-3 py-1.5 rounded-xl transition-all disabled:opacity-40"
                          >
                            Remove
                          </button>
                        </div>
                      </motion.div>
                    ))
                  }
                </div>
              )}
            </div>

            {/* ── MANUAL LINK FORM ── */}
            <div className="rounded-2xl border border-blue-500/15 p-5 mb-5"
              style={{ background: "rgba(59,130,246,0.03)" }}>
              <div className="flex items-center gap-2 mb-5">
                <div className="w-7 h-7 rounded-xl bg-blue-500/15 border border-blue-500/25 flex items-center justify-center">
                  <Plus className="w-3.5 h-3.5 text-blue-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">Manually Link a User</p>
                  <p className="text-xs text-white/30">Connect any user account to a Telegram Chat ID</p>
                </div>
              </div>

              <div className="space-y-4">
                {/* User search */}
                <div className="relative">
                  <label className="text-xs font-medium text-white/40 block mb-1.5">Find User (email or user ID)</label>
                  <Input
                    placeholder="Type email or user ID to search..."
                    value={tgManualUserId}
                    onChange={(e) => setTgManualUserId(e.target.value)}
                    className="h-11 bg-white/[0.04] border-white/[0.09] text-white placeholder:text-white/20 rounded-xl focus:border-blue-500/40"
                  />
                  {/* Suggestions dropdown */}
                  {tgManualUserId.length >= 2 && (() => {
                    const matches = (users || []).filter(u =>
                      (u.email || "").toLowerCase().includes(tgManualUserId.toLowerCase()) ||
                      u.id.includes(tgManualUserId) ||
                      (u.username || "").toLowerCase().includes(tgManualUserId.toLowerCase())
                    ).slice(0, 5);
                    if (matches.length === 0) return null;
                    return (
                      <div className="absolute z-10 w-full mt-1.5 border border-blue-500/25 rounded-2xl overflow-hidden shadow-2xl shadow-blue-500/10" style={{ background: "#0B0722" }}>
                        {matches.map(u => (
                          <button
                            key={u.id}
                            onClick={() => setTgManualUserId(u.email || u.id)}
                            className="w-full text-left px-4 py-3 hover:bg-blue-500/10 transition-colors flex items-center gap-3 border-b border-white/[0.05] last:border-0"
                          >
                            <div className="w-7 h-7 rounded-xl bg-blue-900/50 border border-blue-500/20 flex items-center justify-center shrink-0">
                              <span className="text-xs text-blue-300 font-bold">{(u.username || u.email || "?").charAt(0).toUpperCase()}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-sm text-white font-medium truncate">{u.username || u.email || u.id}</div>
                              <div className="text-xs text-white/30 truncate">{u.email}</div>
                            </div>
                            {u.telegramChatId && (
                              <span className="text-[10px] text-blue-300 bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded-full shrink-0 font-medium">Linked</span>
                            )}
                          </button>
                        ))}
                      </div>
                    );
                  })()}
                </div>

                {/* Chat ID input */}
                <div>
                  <label className="text-xs font-medium text-white/40 block mb-1.5">Telegram Chat ID</label>
                  <Input
                    placeholder="e.g. 1800946343"
                    value={tgManualChatId}
                    onChange={(e) => setTgManualChatId(e.target.value)}
                    className="h-11 bg-white/[0.04] border-white/[0.09] text-white placeholder:text-white/20 rounded-xl focus:border-blue-500/40"
                  />
                  <p className="text-xs text-white/25 mt-1.5">Numeric ID only. User must have started @twhosint_bot.</p>
                </div>

                <Button
                  onClick={() => {
                    const target = users?.find(u => u.id === tgManualUserId || u.email === tgManualUserId || u.username === tgManualUserId);
                    if (!target) return toast({ variant: "destructive", title: "User not found", description: "Check email or user ID and try again." });
                    if (!tgManualChatId.trim()) return toast({ variant: "destructive", title: "Missing Chat ID", description: "Enter a Telegram Chat ID." });
                    addTgUserMutation.mutate({ userId: target.id, chatId: tgManualChatId });
                  }}
                  disabled={addTgUserMutation.isPending || !tgManualUserId.trim() || !tgManualChatId.trim()}
                  className="w-full h-11 bg-blue-600/20 border border-blue-500/40 text-blue-300 hover:bg-blue-600/30 font-semibold rounded-xl text-sm"
                >
                  {addTgUserMutation.isPending ? "Linking..." : "⚡ Link User"}
                </Button>
              </div>
            </div>

            {/* ── QUICK BROADCAST ── */}
            <div className="rounded-2xl border border-violet-500/15 p-5"
              style={{ background: "rgba(139,92,246,0.03)" }}>
              <div className="flex items-center gap-2 mb-5">
                <div className="w-7 h-7 rounded-xl bg-violet-500/15 border border-violet-500/25 flex items-center justify-center">
                  <Send className="w-3.5 h-3.5 text-violet-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">Quick Broadcast</p>
                  <p className="text-xs text-white/30">Send to all {tgLinkedUsers.length} linked users at once</p>
                </div>
              </div>
              <textarea
                placeholder="Type your message here... Emojis supported! 🚀"
                value={tgQuickBroadcast}
                onChange={(e) => setTgQuickBroadcast(e.target.value)}
                rows={3}
                className="w-full bg-white/[0.04] border border-white/[0.08] text-white placeholder:text-white/20 text-sm px-4 py-3 rounded-xl focus:outline-none focus:border-violet-500/40 resize-none mb-3"
              />
              <div className="flex items-center justify-between">
                <span className="text-xs text-white/25">{tgQuickBroadcast.length} characters</span>
                <Button
                  onClick={() => quickTgBroadcastMutation.mutate(tgQuickBroadcast)}
                  disabled={quickTgBroadcastMutation.isPending || !tgQuickBroadcast.trim() || tgLinkedUsers.length === 0}
                  className="h-10 px-5 bg-violet-600/20 border border-violet-500/40 text-violet-300 hover:bg-violet-600/30 font-semibold rounded-xl text-sm"
                >
                  {quickTgBroadcastMutation.isPending ? (
                    <span className="flex items-center gap-2"><span className="animate-spin">⟳</span> Sending...</span>
                  ) : `📢 Send to All ${tgLinkedUsers.length} Users`}
                </Button>
              </div>
            </div>

            {/* ── FOOTER ── */}
            <p className="text-center text-xs text-white/15 mt-5">
              For advanced broadcast with media & buttons → open Telegram Terminal
            </p>
          </DialogContent>
        </Dialog>

        {/* ── BLOCKED USERS MANAGEMENT DIALOG ── */}
        <Dialog open={isBlockedUsersOpen} onOpenChange={(v) => { setIsBlockedUsersOpen(v); if (!v) setBlockSearch(""); }}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader className="border-b border-red-500/10 pb-4">
              <DialogTitle className="flex items-center gap-2 text-red-400 uppercase tracking-widest">
                <Ban className="w-5 h-5" /> BLOCKED_USER_MANAGEMENT
              </DialogTitle>
              <DialogDescription className="text-red-500/40 uppercase text-[10px] tracking-widest">
                VIEW, UNBLOCK, OR TERMINATE USER ACCOUNTS
              </DialogDescription>
            </DialogHeader>

            {/* Search to find & block a user */}
            <div className="mt-4 space-y-3">
              <div className="text-[10px] uppercase text-red-500/50 tracking-widest font-bold">SEARCH & BLOCK USER</div>
              <div className="flex gap-2">
                <Input
                  placeholder="SEARCH BY EMAIL / ID / USERNAME..."
                  value={blockSearch}
                  onChange={(e) => setBlockSearch(e.target.value)}
                  className="bg-black/50 border-red-500/20 font-mono text-primary placeholder:text-primary/20 h-9"
                />
              </div>
              {blockSearch.trim() && (() => {
                const matches = users?.filter(u =>
                  !u.isBlocked && (
                    u.email?.toLowerCase().includes(blockSearch.toLowerCase()) ||
                    u.id.toLowerCase().includes(blockSearch.toLowerCase()) ||
                    u.username?.toLowerCase().includes(blockSearch.toLowerCase())
                  )
                ) ?? [];
                return matches.length > 0 ? (
                  <div className="border border-red-500/10 rounded-xl bg-black/40 divide-y divide-red-500/10 max-h-36 overflow-y-auto">
                    {matches.slice(0, 8).map(u => (
                      <div key={u.id} className="flex items-center justify-between px-3 py-2 gap-3">
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-bold text-primary truncate">{u.username || u.email || "Unknown"}</p>
                          <p className="text-[10px] text-primary/40 truncate">{u.email}</p>
                        </div>
                        <Button
                          size="sm"
                          className="shrink-0 h-7 text-[9px] bg-red-900/60 border border-red-500/50 text-red-400 hover:bg-red-800/60 font-mono uppercase tracking-widest"
                          onClick={() => { blockUserMutation.mutate({ userId: u.id, blocked: true }); setBlockSearch(""); }}
                          disabled={blockUserMutation.isPending}
                        >
                          BLOCK
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[10px] text-primary/30 uppercase tracking-widest">NO UNBLOCKED USERS MATCHING "{blockSearch}"</p>
                );
              })()}
            </div>

            {/* Currently blocked users */}
            <div className="mt-4 space-y-2">
              <div className="text-[10px] uppercase text-red-500/50 tracking-widest font-bold flex items-center justify-between">
                <span>CURRENTLY BLOCKED ({users?.filter(u => u.isBlocked).length ?? 0})</span>
              </div>
              {(users?.filter(u => u.isBlocked) ?? []).length === 0 ? (
                <div className="text-center py-8 text-primary/20 text-xs uppercase border border-primary/5 rounded-sm">
                  NO BLOCKED USERS
                </div>
              ) : (
                <div className="border border-red-500/10 rounded-xl bg-black/40 divide-y divide-red-500/10">
                  {users?.filter(u => u.isBlocked).map(u => (
                    <motion.div
                      key={u.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center justify-between px-3 py-3 gap-3"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <Ban className="w-3 h-3 text-red-500 shrink-0" />
                          <p className="text-sm font-bold text-primary truncate">{u.username || "Unknown"}</p>
                        </div>
                        <p className="text-[10px] text-primary/40 truncate ml-5">{u.email}</p>
                        <p className="text-[9px] text-primary/20 truncate ml-5 font-mono">{u.id}</p>
                        {u.lastIp && (
                          <p className="text-[9px] text-primary/30 ml-5 font-mono">IP: {u.lastIp}</p>
                        )}
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-[9px] border-primary/30 text-primary hover:bg-primary/10 font-mono uppercase tracking-widest"
                          onClick={() => blockUserMutation.mutate({ userId: u.id, blocked: false })}
                          disabled={blockUserMutation.isPending}
                        >
                          RESTORE
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>

        {/* ── IP BLOCKED MANAGEMENT DIALOG ── */}
        <Dialog open={isIpBlockedOpen} onOpenChange={(v) => { setIsIpBlockedOpen(v); if (!v) setBlockSearch(""); }}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader className="border-b border-orange-500/10 pb-4">
              <DialogTitle className="flex items-center gap-2 text-orange-400 uppercase tracking-widest">
                <ShieldAlert className="w-5 h-5" /> IP_BLOCK_MANAGEMENT
              </DialogTitle>
              <DialogDescription className="text-orange-500/40 uppercase text-[10px] tracking-widest">
                VIEW, UNBAN, OR BLOCK USER IPs FROM THE SYSTEM
              </DialogDescription>
            </DialogHeader>

            {/* Search to find & IP-ban a user */}
            <div className="mt-4 space-y-3">
              <div className="text-[10px] uppercase text-orange-500/50 tracking-widest font-bold">SEARCH & BAN IP</div>
              <div className="flex gap-2">
                <Input
                  placeholder="SEARCH BY EMAIL / ID / IP ADDRESS..."
                  value={blockSearch}
                  onChange={(e) => setBlockSearch(e.target.value)}
                  className="bg-black/50 border-orange-500/20 font-mono text-primary placeholder:text-primary/20 h-9"
                />
              </div>
              {blockSearch.trim() && (() => {
                const matches = users?.filter(u =>
                  !u.isIpBlocked && u.lastIp && (
                    u.email?.toLowerCase().includes(blockSearch.toLowerCase()) ||
                    u.id.toLowerCase().includes(blockSearch.toLowerCase()) ||
                    u.username?.toLowerCase().includes(blockSearch.toLowerCase()) ||
                    u.lastIp?.toLowerCase().includes(blockSearch.toLowerCase())
                  )
                ) ?? [];
                return matches.length > 0 ? (
                  <div className="border border-orange-500/10 rounded-xl bg-black/40 divide-y divide-orange-500/10 max-h-36 overflow-y-auto">
                    {matches.slice(0, 8).map(u => (
                      <div key={u.id} className="flex items-center justify-between px-3 py-2 gap-3">
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-bold text-primary truncate">{u.username || u.email || "Unknown"}</p>
                          <p className="text-[10px] text-orange-400/60 font-mono">{u.lastIp}</p>
                        </div>
                        <Button
                          size="sm"
                          className="shrink-0 h-7 text-[9px] bg-orange-900/60 border border-orange-500/50 text-orange-400 hover:bg-orange-800/60 font-mono uppercase tracking-widest"
                          onClick={() => { blockIpMutation.mutate({ userId: u.id, blockIp: true }); setBlockSearch(""); }}
                          disabled={blockIpMutation.isPending}
                        >
                          BAN IP
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[10px] text-primary/30 uppercase tracking-widest">NO USERS WITH IP MATCHING "{blockSearch}"</p>
                );
              })()}
            </div>

            {/* Currently IP-blocked users */}
            <div className="mt-4 space-y-2">
              <div className="text-[10px] uppercase text-orange-500/50 tracking-widest font-bold">
                IP BANNED ({users?.filter(u => u.isIpBlocked).length ?? 0})
              </div>
              {(users?.filter(u => u.isIpBlocked) ?? []).length === 0 ? (
                <div className="text-center py-8 text-primary/20 text-xs uppercase border border-primary/5 rounded-sm">
                  NO IP BANS ACTIVE
                </div>
              ) : (
                <div className="border border-orange-500/10 rounded-xl bg-black/40 divide-y divide-orange-500/10">
                  {users?.filter(u => u.isIpBlocked).map(u => (
                    <motion.div
                      key={u.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center justify-between px-3 py-3 gap-3"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <ShieldAlert className="w-3 h-3 text-orange-500 shrink-0" />
                          <p className="text-sm font-bold text-primary truncate">{u.username || "Unknown"}</p>
                        </div>
                        <p className="text-[10px] text-primary/40 truncate ml-5">{u.email}</p>
                        <p className="text-[9px] font-mono text-orange-400/70 ml-5">IP: {u.lastIp || "NO_IP_RECORDED"}</p>
                        <p className="text-[9px] text-primary/20 truncate ml-5 font-mono">{u.id}</p>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-[9px] border-orange-500/30 text-orange-400 hover:bg-orange-500/10 font-mono uppercase tracking-widest"
                          onClick={() => blockIpMutation.mutate({ userId: u.id, blockIp: false })}
                          disabled={blockIpMutation.isPending}
                        >
                          UNBAN
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={isProtectedModalOpen} onOpenChange={setIsProtectedModalOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 uppercase tracking-widest text-primary">
                <ShieldCheck className="w-5 h-5" />
                PROTECTED_TARGETS_MANAGEMENT
              </DialogTitle>
              <DialogDescription className="text-primary/40 uppercase text-[10px] tracking-widest">
                MANAGE NUMBERS, VEHICLES, IP, AND AADHAR PROTECTION
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="flex flex-col sm:flex-row gap-2">
                <Input 
                  placeholder="TARGET (MOBILE/VEHICLE/IP/AADHAR)..."
                  value={protectedInput.number}
                  onChange={(e) => setProtectedInput({ ...protectedInput, number: e.target.value })}
                  className="bg-black/50 border-primary/20 font-mono text-primary flex-1"
                />
                <Input 
                  placeholder="REASON..."
                  value={protectedInput.reason}
                  onChange={(e) => setProtectedInput({ ...protectedInput, reason: e.target.value })}
                  className="bg-black/50 border-primary/20 font-mono text-primary flex-1"
                />
                <Button 
                  onClick={() => addProtectedMutation.mutate(protectedInput)}
                  className="bg-primary/20 border-primary/50 text-primary hover:bg-primary/30 shrink-0"
                  disabled={addProtectedMutation.isPending}
                >
                  PROTECT
                </Button>
              </div>
              <ScrollArea className="h-[300px] border border-primary/10 rounded p-2 bg-black/50">
                <div className="space-y-2">
                  {protectedNumbersList?.map((num) => (
                    <div key={num} className="flex items-center justify-between p-2 bg-primary/5 border border-primary/10 rounded group">
                      <span className="text-sm">{num}</span>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="h-7 text-red-500 hover:text-red-400 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => removeProtectedMutation.mutate(num)}
                      >
                        REMOVE
                      </Button>
                    </div>
                  ))}
                  {(!protectedNumbersList || protectedNumbersList.length === 0) && (
                    <div className="text-center py-8 text-primary/20 text-xs">NO PROTECTED TARGETS FOUND</div>
                  )}
                </div>
              </ScrollArea>
            </div>
          </DialogContent>
        </Dialog>

        {activeSection === "users" && !selectedUserForDetail && (<>
        {/* ── USER REGISTRY HEADER ── */}
        <div className="relative rounded-2xl overflow-hidden mb-5"
          style={{ background: "linear-gradient(135deg, rgba(139,92,246,0.15) 0%, rgba(109,40,217,0.08) 60%, rgba(9,5,26,0.95) 100%)", border: "1px solid rgba(139,92,246,0.25)", boxShadow: "0 0 40px rgba(139,92,246,0.1)" }}>
          <div className="absolute top-0 left-0 right-0 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(139,92,246,0.8), rgba(192,132,252,0.5), transparent)" }} />
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 px-6 py-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0" style={{ background: "linear-gradient(135deg, rgba(139,92,246,0.3), rgba(192,132,252,0.15))", border: "1px solid rgba(139,92,246,0.35)", boxShadow: "0 0 16px rgba(139,92,246,0.25)" }}>
                <Users className="w-5 h-5 text-violet-300" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-white">User Registry</h2>
                <p className="text-white/35 text-xs mt-0.5">Manage user access and permissions</p>
              </div>
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full shrink-0" style={{ background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.2)" }}>
                <span className="text-[10px] font-bold text-violet-300/70 uppercase tracking-widest">{filteredUsers?.length ?? 0} users</span>
              </div>
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/25" />
                <Input
                  placeholder="Search by email, ID, IP..."
                  className="pl-9 h-10 rounded-xl text-sm text-white placeholder:text-white/20 focus:border-violet-500/50"
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)" }}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* ── USER CARDS GRID ── */}
        <div className="space-y-3">
          <AnimatePresence>
            {filteredUsers?.map((user, idx) => (
              <motion.div
                key={user.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ delay: idx * 0.03 }}
                className="rounded-2xl overflow-hidden transition-all"
                style={{
                  background: user.isBlocked
                    ? "linear-gradient(135deg, rgba(239,68,68,0.06) 0%, rgba(9,5,26,0.95) 100%)"
                    : "linear-gradient(135deg, rgba(13,7,36,0.95) 0%, rgba(9,5,26,0.98) 100%)",
                  border: user.isBlocked
                    ? "1px solid rgba(239,68,68,0.2)"
                    : "1px solid rgba(139,92,246,0.15)",
                  boxShadow: user.isBlocked
                    ? "0 0 20px rgba(239,68,68,0.05)"
                    : "0 0 20px rgba(139,92,246,0.05)",
                }}
              >
                <div className="p-4 flex flex-col sm:flex-row sm:items-center gap-4">
                  {/* Avatar + Info */}
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 font-black text-base"
                      style={{
                        background: user.isBlocked
                          ? "linear-gradient(135deg, rgba(239,68,68,0.2), rgba(239,68,68,0.1))"
                          : "linear-gradient(135deg, rgba(139,92,246,0.3), rgba(192,132,252,0.15))",
                        border: user.isBlocked ? "1px solid rgba(239,68,68,0.3)" : "1px solid rgba(139,92,246,0.3)",
                        color: user.isBlocked ? "#F87171" : "#C4B5FD",
                        boxShadow: user.isBlocked ? "0 0 12px rgba(239,68,68,0.15)" : "0 0 12px rgba(139,92,246,0.2)",
                      }}>
                      {(user.username || user.email || "?").charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-bold text-white">{user.username || "Unknown"}</span>
                        {user.isBlocked ? (
                          <span className="text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest text-red-400 bg-red-500/10 border border-red-500/20 flex items-center gap-1">
                            <Ban className="w-2.5 h-2.5" /> Blocked
                          </span>
                        ) : (
                          <span className="text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-1">
                            <ShieldCheck className="w-2.5 h-2.5" /> Active
                          </span>
                        )}
                        {user.isIpBlocked && (
                          <span className="text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest text-orange-400 bg-orange-500/10 border border-orange-500/20">IP Banned</span>
                        )}
                      </div>
                      <p className="text-[11px] text-white/40 mt-0.5 truncate">{user.email}</p>
                      <p className="text-[9px] text-white/20 font-mono truncate">{user.id}</p>
                    </div>
                  </div>

                  {/* Stats row */}
                  <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap shrink-0">
                    {/* Queries count */}
                    <div className="flex flex-col items-center px-3 py-1.5 rounded-xl" style={{ background: "rgba(139,92,246,0.08)", border: "1px solid rgba(139,92,246,0.15)" }}>
                      <span className="text-base font-black font-mono text-violet-300">{(user as any).queryCount ?? 0}</span>
                      <span className="text-[8px] text-white/25 uppercase tracking-widest">Queries</span>
                    </div>

                    {/* IP */}
                    <div className="flex flex-col items-start px-3 py-1.5 rounded-xl min-w-[90px]" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
                      <span className="text-[10px] font-mono text-white/50">{user.lastIp || "—"}</span>
                      <span className="text-[8px] text-white/20 uppercase tracking-widest">IP Address</span>
                    </div>

                    {/* Rate Limit */}
                    <button
                      onClick={() => {
                        setRateLimitTarget({ id: user.id, email: user.email || user.username || "User", limit: (user as any).dailyQueryLimit ?? null });
                        setRateLimitValue((user as any).dailyQueryLimit?.toString() ?? "");
                      }}
                      className="flex flex-col items-center px-3 py-1.5 rounded-xl transition-all hover:border-violet-500/30"
                      style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
                      title="Set rate limit"
                    >
                      <span className="text-[10px] font-mono font-bold text-white/50">{(user as any).dailyQueryLimit ? `${(user as any).dailyQueryLimit}/d` : "∞"}</span>
                      <span className="text-[8px] text-white/20 uppercase tracking-widest">Limit</span>
                    </button>

                    {/* Tool buttons */}
                    <div className="flex items-center gap-1">
                      <button title="View Profile" onClick={() => { setSelectedUserForDetail(user); setUserDetailTab("history"); }}
                        className="w-8 h-8 rounded-xl flex items-center justify-center transition-all hover:bg-violet-500/15" style={{ border: "1px solid rgba(139,92,246,0.2)" }}>
                        <Search className="w-3.5 h-3.5 text-violet-400/70" />
                      </button>
                      <button title="Login Activity" onClick={() => setSelectedActivityUser({ id: user.id, email: user.email || user.username || "User" })}
                        className="w-8 h-8 rounded-xl flex items-center justify-center transition-all hover:bg-blue-500/15" style={{ border: "1px solid rgba(59,130,246,0.2)" }}>
                        <LogIn className="w-3.5 h-3.5 text-blue-400/60" />
                      </button>
                      <button title="Notes" onClick={() => setSelectedNotesUser({ id: user.id, email: user.email || user.username || "User" })}
                        className="w-8 h-8 rounded-xl flex items-center justify-center transition-all hover:bg-yellow-500/15" style={{ border: "1px solid rgba(234,179,8,0.2)" }}>
                        <StickyNote className="w-3.5 h-3.5 text-yellow-400/60" />
                      </button>
                      <button title="Send Notification" onClick={() => setNotifTarget({ id: user.id, email: user.email || user.username || "User" })}
                        className="w-8 h-8 rounded-xl flex items-center justify-center transition-all hover:bg-cyan-500/15" style={{ border: "1px solid rgba(6,182,212,0.2)" }}>
                        <MessageSquare className="w-3.5 h-3.5 text-cyan-400/60" />
                      </button>
                    </div>

                    {/* Block / Restore + IP Block */}
                    <div className="flex items-center gap-1.5">
                      {user.lastIp && (
                        <button
                          onClick={() => blockIpMutation.mutate({ userId: user.id, blockIp: !user.isIpBlocked })}
                          disabled={blockIpMutation.isPending}
                          className="h-8 px-3 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all disabled:opacity-40"
                          style={user.isIpBlocked
                            ? { background: "rgba(249,115,22,0.1)", border: "1px solid rgba(249,115,22,0.3)", color: "#FB923C" }
                            : { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.35)" }}
                        >
                          {user.isIpBlocked ? "Unban IP" : "Ban IP"}
                        </button>
                      )}
                      <button
                        onClick={() => blockUserMutation.mutate({ userId: user.id, blocked: !user.isBlocked })}
                        disabled={blockUserMutation.isPending}
                        className="h-8 px-3 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all disabled:opacity-40"
                        style={user.isBlocked
                          ? { background: "rgba(139,92,246,0.12)", border: "1px solid rgba(139,92,246,0.3)", color: "#A78BFA" }
                          : { background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)", color: "#F87171" }}
                      >
                        {user.isBlocked ? "Restore" : "Block"}
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {filteredUsers?.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 gap-3 rounded-2xl" style={{ background: "rgba(139,92,246,0.03)", border: "1px dashed rgba(139,92,246,0.12)" }}>
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: "rgba(139,92,246,0.08)", border: "1px solid rgba(139,92,246,0.15)" }}>
                <Users className="w-5 h-5 text-violet-500/30" />
              </div>
              <span className="text-[11px] text-white/20 uppercase tracking-widest">No users found</span>
            </div>
          )}
        </div>
        </>)}

        {activeSection === "users" && !!selectedUserForDetail && (
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <button onClick={() => setSelectedUserForDetail(null)} className="flex items-center gap-2 text-white/50 hover:text-white text-xs transition-colors">
                <ArrowLeft className="w-4 h-4" /> Back to Users
              </button>
            </div>

            <div className="rounded-2xl border border-violet-500/20 p-6" style={{ background: "rgba(9,5,26,0.8)" }}>
              <div className="flex items-start gap-4 flex-wrap">
                <div className="w-14 h-14 rounded-2xl border border-violet-500/30 flex items-center justify-center shrink-0" style={{ background: "rgba(139,92,246,0.15)" }}>
                  <span className="text-2xl font-black text-violet-300">{(selectedUserForDetail.username || selectedUserForDetail.email || "?").charAt(0).toUpperCase()}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h2 className="text-lg font-bold text-white">{selectedUserForDetail.username || "Unknown"}</h2>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase ${selectedUserForDetail.isBlocked ? "text-red-400 bg-red-500/10 border border-red-500/20" : "text-green-400 bg-green-500/10 border border-green-500/20"}`}>
                      {selectedUserForDetail.isBlocked ? "Blocked" : "Active"}
                    </span>
                    {(selectedUserForDetail as any).queryCount > 0 && (
                      <span className="text-[9px] font-bold text-violet-300 bg-violet-500/10 border border-violet-500/20 px-2 py-0.5 rounded-full">{(selectedUserForDetail as any).queryCount} queries</span>
                    )}
                  </div>
                  <p className="text-sm text-white/50">{selectedUserForDetail.email}</p>
                  <p className="text-[10px] text-white/25 font-mono mt-1">{selectedUserForDetail.id}</p>
                  {selectedUserForDetail.lastIp && (
                    <p className="text-[10px] text-white/30 font-mono mt-0.5">
                      IP: {selectedUserForDetail.lastIp}
                      {selectedUserForDetail.isIpBlocked && <span className="text-orange-400 ml-1">(IP Blocked)</span>}
                    </p>
                  )}
                  {(selectedUserForDetail as any).dailyQueryLimit && (
                    <p className="text-[10px] text-white/30 mt-0.5">Rate Limit: {(selectedUserForDetail as any).dailyQueryLimit} queries/day</p>
                  )}
                </div>
                <div className="flex flex-wrap gap-2 shrink-0">
                  <button onClick={() => blockUserMutation.mutate({ userId: selectedUserForDetail.id, blocked: !selectedUserForDetail.isBlocked })} disabled={blockUserMutation.isPending}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${selectedUserForDetail.isBlocked ? "border-green-500/40 text-green-400 hover:bg-green-500/10" : "border-red-500/40 text-red-400 hover:bg-red-500/10"}`}>
                    {selectedUserForDetail.isBlocked ? "Restore" : "Block User"}
                  </button>
                  {selectedUserForDetail.lastIp && (
                    <button onClick={() => blockIpMutation.mutate({ userId: selectedUserForDetail.id, blockIp: !selectedUserForDetail.isIpBlocked })} disabled={blockIpMutation.isPending}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${selectedUserForDetail.isIpBlocked ? "border-green-500/40 text-green-400 hover:bg-green-500/10" : "border-orange-500/40 text-orange-400 hover:bg-orange-500/10"}`}>
                      {selectedUserForDetail.isIpBlocked ? "Unban IP" : "Ban IP"}
                    </button>
                  )}
                  <button onClick={() => { setRateLimitTarget({ id: selectedUserForDetail.id, email: selectedUserForDetail.email || selectedUserForDetail.username || "User", limit: (selectedUserForDetail as any).dailyQueryLimit ?? null }); setRateLimitValue((selectedUserForDetail as any).dailyQueryLimit?.toString() ?? ""); }}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold border border-white/20 text-white/60 hover:text-white hover:bg-white/[0.05] transition-all">
                    Rate Limit {(selectedUserForDetail as any).dailyQueryLimit ? `(${(selectedUserForDetail as any).dailyQueryLimit}/d)` : "(∞)"}
                  </button>
                  <button onClick={() => setNotifTarget({ id: selectedUserForDetail.id, email: selectedUserForDetail.email || selectedUserForDetail.username || "User" })}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10 transition-all">
                    Notify
                  </button>
                </div>
              </div>
            </div>

            <div className="flex gap-0.5 border-b border-white/[0.07]">
              {[
                { id: "history", label: "Query History", icon: <HistoryIcon className="w-3.5 h-3.5" /> },
                { id: "activity", label: "Login Activity", icon: <LogIn className="w-3.5 h-3.5" /> },
                { id: "notes", label: "Notes", icon: <StickyNote className="w-3.5 h-3.5" /> },
              ].map(tab => (
                <button key={tab.id} onClick={() => setUserDetailTab(tab.id)}
                  className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium transition-all border-b-2 -mb-px ${userDetailTab === tab.id ? "border-violet-500 text-violet-300" : "border-transparent text-white/40 hover:text-white/60"}`}>
                  {tab.icon} {tab.label}
                </button>
              ))}
            </div>

            {userDetailTab === "history" && (
              <div className="rounded-2xl border border-white/[0.07] overflow-hidden" style={{ background: "rgba(9,5,26,0.8)" }}>
                {isLoadingDetailHistory ? (
                  <div className="flex justify-center py-10"><RefreshCw className="w-5 h-5 animate-spin text-violet-400" /></div>
                ) : detailHistory.length === 0 ? (
                  <div className="text-center py-10 text-white/20"><HistoryIcon className="w-6 h-6 mx-auto mb-2 opacity-30" /><p className="text-sm">No query history</p></div>
                ) : (
                  <div className="divide-y divide-white/[0.04]">
                    {detailHistory.map(log => (
                      <div key={log.id}>
                        <button onClick={() => setExpandedLogId(expandedLogId === log.id ? null : log.id)}
                          className="w-full flex items-center gap-3 px-5 py-3 hover:bg-white/[0.03] transition-colors text-left">
                          <span className="shrink-0 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase" style={{ background: "rgba(139,92,246,0.15)", color: "#A78BFA", border: "1px solid rgba(139,92,246,0.25)" }}>{log.service}</span>
                          <span className="text-xs text-white/60 truncate flex-1">{log.query}</span>
                          <span className="text-[10px] text-white/25 font-mono shrink-0">{log.createdAt ? new Date(log.createdAt).toLocaleString() : ""}</span>
                          <ChevronDown className={`w-3.5 h-3.5 text-white/20 shrink-0 transition-transform ${expandedLogId === log.id ? "rotate-180" : ""}`} />
                        </button>
                        {expandedLogId === log.id && (
                          <div className="px-5 pb-4 border-t border-white/[0.04]" style={{ background: "rgba(0,0,0,0.2)" }}>
                            <pre className="text-[10px] font-mono text-green-300/80 bg-black/40 border border-white/[0.06] rounded-xl p-3 mt-3 overflow-x-auto whitespace-pre-wrap max-h-48">
                              {log.result ? JSON.stringify(log.result, null, 2) : "No result data"}
                            </pre>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {userDetailTab === "activity" && (
              <div className="rounded-2xl border border-white/[0.07] overflow-hidden" style={{ background: "rgba(9,5,26,0.8)" }}>
                {isLoadingDetailActivity ? (
                  <div className="flex justify-center py-10"><RefreshCw className="w-5 h-5 animate-spin text-violet-400" /></div>
                ) : detailActivity.length === 0 ? (
                  <div className="text-center py-10 text-white/20"><LogIn className="w-6 h-6 mx-auto mb-2 opacity-30" /><p className="text-sm">No login activity</p></div>
                ) : (
                  <div className="divide-y divide-white/[0.04]">
                    {detailActivity.map((a: any, i: number) => (
                      <div key={i} className="flex items-center gap-4 px-5 py-3">
                        <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
                          <LogIn className="w-3.5 h-3.5 text-blue-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-medium text-white">{a.ipAddress || "Unknown IP"}</div>
                          <div className="text-[10px] text-white/25 truncate">{a.userAgent || ""}</div>
                        </div>
                        <div className="text-[10px] text-white/30 font-mono shrink-0">{a.createdAt ? new Date(a.createdAt).toLocaleString() : ""}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {userDetailTab === "notes" && (
              <div className="space-y-4">
                <div className="flex gap-2">
                  <input value={newNote} onChange={e => setNewNote(e.target.value)} placeholder="Add a note about this user..."
                    onKeyDown={e => { if (e.key === "Enter" && newNote.trim()) { addNoteMutation.mutate({ userId: selectedUserForDetail.id, note: newNote.trim() }); refetchDetailNotes(); setNewNote(""); } }}
                    className="flex-1 bg-white/[0.04] border border-white/[0.1] rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-violet-500/40" />
                  <button onClick={() => { if (newNote.trim()) { addNoteMutation.mutate({ userId: selectedUserForDetail.id, note: newNote.trim() }); refetchDetailNotes(); setNewNote(""); } }}
                    disabled={addNoteMutation.isPending || !newNote.trim()}
                    className="px-4 py-2 rounded-xl bg-violet-600/20 border border-violet-500/30 text-violet-300 text-sm font-bold hover:bg-violet-600/30 transition-all disabled:opacity-40">
                    Add
                  </button>
                </div>
                <div className="rounded-2xl border border-white/[0.07] overflow-hidden" style={{ background: "rgba(9,5,26,0.8)" }}>
                  {detailNotes.length === 0 ? (
                    <div className="text-center py-8 text-white/20"><StickyNote className="w-6 h-6 mx-auto mb-2 opacity-30" /><p className="text-sm">No notes yet</p></div>
                  ) : (
                    <div className="divide-y divide-white/[0.04]">
                      {detailNotes.map(note => (
                        <div key={note.id} className="flex items-start gap-3 px-5 py-3 group">
                          <StickyNote className="w-3.5 h-3.5 text-yellow-400/50 mt-0.5 shrink-0" />
                          <span className="flex-1 text-sm text-white/70">{note.content}</span>
                          <span className="text-[10px] text-white/25 font-mono shrink-0">{note.createdAt ? new Date(note.createdAt).toLocaleDateString() : ""}</span>
                          <button onClick={() => { deleteNoteMutation.mutate(note.id); refetchDetailNotes(); }} className="opacity-0 group-hover:opacity-100 text-red-400/50 hover:text-red-400 transition-all">
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        </div>

      <Dialog open={!!selectedUserHistory} onOpenChange={() => setSelectedUserHistory(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 uppercase tracking-widest">
              <HistoryIcon className="w-5 h-5" />
              Operative Activity Log: {selectedUserHistory?.email}
            </DialogTitle>
            <DialogDescription className="text-primary/40 uppercase text-[10px] tracking-widest">
              Full archive of all executed queries in secure database
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="h-[400px] mt-4 border border-primary/10 rounded p-4 bg-black/50">
            {isLoadingHistory ? (
              <div className="flex justify-center py-8">
                <RefreshCw className="w-6 h-6 animate-spin text-primary/40" />
              </div>
            ) : userHistory && userHistory.length > 0 ? (
              <div className="space-y-4">
                {userHistory.map((log) => (
                  <div key={log.id} className="border-b border-primary/10 pb-4 last:border-0">
                    <div className="flex justify-between text-[10px] mb-2 font-bold">
                      <span className="text-primary uppercase tracking-widest bg-primary/10 px-2 py-0.5 rounded-sm">{log.service} MODULE</span>
                      <span className="text-primary/40 uppercase tracking-tighter">{new Date(log.createdAt || "").toLocaleString()}</span>
                    </div>
                    <div className="text-xs break-all text-primary/80 bg-primary/5 p-3 border border-primary/5 font-mono leading-relaxed cursor-pointer hover:bg-primary/10" onClick={() => setSelectedLog(log)}>
                      <span className="text-primary/30 mr-2">QUERY &gt;</span> {log.query}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-primary/20">
                <ShieldAlert className="w-12 h-12 mb-4 opacity-10" />
                <p className="text-center font-bold tracking-widest uppercase">No Activity Detected</p>
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* ── RATE LIMIT DIALOG ── */}
      <Dialog open={!!rateLimitTarget} onOpenChange={(v) => !v && setRateLimitTarget(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader className="border-b border-primary/10 pb-4">
            <DialogTitle className="flex items-center gap-2 text-primary uppercase tracking-widest">
              <Gauge className="w-5 h-5" /> RATE_LIMIT_CONFIG
            </DialogTitle>
            <DialogDescription className="text-primary/40 uppercase text-[10px] tracking-widest">
              SET DAILY QUERY CAP FOR: {rateLimitTarget?.email}
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] uppercase text-primary/40 tracking-widest">DAILY LIMIT (BLANK = UNLIMITED)</label>
              <Input
                type="number"
                min="1"
                placeholder="e.g. 50 — leave empty for unlimited"
                value={rateLimitValue}
                onChange={(e) => setRateLimitValue(e.target.value)}
                className="bg-black/50 border-primary/20 font-mono text-primary"
              />
            </div>
            <div className="flex gap-2">
              <Button
                className="flex-1 bg-primary/20 border border-primary/50 text-primary hover:bg-primary/30 font-mono uppercase tracking-widest"
                onClick={() => rateLimitTarget && setRateLimitMutation.mutate({
                  userId: rateLimitTarget.id,
                  limit: rateLimitValue.trim() ? parseInt(rateLimitValue) : null,
                })}
                disabled={setRateLimitMutation.isPending}
              >
                APPLY LIMIT
              </Button>
              <Button
                variant="outline"
                className="border-primary/20 text-primary/60 hover:bg-primary/5 font-mono uppercase tracking-widest"
                onClick={() => { setRateLimitValue(""); rateLimitTarget && setRateLimitMutation.mutate({ userId: rateLimitTarget.id, limit: null }); }}
              >
                CLEAR (∞)
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── LOGIN ACTIVITY DIALOG ── */}
      <Dialog open={!!selectedActivityUser} onOpenChange={(v) => !v && setSelectedActivityUser(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh]">
          <DialogHeader className="border-b border-blue-500/10 pb-4">
            <DialogTitle className="flex items-center gap-2 text-blue-400 uppercase tracking-widest">
              <LogIn className="w-5 h-5" /> LOGIN_ACTIVITY_LOG
            </DialogTitle>
            <DialogDescription className="text-blue-500/40 uppercase text-[10px] tracking-widest">
              SESSION HISTORY FOR: {selectedActivityUser?.email}
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="h-[400px] mt-4">
            {isLoadingActivity ? (
              <div className="flex justify-center py-12"><RefreshCw className="w-6 h-6 animate-spin text-primary/30" /></div>
            ) : loginActivityData.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-primary/20">
                <LogIn className="w-10 h-10 mb-3 opacity-20" />
                <p className="text-[10px] uppercase tracking-widest">NO LOGIN EVENTS RECORDED</p>
              </div>
            ) : (
              <div className="space-y-2 p-2">
                {loginActivityData.map((entry, i) => (
                  <div key={entry.id} className={`p-3 border rounded-xl ${i === 0 ? "border-blue-500/30 bg-blue-500/5" : "border-primary/10 bg-white/[0.03]"}`}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <Clock className="w-3 h-3 text-primary/40" />
                        <span className="text-[10px] text-primary/60 uppercase tracking-widest">
                          {new Date(entry.createdAt || "").toLocaleString()}
                        </span>
                        {i === 0 && <span className="text-[8px] bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded-xl uppercase">LATEST</span>}
                      </div>
                      <span className="font-mono text-[10px] text-blue-400/80">{entry.ip || "UNKNOWN_IP"}</span>
                    </div>
                    {entry.userAgent && (
                      <p className="text-[9px] text-primary/20 truncate font-mono mt-1">{entry.userAgent}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* ── USER NOTES DIALOG ── */}
      <Dialog open={!!selectedNotesUser} onOpenChange={(v) => { if (!v) { setSelectedNotesUser(null); setNewNote(""); } }}>
        <DialogContent className="max-w-lg max-h-[90vh]">
          <DialogHeader className="border-b border-yellow-500/10 pb-4">
            <DialogTitle className="flex items-center gap-2 text-yellow-400 uppercase tracking-widest">
              <StickyNote className="w-5 h-5" /> OPERATIVE_NOTES
            </DialogTitle>
            <DialogDescription className="text-yellow-500/40 uppercase text-[10px] tracking-widest">
              INTERNAL NOTES FOR: {selectedNotesUser?.email}
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="ADD A NOTE..."
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && newNote.trim() && selectedNotesUser && addNoteMutation.mutate({ userId: selectedNotesUser.id, note: newNote })}
                className="bg-black/50 border-yellow-500/20 font-mono text-primary placeholder:text-primary/20"
              />
              <Button
                className="bg-yellow-900/40 border border-yellow-500/40 text-yellow-400 hover:bg-yellow-800/40 font-mono uppercase tracking-widest text-[10px]"
                onClick={() => selectedNotesUser && newNote.trim() && addNoteMutation.mutate({ userId: selectedNotesUser.id, note: newNote })}
                disabled={addNoteMutation.isPending || !newNote.trim()}
              >
                ADD
              </Button>
            </div>
            <ScrollArea className="h-[280px] border border-yellow-500/10 rounded-xl bg-black/40 p-2">
              {userNotesData.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full py-10 text-primary/20">
                  <StickyNote className="w-8 h-8 mb-2 opacity-20" />
                  <p className="text-[10px] uppercase tracking-widest">NO NOTES YET</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {userNotesData.map((note) => (
                    <div key={note.id} className="flex items-start justify-between gap-2 p-3 border border-yellow-500/10 rounded-xl bg-yellow-500/5 group">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-primary/80 font-mono">{note.note}</p>
                        <p className="text-[9px] text-primary/20 mt-1 uppercase tracking-widest">
                          {new Date(note.createdAt || "").toLocaleString()}
                        </p>
                      </div>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-6 w-6 shrink-0 opacity-0 group-hover:opacity-100 text-red-500/60 hover:text-red-400 hover:bg-red-500/10 transition-all"
                        onClick={() => deleteNoteMutation.mutate(note.id)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── BROADCAST NOTIFICATION TO ALL USERS ── */}
      <Dialog open={isBroadcastNotifOpen} onOpenChange={(v) => { if (!v) { setIsBroadcastNotifOpen(false); setBroadcastNotifInput({ title: "", message: "" }); } }}>
        <DialogContent className="max-w-sm">
          <DialogHeader className="border-b border-violet-500/10 pb-4">
            <DialogTitle className="flex items-center gap-2 text-violet-400 uppercase tracking-widest">
              <Bell className="w-5 h-5" /> NOTIFY ALL USERS
            </DialogTitle>
            <DialogDescription className="text-violet-400/40 uppercase text-[10px] tracking-widest">
              Sends a notification to every registered user
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 space-y-3">
            <div className="space-y-1">
              <label className="text-[10px] uppercase text-primary/40 tracking-widest">TITLE</label>
              <Input
                placeholder="Notification title..."
                value={broadcastNotifInput.title}
                onChange={(e) => setBroadcastNotifInput({ ...broadcastNotifInput, title: e.target.value })}
                className="bg-black/50 border-violet-500/20 font-mono text-primary"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] uppercase text-primary/40 tracking-widest">MESSAGE</label>
              <textarea
                placeholder="Message content..."
                value={broadcastNotifInput.message}
                onChange={(e) => setBroadcastNotifInput({ ...broadcastNotifInput, message: e.target.value })}
                rows={4}
                className="w-full bg-black/50 border border-violet-500/20 text-primary font-mono text-sm px-3 py-2 rounded-xl focus:outline-none focus:border-violet-500/50 resize-none"
              />
            </div>
            <Button
              className="w-full bg-violet-900/40 border border-violet-500/40 text-violet-400 hover:bg-violet-800/40 font-mono uppercase tracking-widest h-11"
              onClick={() => broadcastNotifInput.title && broadcastNotifInput.message && sendBroadcastNotifMutation.mutate(broadcastNotifInput)}
              disabled={sendBroadcastNotifMutation.isPending || !broadcastNotifInput.title || !broadcastNotifInput.message}
            >
              {sendBroadcastNotifMutation.isPending ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Bell className="w-4 h-4 mr-2" />
              )}
              {sendBroadcastNotifMutation.isPending ? "SENDING..." : "SEND TO ALL USERS"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── SEND NOTIFICATION DIALOG ── */}
      <Dialog open={!!notifTarget} onOpenChange={(v) => { if (!v) { setNotifTarget(null); setNotifInput({ title: "", message: "" }); } }}>
        <DialogContent className="max-w-sm">
          <DialogHeader className="border-b border-cyan-500/10 pb-4">
            <DialogTitle className="flex items-center gap-2 text-cyan-400 uppercase tracking-widest">
              <MessageSquare className="w-5 h-5" /> SEND_MESSAGE
            </DialogTitle>
            <DialogDescription className="text-cyan-500/40 uppercase text-[10px] tracking-widest">
              DIRECT MESSAGE TO: {notifTarget?.email}
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 space-y-3">
            <div className="space-y-1">
              <label className="text-[10px] uppercase text-primary/40 tracking-widest">TITLE</label>
              <Input
                placeholder="MESSAGE TITLE..."
                value={notifInput.title}
                onChange={(e) => setNotifInput({ ...notifInput, title: e.target.value })}
                className="bg-black/50 border-cyan-500/20 font-mono text-primary"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] uppercase text-primary/40 tracking-widest">MESSAGE</label>
              <textarea
                placeholder="MESSAGE CONTENT..."
                value={notifInput.message}
                onChange={(e) => setNotifInput({ ...notifInput, message: e.target.value })}
                rows={4}
                className="w-full bg-black/50 border border-cyan-500/20 text-primary font-mono text-sm px-3 py-2 rounded-xl focus:outline-none focus:border-cyan-500/50 resize-none"
              />
            </div>
            <Button
              className="w-full bg-cyan-900/40 border border-cyan-500/40 text-cyan-400 hover:bg-cyan-800/40 font-mono uppercase tracking-widest h-11"
              onClick={() => notifTarget && notifInput.title && notifInput.message && sendNotificationMutation.mutate({
                userId: notifTarget.id,
                title: notifInput.title,
                message: notifInput.message,
              })}
              disabled={sendNotificationMutation.isPending || !notifInput.title || !notifInput.message}
            >
              <Send className="w-4 h-4 mr-2" /> TRANSMIT_MESSAGE
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!selectedLog} onOpenChange={() => setSelectedLog(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="uppercase tracking-widest">QUERY_FULL_DETAILS</DialogTitle>
          </DialogHeader>
          <ScrollArea className="h-[500px] mt-4 p-4 bg-black/50 border border-primary/10 rounded">
            <div className="space-y-4">
              <div>
                <h4 className="text-[10px] text-primary/40 uppercase mb-1">Service</h4>
                <div className="text-sm font-bold text-primary">{selectedLog?.service}</div>
              </div>
              <div>
                <h4 className="text-[10px] text-primary/40 uppercase mb-1">Query</h4>
                <div className="text-sm font-bold text-primary break-all">{selectedLog?.query}</div>
              </div>
              <div>
                <h4 className="text-[10px] text-primary/40 uppercase mb-1">Timestamp</h4>
                <div className="text-sm text-primary/60">{selectedLog?.createdAt && new Date(selectedLog.createdAt).toLocaleString()}</div>
              </div>
              <div>
                <h4 className="text-[10px] text-primary/40 uppercase mb-1">Raw Result</h4>
                <pre className="text-xs text-primary/80 whitespace-pre-wrap bg-primary/5 p-4 border border-primary/10 rounded">
                  {JSON.stringify(selectedLog?.result, null, 2)}
                </pre>
              </div>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
      </div>
    </div>
  );
}
