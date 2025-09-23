import { apiFetch } from "@/lib/apiClient";

export type DashboardPayload = {
  kpis: {
    totalUsers: { value: number; change: string; trend: "up" | "down" };
    activeWallets: { value: number; change: string; trend: "up" | "down" };
    dailyVolume: { value: string; change: string; trend: "up" | "down" };
    totalRevenue: { value: string; change: string; trend: "up" | "down" };
  };
  userGrowth: { month: string; users: number }[];
  walletBalances: { month: string; balance: number }[];
  transactionStatus: { Success: number; Pending: number; Failed: number };
};

export type RecentTx = {
  id: string;
  hash: string;
  amount: number;
  amountUSD: number;
  currency: string;
  status: "Success" | "Pending" | "Failed";
  date: string;
};

export async function fetchDashboard(token: string | null) {
  return apiFetch<DashboardPayload>("/admin/dashboard", { token });
}

// If your backend serves recent via the same list handler, using ?limit=5:
export async function fetchRecentTransactions(token: string | null, limit = 5) {
  // Option A: dedicated recent endpoint (if you added one):
  // return apiFetch<{ items: RecentTx[] }>(`/admin/transactions/recent?limit=${limit}`, { token });

  // Option B: reuse list with limit param (works with your earlier controller):
  return apiFetch<{ items: RecentTx[] }>(`/admin/transactions?limit=${limit}`, { token });
}

export function toPieData(status: { Success: number; Pending: number; Failed: number }) {
  // Use your theme colors or fixed tokens:
  return [
    { name: "Success", value: status.Success ?? 0, color: "hsl(var(--success))" },
    { name: "Pending", value: status.Pending ?? 0, color: "hsl(var(--warning))" },
    { name: "Failed", value: status.Failed ?? 0, color: "hsl(var(--destructive))" },
  ];
}
