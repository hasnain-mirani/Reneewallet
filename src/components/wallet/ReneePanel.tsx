import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronUp, Copy, Loader2 } from "lucide-react";
import { useWallet } from "@/wallet/store";
import { validateMnemonic } from "@scure/bip39";
import { wordlist } from "@scure/bip39/wordlists/english.js";
import { useWalletModal } from "./useWalletModal";

export default function ReneePanel() {
  const { createWallet, createWalletFromMnemonic, unlock, sol, tron } = useWallet();
  const { connectSolanaRpc, connectTronRpc, isConnecting } = useWalletModal();

  const [pwd, setPwd] = useState("");
  const [mnemonic, setMnemonic] = useState<string | null>(null);
  const [showImport, setShowImport] = useState(false);
  const [importSeed, setImportSeed] = useState("");

  async function connectNetworks() {
    await Promise.allSettled([connectSolanaRpc(), connectTronRpc()]);
  }

  return (
    <section className="rounded-lg border border-border/50 bg-card/40 p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="grid h-8 w-8 place-items-center rounded-full bg-foreground/10 text-sm font-semibold">R</div>
          <div className="text-sm font-semibold">Renee Wallet</div>
          <Badge className="h-5 px-2 text-[10px] leading-none bg-emerald-600">Built-in</Badge>
        </div>
      </div>

      <div className="grid gap-2 md:grid-cols-[1fr_auto_auto]">
        <Input
          type="password"
          placeholder="Password"
          value={pwd}
          onChange={(e) => setPwd(e.target.value)}
          className="md:col-span-1"
        />
        <Button
          variant="secondary"
          disabled={isConnecting}
          onClick={async () => {
            try {
              await connectNetworks();                         // prove backend first
              const { mnemonic } = await createWallet(pwd || "pass");
              setMnemonic(mnemonic);
            } catch (e) {
              console.error(e); alert("Create failed");
            }
          }}
        >
          {isConnecting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Create & Connect
        </Button>
        <Button
          disabled={isConnecting}
          onClick={async () => {
            try {
              await connectNetworks();
              await unlock(pwd || "pass");
            } catch (e) {
              console.error(e); alert("Unlock failed");
            }
          }}
        >
          {isConnecting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Unlock & Connect
        </Button>
      </div>

      {mnemonic && (
        <div className="mt-3 rounded-lg bg-foreground/5 p-3 text-xs">
          <div className="mb-1 font-medium">Write these 12 words down:</div>
          <div className="select-text">{mnemonic}</div>
          <Button
            size="sm"
            variant="secondary"
            className="mt-2"
            onClick={() => navigator.clipboard.writeText(mnemonic)}
          >
            <Copy className="mr-2 h-3.5 w-3.5" /> Copy
          </Button>
        </div>
      )}

      <Separator className="my-3" />

      <div className="flex items-center justify-between">
        <div className="text-xs text-muted-foreground">
          Addresses: {sol?.address ? <>SOL {sol.address}</> : <>SOL —</>} · {tron?.address ? <>TRON {tron.address}</> : <>TRON —</>}
        </div>

        <button
          className="text-xs text-foreground/80 hover:underline inline-flex items-center gap-1"
          onClick={() => setShowImport((s) => !s)}
        >
          {showImport ? <>Hide import <ChevronUp className="h-3 w-3" /></> : <>Import from seed <ChevronDown className="h-3 w-3" /></>}
        </button>
      </div>

      {showImport && (
        <div className="mt-2 grid gap-2 md:grid-cols-[1fr_auto]">
          <textarea
            rows={2}
            className="w-full rounded-md border bg-background p-2 text-sm"
            placeholder="Enter 12/24-word seed…"
            value={importSeed}
            onChange={(e) => setImportSeed(e.target.value)}
          />
          <Button
            variant="secondary"
            disabled={isConnecting}
            onClick={async () => {
              const m = importSeed.trim().toLowerCase().replace(/\s+/g, " ");
              if (!validateMnemonic(m, wordlist)) { alert("Invalid mnemonic"); return; }
              try {
                await connectNetworks();
                await createWalletFromMnemonic(m, pwd || "pass");
              } catch (e) {
                console.error(e); alert("Import failed");
              }
            }}
          >
            Import & Connect
          </Button>
        </div>
      )}
    </section>
  );
}
