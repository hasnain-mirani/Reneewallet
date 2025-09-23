import { apiFetch } from "@/lib/apiClient";

export type AnalyticsPayload = {
  kpis: {
    totalUsers: number;
    dailyActive: number;
    volume24h: number;   // USD
    revenue30d: number;  // USD
    usersChange?: string;    // "+12%" etc
    dauChange?: string;
    volumeChange?: string;
    revenueChange?: string;
  };
  series: {
    dau: { date: string; value: number }[];          // last 30d
    volumeUSD: { date: string; value: number }[];    // last 30d
  };
};

// Expected backend endpoint:
// GET /api/admin/analytics  -> AnalyticsPayload
export async function fetchAnalytics(token: string | null) {
  return apiFetch<AnalyticsPayload>("/admin/analytics", { token });
}
