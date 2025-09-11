import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import WalletCard from "@/components/ui/WalletCard";
import ActionButton from "@/components/ui/ActionButton";
import { Send, Download, ArrowUpDown, Plus, TrendingUp, Activity, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import AddressPanel from "@/components/wallet-ui/AddressPanel";
import SendPanel from "@/components/wallet-ui/SendPanel";
import WalletSetup from "@/components/wallet-ui/WalletSetup";
import { useWallet } from "@/wallet/store";
import AddressPill from "@/components/wallet/AddressPill";
import { useWalletModal } from "@/components/wallet/useWalletModal";

type Prices = { solUsd: number; trxUsd: number };

function formatUSD(n: number) {
  return n.toLocaleString(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 2 });
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { sol, tron, getBalances, encrypted } = useWallet();
  const { open: openWalletModal } = useWalletModal();

  const [loading, setLoading] = useState(false);
  const [solBalance, setSolBalance] = useState<number | null>(null); // in SOL
  const [trxBalance, setTrxBalance] = useState<number | null>(null); // in TRX
  const [prices, setPrices] = useState<Prices>({ solUsd: 0, trxUsd: 0 });

  const isUnlocked = !!(sol?.address || tron?.address);
  const hasVault = !!encrypted;

  // --- fetch USD prices (Coingecko simple price)
  async function fetchPrices(): Promise<Prices> {
    try {
      const r = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=solana,tron&vs_currencies=usd");
      const j = await r.json();
      return {
        solUsd: j?.solana?.usd ?? 0,
        trxUsd: j?.tron?.usd ?? 0,
      };
    } catch {
      return { solUsd: 0, trxUsd: 0 };
    }
  }

  // --- fetch balances from your backend via store action
  async function refreshAll() {
    if (!isUnlocked) return;
    setLoading(true);
    try {
      const [p, b] = await Promise.all([fetchPrices(), getBalances()]);
      setPrices(p);
      setSolBalance(b.sol);
      setTrxBalance(b.trx);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // auto-refresh whenever wallet gets unlocked / addresses available
    if (isUnlocked) refreshAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sol?.address, tron?.address]);

  const totalUsd = useMemo(() => {
    const solUsd = (solBalance ?? 0) * (prices.solUsd || 0);
    const trxUsd = (trxBalance ?? 0) * (prices.trxUsd || 0);
    return solUsd + trxUsd;
  }, [solBalance, trxBalance, prices]);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Portfolio Overview */}
        <div className="mb-8">
          <div className="text-center mb-4">
            <h1 className="text-3xl font-bold text-foreground mb-2">BALANCE</h1>
            <div className="text-4xl font-bold bg-gradient-neon bg-clip-text text-transparent mb-2">
              {formatUSD(totalUsd)}
            </div>

            <div className="flex items-center justify-center gap-3">
              <Button
                size="sm"
                variant="secondary"
                onClick={refreshAll}
                disabled={!isUnlocked || loading}
                className="rounded-full"
                title={isUnlocked ? "Refresh balances" : "Unlock wallet to refresh"}
              >
                <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                {loading ? "Refreshing…" : "Refresh"}
              </Button>

              {!hasVault && (
                <Button size="sm" onClick={openWalletModal} className="rounded-full">
                  Connect Wallet
                </Button>
              )}
              {hasVault && !isUnlocked && (
                <Button size="sm" variant="secondary" onClick={openWalletModal} className="rounded-full">
                  Unlock Wallet
                </Button>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <ActionButton icon={Send} label="Send" onClick={() => navigate("/send")} variant="primary" disabled={!isUnlocked} />
            <ActionButton icon={Download} label="Receive" onClick={() => navigate("/receive")} disabled={!isUnlocked} />
            <ActionButton icon={ArrowUpDown} label="Convert" onClick={() => navigate("/convert")} disabled={!isUnlocked} />
            <ActionButton icon={Plus} label="Buy Crypto" onClick={() => navigate("/buy")} />
          </div>
        </div>

        {/* Wallet Cards (dynamic) */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* TRON */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">TRON</h3>
              <AddressPill label="TRON" address={tron?.address} />
            </div>
            <WalletCard
              balance={
                trxBalance === null ? "— TRX" : `${trxBalance.toLocaleString(undefined, { maximumFractionDigits: 6 })} TRX`
              }
              usdValue={formatUSD((trxBalance ?? 0) * (prices.trxUsd || 0))}
              change24h={0} // if you have a 24h change API, wire it here
              network="TRON"
            />
          </div>

          {/* Solana */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Solana</h3>
              <AddressPill label="SOL" address={sol?.address} />
            </div>
            <WalletCard
              balance={
                solBalance === null ? "— SOL" : `${solBalance.toLocaleString(undefined, { maximumFractionDigits: 6 })} SOL`
              }
              usdValue={formatUSD((solBalance ?? 0) * (prices.solUsd || 0))}
              change24h={0}
              network="Solana"
            />
          </div>
        </div>

        {/* Wallet setup / send panels (these already use real wallet state) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
          <WalletSetup />
          <AddressPanel />
          <SendPanel />
        </div>

        {/* Recent Activity (dynamic placeholder) */}
        <Card className="bg-gradient-card border-border/50 shadow-card">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Activity className="w-5 h-5 text-primary" />
              <span>Recent Activity</span>
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={() => navigate("/history")} disabled={!isUnlocked}>
              View All
            </Button>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">
              {isUnlocked ? "No recent activity yet." : "Unlock your wallet to see transactions."}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
