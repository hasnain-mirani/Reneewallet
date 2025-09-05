// src/pages/Staking.tsx
import { useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Loader2, Search } from "lucide-react";
import Navbar from "@/components/navbar/Navbar";
import ConnectWalletButton from "@/components/wallet/ConnectWalletButton";

type Position = {
  token: string;
  apr: number;
  stakedAmount: number;
  chain: "TRON" | "Solana";
};

const Staking = () => {
  // In real app, fetch these via react-query
 
  const [positions] = useState<Position[]>([]); // ← empty = shows “You haven’t staked…”
  const [query, setQuery] = useState("");
  const [chain, setChain] = useState<"all" | "TRON" | "Solana">("all");

  const filtered = useMemo(() => {
    return positions.filter((p) => {
      const q = query.trim().toLowerCase();
      const passQ = q ? p.token.toLowerCase().includes(q) : true;
      const passC = chain === "all" ? true : p.chain === chain;
      return passQ && passC;
    });
  }, [positions, query, chain]);

  return (
    <> <Navbar/>
 
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Hero / Balance + CTA */}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="bg-card/60 border-border">
          <CardContent className="flex items-center gap-4 py-6">
            <div className="w-16 h-16 rounded-xl bg-emerald-500/15 grid place-items-center">
              <span className="text-3xl">🐸</span>
            </div>
            <div className="flex-1">
              <div className="text-4xl font-semibold">$0.00</div>
           <ConnectWalletButton className="ml-3 rounded-full bg-white text-black hover:bg-white/90 border border-white/20 h-9 px-4" />
            </div>
          </CardContent>
        </Card>

        {/* Promo banners (placeholders) */}
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-xl bg-gradient-to-br from-emerald-500/15 to-transparent border border-border p-4">
            <div className="text-lg font-semibold">LEAP FEST</div>
            <p className="text-xs text-muted-foreground mt-1">$12,000+ in rewards</p>
            <Badge className="mt-3 bg-emerald-500">Season 2</Badge>
          </div>
          <div className="rounded-xl bg-gradient-to-br from-emerald-500/15 to-transparent border border-border p-4">
            <div className="text-lg font-semibold">Win 2 Mammoths now</div>
            <p className="text-xs text-muted-foreground mt-1">Join the event</p>
          </div>
          <div className="rounded-xl bg-gradient-to-br from-emerald-500/15 to-transparent border border-border p-4">
            <div className="text-lg font-semibold">Win 3 Mad Scientists</div>
            <p className="text-xs text-muted-foreground mt-1">Compete & earn</p>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              Total staking value
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between gap-4 py-4">
            <div className="text-3xl font-semibold">$0</div>
            <div className="flex flex-wrap gap-3">
              <Button className="bg-emerald-600 hover:bg-emerald-600/90">Stake</Button>
              <Button variant="secondary">Unstake</Button>
              <Button variant="secondary">Redelegate</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              Claimable rewards
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between gap-4 py-4">
            <div className="text-3xl font-semibold">$0</div>
            <Button variant="secondary">Claim</Button>
          </CardContent>
        </Card>
      </div>

      {/* Subnav / Search / Filter */}
      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Tabs defaultValue="delegations" className="w-full sm:w-auto">
          <TabsList>
            <TabsTrigger value="delegations">My delegations</TabsTrigger>
            <TabsTrigger value="unstaking">Unstaking in progress</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex items-center gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by token name or address"
              className="pl-9"
            />
          </div>

          <Select
            value={chain}
            onValueChange={(v: "all" | "TRON" | "Solana") => setChain(v)}
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="All chains" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All chains</SelectItem>
              <SelectItem value="TRON">TRON</SelectItem>
              <SelectItem value="Solana">Solana</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <Card className="mt-4">
        <CardHeader className="pb-0">
          <CardTitle className="sr-only">Staked positions</CardTitle>
          <CardDescription className="sr-only">
            Your delegations and APR by token
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[40%]">Token</TableHead>
                <TableHead>APR</TableHead>
                <TableHead className="text-right">Staked amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3}>
                    <div className="h-60 flex flex-col items-center justify-center gap-3 text-muted-foreground">
                      <div className="h-10 w-10 rounded-full bg-muted grid place-items-center">
                        <Loader2 className="h-5 w-5 animate-spin" />
                      </div>
                      <p className="text-sm">You haven&apos;t staked any tokens yet</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((p) => (
                  <TableRow key={`${p.token}-${p.chain}`}>
                    <TableCell className="font-medium">{p.token}</TableCell>
                    <TableCell>{p.apr.toFixed(2)}%</TableCell>
                    <TableCell className="text-right">
                      {p.stakedAmount.toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
       </>
  );
};

export default Staking;
