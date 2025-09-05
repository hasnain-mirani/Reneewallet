// src/components/wallet/WalletConnectModal.tsx
import { useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Search } from "lucide-react";
import { useWalletModal } from "@/components/wallet/walletModalContext";

type Category = "All Wallets" | "Cosmos" | "EVM" | "Move" | "Solana" | "Sui" | "CEX accounts";

type WalletInfo = {
  id: string;
  name: string;
  category: Category;
  detected?: boolean;
  recommended?: boolean;
  action: "connect" | "install";
};

const WALLETS: WalletInfo[] = [
  { id: "phantom", name: "Phantom", category: "Solana", detected: true, action: "connect" },
  { id: "leap", name: "Leap Wallet", category: "Cosmos", recommended: true, action: "install" },
  { id: "keplr", name: "Keplr", category: "Cosmos", action: "install" },
  { id: "metamask-snap", name: "MetaMask Snap", category: "EVM", action: "install" },
  { id: "sui-wallet", name: "Sui Wallet", category: "Sui", action: "install" },
];

const CATEGORIES: Category[] = [
  "All Wallets",
  "Cosmos",
  "EVM",
  "Move",
  "Solana",
  "Sui",
  "CEX accounts",
];

export default function WalletConnectModal() {
  const { isOpen, close } = useWalletModal();
  const [category, setCategory] = useState<Category>("All Wallets");
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const list =
      category === "All Wallets" ? WALLETS : WALLETS.filter((w) => w.category === category);
    const query = q.trim().toLowerCase();
    return query ? list.filter((w) => w.name.toLowerCase().includes(query)) : list;
  }, [category, q]);

  const detected = filtered.filter((w) => w.detected);
  const others = filtered.filter((w) => !w.detected);

  const WalletRow = ({ w }: { w: WalletInfo }) => (
    <div className="flex items-center justify-between gap-4 rounded-lg border border-border/50 bg-card/40 px-4 py-3">
      <div className="flex items-center gap-3">
        <div className="h-8 w-8 rounded-full bg-foreground/10 grid place-items-center text-sm">
          {w.name[0]}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">{w.name}</span>
          {w.recommended && (
            <Badge className="h-5 px-2 text-[10px] leading-none bg-emerald-600">Recommended</Badge>
          )}
        </div>
      </div>
      {w.action === "connect" ? (
        <Button size="sm" onClick={() => {/* trigger your real connect flow here */}}>
          Connect
        </Button>
      ) : (
        <Button size="sm" variant="secondary" onClick={() => {/* open install link */}}>
          Install
        </Button>
      )}
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={(o) => (!o ? close() : null)}>
      <DialogContent className="max-w-3xl p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle>Connect your wallets</DialogTitle>
        </DialogHeader>

        <div className="px-6 pb-6">
          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by wallet name"
              className="pl-9"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-[220px_minmax(0,1fr)] gap-6">
            {/* Left sidebar categories */}
            <div className="space-y-1">
              {CATEGORIES.map((c) => (
                <button
                  key={c}
                  onClick={() => setCategory(c)}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm transition
                  ${
                    category === c
                      ? "bg-foreground/10 text-foreground"
                      : "text-foreground/80 hover:bg-foreground/5"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>

            {/* Right content */}
            <div className="space-y-5">
              {!!detected.length && (
                <section>
                  <h4 className="mb-2 text-sm font-semibold text-foreground/90">
                    YOUR DETECTED WALLETS
                  </h4>
                  <div className="space-y-2">
                    {detected.map((w) => (
                      <WalletRow key={w.id} w={w} />
                    ))}
                  </div>
                </section>
              )}

              {!!detected.length && <Separator className="my-2" />}

              <section>
                <h4 className="mb-2 text-sm font-semibold text-foreground/90">
                  OTHER WAYS TO CONNECT
                </h4>
                <div className="space-y-2">
                  {others.map((w) => (
                    <WalletRow key={w.id} w={w} />
                  ))}
                </div>
              </section>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
