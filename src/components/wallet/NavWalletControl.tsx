import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useWallet } from "@/wallet/store";
import { useWalletModal } from "./useWalletModal";
import { Copy, LogOut, Wallet, RefreshCw, Lock, Unlock } from "lucide-react";

function truncate(addr?: string, size = 4) {
  if (!addr) return "—";
  return `${addr.slice(0, 2 + size)}…${addr.slice(-size)}`;
}

export default function NavWalletControl() {
  const { encrypted, sol, tron, unlock, lock, getBalances } = useWallet();
  const { open } = useWalletModal();
  const [busy, setBusy] = useState(false);
  const hasVault = !!encrypted;
  const isUnlocked = !!(sol?.address || tron?.address);

  const dot = (
    <span
      className={`mr-2 inline-block h-2 w-2 rounded-full ${
        isUnlocked ? "bg-emerald-500" : hasVault ? "bg-zinc-400" : "bg-zinc-500"
      }`}
    />
  );

  return (
    <div className="flex items-center gap-2">
      {/* Pill */}
      <div className="rounded-full border border-border/60 bg-card/50 px-3 py-1.5 text-sm">
        <button
          className="inline-flex items-center gap-2"
          onClick={() => {
            if (!hasVault) open(); // no vault: open modal
          }}
          title={isUnlocked ? "Wallet ready" : hasVault ? "Vault locked" : "No wallet yet"}
        >
          {dot}
          <Wallet className="h-4 w-4 opacity-80" />
          <span className="font-medium">
            {isUnlocked ? "Wallet" : hasVault ? "Locked" : "Connect Wallet"}
          </span>
        </button>
      </div>

      {/* Dropdown-like simple panel (no dependency on shadcn dropdown) */}
      <div className="rounded-lg border border-border/60 bg-card/60 px-3 py-2 text-xs">
        <div className="mb-1 flex items-center gap-2">
          <Badge variant="outline">SOL</Badge>
          <code className="select-text">{truncate(sol?.address, 6)}</code>
          {sol?.address && (
            <button
              className="ml-1 opacity-70 hover:opacity-100"
              onClick={() => navigator.clipboard.writeText(sol.address!)}
              title="Copy Solana address"
            >
              <Copy className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
        <div className="mb-1 flex items-center gap-2">
          <Badge variant="outline">TRON</Badge>
          <code className="select-text">{truncate(tron?.address, 6)}</code>
          {tron?.address && (
            <button
              className="ml-1 opacity-70 hover:opacity-100"
              onClick={() => navigator.clipboard.writeText(tron.address!)}
              title="Copy TRON address"
            >
              <Copy className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <Separator className="my-2" />

        <div className="flex items-center gap-2">
          {!hasVault && (
            <Button size="sm" onClick={open}>
              Open Modal
            </Button>
          )}

          {hasVault && !isUnlocked && (
            <Button
              size="sm"
              variant="secondary"
              onClick={open}
              title="Unlock from modal"
            >
              <Unlock className="mr-1 h-3.5 w-3.5" /> Unlock
            </Button>
          )}

          {isUnlocked && (
            <>
              <Button
                size="sm"
                variant="secondary"
                disabled={busy}
                onClick={async () => {
                  setBusy(true);
                  try { await getBalances(); } finally { setBusy(false); }
                }}
                title="Refresh balances"
              >
                <RefreshCw className="mr-1 h-3.5 w-3.5" />
                {busy ? "Refreshing…" : "Refresh"}
              </Button>

              <Button
                size="sm"
                variant="ghost"
                onClick={() => lock()}
                title="Lock wallet"
              >
                <Lock className="mr-1 h-3.5 w-3.5" /> Lock
              </Button>
            </>
          )}

          {hasVault && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                // danger: clear local vault
                localStorage.removeItem("dualchain_encrypted");
                window.location.reload();
              }}
              title="Remove local vault"
            >
              <LogOut className="mr-1 h-3.5 w-3.5" /> Remove
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
