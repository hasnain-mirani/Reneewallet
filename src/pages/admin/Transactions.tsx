import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui-admin/card";
import { Button } from "@/components/ui-admin/button";
import { Input } from "@/components/ui-admin/input";
import { Badge } from "@/components/ui-admin/badge";
import {
  ArrowLeftRight,
  Search,
  Filter,
  Download,
  Eye,
  CheckCircle,
  Clock,
  XCircle,
  TrendingUp,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui-admin/table";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import {
  fetchTransactions,
  fetchTransactionStats,
  exportTransactionsCSV,
  type Transaction,
  type TxStatus,
  type TxType,
} from "@/services/transactions.api";

// debounce helper
function useDebounced<T>(value: T, delay = 400) {
  const [deb, setDeb] = React.useState(value);
  React.useEffect(() => {
    const id = setTimeout(() => setDeb(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return deb;
}

const StatusBadge = ({ status }: { status: string }) => {
  const variants = {
    Success: { icon: CheckCircle, className: "bg-success text-success-foreground" },
    Pending: { icon: Clock, className: "bg-warning text-warning-foreground" },
    Failed: { icon: XCircle, className: "bg-destructive text-destructive-foreground" },
  } as const;
  const cfg = variants[status as keyof typeof variants];
  if (!cfg) return <Badge variant="outline">{status}</Badge>;
  const Icon = cfg.icon;
  return (
    <Badge className={cfg.className}>
      <Icon className="w-3 h-3 mr-1" />
      {status}
    </Badge>
  );
};

const TypeBadge = ({ type }: { type: string }) => {
  const colors: Record<string, string> = {
    Transfer: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    Deposit: "bg-green-500/20 text-green-400 border-green-500/30",
    Withdrawal: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  };
  return (
    <Badge variant="outline" className={colors[type] || ""}>
      {type}
    </Badge>
  );
};

const Transactions: React.FC = () => {
  const { token: ctxToken } = useAuth();
  // fallback so fetches still run on reload before context hydrates
  const token = ctxToken ?? (typeof window !== "undefined" ? localStorage.getItem("token") : null);

  // filters & table state
  const [searchQuery, setSearchQuery] = useState("");
  const debounced = useDebounced(searchQuery);
  const [status, setStatus] = useState<TxStatus | "">("");
  const [type, setType] = useState<TxType | "">("");
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [sort, setSort] = useState<"date:desc" | "date:asc">("date:desc");

  // list query
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["transactions", { debounced, status, type, page, pageSize, sort }],
    queryFn: () =>
      fetchTransactions({
        token,
        search: debounced,
        status,
        type,
        page,
        pageSize,
        sort,
      }),
    enabled: true, // don't gate on token; apiClient will send it if available
    keepPreviousData: true,
    staleTime: 30_000,
  });

  // stats query
  const { data: stats } = useQuery({
    queryKey: ["transactions-stats", { debounced, status, type }],
    queryFn: () => fetchTransactionStats({ token, search: debounced, status, type }),
    enabled: true,
    staleTime: 60_000,
  });

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const items = data?.items ?? [];
  const meta = data?.meta ?? { total: items.length, page: 1, pageSize, pageCount: 1 };

  const derived = useMemo(() => {
    const success = items.filter((t) => t.status === "Success").length;
    const pending = items.filter((t) => t.status === "Pending").length;
    const totalVolumeUSD = items.reduce((sum, t) => sum + (t.amountUSD || 0), 0);
    return { total: meta.total ?? items.length, success, pending, totalVolumeUSD };
  }, [items, meta.total]);

  const cards = {
    total: stats?.total ?? derived.total,
    success: stats?.success ?? derived.success,
    pending: stats?.pending ?? derived.pending,
    totalVolumeUSD: stats?.totalVolumeUSD ?? derived.totalVolumeUSD,
  };

  const exportToCSV = async () => {
    try {
      const blob = await exportTransactionsCSV({ token, search: debounced, status, type, sort });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `transactions_${new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-")}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
      alert("Failed to export CSV");
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gradient mb-2">Transactions</h1>
          <p className="text-muted-foreground">Monitor all blockchain transactions</p>
        </div>
        <Button onClick={exportToCSV} className="bg-gradient-primary hover:opacity-90">
          <Download className="w-4 h-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="glass border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
            <ArrowLeftRight className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gradient">{cards.total}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>

        <Card className="glass border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Successful</CardTitle>
            <CheckCircle className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{cards.success}</div>
            <p className="text-xs text-muted-foreground">Completed transactions</p>
          </CardContent>
        </Card>

        <Card className="glass border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">{cards.pending}</div>
            <p className="text-xs text-muted-foreground">Awaiting confirmation</p>
          </CardContent>
        </Card>

        <Card className="glass border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Volume</CardTitle>
            <TrendingUp className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent">
              ${Number(cards.totalVolumeUSD || 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">USD equivalent</p>
          </CardContent>
        </Card>
      </div>

      {/* Search & Filters */}
      <Card className="glass border-border/50">
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by hash, currency, from, to..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(1);
                }}
                className="pl-10"
              />
            </div>
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value as TxStatus | "");
                setPage(1);
              }}
              className="rounded-md border bg-background px-3 py-2 text-sm"
            >
              <option value="">All Status</option>
              <option value="Success">Success</option>
              <option value="Pending">Pending</option>
              <option value="Failed">Failed</option>
            </select>
            <select
              value={type}
              onChange={(e) => {
                setType(e.target.value as TxType | "");
                setPage(1);
              }}
              className="rounded-md border bg-background px-3 py-2 text-sm"
            >
              <option value="">All Types</option>
              <option value="Transfer">Transfer</option>
              <option value="Deposit">Deposit</option>
              <option value="Withdrawal">Withdrawal</option>
            </select>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSort((s) => (s === "date:desc" ? "date:asc" : "date:desc"))}
              title="Toggle sort by date"
            >
              <Filter className="w-4 h-4 mr-2" />
              {sort === "date:desc" ? "Newest" : "Oldest"}
            </Button>
          </div>
          {isError && (
            <CardDescription className="text-destructive mt-2">
              {(error as Error)?.message || "Failed to load transactions."}
            </CardDescription>
          )}
        </CardHeader>

        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Transaction</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>From</TableHead>
                  <TableHead>To</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Fee</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="w-[50px]" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading
                  ? Array.from({ length: pageSize }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell colSpan={9}>
                          <div className="h-6 w-full animate-pulse bg-muted/40 rounded" />
                        </TableCell>
                      </TableRow>
                    ))
                  : items.map((txn: Transaction) => (
                      <TableRow key={txn.id} className="hover:bg-muted/30">
                        <TableCell>
                          <div>
                            <div className="font-medium">{txn.id}</div>
                            <div className="text-sm text-muted-foreground font-mono">
                              {txn.hash.slice(0, 16)}...
                            </div>
                          </div>
                        </TableCell>
                        <TableCell><TypeBadge type={txn.type ?? "Transfer"} /></TableCell>
                        <TableCell className="font-mono text-sm">{txn.from ?? "-"}</TableCell>
                        <TableCell className="font-mono text-sm">{txn.to ?? "-"}</TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {txn.amount} {txn.currency}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              ${txn.amountUSD.toLocaleString()}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {(txn.fee ?? 0)} {txn.currency}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              ${(txn.feeUSD ?? 0).toFixed(2)}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell><StatusBadge status={txn.status} /></TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {new Date(txn.date).toLocaleDateString()}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {new Date(txn.date).toLocaleTimeString()}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" className="h-8 w-8 p-0" title="View details">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                {!isLoading && items.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={9}>
                      <div className="text-center text-muted-foreground py-6">No transactions found.</div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {!isLoading && meta.pageCount > 1 && (
            <div className="flex items-center justify-between pt-4">
              <div className="text-sm text-muted-foreground">
                Page <span className="font-medium">{meta.page}</span> of{" "}
                <span className="font-medium">{meta.pageCount}</span> • {meta.total} transactions
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
    </motion.div>
  );
};

export default Transactions;
