import React from "react";
import { motion } from "framer-motion";
import {
  LineChart, Line, AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui-admin/card";
import { Badge } from "@/components/ui-admin/badge";
import {
  Users, Wallet, TrendingUp, DollarSign, ArrowUpIcon, ArrowDownIcon,
  Activity, Clock, CheckCircle, XCircle, AlertTriangle,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { fetchDashboard, fetchRecentTransactions, toPieData } from "@/services/dashboard.api";

// Motion
const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.1 } } };
const itemVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };

// KPI Card
const KPICard = ({
  title, value, change, trend, icon: Icon,
}: { title: string; value: string; change: string; trend: "up" | "down"; icon: any }) => (
  <motion.div variants={itemVariants} className="group">
    <Card className="glass border-border/50 hover:shadow-card transition-all duration-300 hover:-translate-y-1">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Icon className="h-4 w-4 text-primary group-hover:scale-110 transition-transform duration-200" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-gradient mb-2">{value}</div>
        <div className="flex items-center text-xs">
          {trend === "up" ? (
            <ArrowUpIcon className="h-3 w-3 text-success mr-1" />
          ) : (
            <ArrowDownIcon className="h-3 w-3 text-destructive mr-1" />
          )}
          <span className={trend === "up" ? "text-success" : "text-destructive"}>{change}</span>
          <span className="text-muted-foreground ml-1">from last month</span>
        </div>
      </CardContent>
    </Card>
  </motion.div>
);

// Status pill
const StatusBadge = ({ status }: { status: string }) => {
  const variants = {
    Success: { icon: CheckCircle, className: "bg-success text-success-foreground" },
    Pending: { icon: Clock, className: "bg-warning text-warning-foreground" },
    Failed: { icon: XCircle, className: "bg-destructive text-destructive-foreground" },
  } as const;
  const cfg = variants[status as keyof typeof variants];
  if (!cfg) return <Badge variant="outline">{status}</Badge>;
  const Icon = cfg.icon;
  return <Badge className={cfg.className}><Icon className="w-3 h-3 mr-1" />{status}</Badge>;
};

const Dashboard: React.FC = () => {
  const { token: ctxToken } = useAuth();
  // fallback so requests run even before context hydrates
  const token = ctxToken ?? (typeof window !== "undefined" ? localStorage.getItem("token") : null);

  // Dashboard aggregates
  const {
    data: dashboard,
    isLoading: dashboardLoading,
    isError: dashboardError,
    error: dashboardErr,
  } = useQuery({
    queryKey: ["dashboard"],
    queryFn: () => fetchDashboard(token),
    enabled: true,         // don't gate on token; apiClient will attach it if available
    staleTime: 60_000,
  });

  // Recent transactions
  const {
    data: recent,
    isLoading: txLoading,
    isError: txError,
    error: txErr,
  } = useQuery({
    queryKey: ["recent-transactions", 5],
    queryFn: () => fetchRecentTransactions(token, 5),
    enabled: true,
    staleTime: 30_000,
  });

  const isLoading = dashboardLoading || txLoading;
  const hasError = dashboardError || txError;

  const kpis = dashboard?.kpis;
  const userGrowth = dashboard?.userGrowth ?? [];
  const walletBalances = dashboard?.walletBalances ?? [];
  const transactionStatus = toPieData(dashboard?.transactionStatus ?? { Success: 0, Pending: 0, Failed: 0 });
  const recentTxns = recent?.items?.slice(0, 5) ?? [];

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      {/* Header */}
      <motion.div variants={itemVariants}>
        <h1 className="text-3xl font-bold text-gradient mb-2">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back! Here's what's happening with Renee Wallet today.</p>
      </motion.div>

      {/* Loading */}
      {isLoading && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 rounded-lg animate-pulse bg-muted/40" />
          ))}
        </div>
      )}

      {/* Error */}
      {hasError && (
        <Card>
          <CardHeader>
            <CardTitle>Unable to load data</CardTitle>
            <CardDescription className="text-destructive">
              {(dashboardErr as Error)?.message || (txErr as Error)?.message || "Please try again."}
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      {/* KPI Cards */}
      {!isLoading && !hasError && kpis && (
        <motion.div variants={itemVariants} className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <KPICard title="Total Users" value={kpis.totalUsers.value.toLocaleString()} change={kpis.totalUsers.change} trend={kpis.totalUsers.trend} icon={Users} />
          <KPICard title="Active Wallets" value={kpis.activeWallets.value.toLocaleString()} change={kpis.activeWallets.change} trend={kpis.activeWallets.trend} icon={Wallet} />
          <KPICard title="24h Volume" value={kpis.dailyVolume.value} change={kpis.dailyVolume.change} trend={kpis.dailyVolume.trend} icon={TrendingUp} />
          <KPICard title="Total Revenue" value={kpis.totalRevenue.value} change={kpis.totalRevenue.change} trend={kpis.totalRevenue.trend} icon={DollarSign} />
        </motion.div>
      )}

      {/* Charts Row */}
      {!isLoading && !hasError && (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* User Growth */}
          <motion.div variants={itemVariants}>
            <Card className="glass border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="w-5 h-5 text-primary" /><span>User Growth</span>
                </CardTitle>
                <CardDescription>Monthly active user growth over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={userGrowth}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="month" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} />
                    <Line type="monotone" dataKey="users" stroke="hsl(var(--primary))" strokeWidth={3}
                      dot={{ fill: "hsl(var(--accent))", strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, stroke: "hsl(var(--accent))", strokeWidth: 2 }} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>

          {/* Transaction Status Pie */}
          <motion.div variants={itemVariants}>
            <Card className="glass border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <AlertTriangle className="w-5 h-5 text-primary" /><span>Transaction Status</span>
                </CardTitle>
                <CardDescription>Distribution of transaction statuses</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie data={transactionStatus} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="value">
                      {transactionStatus.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      )}

      {/* Wallet Balance Trend */}
      {!isLoading && !hasError && (
        <motion.div variants={itemVariants}>
          <Card className="glass border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Wallet className="w-5 h-5 text-primary" /><span>Total Wallet Balance Trend</span>
              </CardTitle>
              <CardDescription>Total USD value across all wallets</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={walletBalances}>
                  <defs>
                    <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.1} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="month" className="text-xs" />
                  <YAxis tickFormatter={(v) => `$${(v / 1_000_000).toFixed(1)}M`} className="text-xs" />
                  <Tooltip
                    formatter={(v: any) => [`$${Number(v).toLocaleString()}`, "Balance"]}
                    contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }}
                  />
                  <Area type="monotone" dataKey="balance" stroke="hsl(var(--primary))"
                    fillOpacity={1} fill="url(#colorBalance)" strokeWidth={3} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Recent Transactions */}
      {!isLoading && !hasError && (
        <motion.div variants={itemVariants}>
          <Card className="glass border-border/50">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="w-5 h-5 text-primary" /><span>Recent Transactions</span>
                </CardTitle>
                <CardDescription>Latest transaction activity</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentTxns.map((txn, index) => (
                  <motion.div key={txn.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.3 }}
                    className="flex items-center justify-between p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className="w-2 h-2 rounded-full bg-primary animate-pulse-glow" />
                      <div>
                        <p className="font-medium">{txn.hash.slice(0, 20)}...</p>
                        <p className="text-sm text-muted-foreground">
                          {txn.amount} {txn.currency} • {new Date(txn.date).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="font-medium">${txn.amountUSD.toLocaleString()}</span>
                      <StatusBadge status={txn.status} />
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </motion.div>
  );
};

export default Dashboard;
