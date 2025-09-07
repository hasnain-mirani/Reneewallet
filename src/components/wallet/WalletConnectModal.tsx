// src/components/wallet/WalletConnectModal.tsx
import { useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Search, Loader2, ExternalLink } from "lucide-react";
import { useWalletModal } from "./useWalletModal";

type Category =
  | "All Wallets"
  | "EVM"
  | "Solana"
  | "Cosmos"
  | "Sui"
  | "Move"
  | "CEX accounts";

type WalletInfo = {
  id: string;
  name: string;
  category: Category;
  detected?: boolean;
  recommended?: boolean;
  action: "connect" | "install";
  link?: string;
};

const WALLETS: WalletInfo[] = [
  { id: "metamask", name: "MetaMask", category: "EVM", detected: true, action: "connect", link: "https://metamask.io" },
  { id: "phantom", name: "Phantom", category: "Solana", action: "install", link: "https://phantom.app/" },
  { id: "leap", name: "Leap Wallet", category: "Cosmos", recommended: true, action: "install", link: "https://www.leapwallet.io/" },
  { id: "keplr", name: "Keplr", category: "Cosmos", action: "install", link: "https://www.keplr.app/" },
];

const CATEGORIES: Category[] = ["All Wallets", "EVM", "Solana", "Cosmos", "Sui", "Move", "CEX accounts"];

function truncate(addr?: string | null, size = 4) {
  if (!addr) return "";
  return `${addr.slice(0, 2 + size)}…${addr.slice(-size)}`;
}

export default function WalletConnectModal() {
  const { isOpen, close, connect, isConnecting, address } = useWalletModal();
  const [category, setCategory] = useState<Category>("All Wallets");
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const list = category === "All Wallets" ? WALLETS : WALLETS.filter((w) => w.category === category);
    const query = q.trim().toLowerCase();
    return query ? list.filter((w) => w.name.toLowerCase().includes(query)) : list;
  }, [category, q]);

  const WalletRow = ({ w }: { w: WalletInfo }) => {
    const isMM = w.id === "metamask";
    return (
      <div className="flex items-center justify-between gap-4 rounded-lg border border-border/50 bg-card/40 px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="grid h-8 w-8 place-items-center rounded-full bg-foreground/10 text-sm font-semibold">
            {w.name[0]}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">{w.name}</span>
            {w.recommended && (
              <Badge className="h-5 px-2 text-[10px] leading-none bg-emerald-600">Recommended</Badge>
            )}
            {w.detected && (
              <Badge variant="outline" className="h-5 px-2 text-[10px] leading-none">
                Detected
              </Badge>
            )}
          </div>
        </div>

        {isMM ? (
          <Button
            size="sm"
            onClick={async () => {
              try {
                await connect();
                
                close();
              } catch {
                /* user cancelled or error — ignore or show toast */
              }
            }}
            disabled={isConnecting || !!address}
            className={address ? "cursor-default opacity-80" : ""}
          >
            {isConnecting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Connecting…
              </>
            ) : address ? (
              <>Connected {truncate(address)}</>
            ) : (
              <>Connect</>
            )}
          </Button>
        ) : w.action === "connect" ? (
          <Button size="sm" onClick={() => alert("Hook this wallet next")}>Connect</Button>
        ) : (
          <Button size="sm" variant="secondary" onClick={() => window.open(w.link ?? "about:blank", "_blank")}>
            Install
            <ExternalLink className="ml-2 h-3.5 w-3.5 opacity-70" />
          </Button>
        )}
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={(o) => (!o ? close() : null)}>
      <DialogContent className="max-w-3xl overflow-hidden p-0">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle>Connect your wallets</DialogTitle>
        </DialogHeader>

        <div className="px-6 pb-6">
          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by wallet name"
              className="pl-9"
            />
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-[220px_minmax(0,1fr)]">
            {/* Left: categories */}
            <div className="space-y-1">
              {CATEGORIES.map((c) => (
                <button
                  key={c}
                  onClick={() => setCategory(c)}
                  className={`w-full rounded-md px-3 py-2 text-left text-sm transition ${
                    category === c ? "bg-foreground/10 text-foreground" : "text-foreground/80 hover:bg-foreground/5"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>

            {/* Right: wallet list */}
            <div className="space-y-5">
              <section>
                <h4 className="mb-2 text-sm font-semibold text-foreground/90">WALLETS</h4>
                <div className="space-y-2">
                  {filtered.map((w) => (
                    <WalletRow key={w.id} w={w} />
                  ))}
                </div>
              </section>

              <Separator className="my-2" />

              <section>
                <h4 className="mb-2 text-sm font-semibold text-foreground/90">Need a different wallet?</h4>
                <p className="text-sm text-muted-foreground">
                  We’ll add more options soon. MetaMask (EVM), Phantom (Solana), Leap/Keplr (Cosmos) are supported.
                </p>
              </section>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
