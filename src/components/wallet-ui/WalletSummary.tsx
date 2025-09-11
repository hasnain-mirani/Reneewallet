import { useState } from "react";
import { useWallet } from "@/wallet/store";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Copy, RefreshCw } from "lucide-react";

export default function WalletSummary() {
  const { encrypted, sol, tron, getBalances } = useWallet();
  const [busy, setBusy] = useState(false);
  const hasVault = !!encrypted;

  return (
    <div className="rounded-2xl border border-border/60 bg-card/50 p-4">
      <div className="mb-2 text-sm font-semibold">Wallet Summary</div>
      {!hasVault ? (
        <div className="text-sm text-muted-foreground">
          No wallet yet. Click <b>Connect Wallet</b> to create or import.
        </div>
      ) : (
        <>
          <div className="text-sm">
            <div className="mb-1">
              <span className="mr-2 font-medium">Solana:</span>
              <code>{sol?.address ?? "— (locked)"}</code>
              {sol?.address && (
                <button className="ml-2 opacity-70 hover:opacity-100"
                        onClick={() => navigator.clipboard.writeText(sol.address!)}
                        title="Copy">
                  <Copy className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
            <div>
              <span className="mr-2 font-medium">TRON:</span>
              <code>{tron?.address ?? "— (locked)"}</code>
              {tron?.address && (
                <button className="ml-2 opacity-70 hover:opacity-100"
                        onClick={() => navigator.clipboard.writeText(tron.address!)}
                        title="Copy">
                  <Copy className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>

          <Separator className="my-3" />
          <Button
            size="sm"
            variant="secondary"
            onClick={async () => { setBusy(true); try { await getBalances(); } finally { setBusy(false); } }}
          >
            <RefreshCw className="mr-1 h-3.5 w-3.5" />
            {busy ? "Refreshing…" : "Refresh balances"}
          </Button>
        </>
      )}
    </div>
  );
}
