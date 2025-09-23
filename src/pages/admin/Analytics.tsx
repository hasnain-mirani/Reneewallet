import React from "react";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui-admin/card"; // ⬅ keep consistent with your other admin pages
import { BarChart3, TrendingUp, Users, Activity } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { fetchAnalytics, type AnalyticsPayload } from "@/services/analytics.api";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  AreaChart,
  Area,
  Legend,
} from "recharts";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.1 } },
};
const itemVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };

const KPI = ({
  icon: Icon,
  label,
  value,
  sub,
}: {
  icon: any;
  label: string;
  value: string | number;
  sub?: string;
}) => (
  <motion.div variants={itemVariants}>
    <Card className="glass border-border/50 hover:shadow-card transition-all hover:-translate-y-0.5">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm text-muted-foreground">{label}</CardTitle>
        <Icon className="w-4 h-4 text-primary" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-gradient">{typeof value === "number" ? value.toLocaleString() : value}</div>
        {sub && <div className="text-xs text-muted-foreground mt-1">{sub}</div>}
      </CardContent>
    </Card>
  </motion.div>
);

const Analytics: React.FC = () => {
  const { token: ctxToken } = useAuth();
  // fallback so queries run on reload before context hydrates
  const token = ctxToken ?? (typeof window !== "undefined" ? localStorage.getItem("token") : null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["analytics"],
    queryFn: () => fetchAnalytics(token),
    enabled: true, // don't gate on token; apiClient will attach it if present
    staleTime: 60_000,
  });

  // When API is not available yet (404), keep your "Coming soon" card
  const showComingSoon = isError || !data;

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={itemVariants}>
        <h1 className="text-3xl font-bold text-gradient mb-2">Analytics</h1>
        <p className="text-muted-foreground">Advanced insights and reporting</p>
      </motion.div>

      {/* Loading skeleton */}
      {isLoading && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 rounded-lg animate-pulse bg-muted/40" />
          ))}
        </div>
      )}

      {/* Coming Soon (fallback) */}
      {showComingSoon && !isLoading && (
        <Card className="glass border-border/50">
          <CardContent className="flex items-center justify-center min-h-[400px]">
            <div className="text-center space-y-4">
              <BarChart3 className="w-16 h-16 text-primary mx-auto animate-pulse-glow" />
              <h3 className="text-2xl font-bold text-gradient">Advanced Analytics</h3>
              <p className="text-muted-foreground max-w-md">
                Detailed analytics dashboard with user behavior insights, transaction patterns,
                and revenue analytics coming soon.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Real content when API responds */}
      {!showComingSoon && data && (
        <>
          {/* KPIs */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <KPI icon={Users} label="Total Users" value={data.kpis.totalUsers} sub={data.kpis.usersChange} />
            <KPI icon={Activity} label="Daily Active Users" value={data.kpis.dailyActive} sub={data.kpis.dauChange} />
            <KPI icon={TrendingUp} label="24h Volume (USD)" value={`$${data.kpis.volume24h.toLocaleString()}`} sub={data.kpis.volumeChange} />
            <KPI icon={BarChart3} label="30d Revenue (USD)" value={`$${data.kpis.revenue30d.toLocaleString()}`} sub={data.kpis.revenueChange} />
          </div>

          {/* Charts */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* DAU trend */}
            <motion.div variants={itemVariants}>
              <Card className="glass border-border/50">
                <CardHeader>
                  <CardTitle>Daily Active Users</CardTitle>
                  <CardDescription>Last 30 days</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={data.series.dau}>
                      <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                      <XAxis dataKey="date" className="text-xs" />
                      <YAxis className="text-xs" />
                      <Tooltip contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }} />
                      <Legend />
                      <Line type="monotone" dataKey="value" stroke="hsl(var(--primary))" strokeWidth={3} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </motion.div>

            {/* Volume trend */}
            <motion.div variants={itemVariants}>
              <Card className="glass border-border/50">
                <CardHeader>
                  <CardTitle>Transaction Volume (USD)</CardTitle>
                  <CardDescription>Last 30 days</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={data.series.volumeUSD}>
                      <defs>
                        <linearGradient id="volGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.1} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                      <XAxis dataKey="date" className="text-xs" />
                      <YAxis className="text-xs" tickFormatter={(v) => `$${Number(v).toLocaleString()}`} />
                      <Tooltip
                        formatter={(v: any) => [`$${Number(v).toLocaleString()}`, "Volume"]}
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                      />
                      <Legend />
                      <Area type="monotone" dataKey="value" stroke="hsl(var(--primary))" fill="url(#volGrad)" strokeWidth={3} />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </>
      )}
    </motion.div>
  );
};

export default Analytics;
