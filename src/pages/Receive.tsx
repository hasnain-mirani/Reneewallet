// src/pages/Receive.tsx
import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Download, Copy, QrCode, Share2, CheckCircle, PlugZap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useWalletModal } from "@/components/wallet/useWalletModal";
import ConnectWalletButton from "@/components/wallet/ConnectWalletButton";
import { ethers } from "ethers";

type NetType = "evm-native" | "evm-erc20" | "tron" | "solana";

type Network = {
  value: string;
  label: string;
  color: string;
  type: NetType;
  // EVM specifics
  chainId?: number;
  tokenAddress?: string; // for evm-erc20 display only
};

// EVM + Non-EVM choices
const NETWORKS: Network[] = [
  { value: "evm-eth-mainnet", label: "Ethereum (ETH)", color: "bg-blue-500", type: "evm-native", chainId: 1 },
  { value: "evm-usdt-mainnet", label: "USDT (Ethereum)", color: "bg-emerald-500", type: "evm-erc20", chainId: 1, tokenAddress: "0xdAC17F958D2ee523a2206206994597C13D831ec7" },

  // Non-EVM (inform user)
  { value: "tron-trx", label: "TRON (TRX)", color: "bg-red-500", type: "tron" },
  { value: "usdt-tron", label: "USDT (TRON)", color: "bg-red-500", type: "tron" },
  { value: "sol-sol", label: "Solana (SOL)", color: "bg-purple-500", type: "solana" },
  { value: "usdt-sol", label: "USDT (Solana)", color: "bg-purple-500", type: "solana" },
];

export default function ReceivePage() {
  const { toast } = useToast();
  const { address, provider, open } = useWalletModal();

  // Default to Ethereum (EVM) since MetaMask is EVM
  const [selectedNetwork, setSelectedNetwork] = useState<string>("evm-eth-mainnet");
  const [amount, setAmount] = useState("");
  const [memo, setMemo] = useState("");
  const [copied, setCopied] = useState(false);

  const net = useMemo(
    () => NETWORKS.find((n) => n.value === selectedNetwork)!,
    [selectedNetwork]
  );

  // Dynamic address depending on network
  const currentAddress = useMemo(() => {
    if (net.type === "evm-native" || net.type === "evm-erc20") {
      return address ?? "";
    }
    // Demo placeholder addresses for non-EVM (not supported by MetaMask)
    if (net.type === "tron") return "TQn9Y2khEsLJW1ChVWFMSMeRDow5KcbLSE";
    if (net.type === "solana") return "9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM";
    return "";
  }, [net, address]);

  const handleCopyAddress = async () => {
    if (!currentAddress) {
      toast({ title: "No Address", description: "Please connect your wallet first.", variant: "destructive" });
      return;
    }
    try {
      await navigator.clipboard.writeText(currentAddress);
      setCopied(true);
      toast({ title: "Address Copied", description: "Wallet address copied to clipboard" });
      setTimeout(() => setCopied(false), 1800);
    } catch {
      toast({ title: "Copy Failed", description: "Failed to copy address to clipboard", variant: "destructive" });
    }
  };

  const handleShare = async () => {
    if (!currentAddress) {
      toast({ title: "No Address", description: "Please connect your wallet first.", variant: "destructive" });
      return;
    }
    const label = NETWORKS.find((n) => n.value === selectedNetwork)?.label ?? "Wallet";
    const text = `Send ${label} to: ${currentAddress}${amount ? `\nAmount: ${amount}` : ""}${memo ? `\nNote: ${memo}` : ""}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: "InventWallet Address", text });
      } catch {
        /* user canceled */
      }
    } else {
      await handleCopyAddress();
    }
  };

  const generateQRCode = () => {
    // Keep as placeholder; can wire a tiny QR lib like `qrcode` later
    // (or build EIP-681 ethereum: URI for payments).
    toast({
      title: "QR Code",
      description: "QR code generation is coming soon.",
    });
  };

  // Helpers for info box
  const confirmations =
    net.type === "tron" ? "1" : net.type === "solana" ? "1" : "1–2";
  const eta =
    net.type === "tron" ? "~3 seconds" : net.type === "solana" ? "~400 ms" : "~12–30 seconds";

  const needsEvmButNotConnected =
    (net.type === "evm-native" || net.type === "evm-erc20") && !address;

  const wrongEvmFormat =
    (net.type === "evm-native" || net.type === "evm-erc20") &&
    address &&
    !ethers.isAddress(address);

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
                        {(n.type === "tron" || n.type === "solana") && (
                          <Badge className="ml-2" variant="destructive">Not via MetaMask</Badge>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Connect hint for EVM */}
            {needsEvmButNotConnected && (
              <div className="flex items-center justify-between rounded-lg border border-border/60 bg-card/50 p-3">
                <div className="text-sm text-muted-foreground">
                  Connect MetaMask to view your {net.label} receive address.
                </div>
                <ConnectWalletButton size="sm" className="gap-2">
                  <PlugZap className="h-4 w-4" />
                  Connect
                </ConnectWalletButton>
              </div>
            )}

            {/* QR Code Section */}
            <Card className="bg-muted/50 border-border/50">
              <CardContent className="p-6 text-center">
                <div className="w-48 h-48 bg-white border-2 border-border rounded-lg mx-auto mb-4 flex items-center justify-center">
                  <QrCode className="w-24 h-24 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Scan this QR code to get the wallet address
                </p>
                <Button variant="outline" onClick={generateQRCode} className="w-full">
                  <QrCode className="w-4 h-4 mr-2" />
                  Generate QR Code
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
                  placeholder={needsEvmButNotConnected ? "Connect MetaMask to see your address" : "Address unavailable"}
                  className="bg-muted font-mono text-sm"
                />
                <Button variant="outline" onClick={handleCopyAddress} className="px-3 flex-shrink-0">
                  {copied ? <CheckCircle className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                </Button>
                <Button variant="outline" onClick={handleShare} className="px-3 flex-shrink-0">
                  <Share2 className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Only send {net.label} to this address.
              </p>

              {wrongEvmFormat && (
                <p className="text-xs text-red-500">The connected address is not a valid EVM address.</p>
              )}

              {(net.type === "tron" || net.type === "solana") && (
                <p className="text-xs text-yellow-500">
                  Tip: Use TronLink for TRON or Phantom for Solana to receive on those networks.
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
                Specify an amount to help the sender know how much to send
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
                    <span>{confirmations} required</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Estimated time:</span>
                    <span>{eta}</span>
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
