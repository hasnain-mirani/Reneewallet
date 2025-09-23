// src/services/users.api.ts
import { apiFetch } from "@/lib/apiClient";

export type UserRole = "Viewer" | "Manager" | "Admin" | "VIP User";
export type UserStatus = "Active" | "Inactive" | "Suspended";

export type User = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  walletCount: number;
  totalBalance: number;
  createdAt: string; // ISO
};

export async function fetchUsers(params: {
  token: string | null;
  search?: string;
  page?: number;
  pageSize?: number;
  sort?: string;
}) {
  const { token, search = "", page = 1, pageSize = 10, sort = "createdAt:desc" } = params;
  const qs = new URLSearchParams({ search, page: String(page), pageSize: String(pageSize), sort });
  return apiFetch<{ items: User[]; meta: { total: number; page: number; pageSize: number; pageCount: number } }>(
    `/admin/users?${qs.toString()}`,
    { token }
  );
}

export async function fetchUserStats(token: string | null) {
  return apiFetch<{ total: number; active: number; vip: number }>(`/admin/users/stats`, { token });
}

export async function createUser(payload: {
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  walletCount?: number;
  totalBalance?: number;
}, token: string | null) {
  return apiFetch<User>(`/admin/users`, { method: "POST", body: payload, token });
}

export async function deleteUser(id: string, token: string | null) {
  return apiFetch<void>(`/admin/users/${id}`, { method: "DELETE", token });
}
