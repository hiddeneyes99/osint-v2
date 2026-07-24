import { QueryClient, QueryFunction } from "@tanstack/react-query";

const API_BASE = (import.meta.env.VITE_API_URL as string) || "";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    let text = `${res.status} ${res.statusText}`;
    try { text = await res.text(); } catch {}
    throw new Error(`${res.status}: ${text}`);
  }
  // Guard: if the server returned HTML (Vite catch-all) instead of JSON, treat as 404
  const ct = res.headers.get("content-type") || "";
  if (!ct.includes("application/json") && !ct.includes("text/plain")) {
    throw new Error(`404: API route not found`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const token = (window as any).firebaseToken;
  const fullUrl = url.startsWith("/") ? `${API_BASE}${url}` : url;
  const res = await fetch(fullUrl, {
    method,
    headers: {
      ...(data ? { "Content-Type": "application/json" } : {}),
      ...(token ? { "Authorization": `Bearer ${token}` } : {}),
    },
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    const message = errorData.message || res.statusText || "An error occurred";
    const error = new Error(message);
    (error as any).status = res.status;
    (error as any).reason = errorData.reason;
    throw error;
  }
  
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const token = (window as any).firebaseToken;
    const adminToken = localStorage.getItem("adminToken");
    const rawUrl = queryKey.join("/") as string;
    const fullUrl = rawUrl.startsWith("/") ? `${API_BASE}${rawUrl}` : rawUrl;
    const res = await fetch(fullUrl, {
      headers: {
        ...(token ? { "Authorization": `Bearer ${token}` } : {}),
        ...(adminToken ? { "X-Admin-Token": adminToken } : {}),
      },
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
