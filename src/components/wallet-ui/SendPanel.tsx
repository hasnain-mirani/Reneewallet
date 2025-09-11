import { useState } from "react";
import { useWallet } from "@/wallet/store";

export default function SendPanel() {
  const { sendSOL, sendTRX } = useWallet();
  const [pwd, setPwd] = useState("");
  const [solTo, setSolTo] = useState(""); const [solAmt, setSolAmt] = useState("");
  const [trxTo, setTrxTo] = useState(""); const [trxAmt, setTrxAmt] = useState("");

  return (
    <div className="space-y-4 p-4 border rounded-xl">
      <h3 className="font-semibold">Send</h3>

      <div className="space-y-2">
        <div className="font-medium">Send SOL</div>
        <input className="border rounded px-3 py-2 w-full" placeholder="Recipient (Solana)" value={solTo} onChange={e=>setSolTo(e.target.value)} />
        <input className="border rounded px-3 py-2 w-full" placeholder="Amount (SOL)" value={solAmt} onChange={e=>setSolAmt(e.target.value)} />
        <input className="border rounded px-3 py-2 w-full" placeholder="Password" type="password" value={pwd} onChange={e=>setPwd(e.target.value)} />
        <button className="px-3 py-2 bg-black text-white rounded" onClick={async ()=>{
          const sig = await sendSOL(solTo, parseFloat(solAmt || "0"), pwd || "pass");
          alert("SOL tx: " + sig);
        }}>Send SOL</button>
      </div>

      <div className="space-y-2">
        <div className="font-medium">Send TRX</div>
        <input className="border rounded px-3 py-2 w-full" placeholder="Recipient (TRON)" value={trxTo} onChange={e=>setTrxTo(e.target.value)} />
        <input className="border rounded px-3 py-2 w-full" placeholder="Amount (TRX)" value={trxAmt} onChange={e=>setTrxAmt(e.target.value)} />
        <input className="border rounded px-3 py-2 w-full" placeholder="Password" type="password" value={pwd} onChange={e=>setPwd(e.target.value)} />
        <button className="px-3 py-2 bg-black text-white rounded" onClick={async ()=>{
          const txid = await sendTRX(trxTo, parseFloat(trxAmt || "0"), pwd || "pass");
          alert("TRX tx: " + txid);
        }}>Send TRX</button>
      </div>
    </div>
  );
}