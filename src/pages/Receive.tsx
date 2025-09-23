// src/pages/Receive.tsx
import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Download, Copy, QrCode, Share2, CheckCircle, PlugZap, Unlock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useWalletModal } from "@/components/wallet/useWalletModal";
import ConnectWalletButton from "@/components/wallet/ConnectWalletButton";
import { useWallet } from "@/wallet/store";
import { ethers } from "ethers";
import { QRCodeSVG } from "qrcode.react";

type NetType = "evm-native" | "evm-erc20" | "tron" | "solana";

type Network = {
  value: string;
  label: string;
  color: string;
  type: NetType;
  chainId?: number;      // EVM
  tokenAddress?: string; // EVM ERC-20 (display only)
};

const NETWORKS: Network[] = [
  { value: "evm-eth-mainnet", label: "Ethereum (ETH)",  color: "bg-blue-500",   type: "evm-native", chainId: 1 },
  { value: "evm-usdt-mainnet", label: "USDT (Ethereum)", color: "bg-emerald-500", type: "evm-erc20", chainId: 1, tokenAddress: "0xdAC17F958D2ee523a2206206994597C13D831ec7" },
  { value: "tron-trx", label: "TRON (TRX)",   color: "bg-red-500",    type: "tron"   },
  { value: "sol-sol",  label: "Solana (SOL)", color: "bg-purple-500", type: "solana" },
];

export default function ReceivePage() {
  const { toast } = useToast();

  // EVM (MetaMask)
  const { address: evmAddress, open: openWalletModal } = useWalletModal();
  // Built-in wallet (Solana + TRON)
  const { sol, tron, encrypted } = useWallet();

  // default to EVM ETH
  const [selectedNetwork, setSelectedNetwork] = useState<string>("evm-eth-mainnet");
  const [amount, setAmount] = useState("");
  const [memo, setMemo] = useState("");
  const [copied, setCopied] = useState(false);

  const net = useMemo(
    () => NETWORKS.find((n) => n.value === selectedNetwork)!,
    [selectedNetwork]
  );

  // pick the correct address source
  const currentAddress = useMemo(() => {
    if (net.type === "evm-native" || net.type === "evm-erc20") return evmAddress ?? "";
    if (net.type === "tron") return tron?.address ?? "";
    if (net.type === "solana") return sol?.address ?? "";
    return "";
  }, [net, evmAddress, sol?.address, tron?.address]);

  // build payment URI for QR/share
  const paymentUri = useMemo(() => {
    if (!currentAddress) return "";

    const amt = amount.trim();
    const note = memo.trim();

    if (net.type === "evm-native") {
      // EIP-681 minimal: ethereum:<addr>@<chainId>?value=<wei>
      const chain = net.chainId ?? 1;
      const wei = amt ? ethers.parseEther(amt).toString() : undefined;
      const qs = new URLSearchParams();
      if (wei) qs.set("value", wei);
      return `ethereum:${currentAddress}@${chain}${qs.toString() ? "?" + qs.toString() : ""}`;
    }

    if (net.type === "evm-erc20") {
      // For receive, the account address is enough. (Advanced: encode token transfer target.)
      const chain = net.chainId ?? 1;
      return `ethereum:${currentAddress}@${chain}`;
    }

    if (net.type === "solana") {
      const qs = new URLSearchParams();
      if (amt) qs.set("amount", amt); // SOL decimal
      if (note) qs.set("memo", note);
      return `solana:${currentAddress}${qs.toString() ? "?" + qs.toString() : ""}`;
    }

    if (net.type === "tron") {
      const qs = new URLSearchParams();
      if (amt) qs.set("amount", amt); // TRX decimal
      return `tron:${currentAddress}${qs.toString() ? "?" + qs.toString() : ""}`;
    }

    return currentAddress;
  }, [net, currentAddress, amount, memo]);

  const needsEvmButNotConnected = (net.type === "evm-native" || net.type === "evm-erc20") && !evmAddress;
  const needsBuiltInButMissing =
    (net.type === "tron"   && !tron?.address) ||
    (net.type === "solana" && !sol?.address);

  const wrongEvmFormat =
    (net.type === "evm-native" || net.type === "evm-erc20") &&
    evmAddress &&
    !ethers.isAddress(evmAddress);

  const handleCopyAddress = async () => {
    if (!currentAddress) {
      toast({ title: "No Address", description: "Connect or unlock your wallet first.", variant: "destructive" });
      return;
    }
    try {
      await navigator.clipboard.writeText(currentAddress);
      setCopied(true);
      toast({ title: "Address Copied", description: "Wallet address copied to clipboard" });
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast({ title: "Copy Failed", description: "Unable to copy address", variant: "destructive" });
    }
  };

  const handleShare = async () => {
    if (!currentAddress) {
      toast({ title: "No Address", description: "Connect or unlock your wallet first.", variant: "destructive" });
      return;
    }
    const label = net.label ?? "Wallet";
    const text = `Send ${label} to: ${currentAddress}${amount ? `\nAmount: ${amount}` : ""}${memo ? `\nNote: ${memo}` : ""}`;
    if (navigator.share) {
      try { await navigator.share({ title: "Receive Address", text, url: paymentUri || undefined }); } catch { /* ignore */ }
    } else {
      await handleCopyAddress();
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Receive Crypto</h1>
          <p className="text-muted-foreground">Share your wallet address to receive payments</p>
        </div>

        <Card className="bg-gradient-card border-border/50 shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Download className="w-5 h-5 text-primary" />
              <span>Receive Address</span>
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Network Selection */}
            <div className="space-y-2">
              <Label htmlFor="network">Select Network & Token</Label>
              <Select value={selectedNetwork} onValueChange={setSelectedNetwork}>
                <SelectTrigger id="network">
                  <SelectValue placeholder="Choose network and token" />
                </SelectTrigger>
                <SelectContent>
                  {NETWORKS.map((n) => (
                    <SelectItem key={n.value} value={n.value}>
                      <div className="flex items-center space-x-3">
                        <div className={`w-4 h-4 ${n.color} rounded-full`} />
                        <span>{n.label}</span>
                        {n.type === "tron" || n.type === "solana" ? (
                          <Badge className="ml-2" variant="secondary">Built-in wallet</Badge>
                        ) : null}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Hints */}
            {needsEvmButNotConnected && (
              <div className="flex items-center justify-between rounded-lg border border-border/60 bg-card/50 p-3">
                <div className="text-sm text-muted-foreground">
                  Connect MetaMask to view your {net.label} address.
                </div>
                <ConnectWalletButton size="sm" className="gap-2">
                  <PlugZap className="h-4 w-4" />
                  Connect
                </ConnectWalletButton>
              </div>
            )}

            {needsBuiltInButMissing && (
              <div className="flex items-center justify-between rounded-lg border border-border/60 bg-card/50 p-3">
                <div className="text-sm text-muted-foreground">
                  Create/Unlock your built-in wallet to view your {net.label} address.
                </div>
                <Button size="sm" variant="secondary" onClick={openWalletModal} className="gap-2">
                  <Unlock className="h-4 w-4" />
                  Open Wallet
                </Button>
              </div>
            )}

            {/* QR Code */}
            <Card className="bg-muted/50 border-border/50">
              <CardContent className="p-6 text-center">
                <div
                  className="rounded-lg bg-white border-2 border-border mx-auto mb-4 flex items-center justify-center"
                  style={{ width: 192, height: 192 }}
                >
                  {currentAddress ? (
                    <QRCodeSVG value={paymentUri || currentAddress} size={176} />
                  ) : (
                    <QrCode className="w-24 h-24 text-muted-foreground" />
                  )}
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  {currentAddress ? "Scan to pay" : "Connect / Unlock to show your QR"}
                </p>
                <Button
                  variant="outline"
                  onClick={() => {
                    if (!currentAddress) {
                      toast({ title: "No Address", description: "Connect or unlock your wallet first.", variant: "destructive" });
                      return;
                    }
                    toast({ title: "QR ready", description: "The QR above can be scanned now." });
                  }}
                  className="w-full"
                >
                  <QrCode className="w-4 h-4 mr-2" />
                  Show QR Code
                </Button>
              </CardContent>
            </Card>

            {/* Address Display */}
            <div className="space-y-2">
              <Label>Wallet Address</Label>
              <div className="flex space-x-2">
                <Input
                  value={currentAddress || ""}
                  readOnly
                  placeholder={
                    needsEvmButNotConnected || needsBuiltInButMissing
                      ? "Connect or Unlock to see your address"
                      : "Address unavailable"
                  }
                  className="bg-muted font-mono text-sm"
                />
                <Button variant="outline" onClick={handleCopyAddress} className="px-3 flex-shrink-0">
                  {copied ? <CheckCircle className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                </Button>
                <Button variant="outline" onClick={handleShare} className="px-3 flex-shrink-0">
                  <Share2 className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">Only send {net.label} to this address.</p>

              {wrongEvmFormat && (
                <p className="text-xs text-red-500">
                  The connected address is not a valid EVM address.
                </p>
              )}
            </div>

            {/* Optional Amount */}
            <div className="space-y-2">
              <Label htmlFor="amount">Expected Amount (Optional)</Label>
              <Input
                id="amount"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                type="number"
              />
              <p className="text-xs text-muted-foreground">
                Many wallets will prefill the amount from this QR.
              </p>
            </div>

            {/* Memo */}
            <div className="space-y-2">
              <Label htmlFor="memo">Memo/Note (Optional)</Label>
              <Input
                id="memo"
                placeholder="Add a note for this transaction"
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
              />
            </div>

            {/* Network Info */}
            <Card className="bg-muted/50 border-border/50">
              <CardContent className="p-4">
                <h4 className="font-medium mb-3">Important Information</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Network:</span>
                    <Badge variant="secondary">{net.label}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Confirmations:</span>
                    <span>{net.type === "tron" ? "1" : net.type === "solana" ? "1" : "1–2"} required</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Estimated time:</span>
                    <span>{net.type === "tron" ? "~3 seconds" : net.type === "solana" ? "~400 ms" : "~12–30 seconds"}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Warning */}
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start space-x-3">
                <div className="w-5 h-5 text-yellow-600 mt-0.5">⚠️</div>
                <div className="text-sm">
                  <p className="font-medium text-yellow-800 mb-1">Important:</p>
                  <p className="text-yellow-700">
                    Only send {net.label.split(" ")[0]} tokens to this address. Sending other tokens may result in permanent loss.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
