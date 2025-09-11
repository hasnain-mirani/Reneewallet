import { useState } from "react";
import { useWallet } from "@/wallet/store";

export default function AddressPanel() {
  const { sol, tron, getBalances } = useWallet();
  const [bal, setBal] = useState<{sol:number; trx:number} | null>(null);

  return (
    <div className="space-y-3 p-4 border rounded-xl">
      <h3 className="font-semibold">Addresses & Balances</h3>

      <div className="text-sm">
        <div><b>Solana:</b> {sol?.address || "—"}</div>
        <div><b>TRON:</b> {tron?.address || "—"}</div>
      </div>

      <button className="px-3 py-2 bg-black text-white rounded" onClick={async ()=>{
        const r = await getBalances();
        setBal(r);
      }}>Refresh Balances</button>

      {bal && (
        <div className="text-sm">
          <div>SOL: {bal.sol}</div>
          <div>TRX: {bal.trx}</div>
        </div>
      )}
    </div>
  );
}