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


function getHex(dec: number) { return "0x" + dec.toString(16); }

async function ensureMainnet(provider: any) {
  const want = getHex(1);
  const cur: string = await provider.request({ method: "eth_chainId" });
  if (cur?.toLowerCase() === want) return;
  await provider.request({ method: "wallet_switchEthereumChain", params: [{ chainId: want }] });
}

const TOKENS = [
  { value: "usd", label: "USD (Fiat)", balance: "Available via card", rate: 1 },
  { value: "eth", label: "Ethereum (ETH)", balance: "—", rate: 3600 },
  { value: "usdt", label: "USDT (Ethereum)", balance: "—", rate: 1 },
  { value: "tron", label: "TRON (TRX)", balance: "—", rate: 0.068 },
  { value: "solana", label: "Solana (SOL)", balance: "—", rate: 87.65 },
];

export default function ConvertPage() {
  const { toast } = useToast();
  const { provider, address, open } = useWalletModal();

  const [fromToken, setFromToken] = useState("");
  const [toToken, setToToken] = useState("usdt");
  const [fromAmount, setFromAmount] = useState("");
  const [toAmount, setToAmount] = useState("");
  const [loading, setLoading] = useState(false);

  const fromTokenData = useMemo(() => TOKENS.find(t => t.value === fromToken), [fromToken]);
  const toTokenData   = useMemo(() => TOKENS.find(t => t.value === toToken),   [toToken]);

  const handleAmountChange = (v: string) => {
    setFromAmount(v);
    if (v && fromToken && toToken) {
      const fromRate = fromTokenData?.rate ?? 1;
      const toRate   = toTokenData?.rate ?? 1;
      setToAmount(((parseFloat(v) * fromRate) / toRate).toFixed(6));
    } else setToAmount("");
  };

  const swapSelection = () => {
    const t = fromToken;
    setFromToken(toToken);
    setToToken(t);
    setFromAmount("");
    setToAmount("");
  };

  const handleConvert = async () => {
    if (!fromToken || !toToken || !fromAmount) {
      toast({ title: "Missing info", description: "Fill all fields", variant: "destructive" });
      return;
    }

    // Fiat route (left as placeholder)
    if (fromToken === "usd") {
      toast({ title: "On-ramp", description: "Open your payment provider here." });
      return;
    }

    // Only mainnet ETH <-> USDT handled below
    const isSupported =
      (fromToken === "eth" && toToken === "usdt") ||
      (fromToken === "usdt" && toToken === "eth");

    if (!isSupported) {
      toast({
        title: "Not supported here",
        description: "This demo only swaps ETH ↔ USDT on Ethereum via Uniswap v3.",
        variant: "destructive",
      });
      return;
    }

    if (!provider || !address) {
      toast({ title: "Connect wallet", description: "Please connect MetaMask first.", variant: "destructive" });
      open();
      return;
    }

    try {
      setLoading(true);
      await ensureMainnet(provider);

      

      setFromAmount("");
      setToAmount("");
    } catch (e: any) {
      if (e?.code === 4001) return; // user rejected
      toast({ title: "Swap failed", description: e?.message || "Try again.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Convert & Buy</h1>
          <p className="text-muted-foreground">Direct Uniswap v3 swaps (no 3rd-party aggregators)</p>
        </div>

        <Card className="bg-gradient-card border-border/50 shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ArrowUpDown className="w-5 h-5 text-primary" />
              <span>Token Conversion</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* From */}
            <div className="space-y-2">
              <Label htmlFor="from-token">From</Label>
              <Select value={fromToken} onValueChange={(v) => { setFromToken(v); setFromAmount(""); setToAmount(""); }}>
                <SelectTrigger id="from-token">
                  <SelectValue placeholder="Select token" />
                </SelectTrigger>
                <SelectContent>
                  {TOKENS.map((t) => (
                    <SelectItem key={t.value} value={t.value} disabled={t.value === toToken}>
                      <div className="flex items-center justify-between w-full">
                        <span>{t.label}</span>
                        <Badge variant="secondary" className="ml-2">{t.balance}</Badge>
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
                title="Swap tokens"
              >
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>

            {/* To */}
            <div className="space-y-2">
              <Label htmlFor="to-token">To</Label>
              <Select value={toToken} onValueChange={(v) => { setToToken(v); setFromAmount(""); setToAmount(""); }}>
                <SelectTrigger id="to-token">
                  <SelectValue placeholder="Select token" />
                </SelectTrigger>
                <SelectContent>
                  {TOKENS.map((t) => (
                    <SelectItem key={t.value} value={t.value} disabled={t.value === fromToken}>
                      <div className="flex items-center justify-between w-full">
                        <span>{t.label}</span>
                        <Badge variant="secondary" className="ml-2">{t.balance}</Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input placeholder="0.00" value={toAmount} readOnly className="bg-muted" />
            </div>

            {(fromToken === "eth" || toToken === "eth") && !address && (
              <div className="flex items-center justify-between rounded-lg border border-border/60 bg-card/50 p-3">
                <div className="text-sm text-muted-foreground">Connect MetaMask to swap on Ethereum.</div>
                <ConnectWalletButton size="sm" className="gap-2">
                  <PlugZap className="h-4 w-4" />
                  Connect
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
              Convert Tokens
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
