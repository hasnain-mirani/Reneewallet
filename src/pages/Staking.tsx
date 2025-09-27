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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import ConnectWalletButton from "@/components/wallet/ConnectWalletButton";
import { useTranslation } from "react-i18next";

type Position = {
  token: string;
  apr: number;           // percent value e.g. 7.5
  stakedAmount: number;  // raw token units
  chain: "TRON" | "Solana";
};

const Staking = () => {
  const { t } = useTranslation();

  // In real app, fetch positions with react-query
  const [positions] = useState<Position[]>([]);
  const [query, setQuery] = useState("");
  const [chain, setChain] = useState<"all" | "TRON" | "Solana">("all");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return positions.filter((p) => {
      const passQ = q ? p.token.toLowerCase().includes(q) : true;
      const passC = chain === "all" ? true : p.chain === chain;
      return passQ && passC;
    });
  }, [positions, query, chain]);

  const totalStaked = useMemo(
    () => positions.reduce((acc, p) => acc + (Number(p.stakedAmount) || 0), 0),
    [positions]
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Hero / Balance + CTA */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="bg-card/60 border-border">
          <CardContent className="flex items-center gap-4 py-6">
            <div className="w-16 h-16 rounded-xl bg-emerald-500/15 grid place-items-center">
              <span className="text-3xl">🪙</span>
            </div>
            <div className="flex-1">
              {/* Keep $ display for now; you can wire price * amount later */}
              <div className="text-4xl font-semibold">$0.00</div>
              <div className="text-xs text-muted-foreground">
                {t("staking.hero.stakedCount", {
                  defaultValue: "{{count}} token staked",
                  count: positions.length,
                })}
              </div>
            </div>
            <ConnectWalletButton className="ml-3 rounded-full bg-white text-black hover:bg-white/90 border border-white/20 h-9 px-4" />
          </CardContent>
        </Card>

        {/* Replaced the LEAP promos with a single Renee Wallet banner */}
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card className="rounded-xl bg-gradient-to-br from-emerald-500/15 to-transparent border border-border">
            <CardContent className="p-4">
              <div className="text-lg font-semibold">
                {t("staking.banner.title", { defaultValue: "Renee Wallet" })}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {t("staking.banner.desc", {
                  defaultValue: "Stake supported assets and earn rewards",
                })}
              </p>
              <Badge className="mt-3 bg-emerald-500">
                {t("staking.banner.tag", { defaultValue: "Staking" })}
              </Badge>
            </CardContent>
          </Card>

          <Card className="rounded-xl bg-gradient-to-br from-emerald-500/15 to-transparent border border-border">
            <CardContent className="p-4">
              <div className="text-lg font-semibold">
                {t("staking.banner.secureTitle", { defaultValue: "Secure & Non-custodial" })}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {t("staking.banner.secureDesc", {
                  defaultValue: "You keep your keys while earning on-chain rewards",
                })}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              {t("staking.cards.totalValue", { defaultValue: "Total staking value" })}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between gap-4 py-4">
            <div className="text-3xl font-semibold">
              {/* Placeholder until you wire prices */}
              $0
            </div>
            <div className="flex flex-wrap gap-3">
              <Button className="bg-emerald-600 hover:bg-emerald-600/90">
                {t("staking.actions.stake", { defaultValue: "Stake" })}
              </Button>
              <Button variant="secondary">
                {t("staking.actions.unstake", { defaultValue: "Unstake" })}
              </Button>
              <Button variant="secondary">
                {t("staking.actions.redelegate", { defaultValue: "Redelegate" })}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              {t("staking.cards.claimable", { defaultValue: "Claimable rewards" })}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between gap-4 py-4">
            <div className="text-3xl font-semibold">$0</div>
            <Button variant="secondary">
              {t("staking.actions.claim", { defaultValue: "Claim" })}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Subnav / Search / Filter */}
      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Tabs defaultValue="delegations" className="w-full sm:w-auto">
          <TabsList>
            <TabsTrigger value="delegations">
              {t("staking.tabs.delegations", { defaultValue: "My delegations" })}
            </TabsTrigger>
            <TabsTrigger value="unstaking">
              {t("staking.tabs.unstaking", { defaultValue: "Unstaking in progress" })}
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex items-center gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("staking.search.placeholder", {
                defaultValue: "Search by token name or address",
              })}
              className="pl-9"
            />
          </div>

          <Select
            value={chain}
            onValueChange={(v: "all" | "TRON" | "Solana") => setChain(v)}
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder={t("staking.filters.chain.placeholder", { defaultValue: "All chains" })} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">
                {t("staking.filters.chain.all", { defaultValue: "All chains" })}
              </SelectItem>
              <SelectItem value="TRON">TRON</SelectItem>
              <SelectItem value="Solana">Solana</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <Card className="mt-4">
        <CardHeader className="pb-0">
          <CardTitle className="sr-only">
            {t("staking.table.title", { defaultValue: "Staked positions" })}
          </CardTitle>
          <CardDescription className="sr-only">
            {t("staking.table.subtitle", { defaultValue: "Your delegations and APR by token" })}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[40%]">
                  {t("staking.table.columns.token", { defaultValue: "Token" })}
                </TableHead>
                <TableHead>
                  {t("staking.table.columns.apr", { defaultValue: "APR" })}
                </TableHead>
                <TableHead className="text-right">
                  {t("staking.table.columns.staked", { defaultValue: "Staked amount" })}
                </TableHead>
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
                      <p className="text-sm">
                        {t("staking.empty", { defaultValue: "You haven't staked any tokens yet" })}
                      </p>
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
  );
};

export default Staking;
