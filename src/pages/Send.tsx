// src/pages/Send.tsx
import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Send, ArrowRight, QrCode, BookOpen } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useWallet } from "@/wallet/store";
import { ethers } from "ethers";
import { useTranslation } from "react-i18next";

type NetType = "tron" | "solana" | "evm-native" | "evm-erc20";

type NetworkOption = {
  value: string;
  label: string;
  type: NetType;
  fee?: string;
  chainId?: number;
  tokenAddress?: string;
};

const BASE_NETWORKS: NetworkOption[] = [
  // EVM
  { value: "evm-eth-mainnet", label: "Ethereum (ETH)", type: "evm-native", chainId: 1, fee: "Gas (variable)" },
  {
    value: "evm-usdt-mainnet",
    label: "USDT (Ethereum)",
    type: "evm-erc20",
    chainId: 1,
    tokenAddress: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
    fee: "Gas (ETH)",
  },
  // Built-in wallet chains
  { value: "tron-trx", label: "TRON (TRX)", type: "tron", fee: "≈ 1 TRX" },
  { value: "sol-sol", label: "Solana (SOL)", type: "solana", fee: "≈ 0.000005 SOL" },
];

/* ------------------------- helpers ------------------------- */
const ERC20_ABI = [
  "function decimals() view returns (uint8)",
  "function balanceOf(address owner) view returns (uint256)",
  "function transfer(address to, uint256 value) returns (bool)",
];

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function getHexChainId(dec: number) {
  return "0x" + dec.toString(16);
}

async function ensureChain(ethProvider: any, chainIdDec: number) {
  const targetHex = getHexChainId(chainIdDec);
  const currentHex: string = await ethProvider.request({ method: "eth_chainId" });
  if (currentHex?.toLowerCase() === targetHex.toLowerCase()) return;
  try {
    await ethProvider.request({ method: "wallet_switchEthereumChain", params: [{ chainId: targetHex }] });
  } catch {
    throw new Error("Please switch MetaMask to the required network and try again.");
  }
}

async function sendEvmNative(ethProvider: any, to: string, amountEther: string) {
  const browser = new ethers.BrowserProvider(ethProvider);
  const signer = await browser.getSigner();
  const tx = await signer.sendTransaction({ to, value: ethers.parseEther(amountEther) });
  await tx.wait();
  return tx.hash;
}

async function sendEvmErc20(ethProvider: any, tokenAddress: string, to: string, amount: string) {
  const browser = new ethers.BrowserProvider(ethProvider);
  const signer = await browser.getSigner();
  const c = new ethers.Contract(tokenAddress, ERC20_ABI, signer);
  const decimals: number = Number(await c.decimals());
  const value = ethers.parseUnits(amount, decimals);
  const tx = await c.transfer(to, value);
  await tx.wait();
  return tx.hash;
}

async function getEvmNativeBalance(ethProvider: any) {
  const browser = new ethers.BrowserProvider(ethProvider);
  const signer = await browser.getSigner();
  const addr = await signer.getAddress();
  const bal = await browser.getBalance(addr);
  return Number(ethers.formatEther(bal));
}

/* --------- lightweight address validators (client-side) --------- */
function isValidTron(addr: string) {
  return /^T[1-9A-HJ-NP-Za-km-z]{33}$/.test(addr.trim());
}
function isValidSol(addr: string) {
  return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(addr.trim());
}

/* ----------------------- Component ----------------------- */
export default function SendPage() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { encrypted, sol, tron, getBalances, sendSOL, sendTRX } = useWallet();

  const [selectedNetwork, setSelectedNetwork] = useState("");
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [memo, setMemo] = useState("");
  const [password, setPassword] = useState(""); // for Sol/Tron
  const [loading, setLoading] = useState(false);

  const [solBal, setSolBal] = useState<number | null>(null);
  const [trxBal, setTrxBal] = useState<number | null>(null);
  const [ethBal, setEthBal] = useState<number | null>(null);

  const selected = useMemo(
    () => BASE_NETWORKS.find((n) => n.value === selectedNetwork),
    [selectedNetwork]
  );

  // hydrate balances for built-in wallet
  useEffect(() => {
    const hasAny = !!(sol?.address || tron?.address);
    if (!hasAny) return;
    (async () => {
      try {
        const b = await getBalances();
        setSolBal(b.sol);
        setTrxBal(b.trx);
      } catch {
        /* ignore */
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sol?.address, tron?.address]);

  // hydrate ETH when EVM is selected
  useEffect(() => {
    if (!selected) return;
    if (selected.type !== "evm-native" && selected.type !== "evm-erc20") return;
    const eth = (window as any).ethereum;
    if (!eth) return;
    (async () => {
      try {
        if (selected.chainId) await ensureChain(eth, selected.chainId);
        const bal = await getEvmNativeBalance(eth);
        setEthBal(bal);
      } catch {
        /* ignore */
      }
    })();
  }, [selected]);

  const NETWORKS_WITH_BAL = useMemo(() => {
    return BASE_NETWORKS.map((n) => {
      if (n.type === "tron" && trxBal != null) {
        return { ...n, label: `${n.label}`, _balance: `${trxBal.toLocaleString(undefined, { maximumFractionDigits: 6 })} TRX` };
      }
      if (n.type === "solana" && solBal != null) {
        return { ...n, label: `${n.label}`, _balance: `${solBal.toLocaleString(undefined, { maximumFractionDigits: 6 })} SOL` };
      }
      if (n.type === "evm-native" && ethBal != null) {
        return { ...n, label: `${n.label}`, _balance: `${ethBal.toLocaleString(undefined, { maximumFractionDigits: 6 })} ETH` };
      }
      return n as any;
    });
  }, [trxBal, solBal, ethBal]);

  async function handleSend() {
    if (!selected || !recipient || !amount) {
      toast({
        title: t("send.toast.missing.title", { defaultValue: "Missing info" }),
        description: t("send.toast.missing.desc", { defaultValue: "Please fill in network, recipient and amount." }),
        variant: "destructive",
      });
      return;
    }

    // per-chain recipient validation
    if (selected.type === "tron" && !isValidTron(recipient)) {
      toast({
        title: t("send.toast.badTron.title", { defaultValue: "Invalid TRON address" }),
        description: t("send.toast.badTron.desc", { defaultValue: "TRON addresses start with T and are 34 chars." }),
        variant: "destructive",
      });
      return;
    }
    if (selected.type === "solana" && !isValidSol(recipient)) {
      toast({
        title: t("send.toast.badSol.title", { defaultValue: "Invalid Solana address" }),
        description: t("send.toast.badSol.desc", { defaultValue: "Enter a valid base58 Solana address." }),
        variant: "destructive",
      });
      return;
    }
    if ((selected.type === "evm-native" || selected.type === "evm-erc20") && !ethers.isAddress(recipient)) {
      toast({
        title: t("send.toast.badEvm.title", { defaultValue: "Invalid EVM address" }),
        description: t("send.toast.badEvm.desc", { defaultValue: "Enter a valid 0x… address." }),
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);

      if (selected.type === "tron") {
        if (!encrypted) throw new Error(t("send.errors.noWallet", { defaultValue: "No wallet found. Create or import first." }));
        if (!tron?.address) throw new Error(t("send.errors.locked", { defaultValue: "Wallet locked. Unlock from the header." }));
        if (!password) throw new Error(t("send.errors.needPassword", { defaultValue: "Enter your wallet password to sign." }));
        const txid = await sendTRX(recipient.trim(), Number(amount), password);
        toast({
          title: t("send.toast.tronSent.title", { defaultValue: "TRON sent" }),
          description: t("send.toast.tronSent.desc", { defaultValue: "Tx: {{tx}}", tx: `${txid.slice(0, 10)}…${txid.slice(-8)}` }),
        });

        // poll balances (TRON)
        for (let i = 0; i < 5; i++) {
          await sleep(1500);
          try {
            const b = await getBalances();
            setTrxBal(b.trx);
            break;
          } catch {}
        }
      } else if (selected.type === "solana") {
        if (!encrypted) throw new Error(t("send.errors.noWallet", { defaultValue: "No wallet found. Create or import first." }));
        if (!sol?.address) throw new Error(t("send.errors.locked", { defaultValue: "Wallet locked. Unlock from the header." }));
        if (!password) throw new Error(t("send.errors.needPassword", { defaultValue: "Enter your wallet password to sign." }));
        const sig = await sendSOL(recipient.trim(), Number(amount), password);
        toast({
          title: t("send.toast.solSent.title", { defaultValue: "Solana sent" }),
          description: t("send.toast.solSent.desc", { defaultValue: "Sig: {{sig}}", sig: `${sig.slice(0, 10)}…${sig.slice(-8)}` }),
        });

        // poll balances (Solana)
        for (let i = 0; i < 5; i++) {
          await sleep(1200);
          try {
            const b = await getBalances();
            setSolBal(b.sol);
            break;
          } catch {}
        }
      } else if (selected.type === "evm-native" || selected.type === "evm-erc20") {
        const eth = (window as any).ethereum;
        if (!eth) throw new Error(t("send.errors.noMetamask", { defaultValue: "MetaMask not detected." }));
        if (selected.chainId) await ensureChain(eth, selected.chainId);

        let hash = "";
        if (selected.type === "evm-native") {
          hash = await sendEvmNative(eth, recipient.trim(), amount);
        } else {
          if (!selected.tokenAddress) throw new Error("Token address missing for ERC-20.");
          hash = await sendEvmErc20(eth, selected.tokenAddress, recipient.trim(), amount);
        }
        toast({
          title: t("send.toast.evmSent.title", { defaultValue: "EVM transaction sent" }),
          description: t("send.toast.evmSent.desc", { defaultValue: "Hash: {{hash}}", hash: `${hash.slice(0, 10)}…${hash.slice(-8)}` }),
        });

        if (selected.type === "evm-native") {
          try {
            const bal = await getEvmNativeBalance(eth);
            setEthBal(bal);
          } catch {}
        }
      }

      setAmount("");
      setMemo("");
      setPassword("");
    } catch (e: any) {
      if (e?.code === 4001) return; // user rejected
      toast({
        title: t("send.toast.failed.title", { defaultValue: "Transaction failed" }),
        description: e?.message || t("send.toast.failed.desc", { defaultValue: "Please try again." }),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  function handleMax() {
    if (!selected) return;
    if (selected.type === "tron" && trxBal != null) {
      setAmount(Math.max(trxBal - 1, 0).toString()); // leave ~1 TRX for fee
    } else if (selected.type === "solana" && solBal != null) {
      setAmount(Math.max(solBal - 0.00001, 0).toString()); // tiny fee buffer
    } else if (selected.type === "evm-native" && ethBal != null) {
      setAmount(Math.max(ethBal - 0.001, 0).toString()); // gas buffer
    } else {
      // ERC20 max would need token balance query
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-3xl font-bold text-foreground">
            {t("send.title", { defaultValue: "Send Crypto" })}
          </h1>
          <p className="text-muted-foreground">
            {t("send.subtitle", { defaultValue: "Send your crypto to any wallet address" })}
          </p>
        </div>

        <Card className="border-border/50 bg-gradient-card shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Send className="h-5 w-5 text-primary" />
              <span>{t("send.cardTitle", { defaultValue: "Send Transaction" })}</span>
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Network Selection */}
            <div className="space-y-2">
              <Label htmlFor="network">{t("send.selectNetwork", { defaultValue: "Select Network & Token" })}</Label>
              <Select value={selectedNetwork} onValueChange={setSelectedNetwork}>
                <SelectTrigger id="network">
                  <SelectValue placeholder={t("send.chooseNetwork", { defaultValue: "Choose network and token" })} />
                </SelectTrigger>
                <SelectContent>
                  {NETWORKS_WITH_BAL.map((n) => (
                    <SelectItem key={n.value} value={n.value}>
                      <div className="flex w-full items-center justify-between">
                        <span>{n.label}</span>
                        {"_balance" in n && (n as any)._balance ? (
                          <Badge variant="secondary" className="ml-2">{(n as any)._balance}</Badge>
                        ) : null}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selected && (
                <div className="text-sm text-muted-foreground">
                  {selected.fee
                    ? t("send.networkFee", { defaultValue: "Network fee: {{fee}}", fee: selected.fee })
                    : t("send.networkFeeGas", { defaultValue: "Network fee depends on gas" })}
                </div>
              )}
            </div>

            {/* Recipient Address */}
            <div className="space-y-2">
              <Label htmlFor="recipient">{t("send.recipient", { defaultValue: "Recipient Address" })}</Label>
              <div className="flex space-x-2">
                <Input
                  id="recipient"
                  placeholder={t("send.recipientPlaceholder", { defaultValue: "Enter wallet address" })}
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  className="flex-1"
                />
                <Button variant="outline" size="sm" className="px-3" title={t("send.scanQrSoon", { defaultValue: "Scan QR (coming soon)" })}>
                  <QrCode className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" className="px-3" title={t("send.addressBookSoon", { defaultValue: "Address book (coming soon)" })}>
                  <BookOpen className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Amount */}
            <div className="space-y-2">
              <Label htmlFor="amount">{t("send.amount", { defaultValue: "Amount" })}</Label>
              <div className="flex space-x-2">
                <Input
                  id="amount"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  type="number"
                  className="flex-1"
                />
                <Button variant="outline" size="sm" onClick={handleMax}>
                  {t("send.max", { defaultValue: "Max" })}
                </Button>
              </div>
              {amount && selected && (
                <div className="text-sm text-muted-foreground">
                  {t("send.amountLabel", {
                    defaultValue: "Amount: {{amount}} {{sym}}",
                    amount,
                    sym: selected.label.split(" ")[0],
                  })}
                </div>
              )}
            </div>

            {/* Memo (Optional) */}
            <div className="space-y-2">
              <Label htmlFor="memo">{t("send.memo", { defaultValue: "Memo (Optional)" })}</Label>
              <Input
                id="memo"
                placeholder={t("send.memoPlaceholder", { defaultValue: "Add a note for this transaction" })}
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
              />
              {selected?.type === "solana" && (
                <div className="text-[11px] text-muted-foreground">
                  {t("send.noteSol", { defaultValue: "(Note: current send uses native SOL transfer. Memo is not yet included.)" })}
                </div>
              )}
              {selected?.type === "tron" && (
                <div className="text-[11px] text-muted-foreground">
                  {t("send.noteTrx", { defaultValue: "(Note: TRX transfer via RPC. Memo/tag not used for native transfers.)" })}
                </div>
              )}
            </div>

            {/* Password for Sol/Tron signing */}
            {(selected?.type === "tron" || selected?.type === "solana") && (
              <div className="space-y-2">
                <Label htmlFor="pwd">{t("send.walletPassword", { defaultValue: "Wallet Password" })}</Label>
                <Input
                  id="pwd"
                  type="password"
                  placeholder={t("send.passwordPlaceholder", { defaultValue: "Enter your wallet password to sign" })}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            )}

            {/* Transaction Summary */}
            {selected && amount && (
              <Card className="border-border/50 bg-muted/50">
                <CardContent className="p-4">
                  <h4 className="mb-3 font-medium">{t("send.summary.title", { defaultValue: "Transaction Summary" })}</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t("send.summary.amount", { defaultValue: "Amount:" })}</span>
                      <span>{amount} {selected.label.split(" ")[0]}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t("send.summary.fee", { defaultValue: "Network Fee:" })}</span>
                      <span>{selected.fee ?? t("send.gasVariable", { defaultValue: "Gas (variable)" })}</span>
                    </div>
                    <div className="flex justify-between border-t pt-2 font-medium">
                      <span>{t("send.summary.total", { defaultValue: "Total:" })}</span>
                      <span>
                        {amount} {selected.label.split(" ")[0]} + {selected.fee ?? t("send.gas", { defaultValue: "Gas" })}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Send Button */}
            <Button
              onClick={handleSend}
              className="w-full bg-gradient-primary text-white shadow-neon hover:shadow-float"
              size="lg"
              disabled={!selectedNetwork || !recipient || !amount || loading}
            >
              <Send className="mr-2 h-4 w-4" />
              {loading ? t("send.sending", { defaultValue: "Sending…" }) : t("send.cta", { defaultValue: "Send Transaction" })}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
