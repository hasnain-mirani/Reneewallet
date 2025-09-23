import { apiFetch } from "@/lib/apiClient";

export type SecurityOverview = {
  systemStatus: "secure" | "degraded" | "incident" | "unknown";
  failedLogins24h: number;
  activeSessions: number;
  twoFAEnabledPct: number; // 0..100
};

export type SecurityLog = {
  id: string;
  timestamp: string;              // ISO
  actor: string;                  // e.g. user email / service name
  action: string;                 // e.g. "LOGIN_FAILED", "2FA_ENROLLED"
  ip: string;                     // IPv4/IPv6
  severity: "low" | "medium" | "high" | "critical";
};

export async function fetchSecurityOverview(token: string | null) {
  return apiFetch<SecurityOverview>("/admin/security/overview", { token });
}

export async function fetchSecurityLogs(params: {
  token: string | null;
  search?: string;
  severity?: SecurityLog["severity"];
  page?: number;
  pageSize?: number;
}) {
  const { token, search = "", severity, page = 1, pageSize = 10 } = params;
  const qs = new URLSearchParams({
    search,
    page: String(page),
    pageSize: String(pageSize),
    ...(severity ? { severity } : {}),
  });
  return apiFetch<{ items: SecurityLog[]; meta: { total: number; page: number; pageSize: number; pageCount: number } }>(
    `/admin/security/logs?${qs.toString()}`,
    { token }
  );
}
