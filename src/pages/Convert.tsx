// src/pages/Convert.tsx
import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ArrowUpDown, ArrowRight, RefreshCw, PlugZap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useWalletModal } from "@/components/wallet/useWalletModal";
import ConnectWalletButton from "@/components/wallet/ConnectWalletButton";
import { useTranslation } from "react-i18next";

function getHex(dec: number) { return "0x" + dec.toString(16); }

async function ensureMainnet(provider: any) {
  const want = getHex(1);
  const cur: string = await provider.request({ method: "eth_chainId" });
  if (cur?.toLowerCase() === want) return;
  await provider.request({ method: "wallet_switchEthereumChain", params: [{ chainId: want }] });
}

export default function ConvertPage() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { provider, address, open } = useWalletModal();

  // Localized token list (names kept as-is; only the badge text is translated)
  const TOKENS = useMemo(() => ([
    { value: "usd",    label: "USD (Fiat)",          balance: t("convert.availableViaCard", { defaultValue: "Available via card" }), rate: 1 },
    { value: "eth",    label: "Ethereum (ETH)",      balance: "—", rate: 3600 },
    { value: "usdt",   label: "USDT (Ethereum)",     balance: "—", rate: 1 },
    { value: "tron",   label: "TRON (TRX)",          balance: "—", rate: 0.068 },
    { value: "solana", label: "Solana (SOL)",        balance: "—", rate: 87.65 },
  ]), [t]);

  const [fromToken, setFromToken] = useState("");
  const [toToken, setToToken] = useState("usdt");
  const [fromAmount, setFromAmount] = useState("");
  const [toAmount, setToAmount] = useState("");
  const [loading, setLoading] = useState(false);

  const fromTokenData = useMemo(() => TOKENS.find(tk => tk.value === fromToken), [TOKENS, fromToken]);
  const toTokenData   = useMemo(() => TOKENS.find(tk => tk.value === toToken),   [TOKENS, toToken]);

  const handleAmountChange = (v: string) => {
    setFromAmount(v);
    if (v && fromToken && toToken) {
      const fromRate = fromTokenData?.rate ?? 1;
      const toRate   = toTokenData?.rate ?? 1;
      setToAmount(((parseFloat(v) * fromRate) / toRate).toFixed(6));
    } else setToAmount("");
  };

  const swapSelection = () => {
    const tkn = fromToken;
    setFromToken(toToken);
    setToToken(tkn);
    setFromAmount("");
    setToAmount("");
  };

  const handleConvert = async () => {
    if (!fromToken || !toToken || !fromAmount) {
      toast({
        title: t("convert.toast.missing.title", { defaultValue: "Missing info" }),
        description: t("convert.toast.missing.desc", { defaultValue: "Fill all fields" }),
        variant: "destructive",
      });
      return;
    }

    // Fiat route (placeholder)
    if (fromToken === "usd") {
      toast({
        title: t("convert.toast.onramp.title", { defaultValue: "On-ramp" }),
        description: t("convert.toast.onramp.desc", { defaultValue: "Open your payment provider here." }),
      });
      return;
    }

    // Only mainnet ETH <-> USDT handled in this demo
    const isSupported =
      (fromToken === "eth" && toToken === "usdt") ||
      (fromToken === "usdt" && toToken === "eth");

    if (!isSupported) {
      toast({
        title: t("convert.toast.notsupported.title", { defaultValue: "Not supported here" }),
        description: t("convert.toast.notsupported.desc", {
          defaultValue: "This demo only swaps ETH ↔ USDT on Ethereum via Uniswap v3.",
        }),
        variant: "destructive",
      });
      return;
    }

    if (!provider || !address) {
      toast({
        title: t("convert.toast.needWallet.title", { defaultValue: "Connect wallet" }),
        description: t("convert.toast.needWallet.desc", { defaultValue: "Please connect MetaMask first." }),
        variant: "destructive",
      });
      open();
      return;
    }

    try {
      setLoading(true);
      await ensureMainnet(provider);

      // Place your swap execution here…
      // (left intentionally empty for this demo)

      setFromAmount("");
      setToAmount("");
    } catch (e: any) {
      if (e?.code === 4001) return; // user rejected
      toast({
        title: t("convert.toast.failed.title", { defaultValue: "Swap failed" }),
        description: e?.message || t("convert.toast.failed.desc", { defaultValue: "Try again." }),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            {t("convert.title", { defaultValue: "Convert & Buy" })}
          </h1>
          <p className="text-muted-foreground">
            {t("convert.subtitle", { defaultValue: "Direct Uniswap v3 swaps (no 3rd-party aggregators)" })}
          </p>
        </div>

        <Card className="bg-gradient-card border-border/50 shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ArrowUpDown className="w-5 h-5 text-primary" />
              <span>{t("convert.cardTitle", { defaultValue: "Token Conversion" })}</span>
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* From */}
            <div className="space-y-2">
              <Label htmlFor="from-token">{t("convert.from", { defaultValue: "From" })}</Label>
              <Select value={fromToken} onValueChange={(v) => { setFromToken(v); setFromAmount(""); setToAmount(""); }}>
                <SelectTrigger id="from-token">
                  <SelectValue placeholder={t("convert.selectToken", { defaultValue: "Select token" })} />
                </SelectTrigger>
                <SelectContent>
                  {TOKENS.map((tkn) => (
                    <SelectItem key={tkn.value} value={tkn.value} disabled={tkn.value === toToken}>
                      <div className="flex items-center justify-between w-full">
                        <span>{tkn.label}</span>
                        <Badge variant="secondary" className="ml-2">{tkn.balance}</Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                placeholder="0.00"
                value={fromAmount}
                onChange={(e) => handleAmountChange(e.target.value)}
                type="number"
              />
              {fromTokenData && fromAmount && (
                <div className="text-sm text-muted-foreground">
                  ≈ ${(parseFloat(fromAmount) * (fromTokenData?.rate ?? 1)).toFixed(2)} USD
                </div>
              )}
            </div>

            {/* Swap Button */}
            <div className="flex justify-center">
              <Button
                variant="outline"
                size="sm"
                onClick={swapSelection}
                className="rounded-full p-2 hover:bg-accent"
                disabled={!fromToken || !toToken}
                title={t("convert.swapTokens", { defaultValue: "Swap tokens" })}
              >
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>

            {/* To */}
            <div className="space-y-2">
              <Label htmlFor="to-token">{t("convert.to", { defaultValue: "To" })}</Label>
              <Select value={toToken} onValueChange={(v) => { setToToken(v); setFromAmount(""); setToAmount(""); }}>
                <SelectTrigger id="to-token">
                  <SelectValue placeholder={t("convert.selectToken", { defaultValue: "Select token" })} />
                </SelectTrigger>
                <SelectContent>
                  {TOKENS.map((tkn) => (
                    <SelectItem key={tkn.value} value={tkn.value} disabled={tkn.value === fromToken}>
                      <div className="flex items-center justify-between w-full">
                        <span>{tkn.label}</span>
                        <Badge variant="secondary" className="ml-2">{tkn.balance}</Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input placeholder="0.00" value={toAmount} readOnly className="bg-muted" />
            </div>

            {(fromToken === "eth" || toToken === "eth") && !address && (
              <div className="flex items-center justify-between rounded-lg border border-border/60 bg-card/50 p-3">
                <div className="text-sm text-muted-foreground">
                  {t("convert.connectHintMetaMask", { defaultValue: "Connect MetaMask to swap on Ethereum." })}
                </div>
                <ConnectWalletButton size="sm" className="gap-2">
                  <PlugZap className="h-4 w-4" />
                  {t("actions.connectWallet", { defaultValue: "Connect Wallet" })}
                </ConnectWalletButton>
              </div>
            )}

            {/* Convert */}
            <Button
              onClick={handleConvert}
              className="w-full bg-gradient-primary text-white shadow-neon hover:shadow-float"
              size="lg"
              disabled={!fromToken || !toToken || !fromAmount || loading}
            >
              <ArrowUpDown className="w-4 h-4 mr-2" />
              {t("convert.convertTokens", { defaultValue: "Convert Tokens" })}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
