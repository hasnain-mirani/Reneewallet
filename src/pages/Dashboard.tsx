// src/pages/Dashboard.tsx
import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import WalletCard from "@/components/ui/WalletCard";
import ActionButton from "@/components/ui/ActionButton";
import { Send, Download, ArrowUpDown, Plus, TrendingUp, Activity, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { useWallet } from "@/wallet/store";
import AddressPill from "@/components/wallet/AddressPill";
import { useWalletModal } from "@/components/wallet/useWalletModal";
import LanguageSwitcher from "@/components/LanguageSwitcher"; // ✅ fixed import name
import { useTranslation } from "react-i18next";

type Prices = { solUsd: number; trxUsd: number };

function formatUSD(n: number) {
  return n.toLocaleString(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 2 });
}

async function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

export default function Dashboard() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { sol, tron, getBalances, encrypted } = useWallet();
  const { open: openWalletModal } = useWalletModal();

  const [loading, setLoading] = useState(false);
  const [solBalance, setSolBalance] = useState<number | null>(null); // SOL
  const [trxBalance, setTrxBalance] = useState<number | null>(null); // TRX
  const [prices, setPrices] = useState<Prices>({ solUsd: 0, trxUsd: 0 });

  const hasSol = !!sol?.address;
  const hasTron = !!tron?.address;
  const isUnlocked = hasSol || hasTron;
  const hasVault = !!encrypted;

  // --- fetch USD prices
  async function fetchPrices(): Promise<Prices> {
    try {
      const r = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=solana,tron&vs_currencies=usd", {
        headers: { "Cache-Control": "no-cache" },
      });
      const j = await r.json();
      return {
        solUsd: j?.solana?.usd ?? 0,
        trxUsd: j?.tron?.usd ?? 0,
      };
    } catch {
      return { solUsd: 0, trxUsd: 0 };
    }
  }

  // --- fetch balances via store (now tolerant to partials)
  async function refreshAll() {
    if (!isUnlocked) return;
    setLoading(true);
    try {
      const [p, b] = await Promise.all([fetchPrices(), getBalances()]);
      setPrices(p);
      // b.sol / b.trx are always numbers (0 if missing)
      setSolBalance(hasSol ? b.sol : null);
      setTrxBalance(hasTron ? b.trx : null);
    } finally {
      setLoading(false);
    }
  }

  // auto-refresh when addresses appear
  useEffect(() => {
    if (isUnlocked) refreshAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sol?.address, tron?.address]);

  // light polling every 20s while unlocked (keeps UI fresh after sends)
  useEffect(() => {
    if (!isUnlocked) return;
    const id = setInterval(() => {
      refreshAll();
    }, 20000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isUnlocked]);

  const totalUsd = useMemo(() => {
    const solUsd = (solBalance ?? 0) * (prices.solUsd || 0);
    const trxUsd = (trxBalance ?? 0) * (prices.trxUsd || 0);
    return solUsd + trxUsd;
  }, [solBalance, trxBalance, prices]);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Language switcher */}
        <div className="flex justify-end mb-2">
        
        </div>

        {/* Portfolio Overview */}
        <div className="mb-8">
          <div className="text-center mb-4">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              {t("labels.balance", { defaultValue: "BALANCE" })}
            </h1>
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
                title={
                  isUnlocked
                    ? t("hints.refreshBalances", { defaultValue: "Refresh balances" })
                    : t("hints.unlockToRefresh", { defaultValue: "Unlock wallet to refresh" })
                }
              >
                <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                {loading
                  ? t("actions.refreshing", { defaultValue: "Refreshing…" })
                  : t("actions.refresh", { defaultValue: "Refresh" })}
              </Button>

              {!hasVault && (
                <Button size="sm" onClick={openWalletModal} className="rounded-full">
                  {t("actions.connectWallet", { defaultValue: "Connect Wallet" })}
                </Button>
              )}
              {hasVault && !isUnlocked && (
                <Button size="sm" variant="secondary" onClick={openWalletModal} className="rounded-full">
                  {t("actions.unlockWallet", { defaultValue: "Unlock Wallet" })}
                </Button>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <ActionButton
              icon={Send}
              label={t("actions.send", { defaultValue: "Send" })}
              onClick={() => navigate("/send")}
              variant="primary"
              disabled={!isUnlocked}
            />
            <ActionButton
              icon={Download}
              label={t("actions.receive", { defaultValue: "Receive" })}
              onClick={() => navigate("/receive")}
              disabled={!isUnlocked}
            />
            <ActionButton
              icon={ArrowUpDown}
              label={t("actions.convert", { defaultValue: "Convert" })}
              onClick={() => navigate("/convert")}
              disabled={!isUnlocked}
            />
            <ActionButton
              icon={Plus}
              label={t("actions.buyCrypto", { defaultValue: "Buy Crypto" })}
              onClick={() => navigate("/buy")}
            />
          </div>
        </div>

        {/* Wallet Cards (dynamic) */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* TRON */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">{t("labels.tron", { defaultValue: "TRON" })}</h3>
              <AddressPill label="TRON" address={tron?.address} />
            </div>
            <WalletCard
              balance={
                trxBalance === null
                  ? "— TRX"
                  : `${trxBalance.toLocaleString(undefined, { maximumFractionDigits: 6 })} TRX`
              }
              usdValue={formatUSD((trxBalance ?? 0) * (prices.trxUsd || 0))}
              change24h={0}
              network="TRON"
            />
          </div>

          {/* Solana */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">{t("labels.solana", { defaultValue: "Solana" })}</h3>
              <AddressPill label="SOL" address={sol?.address} />
            </div>
            <WalletCard
              balance={
                solBalance === null
                  ? "— SOL"
                  : `${solBalance.toLocaleString(undefined, { maximumFractionDigits: 6 })} SOL`
              }
              usdValue={formatUSD((solBalance ?? 0) * (prices.solUsd || 0))}
              change24h={0}
              network="Solana"
            />
          </div>
        </div>

        {/* Recent Activity */}
        <Card className="bg-gradient-card border-border/50 shadow-card">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Activity className="w-5 h-5 text-primary" />
              <span>{t("labels.recentActivity", { defaultValue: "Recent Activity" })}</span>
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={() => navigate("/history")} disabled={!isUnlocked}>
              {t("actions.viewAll", { defaultValue: "View All" })}
            </Button>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">
              {isUnlocked
                ? t("hints.noActivity", { defaultValue: "No recent activity yet." })
                : t("hints.unlockToSeeTx", { defaultValue: "Unlock your wallet to see transactions." })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
