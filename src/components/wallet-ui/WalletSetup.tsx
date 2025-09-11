import { useState } from "react";
import { useWallet } from "@/wallet/store";

export default function WalletSetup() {
  const { createWallet, unlock, encrypted, sol, tron } = useWallet();
  const [password, setPassword] = useState("");
  const [mnemonic, setMnemonic] = useState<string | null>(null);

  return (
    <div className="space-y-3 p-4 border rounded-xl">
      <h3 className="font-semibold">Wallet Setup</h3>

      {!encrypted ? (
        <>
          <input className="border rounded px-3 py-2 w-full" placeholder="Set a password" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
          <button className="px-3 py-2 bg-black text-white rounded" onClick={async ()=>{
            const { mnemonic } = await createWallet(password || "pass");
            setMnemonic(mnemonic);
          }}>Create Wallet</button>
          {mnemonic && (
            <div className="text-sm">
              <div className="font-medium">Write these 12 words down:</div>
              <div className="mt-1 p-2 bg-gray-100 rounded">{mnemonic}</div>
            </div>
          )}
        </>
      ) : (
        <>
          <input className="border rounded px-3 py-2 w-full" placeholder="Enter password to unlock" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
          <button className="px-3 py-2 bg-black text-white rounded" onClick={async ()=>{
            await unlock(password || "pass");
          }}>Unlock</button>
        </>
      )}

      {(sol?.address || tron?.address) && (
        <div className="text-sm space-y-1">
          {sol?.address && <div><b>Solana:</b> {sol.address}</div>}
          {tron?.address && <div><b>TRON:</b> {tron.address}</div>}
        </div>
      )}
    </div>
  );
}