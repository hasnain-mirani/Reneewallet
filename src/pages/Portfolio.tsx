// src/pages/Dashboard.tsx
import { useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, Wallet2, DollarSign } from "lucide-react";
import ConnectWalletButton from "@/components/wallet/ConnectWalletButton";

type Chain = "all" | "TRON" | "Solana";

type Asset = {
  token: string;
  price: number;        // USD
  balance: number;      // token units
  chain: Exclude<Chain, "all">;
};

// If you want to show demo data after connecting, populate this from your API.
const INITIAL_ASSETS: Asset[] = [];

export default function Dashboard() {
  const [assets] = useState<Asset[]>(INITIAL_ASSETS);
  const [query, setQuery] = useState("");
  const [chain, setChain] = useState<Chain>("all");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return assets.filter((a) => {
      const matchQ = q ? a.token.toLowerCase().includes(q) : true;
      const matchC = chain === "all" ? true : a.chain === chain;
      return matchQ && matchC;
    });
  }, [assets, query, chain]);

  const holdingsCount = assets.length;
  const totalUsd = assets.reduce((sum, a) => sum + a.price * a.balance, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Hero: balance + connect */}
      <Card className="bg-card/60 border-border">
        <CardContent className="flex items-center gap-5 py-6">
          <div className="w-16 h-16 rounded-xl bg-emerald-500/15 grid place-items-center">
            <DollarSign className="w-7 h-7 text-emerald-400" />
          </div>
          <div className="flex-1">
            <div className="text-4xl font-semibold">
              ${totalUsd.toLocaleString(undefined, { maximumFractionDigits: 2 })}
            </div>
            <ConnectWalletButton className="mt-3 rounded-full bg-white text-black hover:bg-white/90" />
          </div>
        </CardContent>
      </Card>

      {/* Promo banners */}
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl bg-gradient-to-br from-emerald-500/15 to-transparent border border-border p-4">
          <div className="text-lg font-semibold">LEAP FEST</div>
          <p className="text-xs text-muted-foreground mt-1">$12,000+ in rewards</p>
          <Badge className="mt-3 bg-emerald-600">Season 2</Badge>
        </div>
        <div className="rounded-xl bg-gradient-to-br from-emerald-500/15 to-transparent border border-border p-4">
          <div className="text-lg font-semibold">Win 2 Mammoths now</div>
          <p className="text-xs text-muted-foreground mt-1">Participate to earn</p>
        </div>
        <div className="rounded-xl bg-gradient-to-br from-emerald-500/15 to-transparent border border-border p-4">
          <div className="text-lg font-semibold">Win 3 Mad Scientists</div>
          <p className="text-xs text-muted-foreground mt-1">Compete & claim</p>
        </div>
      </div>

      {/* Holdings header + controls */}
      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl font-semibold">
            ${totalUsd.toLocaleString(undefined, { maximumFractionDigits: 2 })}
          </span>
          <span className="text-muted-foreground">|</span>
          <span className="text-muted-foreground">{holdingsCount} Holdings</span>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by token name or address"
              className="pl-9"
            />
          </div>

          <Select value={chain} onValueChange={(v: Chain) => setChain(v)}>
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

      {/* Assets table */}
      <Card className="mt-4">
        <CardHeader className="pb-0">
          <CardTitle className="sr-only">Portfolio</CardTitle>
          <CardDescription className="sr-only">
            Token list with price and balance
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[40%]">Token</TableHead>
                <TableHead>Price</TableHead>
                <TableHead className="text-right">Balance</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3}>
                    <div className="h-60 flex flex-col items-center justify-center gap-3 text-muted-foreground">
                      <div className="h-10 w-10 rounded-full bg-muted grid place-items-center">
                        <Wallet2 className="h-5 w-5" />
                      </div>
                      <div className="text-sm font-medium">No tokens found</div>
                      <div className="text-xs">
                        Connect wallet to see holdings.
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((a) => (
                  <TableRow key={`${a.chain}-${a.token}`}>
                    <TableCell className="font-medium">{a.token}</TableCell>
                    <TableCell>${a.price.toLocaleString()}</TableCell>
                    <TableCell className="text-right">
                      {a.balance.toLocaleString()}
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
}
