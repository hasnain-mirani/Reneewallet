import { apiFetch } from "@/lib/apiClient";

export type WalletStatus = "Active" | "Frozen";

export type Wallet = {
  id: string;
  address: string;
  userName: string;
  currency: string;        // e.g. "USDT", "ETH"
  balance: number;         // native units
  balanceUSD: number;      // USD
  status: WalletStatus;
  lastTransaction: string; // ISO
};

export type WalletsResponse = {
  items: Wallet[];
  meta: { total: number; page: number; pageSize: number; pageCount: number };
};

export type WalletStats = {
  total: number;
  active: number;
  totalValueUSD: number;
};

export type ListParams = {
  token: string | null;
  search?: string;
  page?: number;
  pageSize?: number;
  sort?: string; // e.g. "lastTransaction:desc"
};

export async function fetchWallets(params: ListParams) {
  const { token, search = "", page = 1, pageSize = 10, sort = "lastTransaction:desc" } = params;
  const qs = new URLSearchParams({
    search,
    page: String(page),
    pageSize: String(pageSize),
    sort,
  });
  return apiFetch<WalletsResponse>(`/admin/wallets?${qs.toString()}`, { token });
}

export async function fetchWalletStats(token: string | null) {
  return apiFetch<WalletStats>(`/admin/wallets/stats`, { token });
}

// If your backend exposes PATCH /admin/wallets/:id/status { status: "Active"|"Frozen" }
export async function updateWalletStatus(id: string, status: WalletStatus, token: string | null) {
  return apiFetch<void>(`/admin/wallets/${id}/status`, {
    method: "PATCH",
    token,
    body: { status },
  });
}

// If instead you have separate endpoints, adapt like:
// export const freezeWallet = (id, token) => apiFetch<void>(`/admin/wallets/${id}/freeze`, { method: "POST", token });
// export const unfreezeWallet = (id, token) => apiFetch<void>(`/admin/wallets/${id}/unfreeze`, { method: "POST", token });
