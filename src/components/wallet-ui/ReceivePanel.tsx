import { QRCodeSVG } from "qrcode.react";
import { useWallet } from "@/wallet/store";
import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";

function Row({ label, address }: { label: string; address?: string }) {
  return (
    <div className="rounded-xl border border-border/50 bg-card/50 p-4">
      <div className="mb-2 flex items-center justify-between">
        <div className="text-sm font-semibold">{label}</div>
        <div className="text-xs opacity-80">{address ? `${address.slice(0,6)}…${address.slice(-4)}` : "—"}</div>
      </div>
      <div className="flex items-center gap-4">
        <div className="rounded-lg bg-background p-2">
          {address ? <QRCodeSVG value={address} size={100} /> : <div className="h-[100px] w-[100px] grid place-items-center text-xs text-muted-foreground">No address</div>}
        </div>
        <div className="text-xs break-all opacity-90">{address || "Unlock wallet to view address"}</div>
      </div>
      <div className="mt-3">
        <Button size="sm" disabled={!address} onClick={() => address && navigator.clipboard.writeText(address)}>
          <Copy className="mr-2 h-3.5 w-3.5" /> Copy address
        </Button>
      </div>
    </div>
  );
}

export default function ReceivePanel() {
  const { sol, tron } = useWallet();
  return (
    <div className="space-y-4">
      <Row label="TRON (TRX / TRC-20)" address={tron?.address} />
      <Row label="Solana (SOL / SPL)" address={sol?.address} />
    </div>
  );
}
