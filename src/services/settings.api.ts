import { apiFetch } from "@/lib/apiClient";

// ---------- Types ----------
export type ProfileSettings = {
  name: string;
  email: string;       // read-only server-side if you prefer
  timezone?: string;
};

export type NotificationSettings = {
  emailAlerts: boolean;
  txAlerts: boolean;
  weeklyDigest: boolean;
};

export type SystemSettings = {
  maintenanceMode: boolean;
  sessionTimeoutMinutes: number;
};

export type ApiKey = {
  id: string;
  name: string;
  last4: string;
  createdAt: string;
  active: boolean;
};

export type SettingsPayload = {
  profile: ProfileSettings;
  notifications: NotificationSettings;
  system: SystemSettings;
  apiKeys: ApiKey[];
};

// ---------- Calls ----------
export async function fetchSettings(token: string | null) {
  return apiFetch<SettingsPayload>("/admin/settings", { token });
}

export async function updateProfile(data: Partial<ProfileSettings>, token: string | null) {
  return apiFetch<ProfileSettings>("/admin/settings/profile", { method: "PATCH", body: data, token });
}

export async function updateNotifications(data: Partial<NotificationSettings>, token: string | null) {
  return apiFetch<NotificationSettings>("/admin/settings/notifications", { method: "PATCH", body: data, token });
}

export async function updateSystem(data: Partial<SystemSettings>, token: string | null) {
  return apiFetch<SystemSettings>("/admin/settings/system", { method: "PATCH", body: data, token });
}

export async function listApiKeys(token: string | null) {
  return apiFetch<{ items: ApiKey[] }>("/admin/settings/apikeys", { token });
}

export async function createApiKey(name: string, token: string | null) {
  // returns { key: 'PLAINTEXT_ONCE', item: ApiKey }
  return apiFetch<{ key: string; item: ApiKey }>("/admin/settings/apikeys", {
    method: "POST",
    body: { name },
    token,
  });
}

export async function revokeApiKey(id: string, token: string | null) {
  return apiFetch<void>(`/admin/settings/apikeys/${id}`, { method: "DELETE", token });
}
