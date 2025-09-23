import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui-admin/card";
import { Button } from "@/components/ui-admin/button";
import { Input } from "@/components/ui-admin/input";
import { Badge } from "@/components/ui-admin/badge";
import {
  Wallet as WalletIcon,
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  Snowflake,
  Copy,
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui-admin/dropdown-menu";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import {
  fetchWallets,
  fetchWalletStats,
  updateWalletStatus,
  type Wallet,
  type WalletStatus,
} from "@/services/wallets.api";

// tiny debounce hook to avoid spamming API
function useDebounced<T>(value: T, delay = 400) {
  const [deb, setDeb] = React.useState(value);
  React.useEffect(() => {
    const id = setTimeout(() => setDeb(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return deb;
}

const Wallets: React.FC = () => {
  const { token: ctxToken } = useAuth();
  // fallback so fetches still run on reload before context hydrates
  const token = ctxToken ?? (typeof window !== "undefined" ? localStorage.getItem("token") : null);

  const [searchQuery, setSearchQuery] = useState("");
  const debounced = useDebounced(searchQuery);
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [sort, setSort] = useState<"lastTransaction:desc" | "lastTransaction:asc">(
    "lastTransaction:desc"
  );

  // list
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["wallets", { search: debounced, page, pageSize, sort }],
    queryFn: () =>
      fetchWallets({
        token,
        search: debounced,
        page,
        pageSize,
        sort,
      }),
    enabled: true, // don't gate on token; apiClient will attach it if available
    keepPreviousData: true,
    staleTime: 30_000,
  });

  // stats
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["wallets-stats"],
    queryFn: () => fetchWalletStats(token),
    enabled: true,
    staleTime: 60_000,
  });

  const items = data?.items ?? [];
  const meta = data?.meta ?? { total: 0, page: 1, pageSize, pageCount: 1 };

  // derive if backend doesn't provide stats yet (based on current page)
  const derived = useMemo(() => {
    const totalValueUSD = items.reduce((sum, w) => sum + (w.balanceUSD || 0), 0);
    const active = items.filter((w) => w.status === "Active").length;
    return { total: meta.total ?? items.length, active, totalValueUSD };
  }, [items, meta.total]);

  const cards = {
    total: stats?.total ?? derived.total,
    active: stats?.active ?? derived.active,
    totalValueUSD: stats?.totalValueUSD ?? derived.totalValueUSD,
  };

  const StatusBadge = ({ status }: { status: WalletStatus }) => {
    const variants: Record<WalletStatus, string> = {
      Active: "bg-success text-success-foreground",
      Frozen: "bg-destructive text-destructive-foreground",
    };
    return <Badge className={variants[status] || "bg-muted"}>{status}</Badge>;
  };

  const qc = useQueryClient();
  const toggleMutation = useMutation({
    mutationFn: (w: Wallet) =>
      updateWalletStatus(w.id, w.status === "Active" ? "Frozen" : "Active", token),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["wallets"] });
      qc.invalidateQueries({ queryKey: ["wallets-stats"] });
    },
  });

  const toggleWallet = (wallet: Wallet) => {
    toggleMutation.mutate(wallet);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gradient mb-2">Wallets</h1>
          <p className="text-muted-foreground">Monitor and manage user wallets</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="glass border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Wallets</CardTitle>
            <WalletIcon className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gradient">
              {statsLoading && !stats ? "—" : cards.total}
            </div>
            <p className="text-xs text-muted-foreground">All registered wallets</p>
          </CardContent>
        </Card>

        <Card className="glass border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Wallets</CardTitle>
            <TrendingUp className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">
              {statsLoading && !stats ? "—" : cards.active}
            </div>
            <p className="text-xs text-muted-foreground">Currently operational</p>
          </CardContent>
        </Card>

        <Card className="glass border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent">
              ${Number(cards.totalValueUSD || 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Combined USD value</p>
          </CardContent>
        </Card>
      </div>

      {/* Search + Filter */}
      <Card className="glass border-border/50">
        <CardHeader>
          <div className="flex items-center space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search wallets..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(1);
                }}
                className="pl-10"
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setSort((s) =>
                  s === "lastTransaction:desc" ? "lastTransaction:asc" : "lastTransaction:desc"
                )
              }
              title="Toggle sort by last activity"
            >
              <Filter className="w-4 h-4 mr-2" />
              {sort === "lastTransaction:desc" ? "Newest" : "Oldest"}
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          {/* Error */}
          {isError && (
            <div className="p-4 rounded-md bg-destructive/10 text-destructive">
              {(error as Error)?.message || "Failed to load wallets."}
            </div>
          )}

          {/* Table */}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Wallet</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Currency</TableHead>
                  <TableHead>Balance</TableHead>
                  <TableHead>USD Value</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Activity</TableHead>
                  <TableHead className="w-[50px]" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading
                  ? Array.from({ length: pageSize }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell colSpan={8}>
                          <div className="h-6 w-full animate-pulse bg-muted/40 rounded" />
                        </TableCell>
                      </TableRow>
                    ))
                  : items.map((wallet) => (
                      <TableRow key={wallet.id} className="hover:bg-muted/30">
                        <TableCell>
                          <div>
                            <div className="font-medium">{wallet.id}</div>
                            <div className="text-sm text-muted-foreground font-mono">
                              {wallet.address.slice(0, 10)}...{wallet.address.slice(-8)}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{wallet.userName}</div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="font-mono">
                            {wallet.currency}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-mono">
                          {Number(wallet.balance ?? 0).toFixed(6)}
                        </TableCell>
                        <TableCell className="font-mono">
                          ${Number(wallet.balanceUSD ?? 0).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={wallet.status} />
                        </TableCell>
                        <TableCell>
                          {wallet.lastTransaction
                            ? new Date(wallet.lastTransaction).toLocaleString()
                            : "-"}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => alert("TODO: wallet details modal")}>
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => navigator.clipboard.writeText(wallet.address)}
                              >
                                <Copy className="mr-2 h-4 w-4" />
                                Copy Address
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => toggleWallet(wallet)}
                                className={wallet.status === "Active" ? "text-destructive" : "text-success"}
                                disabled={toggleMutation.isPending}
                              >
                                <Snowflake className="mr-2 h-4 w-4" />
                                {toggleMutation.isPending
                                  ? "Updating..."
                                  : wallet.status === "Active"
                                  ? "Freeze Wallet"
                                  : "Unfreeze Wallet"}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                {!isLoading && items.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8}>
                      <div className="text-center text-muted-foreground py-6">No wallets found.</div>
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
                <span className="font-medium">{meta.pageCount}</span> • {meta.total} wallets
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

export default Wallets;
