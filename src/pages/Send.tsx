import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Send, ArrowRight, QrCode, BookOpen } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useWalletModal } from "@/components/wallet/useWalletModal";
import { ethers } from "ethers";

type NetType = "tron" | "solana" | "evm-native" | "evm-erc20";

type NetworkOption = {
  value: string;
  label: string;
  type: NetType;
  balance?: string;
  fee?: string;
  // EVM specifics:
  chainId?: number;         // decimal chain id (e.g., 1 for Ethereum mainnet)
  tokenAddress?: string;    // for evm-erc20
};

const NETWORKS: NetworkOption[] = [
  // ✅ EVM: ETH (Ethereum Mainnet)
  { value: "evm-eth-mainnet", label: "Ethereum (ETH)", type: "evm-native", chainId: 1, fee: "Gas (variable)" },
  // ✅ EVM: USDT (Ethereum Mainnet)
  {
    value: "evm-usdt-mainnet",
    label: "USDT (Ethereum)",
    type: "evm-erc20",
    chainId: 1,
    tokenAddress: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
    fee: "Gas (ETH)",
  },

  // 🚫 Non-EVM (inform user they need other wallets)
  { value: "tron-trx", label: "TRON (TRX)", type: "tron", balance: "—", fee: "≈ 1 TRX" },
  { value: "sol-sol", label: "Solana (SOL)", type: "solana", balance: "—", fee: "≈ 0.000005 SOL" },
  { value: "usdt-tron", label: "USDT (TRON)", type: "tron", balance: "—", fee: "≈ 1 TRX" },
  { value: "usdt-sol", label: "USDT (Solana)", type: "solana", balance: "—", fee: "≈ 0.000005 SOL" },
];

/** ---------- EVM helpers (ethers v6) ---------- */
function getHexChainId(dec: number) {
  return "0x" + dec.toString(16);
}

async function ensureChain(provider: any, chainIdDec: number) {
  const targetHex = getHexChainId(chainIdDec);
  const currentHex: string = await provider.request({ method: "eth_chainId" });
  if (currentHex?.toLowerCase() === targetHex.toLowerCase()) return;

  try {
    await provider.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: targetHex }],
    });
  } catch (e: any) {
    // If chain not added (4902), you could add it here with wallet_addEthereumChain.
    // For mainnet, MetaMask already has it, so we rethrow for visibility.
    throw new Error("Please switch MetaMask to Ethereum Mainnet and try again.");
  }
}

async function sendEvmNative(provider: any, to: string, amountEther: string) {
  const browser = new ethers.BrowserProvider(provider);
  const signer = await browser.getSigner();
  const tx = await signer.sendTransaction({ to, value: ethers.parseEther(amountEther) });
  const receipt = await tx.wait();
  return { hash: tx.hash, receipt };
}

const ERC20_ABI = [
  "function decimals() view returns (uint8)",
  "function transfer(address to, uint256 value) returns (bool)",
];

async function sendEvmErc20(provider: any, tokenAddress: string, to: string, amount: string) {
  const browser = new ethers.BrowserProvider(provider);
  const signer = await browser.getSigner();
  const c = new ethers.Contract(tokenAddress, ERC20_ABI, signer);
  const decimals: number = Number(await c.decimals());
  const value = ethers.parseUnits(amount, decimals);
  const tx = await c.transfer(to, value);
  const receipt = await tx.wait();
  return { hash: tx.hash, receipt };
}

/** ---------- Component ---------- */
const SendPage = () => {
  const { toast } = useToast();
  const { provider, address } = useWalletModal(); // ✅ from your MetaMask context

  const [selectedNetwork, setSelectedNetwork] = useState("");
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [memo, setMemo] = useState("");
  const [loading, setLoading] = useState(false);

  const selectedNetworkData = NETWORKS.find((n) => n.value === selectedNetwork);

  const handleSend = async () => {
    if (!selectedNetwork || !recipient || !amount) {
      toast({ title: "Error", description: "Please fill in all required fields", variant: "destructive" });
      return;
    }

    // Basic address sanity for EVM
    const isEvm = selectedNetworkData?.type === "evm-native" || selectedNetworkData?.type === "evm-erc20";
    if (isEvm && !ethers.isAddress(recipient)) {
      toast({ title: "Invalid EVM address", description: "Please enter a valid 0x… address", variant: "destructive" });
      return;
    }

    // Non-EVM networks need different wallets
    if (selectedNetworkData?.type === "tron" || selectedNetworkData?.type === "solana") {
      toast({
        title: "Unsupported in MetaMask",
        description: `The ${selectedNetworkData.label} network requires a different wallet (e.g., TronLink for TRON, Phantom for Solana).`,
        variant: "destructive",
      });
      return;
    }

    // Must be connected
    if (!provider) {
      toast({ title: "Connect Wallet", description: "Please connect MetaMask first.", variant: "destructive" });
      return;
    }

    try {
      setLoading(true);

      // Ensure correct chain (Ethereum mainnet for the two examples above)
      if (selectedNetworkData?.chainId) {
        await ensureChain(provider, selectedNetworkData.chainId);
      }

      let txHash = "";

      if (selectedNetworkData?.type === "evm-native") {
        const { hash } = await sendEvmNative(provider, recipient, amount);
        txHash = hash;
      } else if (selectedNetworkData?.type === "evm-erc20") {
        if (!selectedNetworkData.tokenAddress) {
          throw new Error("Token address missing for ERC-20 send.");
        }
        const { hash } = await sendEvmErc20(provider, selectedNetworkData.tokenAddress, recipient, amount);
        txHash = hash;
      }

      toast({
        title: "Transaction Submitted",
        description: `Hash: ${txHash.slice(0, 10)}…${txHash.slice(-8)}`,
      });

      // Reset form
      setSelectedNetwork("");
      setRecipient("");
      setAmount("");
      setMemo("");
    } catch (e: any) {
      if (e?.code === 4001) {
        // user rejected
        return;
      }
      toast({
        title: "Transaction Failed",
        description: e?.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-3xl font-bold text-foreground">Send Crypto</h1>
          <p className="text-muted-foreground">Send your crypto to any wallet address</p>
        </div>

        <Card className="border-border/50 bg-gradient-card shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Send className="h-5 w-5 text-primary" />
              <span>Send Transaction</span>
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
                      <div className="flex w-full items-center justify-between">
                        <span>{n.label}</span>
                        {n.balance && (
                          <Badge variant="secondary" className="ml-2">
                            {n.balance}
                          </Badge>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedNetworkData && (
                <div className="text-sm text-muted-foreground">
                  {selectedNetworkData.fee ? `Network fee: ${selectedNetworkData.fee}` : "Network fee depends on gas"}
                </div>
              )}
            </div>

            {/* Recipient Address */}
            <div className="space-y-2">
              <Label htmlFor="recipient">Recipient Address</Label>
              <div className="flex space-x-2">
                <Input
                  id="recipient"
                  placeholder="Enter wallet address"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  className="flex-1"
                />
                <Button variant="outline" size="sm" className="px-3" title="Scan QR (coming soon)">
                  <QrCode className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" className="px-3" title="Address book (coming soon)">
                  <BookOpen className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Amount */}
            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <div className="flex space-x-2">
                <Input
                  id="amount"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  type="number"
                  className="flex-1"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setAmount("")} // TODO: hook Max to balance
                >
                  Max
                </Button>
              </div>
              {amount && selectedNetworkData && (
                <div className="text-sm text-muted-foreground">≈ ${(parseFloat(amount || "0") * 100).toFixed(2)} USD</div>
              )}
            </div>

            {/* Memo (Optional) */}
            <div className="space-y-2">
              <Label htmlFor="memo">Memo (Optional)</Label>
              <Input
                id="memo"
                placeholder="Add a note for this transaction"
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
              />
            </div>

            {/* Transaction Summary */}
            {selectedNetworkData && amount && (
              <Card className="border-border/50 bg-muted/50">
                <CardContent className="p-4">
                  <h4 className="mb-3 font-medium">Transaction Summary</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Amount:</span>
                      <span>
                        {amount} {selectedNetworkData.label.split(" ")[0]}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Network Fee:</span>
                      <span>{selectedNetworkData.fee ?? "Gas (variable)"}</span>
                    </div>
                    <div className="flex justify-between border-t pt-2 font-medium">
                      <span>Total:</span>
                      <span>
                        {amount} {selectedNetworkData.label.split(" ")[0]} + {selectedNetworkData.fee ?? "Gas"}
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
              {loading ? "Sending…" : "Send Transaction"}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SendPage;
