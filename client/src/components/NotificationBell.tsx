import { useState } from "react";
import { Bell, X, CheckCheck, MessageSquare } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";
import { getQueryFn } from "@/lib/queryClient";
import type { Notification } from "@shared/schema";

function authFetch(url: string, options: RequestInit = {}) {
  const token = (window as any).firebaseToken;
  return fetch(url, {
    ...options,
    headers: {
      ...(options.headers as Record<string, string> || {}),
      ...(token ? { "Authorization": `Bearer ${token}` } : {}),
    },
    credentials: "include",
  });
}

export function NotificationBell() {
  const { isAuthenticated } = useAuth();
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: countData } = useQuery<{ count: number } | null>({
    queryKey: ["/api/user/notifications/unread-count"],
    enabled: isAuthenticated,
    refetchInterval: 15000,
    queryFn: getQueryFn({ on401: "returnNull" }),
  });
  const count = countData?.count ?? 0;

  const { data: notifications = [] } = useQuery<Notification[]>({
    queryKey: ["/api/user/notifications"],
    enabled: isAuthenticated && open,
    queryFn: getQueryFn({ on401: "returnNull" }) as any,
  });

  const markReadMutation = useMutation({
    mutationFn: async (id: number) => {
      await authFetch(`/api/user/notifications/${id}/read`, { method: "PATCH" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/notifications"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user/notifications/unread-count"] });
    },
  });

  const markAllMutation = useMutation({
    mutationFn: async () => {
      await authFetch("/api/user/notifications/read-all", { method: "PATCH" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/notifications"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user/notifications/unread-count"] });
    },
  });

  if (!isAuthenticated) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative p-1.5 rounded-lg border border-white/10 hover:border-violet-500/40 hover:bg-violet-500/10 transition-all"
        data-testid="button-notification-bell"
      >
        <Bell className="w-4 h-4 text-white/60" />
        {count > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 flex items-center justify-center bg-violet-500 text-white text-[9px] font-bold rounded-full">
            {count > 9 ? "9+" : count}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.97 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-11 z-50 w-[min(22rem,calc(100vw-2rem))] rounded-2xl border border-white/[0.08] overflow-hidden"
              style={{ background: "#09051A", boxShadow: "0 20px 60px rgba(0,0,0,0.5), 0 0 30px rgba(139,92,246,0.1)" }}
            >
              <div className="h-px w-full bg-gradient-to-r from-transparent via-violet-500/40 to-transparent" />
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-3.5 h-3.5 text-violet-400/70" />
                  <span className="text-xs font-semibold text-white/70">Notifications</span>
                  {count > 0 && (
                    <span className="text-[9px] bg-violet-500/15 text-violet-300 border border-violet-500/25 px-1.5 py-0.5 rounded-full font-medium">
                      {count} new
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {notifications.some((n) => !n.isRead) && (
                    <button
                      onClick={() => markAllMutation.mutate()}
                      className="text-[10px] text-white/30 hover:text-violet-400 flex items-center gap-1 transition-colors font-medium"
                    >
                      <CheckCheck className="w-3 h-3" /> Mark all read
                    </button>
                  )}
                  <button onClick={() => setOpen(false)} className="text-white/20 hover:text-white/60 transition-colors">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="max-h-72 overflow-y-auto divide-y divide-white/[0.04]">
                {notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 text-white/20">
                    <Bell className="w-8 h-8 mb-2 opacity-20" />
                    <p className="text-xs text-white/30 font-medium">No messages yet</p>
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      className={`px-4 py-3 cursor-pointer transition-colors hover:bg-white/[0.03] ${!n.isRead ? "border-l-2 border-violet-500/60" : ""}`}
                      onClick={() => !n.isRead && markReadMutation.mutate(n.id)}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className={`text-xs font-semibold ${n.isRead ? "text-white/40" : "text-white"}`}>{n.title}</p>
                        {!n.isRead && <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-violet-400 mt-1" />}
                      </div>
                      <p className={`text-xs mt-0.5 leading-relaxed ${n.isRead ? "text-white/25" : "text-white/60"}`}>{n.message}</p>
                      <p className="text-[10px] text-white/20 mt-1">
                        {new Date(n.createdAt || "").toLocaleString()}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
