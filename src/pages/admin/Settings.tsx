import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui-admin/card";
import { Button } from "@/components/ui-admin/button";
import { Input } from "@/components/ui-admin/input";
import { Badge } from "@/components/ui-admin/badge";
import { Settings as SettingsIcon, User, Bell, Database, Key } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchSettings,
  updateProfile,
  updateNotifications,
  updateSystem,
  listApiKeys,
  createApiKey,
  revokeApiKey,
  type SettingsPayload,
} from "@/services/settings.api";

const Settings: React.FC = () => {
  const { token: ctxToken } = useAuth();
  // Fallback so requests work on hard refresh before context hydrates
  const token = ctxToken ?? (typeof window !== "undefined" ? localStorage.getItem("token") : null);

  const qc = useQueryClient();

  // Base settings
  const {
    data,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["settings"],
    queryFn: () => fetchSettings(token),
    enabled: true,          // ← don't gate on token
    staleTime: 60_000,
  });

  // API keys list is separate so we can refresh it without refetching the whole settings
  const apiKeysQ = useQuery({
    queryKey: ["settings-apikeys"],
    queryFn: () => listApiKeys(token),
    enabled: true,
    staleTime: 60_000,
  });

  // Local form state
  const [profile, setProfile] = React.useState<SettingsPayload["profile"]>({
    name: "",
    email: "",
    timezone: "",
  });
  const [notif, setNotif] = React.useState<SettingsPayload["notifications"]>({
    emailAlerts: false,
    txAlerts: false,
    weeklyDigest: false,
  });
  const [system, setSystem] = React.useState<SettingsPayload["system"]>({
    maintenanceMode: false,
    sessionTimeoutMinutes: 30,
  });
  const [newKeyName, setNewKeyName] = React.useState("");

  React.useEffect(() => {
    if (data) {
      setProfile(data.profile ?? { name: "", email: "", timezone: "" });
      setNotif(
        data.notifications ?? { emailAlerts: false, txAlerts: false, weeklyDigest: false }
      );
      setSystem(data.system ?? { maintenanceMode: false, sessionTimeoutMinutes: 30 });
    }
  }, [data]);

  const profMut = useMutation({
    mutationFn: () => updateProfile(profile, token),
    onSuccess: (saved) => {
      qc.setQueryData(["settings"], (old: SettingsPayload | undefined) =>
        old ? { ...old, profile: saved } : old
      );
    },
  });

  const notifMut = useMutation({
    mutationFn: () => updateNotifications(notif, token),
    onSuccess: (saved) => {
      qc.setQueryData(["settings"], (old: SettingsPayload | undefined) =>
        old ? { ...old, notifications: saved } : old
      );
    },
  });

  const sysMut = useMutation({
    mutationFn: () => updateSystem(system, token),
    onSuccess: (saved) => {
      qc.setQueryData(["settings"], (old: SettingsPayload | undefined) =>
        old ? { ...old, system: saved } : old
      );
    },
  });

  const createKeyMut = useMutation({
    mutationFn: () => createApiKey(newKeyName.trim() || "Admin key", token),
    onSuccess: (res) => {
      setNewKeyName("");
      qc.invalidateQueries({ queryKey: ["settings-apikeys"] });
      alert(`Copy your API key now (shown once):\n\n${res.key}`);
    },
  });

  const revokeKeyMut = useMutation({
    mutationFn: (id: string) => revokeApiKey(id, token),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["settings-apikeys"] });
    },
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gradient mb-2">Settings</h1>
        <p className="text-muted-foreground">System configuration and preferences</p>
        {isError && (
          <p className="text-sm text-destructive mt-2">
            {(error as Error)?.message || "Failed to load settings."}
          </p>
        )}
      </div>

      {/* Settings grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Profile */}
        <Card className="glass border-border/50">
          <CardHeader className="text-center pb-2">
            <User className="w-12 h-12 text-primary mx-auto mb-2" />
            <CardTitle>Profile Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <label className="text-sm">Name</label>
              <Input
                value={profile.name || ""}
                onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))}
                disabled={isLoading || profMut.isPending}
              />
            </div>
            <div>
              <label className="text-sm">Email</label>
              <Input value={profile.email || ""} disabled />
            </div>
            <div>
              <label className="text-sm">Timezone</label>
              <Input
                placeholder="e.g. Asia/Karachi"
                value={profile.timezone || ""}
                onChange={(e) => setProfile((p) => ({ ...p, timezone: e.target.value }))}
                disabled={isLoading || profMut.isPending}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={() => profMut.mutate()} disabled={isLoading || profMut.isPending}>
                {profMut.isPending ? "Saving..." : "Save Profile"}
              </Button>
              {profMut.isError && (
                <span className="text-xs text-destructive self-center ml-2">
                  {(profMut.error as Error)?.message || "Failed to save."}
                </span>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card className="glass border-border/50">
          <CardHeader className="text-center pb-2">
            <Bell className="w-12 h-12 text-primary mx-auto mb-2" />
            <CardTitle>Notifications</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={!!notif.emailAlerts}
                onChange={(e) => setNotif((n) => ({ ...n, emailAlerts: e.target.checked }))}
                disabled={isLoading || notifMut.isPending}
              />
              Email alerts
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={!!notif.txAlerts}
                onChange={(e) => setNotif((n) => ({ ...n, txAlerts: e.target.checked }))}
                disabled={isLoading || notifMut.isPending}
              />
              Transaction alerts
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={!!notif.weeklyDigest}
                onChange={(e) => setNotif((n) => ({ ...n, weeklyDigest: e.target.checked }))}
                disabled={isLoading || notifMut.isPending}
              />
              Weekly digest
            </label>
            <div className="flex gap-2">
              <Button onClick={() => notifMut.mutate()} disabled={isLoading || notifMut.isPending}>
                {notifMut.isPending ? "Saving..." : "Save Notifications"}
              </Button>
              {notifMut.isError && (
                <span className="text-xs text-destructive self-center ml-2">
                  {(notifMut.error as Error)?.message || "Failed to save."}
                </span>
              )}
            </div>
          </CardContent>
        </Card>

        {/* System */}
        <Card className="glass border-border/50">
          <CardHeader className="text-center pb-2">
            <Database className="w-12 h-12 text-primary mx-auto mb-2" />
            <CardTitle>System Config</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={!!system.maintenanceMode}
                onChange={(e) => setSystem((s) => ({ ...s, maintenanceMode: e.target.checked }))}
                disabled={isLoading || sysMut.isPending}
              />
              Maintenance mode
            </label>
            <div>
              <label className="text-sm">Session timeout (minutes)</label>
              <Input
                type="number"
                min={5}
                step={5}
                value={system.sessionTimeoutMinutes ?? 30}
                onChange={(e) =>
                  setSystem((s) => ({
                    ...s,
                    sessionTimeoutMinutes: Number(e.target.value || 0),
                  }))
                }
                disabled={isLoading || sysMut.isPending}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={() => sysMut.mutate()} disabled={isLoading || sysMut.isPending}>
                {sysMut.isPending ? "Saving..." : "Save System"}
              </Button>
              {sysMut.isError && (
                <span className="text-xs text-destructive self-center ml-2">
                  {(sysMut.error as Error)?.message || "Failed to save."}
                </span>
              )}
            </div>
          </CardContent>
        </Card>

        {/* API Keys */}
        <Card className="glass border-border/50 md:col-span-2 lg:col-span-3">
          <CardHeader className="text-center pb-2">
            <Key className="w-12 h-12 text-primary mx-auto mb-2" />
            <CardTitle>API Keys</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Key name (e.g. Admin CLI)"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                disabled={createKeyMut.isPending}
                className="max-w-xs"
              />
              <Button
                onClick={() => createKeyMut.mutate()}
                disabled={!newKeyName.trim() || createKeyMut.isPending}
              >
                {createKeyMut.isPending ? "Creating..." : "Create Key"}
              </Button>
              {createKeyMut.isError && (
                <span className="text-xs text-destructive self-center ml-2">
                  {(createKeyMut.error as Error)?.message || "Failed to create key."}
                </span>
              )}
            </div>

            <div className="grid gap-2">
              {(apiKeysQ.data?.items ?? []).map((k) => (
                <div key={k.id} className="flex items-center justify-between rounded-md border p-3">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline">{k.name}</Badge>
                    <span className="text-sm text-muted-foreground">
                      **** **** **** {k.last4} • {new Date(k.createdAt).toLocaleDateString()}
                    </span>
                    {k.active ? (
                      <span className="text-xs px-2 py-0.5 rounded bg-success text-success-foreground">
                        Active
                      </span>
                    ) : (
                      <span className="text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground">
                        Revoked
                      </span>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => revokeKeyMut.mutate(k.id)}
                    disabled={!k.active || revokeKeyMut.isPending}
                  >
                    {revokeKeyMut.isPending ? "Revoking..." : "Revoke"}
                  </Button>
                </div>
              ))}
              {apiKeysQ.isLoading && (
                <div className="text-sm text-muted-foreground">Loading keys…</div>
              )}
              {!apiKeysQ.isLoading && (apiKeysQ.data?.items?.length ?? 0) === 0 && (
                <div className="text-sm text-muted-foreground">No API keys yet.</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom info */}
      <Card className="glass border-border/50">
        <CardContent className="flex items-center justify-center min-h-[220px]">
          <div className="text-center space-y-4">
            <SettingsIcon className="w-16 h-16 text-primary mx-auto animate-pulse-glow" />
            <h3 className="text-2xl font-bold text-gradient">Settings Panel</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Manage profile, notifications, system flags, and API keys — all backed by your API.
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default Settings;
