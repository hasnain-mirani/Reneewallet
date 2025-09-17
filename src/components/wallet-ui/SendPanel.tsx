import { useState } from "react";
import { useWallet } from "@/wallet/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

function SendForm({
  chain,
  onSend,
}: {
  chain: "tron" | "solana";
  onSend: (to: string, amount: number, pwd: string) => Promise<string>;
}) {
  const [to, setTo] = useState("");
  const [amount, setAmount] = useState("");
  const [pwd, setPwd] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  return (
    <div className="space-y-3">
      <Input placeholder={chain === "tron" ? "Recipient T-address" : "Recipient Solana address"} value={to} onChange={e=>setTo(e.target.value.trim())} />
      <Input placeholder={chain === "tron" ? "Amount in TRX" : "Amount in SOL"} value={amount} onChange={e=>setAmount(e.target.value)} />
      <Input type="password" placeholder="Wallet password" value={pwd} onChange={e=>setPwd(e.target.value)} />
      <Button
        disabled={busy || !to || !amount || !pwd}
        onClick={async () => {
          setBusy(true);
          try {
            const txid = await onSend(to, Number(amount), pwd);
            setResult(txid);
          } catch (e:any) {
            alert(e?.message || "Send failed");
          } finally { setBusy(false); }
        }}
      >
        {busy ? "Sending…" : "Send"}
      </Button>
      {result && <div className="text-xs text-muted-foreground break-all">Tx: {result}</div>}
    </div>
  );
}

export default function SendPanel() {
  const { sendTRX, sendSOL } = useWallet();
  return (
    <div className="rounded-2xl border border-border/50 bg-card/60 p-4">
      <div className="mb-3 text-sm font-semibold">Send</div>
      <Tabs defaultValue="tron">
        <TabsList>
          <TabsTrigger value="tron">TRON</TabsTrigger>
          <TabsTrigger value="solana">Solana</TabsTrigger>
        </TabsList>

        <TabsContent value="tron" className="mt-3">
          <SendForm chain="tron" onSend={(to, amt, pwd) => sendTRX(to, amt, pwd)} />
        </TabsContent>
        <TabsContent value="solana" className="mt-3">
          <SendForm chain="solana" onSend={(to, amt, pwd) => sendSOL(to, amt, pwd)} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
