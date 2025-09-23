import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui-admin/card";
import { Button } from "@/components/ui-admin/button";
import { Input } from "@/components/ui-admin/input";
import { Badge } from "@/components/ui-admin/badge";
import {
  Users as UsersIcon,
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  UserPlus,
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
  deleteUser,
  fetchUserStats,
  fetchUsers,
  createUser,            // ✅ NEW
  type User,
} from "@/services/users.api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui-admin/dialog";  // adjust import path if different

// Small debouncer to avoid hammering the API on each keystroke
function useDebounced<T>(value: T, delay = 400) {
  const [debounced, setDebounced] = React.useState(value);
  React.useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

const Users: React.FC = () => {
  const { token: ctxToken } = useAuth();
  // fallback so fetches still run on reload before context hydrates
  const token = ctxToken ?? (typeof window !== "undefined" ? localStorage.getItem("token") : null);

  const [searchQuery, setSearchQuery] = useState("");
  const debouncedQuery = useDebounced(searchQuery);
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [sort, setSort] = useState<"createdAt:desc" | "createdAt:asc">("createdAt:desc");

  // Add User modal state
  const [open, setOpen] = useState(false);
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    role: "Viewer",
    status: "Active",
    walletCount: 0,
    totalBalance: 0,
  });

  // Fetch users
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["users", { search: debouncedQuery, page, pageSize, sort }],
    queryFn: () =>
      fetchUsers({
        token,
        search: debouncedQuery,
        page,
        pageSize,
        sort,
      }),
    enabled: true, // don't gate on token; apiClient will send it if available
    keepPreviousData: true,
    staleTime: 30_000,
  });

  // Fetch stats for the cards
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["users-stats"],
    queryFn: () => fetchUserStats(token),
    enabled: true,
    staleTime: 60_000,
  });

  const qc = useQueryClient();

  // Create mutation
  const createMutation = useMutation({
    mutationFn: () =>
      createUser(
        {
          name: newUser.name.trim(),
          email: newUser.email.trim().toLowerCase(),
          role: newUser.role as User["role"],
          status: newUser.status as User["status"],
          walletCount: Number(newUser.walletCount) || 0,
          totalBalance: Number(newUser.totalBalance) || 0,
        },
        token
      ),
    onSuccess: () => {
      setOpen(false);
      setNewUser({
        name: "",
        email: "",
        role: "Viewer",
        status: "Active",
        walletCount: 0,
        totalBalance: 0,
      });
      qc.invalidateQueries({ queryKey: ["users"] });
      qc.invalidateQueries({ queryKey: ["users-stats"] });
    },
  });

  // Delete mutation
  const delMutation = useMutation({
    mutationFn: (id: string) => deleteUser(id, token),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["users"] });
      qc.invalidateQueries({ queryKey: ["users-stats"] });
    },
  });

  const items = data?.items ?? [];
  const meta = data?.meta ?? { total: 0, page: 1, pageSize, pageCount: 1 };

  // Fallback stats if backend doesn't provide them (derived from current page only)
  const derivedStats = useMemo(() => {
    const total = meta.total ?? items.length;
    const active = items.filter((u) => u.status === "Active").length;
    const vip = items.filter((u) => u.role === "VIP User").length;
    return { total, active, vip };
  }, [items, meta.total]);

  const cards = {
    total: stats?.total ?? derivedStats.total,
    active: stats?.active ?? derivedStats.active,
    vip: stats?.vip ?? derivedStats.vip,
  };

  const StatusBadge = ({ status }: { status: User["status"] }) => {
    const variants: Record<User["status"], string> = {
      Active: "bg-success text-success-foreground",
      Inactive: "bg-muted text-muted-foreground",
      Suspended: "bg-destructive text-destructive-foreground",
    };
    return <Badge className={variants[status] || "bg-muted"}>{status}</Badge>;
  };

  const handleDelete = (u: User) => {
    if (!confirm(`Delete user "${u.name}"? This cannot be undone.`)) return;
    delMutation.mutate(u.id);
  };

  const onCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.name || !newUser.email) return;
    createMutation.mutate();
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
          <h1 className="text-3xl font-bold text-gradient mb-2">Users</h1>
          <p className="text-muted-foreground">Manage user accounts and permissions</p>
        </div>

        {/* Add User */}
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-primary hover:opacity-90">
              <UserPlus className="w-4 h-4 mr-2" />
              Add User
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Add user</DialogTitle>
            </DialogHeader>

            <form onSubmit={onCreate} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm">Name</label>
                  <Input
                    value={newUser.name}
                    onChange={(e) => setNewUser((p) => ({ ...p, name: e.target.value }))}
                    placeholder="Jane Doe"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm">Email</label>
                  <Input
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser((p) => ({ ...p, email: e.target.value }))}
                    placeholder="jane@example.com"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm">Role</label>
                  <select
                    value={newUser.role}
                    onChange={(e) => setNewUser((p) => ({ ...p, role: e.target.value }))}
                    className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                  >
                    <option>Viewer</option>
                    <option>Manager</option>
                    <option>Admin</option>
                    <option>VIP User</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm">Status</label>
                  <select
                    value={newUser.status}
                    onChange={(e) => setNewUser((p) => ({ ...p, status: e.target.value }))}
                    className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                  >
                    <option>Active</option>
                    <option>Inactive</option>
                    <option>Suspended</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm">Wallets</label>
                  <Input
                    type="number"
                    min={0}
                    value={newUser.walletCount}
                    onChange={(e) =>
                      setNewUser((p) => ({ ...p, walletCount: Number(e.target.value || 0) }))
                    }
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm">Total Balance (USD)</label>
                  <Input
                    type="number"
                    min={0}
                    step="1"
                    value={newUser.totalBalance}
                    onChange={(e) =>
                      setNewUser((p) => ({ ...p, totalBalance: Number(e.target.value || 0) }))
                    }
                  />
                </div>
              </div>

              <DialogFooter className="gap-2">
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending ? "Creating..." : "Create"}
                </Button>
              </DialogFooter>

              {createMutation.isError && (
                <CardDescription className="text-destructive mt-2">
                  {(createMutation.error as Error)?.message || "Failed to create user."}
                </CardDescription>
              )}
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="glass border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <UsersIcon className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gradient">
              {statsLoading && !stats ? "—" : cards.total}
            </div>
            <p className="text-xs text-muted-foreground">+12% from last month</p>
          </CardContent>
        </Card>

        <Card className="glass border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <UsersIcon className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">
              {statsLoading && !stats ? "—" : cards.active}
            </div>
            <p className="text-xs text-muted-foreground">Currently online</p>
          </CardContent>
        </Card>

        <Card className="glass border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">VIP Users</CardTitle>
            <UsersIcon className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent">
              {statsLoading && !stats ? "—" : cards.vip}
            </div>
            <p className="text-xs text-muted-foreground">Premium members</p>
          </CardContent>
        </Card>
      </div>

      {/* Search + Filter + Sort */}
      <Card className="glass border-border/50">
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
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
                setSort((s) => (s === "createdAt:desc" ? "createdAt:asc" : "createdAt:desc"))
              }
              title="Toggle sort by created date"
            >
              <Filter className="w-4 h-4 mr-2" />
              {sort === "createdAt:desc" ? "Newest" : "Oldest"}
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          {/* Error */}
          {isError && (
            <div className="p-4 rounded-md bg-destructive/10 text-destructive">
              {(error as Error)?.message || "Failed to load users."}
            </div>
          )}

          {/* Table */}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Wallets</TableHead>
                  <TableHead>Balance</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="w-[50px]" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading
                  ? Array.from({ length: pageSize }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell colSpan={7}>
                          <div className="h-6 w-full animate-pulse bg-muted/40 rounded" />
                        </TableCell>
                      </TableRow>
                    ))
                  : items.map((user) => (
                      <TableRow key={user.id} className="hover:bg-muted/30">
                        <TableCell>
                          <div>
                            <div className="font-medium">{user.name}</div>
                            <div className="text-sm text-muted-foreground">{user.email}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{user.role}</Badge>
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={user.status} />
                        </TableCell>
                        <TableCell>{user.walletCount}</TableCell>
                        <TableCell>${user.totalBalance.toLocaleString()}</TableCell>
                        <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => alert("TODO: view user modal")}>
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => alert("TODO: edit user modal")}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit User
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => handleDelete(user)}
                                disabled={delMutation.isPending}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                {delMutation.isPending ? "Deleting..." : "Delete User"}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                {!isLoading && items.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7}>
                      <div className="text-center text-muted-foreground py-6">No users found.</div>
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
                <span className="font-medium">{meta.pageCount}</span> • {meta.total} users
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

export default Users;
