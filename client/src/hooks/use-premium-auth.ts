import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export interface PremiumUser {
  id: number;
  username: string;
  role: string;
  expiresAt: string | null;
}

async function fetchMe(): Promise<PremiumUser> {
  const res = await fetch("/api/premium/me", { credentials: "include" });
  if (!res.ok) throw new Error("Not authenticated");
  return res.json();
}

export function usePremiumAuth() {
  const queryClient = useQueryClient();

  const { data: premiumUser, isLoading } = useQuery<PremiumUser>({
    queryKey: ["/api/premium/me"],
    queryFn: fetchMe,
    retry: false,
    staleTime: 60_000,
  });

  const loginMutation = useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      const res = await fetch("/api/premium/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: "Login failed" }));
        throw new Error(err.message || "Login failed");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/premium/me"] });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await fetch("/api/premium/logout", { method: "POST", credentials: "include" });
    },
    onSuccess: () => {
      queryClient.setQueryData(["/api/premium/me"], null);
      queryClient.invalidateQueries({ queryKey: ["/api/premium/me"] });
    },
  });

  return {
    premiumUser,
    isLoading,
    isPremium: !!premiumUser,
    login: loginMutation.mutateAsync,
    logout: logoutMutation.mutate,
    isLoggingIn: loginMutation.isPending,
    isLoggingOut: logoutMutation.isPending,
    loginError: loginMutation.error,
  };
}
