import { apiFetch } from "@/lib/apiClient";

export type TxStatus = "Success" | "Pending" | "Failed";
export type TxType = "Transfer" | "Deposit" | "Withdrawal";

export type Transaction = {
  id: string;
  hash: string;
  type?: TxType;     // optional fallback if backend doesn't include
  from?: string;
  to?: string;
  currency: string;
  amount: number;
  amountUSD: number;
  fee?: number;
  feeUSD?: number;
  status: TxStatus;
  date: string;
};

export type TransactionsResponse = {
  items: Transaction[];
  meta?: { total: number; page: number; pageSize: number; pageCount: number };
};

export type TxStats = {
  total: number;
  success: number;
  pending: number;
  totalVolumeUSD: number;
};

export async function fetchTransactions(params: {
  token: string | null;
  search?: string;
  status?: TxStatus | "";
  type?: TxType | "";
  page?: number;
  pageSize?: number;
  sort?: string; // "date:desc"
}) {
  const { token, search = "", status = "", type = "", page = 1, pageSize = 10, sort = "date:desc" } = params;
  const qs = new URLSearchParams({
    search, status, type,
    page: String(page),
    pageSize: String(pageSize),
    sort
  });
  return apiFetch<TransactionsResponse>(`/admin/transactions?${qs.toString()}`, { token });
}

export async function fetchTransactionStats(params: {
  token: string | null;
  search?: string;
  status?: TxStatus | "";
  type?: TxType | "";
}) {
  const { token, search = "", status = "", type = "" } = params;
  const qs = new URLSearchParams({ search, status, type });
  return apiFetch<TxStats>(`/admin/transactions/stats?${qs.toString()}`, { token });
}

export async function exportTransactionsCSV(params: {
  token: string | null;
  search?: string;
  status?: TxStatus | "";
  type?: TxType | "";
  sort?: string;
}) {
  const { token, search = "", status = "", type = "", sort = "date:desc" } = params;
  const qs = new URLSearchParams({ search, status, type, sort });
  const base = (import.meta.env.VITE_API_BASE_URL as string).replace(/\/+$/, "");
  const url = `${base}/admin/transactions/export?${qs.toString()}`;

  const res = await fetch(url, {
    headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to export CSV");
  return res.blob();
}
