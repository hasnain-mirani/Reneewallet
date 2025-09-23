import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui-admin/card";
import { Button } from "@/components/ui-admin/button";
import { Input } from "@/components/ui-admin/input";
import { Badge } from "@/components/ui-admin/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui-admin/table";
import { Shield, Lock, AlertTriangle, Eye, Search, Filter } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { fetchSecurityOverview, fetchSecurityLogs, type SecurityLog, type SecurityOverview } from "@/services/security.api";

// tiny debounce so we don't spam the API while typing
function useDebounced<T>(value: T, delay = 400) {
  const [debounced, setDebounced] = React.useState(value);
  React.useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

const severityBadge = (sev: SecurityLog["severity"]) => {
  const map: Record<SecurityLog["severity"], string> = {
    low: "bg-muted text-muted-foreground",
    medium: "bg-warning text-warning-foreground",
    high: "bg-destructive text-destructive-foreground",
    critical: "bg-destructive text-destructive-foreground",
  };
  return <Badge className={map[sev]}>{sev.toUpperCase()}</Badge>;
};

const Security: React.FC = () => {
  const { token: ctxToken } = useAuth();
  const token = ctxToken ?? (typeof window !== "undefined" ? localStorage.getItem("token") : null);

  // filters/pagination for logs
  const [search, setSearch] = React.useState("");
  const debounced = useDebounced(search);
  const [severity, setSeverity] = React.useState<SecurityLog["severity"] | "all">("all");
  const [page, setPage] = React.useState(1);
  const pageSize = 10;

  // overview KPIs
  const ov = useQuery({
    queryKey: ["security-overview"],
    queryFn: () => fetchSecurityOverview(token),
    enabled: true,
    staleTime: 60_000,
  });

  // logs
  const logsQ = useQuery({
    queryKey: ["security-logs", { search: debounced, severity, page, pageSize }],
    queryFn: () =>
      fetchSecurityLogs({
        token,
        search: debounced,
        severity: severity === "all" ? undefined : severity,
        page,
        pageSize,
      }),
    enabled: true,
    keepPreviousData: true,
    staleTime: 30_000,
  });

  const overview = ov.data as SecurityOverview | undefined;
  const logs = logsQ.data?.items ?? [];
  const meta = logsQ.data?.meta ?? { total: 0, page: 1, pageSize, pageCount: 1 };

  const systemStatusBadge = (status: SecurityOverview["systemStatus"]) => {
    const s = status?.toLowerCase();
    if (s === "secure") return <span className="text-success font-semibold">Secure</span>;
    if (s === "degraded") return <span className="text-warning font-semibold">Degraded</span>;
    if (s === "incident") return <span className="text-destructive font-semibold">Incident</span>;
    return <span className="text-muted-foreground font-medium">Unknown</span>;
  };

  const showComingSoon = ov.isError && !logsQ.data; // if no endpoints yet, keep your original card

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gradient mb-2">Security</h1>
        <p className="text-muted-foreground">Security monitoring and audit logs</p>
        {(ov.isError || logsQ.isError) && (
          <p className="text-sm text-destructive mt-2">
            {((ov.error || logsQ.error) as Error)?.message || "Failed to load security data."}
          </p>
        )}
      </div>

      {/* Overview KPIs (with skeletons) */}
      {!showComingSoon && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="glass border-border/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">System Status</CardTitle>
              <Shield className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {ov.isLoading ? "—" : systemStatusBadge(overview?.systemStatus ?? "unknown")}
              </div>
              <p className="text-xs text-muted-foreground">Overall security posture</p>
            </CardContent>
          </Card>

          <Card className="glass border-border/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Failed Logins</CardTitle>
              <AlertTriangle className="h-4 w-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-warning">
                {ov.isLoading ? "—" : (overview?.failedLogins24h ?? 0).toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">Last 24 hours</p>
            </CardContent>
          </Card>

          <Card className="glass border-border/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
              <Eye className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gradient">
                {ov.isLoading ? "—" : (overview?.activeSessions ?? 0).toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">Currently logged in</p>
            </CardContent>
          </Card>

          <Card className="glass border-border/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">2FA Enabled</CardTitle>
              <Lock className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">
                {ov.isLoading ? "—" : `${Math.round(overview?.twoFAEnabledPct ?? 0)}%`}
              </div>
              <p className="text-xs text-muted-foreground">User adoption rate</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Audit Logs */}
      {!showComingSoon && (
        <Card className="glass border-border/50">
          <CardHeader>
            <div className="flex items-center justify-between gap-4">
              <div>
                <CardTitle>Audit Logs</CardTitle>
                <CardDescription>Recent security-related events</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search actor, action, IP…"
                    className="pl-10 w-[260px]"
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setPage(1);
                    }}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <select
                    className="rounded-md border bg-background px-2 py-1 text-sm"
                    value={severity}
                    onChange={(e) => {
                      setSeverity(e.target.value as any);
                      setPage(1);
                    }}
                  >
                    <option value="all">All severities</option>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {logsQ.isLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-10 w-full rounded bg-muted/40 animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Time</TableHead>
                      <TableHead>Actor</TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead>IP</TableHead>
                      <TableHead>Severity</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {logs.map((log) => (
                      <TableRow key={log.id} className="hover:bg-muted/30">
                        <TableCell className="whitespace-nowrap">
                          {new Date(log.timestamp).toLocaleString()}
                        </TableCell>
                        <TableCell>{log.actor}</TableCell>
                        <TableCell>{log.action}</TableCell>
                        <TableCell className="font-mono text-sm">{log.ip}</TableCell>
                        <TableCell>{severityBadge(log.severity)}</TableCell>
                      </TableRow>
                    ))}
                    {!logsQ.isLoading && logs.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5}>
                          <div className="text-center text-muted-foreground py-6">
                            No logs found.
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            )}

            {/* Pagination */}
            {!logsQ.isLoading && meta.pageCount > 1 && (
              <div className="flex items-center justify-between pt-4">
                <div className="text-sm text-muted-foreground">
                  Page <span className="font-medium">{meta.page}</span> of{" "}
                  <span className="font-medium">{meta.pageCount}</span> • {meta.total} events
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={meta.page <= 1}
                  >
                    Prev
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.min(meta.pageCount, p + 1))}
                    disabled={meta.page >= meta.pageCount}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Coming Soon (if endpoints not ready) */}
      {showComingSoon && (
        <Card className="glass border-border/50">
          <CardContent className="flex items-center justify-center min-h-[400px]">
            <div className="text-center space-y-4">
              <Shield className="w-16 h-16 text-primary mx-auto animate-pulse-glow" />
              <h3 className="text-2xl font-bold text-gradient">Security Center</h3>
              <p className="text-muted-foreground max-w-md">
                Comprehensive security monitoring, audit logs, threat detection,
                and incident management coming soon.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </motion.div>
  );
};

export default Security;
