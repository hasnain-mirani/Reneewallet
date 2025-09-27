// src/pages/Receive.tsx
import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Download, Copy, QrCode, Share2, CheckCircle, PlugZap, Unlock, Info } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useWalletModal } from "@/components/wallet/useWalletModal";
import ConnectWalletButton from "@/components/wallet/ConnectWalletButton";
import { useWallet } from "@/wallet/store";
import { ethers } from "ethers";
import { QRCodeSVG } from "qrcode.react";
import { useTranslation } from "react-i18next"; // ✅ translations

/** ------------ Types ------------ */
type NetType =
  | "evm-native"
  | "evm-erc20"
  | "tron-native"
  | "tron-trc20"
  | "solana";

type Network = {
  value: string;
  label: string;
  color: string;
  type: NetType;
  chainId?: number;      // EVM
  tokenAddress?: string; // ERC-20 / TRC-20
  tokenSymbol?: string;  // for TRC-20 / ERC-20 display
};

/** ------------ Constants ------------ */
// Mainnet USDT (TRC20) contract:
const USDT_TRC20_CONTRACT = "TXLAQ63Xg1NAzckPwKHvzw7CSEmLMEqcdj";

const NETWORKS: Network[] = [
  // EVM
  { value: "evm-eth-mainnet", label: "Ethereum (ETH)",  color: "bg-blue-500",   type: "evm-native", chainId: 1 },
  {
    value: "evm-usdt-mainnet",
    label: "USDT (Ethereum ERC20)",
    color: "bg-emerald-500",
    type: "evm-erc20",
    chainId: 1,
    tokenAddress: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
    tokenSymbol: "USDT",
  },

  // TRON
  { value: "tron-trx", label: "TRON (TRX)",   color: "bg-red-500",    type: "tron-native" },
  {
    value: "tron-usdt",
    label: "USDT (TRON TRC20)",
    color: "bg-red-500",
    type: "tron-trc20",
    tokenAddress: USDT_TRC20_CONTRACT,
    tokenSymbol: "USDT",
  },

  // Solana
  { value: "sol-sol",  label: "Solana (SOL)", color: "bg-purple-500", type: "solana" },
];

/** Basic TRON Base58 check for UX (not cryptographically strong) */
const isTronBase58 = (addr?: string) =>
  !!addr && /^T[1-9A-HJ-NP-Za-km-z]{33}$/.test(addr);

/** ------------ Component ------------ */
export default function ReceivePage() {
  const { t } = useTranslation();
  const { toast } = useToast();

  // EVM (MetaMask)
  const { address: evmAddress, open: openWalletModal } = useWalletModal();
  // Built-in wallet (Solana + TRON)
  const { sol, tron, encrypted } = useWallet();

  // defaults
  const [selectedNetwork, setSelectedNetwork] = useState<string>("evm-eth-mainnet");
  const [amount, setAmount] = useState("");
  const [memo, setMemo] = useState("");
  const [copied, setCopied] = useState(false);
  const [copiedToken, setCopiedToken] = useState(false);

  const net = useMemo(
    () => NETWORKS.find((n) => n.value === selectedNetwork)!,
    [selectedNetwork]
  );

  // pick the correct address source
  const currentAddress = useMemo(() => {
    if (net.type === "evm-native" || net.type === "evm-erc20") return evmAddress ?? "";
    if (net.type === "tron-native" || net.type === "tron-trc20") return tron?.address ?? "";
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
      // For receive, the account address is sufficient; token is chosen in the sender wallet.
      const chain = net.chainId ?? 1;
      return `ethereum:${currentAddress}@${chain}`;
    }

    if (net.type === "solana") {
      // Solana Pay basic
      const qs = new URLSearchParams();
      if (amt) qs.set("amount", amt); // SOL full decimals understood by wallets
      if (note) qs.set("memo", note);
      return `solana:${currentAddress}${qs.toString() ? "?" + qs.toString() : ""}`;
    }

    if (net.type === "tron-native") {
      // No universal standard; many wallets accept tron:<addr>?amount=<TRX>
      const qs = new URLSearchParams();
      if (amt) qs.set("amount", amt); // TRX decimal
      return `tron:${currentAddress}${qs.toString() ? "?" + qs.toString() : ""}`;
    }

    if (net.type === "tron-trc20") {
      // Best cross-wallet compatibility is to show a plain address in QR.
      // We also display/copy the token contract separately so sender selects the correct token.
      return currentAddress;
    }

    return currentAddress;
  }, [net, currentAddress, amount, memo]);

  const needsEvmButNotConnected = (net.type === "evm-native" || net.type === "evm-erc20") && !evmAddress;
  const needsBuiltInButMissing =
    ((net.type === "tron-native" || net.type === "tron-trc20") && !tron?.address) ||
    (net.type === "solana" && !sol?.address);

  const wrongEvmFormat =
    (net.type === "evm-native" || net.type === "evm-erc20") &&
    evmAddress &&
    !ethers.isAddress(evmAddress);

  const wrongTronFormat =
    (net.type === "tron-native" || net.type === "tron-trc20") &&
    !!tron?.address &&
    !isTronBase58(tron?.address);

  const handleCopyAddress = async () => {
    if (!currentAddress) {
      toast({
        title: t("receive.toast.noAddress.title", { defaultValue: "No Address" }),
        description: t("receive.toast.noAddress.desc", { defaultValue: "Connect or unlock your wallet first." }),
        variant: "destructive",
      });
      return;
    }
    try {
      await navigator.clipboard.writeText(currentAddress);
      setCopied(true);
      toast({
        title: t("receive.toast.addrCopied.title", { defaultValue: "Address Copied" }),
        description: t("receive.toast.addrCopied.desc", { defaultValue: "Wallet address copied to clipboard" }),
      });
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast({
        title: t("receive.toast.copyFail.title", { defaultValue: "Copy Failed" }),
        description: t("receive.toast.copyFail.addr", { defaultValue: "Unable to copy address" }),
        variant: "destructive",
      });
    }
  };

  const handleCopyToken = async (token?: string) => {
    if (!token) return;
    try {
      await navigator.clipboard.writeText(token);
      setCopiedToken(true);
      toast({
        title: t("receive.toast.tokenCopied.title", { defaultValue: "Token Contract Copied" }),
        description: token,
      });
      setTimeout(() => setCopiedToken(false), 1500);
    } catch {
      toast({
        title: t("receive.toast.copyFail.title", { defaultValue: "Copy Failed" }),
        description: t("receive.toast.copyFail.token", { defaultValue: "Unable to copy token contract" }),
        variant: "destructive",
      });
    }
  };

  const handleShare = async () => {
    if (!currentAddress) {
      toast({
        title: t("receive.toast.noAddress.title", { defaultValue: "No Address" }),
        description: t("receive.toast.noAddress.desc", { defaultValue: "Connect or unlock your wallet first." }),
        variant: "destructive",
      });
      return;
    }
    const label = net.label ?? t("receive.common.wallet", { defaultValue: "Wallet" });
    const extra =
      net.type === "tron-trc20"
        ? `\n${t("receive.trc20.tokenLine", { defaultValue: "Token" })}: ${net.tokenSymbol || "USDT"} (TRC20)\n${t("receive.trc20.contract", { defaultValue: "Contract" })}: ${net.tokenAddress}`
        : "";

    const text =
      `${t("receive.share.sendTo", { defaultValue: "Send" })} ${label} ${t("receive.share.to", { defaultValue: "to" })}: ${currentAddress}` +
      `${amount ? `\n${t("receive.form.amount", { defaultValue: "Amount" })}: ${amount}` : ""}` +
      `${memo ? `\n${t("receive.form.memo", { defaultValue: "Note" })}: ${memo}` : ""}` +
      extra;

    if (navigator.share) {
      try {
        await navigator.share({
          title: t("receive.share.title", { defaultValue: "Receive Address" }),
          text,
          url: paymentUri || undefined,
        });
      } catch {
        /* ignore */
      }
    } else {
      await handleCopyAddress();
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            {t("receive.title", { defaultValue: "Receive Crypto" })}
          </h1>
          <p className="text-muted-foreground">
            {t("receive.subtitle", { defaultValue: "Share your wallet address to receive payments" })}
          </p>
        </div>

        <Card className="bg-gradient-card border-border/50 shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Download className="w-5 h-5 text-primary" />
              <span>{t("receive.sectionTitle", { defaultValue: "Receive Address" })}</span>
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Network Selection */}
            <div className="space-y-2">
              <Label htmlFor="network">
                {t("receive.form.selectNetwork", { defaultValue: "Select Network & Token" })}
              </Label>
              <Select value={selectedNetwork} onValueChange={setSelectedNetwork}>
                <SelectTrigger id="network">
                  <SelectValue placeholder={t("receive.form.chooseNetwork", { defaultValue: "Choose network and token" })} />
                </SelectTrigger>
                <SelectContent>
                  {NETWORKS.map((n) => (
                    <SelectItem key={n.value} value={n.value}>
                      <div className="flex items-center space-x-3">
                        <div className={`w-4 h-4 ${n.color} rounded-full`} />
                        <span>{n.label}</span>
                        {n.type === "tron-trc20" && (
                          <Badge className="ml-2" variant="secondary">TRC20</Badge>
                        )}
                        {n.type === "evm-erc20" && (
                          <Badge className="ml-2" variant="secondary">ERC20</Badge>
                        )}
                        {(n.type === "tron-native" || n.type === "tron-trc20" || n.type === "solana") ? (
                          <Badge className="ml-2" variant="outline">
                            {t("receive.badges.builtin", { defaultValue: "Built-in wallet" })}
                          </Badge>
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
                  {t("receive.hints.connectEvm", {
                    defaultValue: "Connect MetaMask to view your {{label}} address.",
                    label: net.label,
                  })}
                </div>
                <ConnectWalletButton size="sm" className="gap-2">
                  <PlugZap className="h-4 w-4" />
                  {t("actions.connectWallet", { defaultValue: "Connect Wallet" })}
                </ConnectWalletButton>
              </div>
            )}

            {needsBuiltInButMissing && (
              <div className="flex items-center justify-between rounded-lg border border-border/60 bg-card/50 p-3">
                <div className="text-sm text-muted-foreground">
                  {t("receive.hints.unlockBuiltIn", {
                    defaultValue: "Create/Unlock your built-in wallet to view your {{label}} address.",
                    label: net.label,
                  })}
                </div>
                <Button size="sm" variant="secondary" onClick={openWalletModal} className="gap-2">
                  <Unlock className="h-4 w-4" />
                  {t("receive.actions.openWallet", { defaultValue: "Open Wallet" })}
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
                  {currentAddress
                    ? t("receive.qr.scanToPay", { defaultValue: "Scan to pay" })
                    : t("receive.qr.connectToShow", { defaultValue: "Connect / Unlock to show your QR" })}
                </p>
                <Button
                  variant="outline"
                  onClick={() => {
                    if (!currentAddress) {
                      toast({
                        title: t("receive.toast.noAddress.title", { defaultValue: "No Address" }),
                        description: t("receive.toast.noAddress.desc", { defaultValue: "Connect or unlock your wallet first." }),
                        variant: "destructive",
                      });
                      return;
                    }
                    toast({
                      title: t("receive.qr.readyTitle", { defaultValue: "QR ready" }),
                      description: t("receive.qr.readyDesc", { defaultValue: "The QR above can be scanned now." }),
                    });
                  }}
                  className="w-full"
                >
                  <QrCode className="w-4 h-4 mr-2" />
                  {t("receive.qr.showBtn", { defaultValue: "Show QR Code" })}
                </Button>
              </CardContent>
            </Card>

            {/* Address Display */}
            <div className="space-y-2">
              <Label>{t("receive.form.addressLabel", { defaultValue: "Wallet Address" })}</Label>
              <div className="flex space-x-2">
                <Input
                  value={currentAddress || ""}
                  readOnly
                  placeholder={
                    needsEvmButNotConnected || needsBuiltInButMissing
                      ? t("receive.form.addressPlaceholderLocked", { defaultValue: "Connect or Unlock to see your address" })
                      : t("receive.form.addressPlaceholderEmpty", { defaultValue: "Address unavailable" })
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
              <p className="text-xs text-muted-foreground">
                {t("receive.form.sendOnly", {
                  defaultValue: "Only send {{label}} to this address.",
                  label: net.label,
                })}
              </p>

              {wrongEvmFormat && (
                <p className="text-xs text-red-500">
                  {t("receive.errors.badEvm", { defaultValue: "The connected address is not a valid EVM address." })}
                </p>
              )}
              {wrongTronFormat && (
                <p className="text-xs text-red-500">
                  {t("receive.errors.badTron", {
                    defaultValue: "The built-in address doesn’t look like a valid TRON Base58 address (T…).",
                  })}
                </p>
              )}
            </div>

            {/* Optional Amount */}
            <div className="space-y-2">
              <Label htmlFor="amount">
                {t("receive.form.expectedAmount", { defaultValue: "Expected Amount (Optional)" })}
              </Label>
              <Input
                id="amount"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                type="number"
              />
              <p className="text-xs text-muted-foreground">
                {t("receive.form.amountHint", {
                  defaultValue: "Many wallets will prefill the amount from this QR. (Not all support token amounts.)",
                })}
              </p>
            </div>

            {/* Memo */}
            <div className="space-y-2">
              <Label htmlFor="memo">{t("receive.form.memoOpt", { defaultValue: "Memo/Note (Optional)" })}</Label>
              <Input
                id="memo"
                placeholder={t("receive.form.memoPlaceholder", { defaultValue: "Add a note for this transaction" })}
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
              />
            </div>

            {/* TRC20 extra (token contract copy) */}
            {net.type === "tron-trc20" && (
              <Card className="bg-muted/50 border-border/50">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <Info className="w-4 h-4 text-primary" />
                    <p className="text-sm">
                      {t("receive.trc20.infoLine", {
                        defaultValue:
                          "This is a USDT (TRC20) request on TRON. The sender should select the USDT TRC20 token in their wallet.",
                      })}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label>{t("receive.trc20.contractLabel", { defaultValue: "USDT (TRC20) Contract" })}</Label>
                    <div className="flex gap-2">
                      <Input
                        value={net.tokenAddress || USDT_TRC20_CONTRACT}
                        readOnly
                        className="bg-muted font-mono text-xs"
                      />
                      <Button
                        variant="outline"
                        onClick={() => handleCopyToken(net.tokenAddress || USDT_TRC20_CONTRACT)}
                        className="px-3 flex-shrink-0"
                        title={t("receive.trc20.copyContract", { defaultValue: "Copy contract" })}
                      >
                        {copiedToken ? <CheckCircle className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {t("receive.trc20.pasteHint", {
                        defaultValue:
                          "Some wallets let you paste the token contract to ensure they send the correct token.",
                      })}
                    </p>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {t("receive.trc20.trxNote", {
                      defaultValue:
                        "You’ll need a little TRX in your wallet to receive/forward USDT (TRC20) due to network fees.",
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Network Info */}
            <Card className="bg-muted/50 border-border/50">
              <CardContent className="p-4">
                <h4 className="font-medium mb-3">
                  {t("receive.info.title", { defaultValue: "Important Information" })}
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      {t("receive.info.network", { defaultValue: "Network:" })}
                    </span>
                    <Badge variant="secondary">{net.label}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      {t("receive.info.confirmations", { defaultValue: "Confirmations:" })}
                    </span>
                    <span>
                      {net.type === "tron-native" || net.type === "tron-trc20"
                        ? "1"
                        : net.type === "solana"
                        ? "1"
                        : "1–2"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      {t("receive.info.eta", { defaultValue: "Estimated time:" })}
                    </span>
                    <span>
                      {net.type === "tron-native" || net.type === "tron-trc20"
                        ? "~3 seconds"
                        : net.type === "solana"
                        ? "~400 ms"
                        : "~12–30 seconds"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Warning */}
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start space-x-3">
                <div className="w-5 h-5 text-yellow-600 mt-0.5">⚠️</div>
                <div className="text-sm">
                  <p className="font-medium text-yellow-800 mb-1">
                    {t("receive.warn.title", { defaultValue: "Important:" })}
                  </p>
                  <p className="text-yellow-700">
                    {t("receive.warn.body", {
                      defaultValue:
                        "Only send {{token}} tokens to this address. Sending other tokens may result in permanent loss.",
                      token: net.label.split(" ")[0],
                    })}
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
