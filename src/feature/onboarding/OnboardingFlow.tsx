// src/components/wallet/ReneeOnboarding.tsx
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Check, ChevronLeft } from "lucide-react";
import { useWallet } from "@/wallet/store";
import { useWalletModal } from "@/components/wallet/useWalletModal";
import { newMnemonic } from "@/wallet/core";
import { validateMnemonic } from "@scure/bip39";
import { wordlist } from "@scure/bip39/wordlists/english.js";

type Step = "reveal" | "verify" | "password" | "import" | "done";

export default function ReneeOnboarding({
  mode, onCancel, onDone,
}: { mode: "create" | "import"; onCancel: () => void; onDone: () => void; }) {
  const { createWalletFromMnemonic } = useWallet();
  const { connectSolanaRpc, connectTronRpc } = useWalletModal();

  // state
  const [step, setStep] = useState<Step>(mode === "create" ? "reveal" : "import");
  const [mnemonic, setMnemonic] = useState(() => mode === "create" ? newMnemonic(128) : "");
  const words = useMemo(() => mnemonic.split(" ").filter(Boolean), [mnemonic]);

  const [verifyIdx, setVerifyIdx] = useState<number[]>([]);
  const [verifyAnswers, setVerifyAnswers] = useState<string[]>([]);
  const [password1, setPassword1] = useState("");
  const [password2, setPassword2] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (mode === "create") {
      const picks = new Set<number>();
      while (picks.size < 3) picks.add(Math.floor(Math.random() * 12));
      const idx = Array.from(picks).sort((a, b) => a - b);
      setVerifyIdx(idx);
      setVerifyAnswers(new Array(3).fill(""));
    }
  }, [mode]);

  async function connectNetworks() {
    await Promise.allSettled([connectSolanaRpc(), connectTronRpc()]);
  }

  return (
    <div className="mx-auto w-full max-w-2xl">
      <div className="mb-4 flex items-center justify-between">
        <button className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
                onClick={onCancel}><ChevronLeft className="mr-1 h-4 w-4" /> Back</button>
        <div className="text-sm text-muted-foreground">
          {step !== "done" && (mode === "create" ? "Create wallet" : "Import wallet")}
        </div>
      </div>

      {/* Create: Reveal → Verify → Password */}
      {mode === "create" && step === "reveal" && (
        <div className="rounded-2xl border border-border/50 bg-card/60 p-6">
          <h3 className="text-xl font-semibold mb-1">Your secret recovery phrase</h3>
          <p className="text-sm text-muted-foreground">Write down these 12 words. They are the only way to recover your wallet.</p>
          <div className="mt-4 grid grid-cols-2 gap-2 rounded-xl bg-foreground/5 p-4">
            {words.map((w, i) => (
              <div key={i} className="flex items-center gap-2 rounded-lg bg-card px-3 py-2 text-sm">
                <span className="text-muted-foreground w-5 text-right">{i + 1}</span>
                <span className="font-medium">{w}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 flex gap-2">
            <Button variant="secondary" onClick={() => navigator.clipboard.writeText(mnemonic)}>Copy</Button>
            <Button className="ml-auto" onClick={() => setStep("verify")}>I have saved my phrase</Button>
          </div>
        </div>
      )}

      {mode === "create" && step === "verify" && (
        <div className="rounded-2xl border border-border/50 bg-card/60 p-6">
          <h3 className="text-xl font-semibold mb-1">Verify your phrase</h3>
          <p className="text-sm text-muted-foreground">Enter the words #{verifyIdx.map(i => i + 1).join(", ")} in order.</p>
          <div className="mt-4 space-y-3">
            {verifyIdx.map((idx, j) => (
              <div key={idx}>
                <div className="mb-1 text-xs text-muted-foreground">Word #{idx + 1}</div>
                <Input value={verifyAnswers[j]} onChange={(e) => {
                  const a = [...verifyAnswers]; a[j] = e.target.value.trim(); setVerifyAnswers(a);
                }} />
              </div>
            ))}
          </div>
          <div className="mt-4 flex gap-2">
            <Button variant="secondary" onClick={() => setStep("reveal")}>Back</Button>
            <Button className="ml-auto" onClick={() => {
              const ok = verifyIdx.every((idx, j) => words[idx] === verifyAnswers[j]);
              if (!ok) { alert("Words do not match."); return; }
              setStep("password");
            }}>Continue</Button>
          </div>
        </div>
      )}

      {(mode === "create" && step === "password") && (
        <div className="rounded-2xl border border-border/50 bg-card/60 p-6">
          <h3 className="text-xl font-semibold mb-1">Secure your wallet</h3>
          <p className="text-sm text-muted-foreground">Set a password to encrypt the wallet on this device.</p>
          <div className="mt-4 space-y-3">
            <Input type="password" placeholder="Password" value={password1} onChange={(e)=>setPassword1(e.target.value)} />
            <Input type="password" placeholder="Confirm password" value={password2} onChange={(e)=>setPassword2(e.target.value)} />
          </div>
          <div className="mt-4 flex gap-2">
            <Button variant="secondary" onClick={() => setStep("verify")}>Back</Button>
            <Button
              className="ml-auto"
              disabled={busy}
              onClick={async () => {
                if (!password1 || password1 !== password2) { alert("Passwords don't match"); return; }
                setBusy(true);
                try {
                  await connectNetworks();
                  await createWalletFromMnemonic(mnemonic, password1);
                  setStep("done");
                } catch (e) {
                  console.error(e); alert("Failed to create wallet");
                } finally { setBusy(false); }
              }}
            >
              {busy ? "Saving…" : "Save & Finish"}
            </Button>
          </div>
        </div>
      )}

      {/* Import */}
      {mode === "import" && step === "import" && (
        <div className="rounded-2xl border border-border/50 bg-card/60 p-6">
          <h3 className="text-xl font-semibold mb-1">Import wallet</h3>
          <p className="text-sm text-muted-foreground">Paste your 12/24-word phrase. We’ll derive Solana + TRON.</p>
          <div className="mt-4 space-y-3">
            <textarea
              rows={3}
              className="w-full rounded-md border bg-background p-3 text-sm"
              placeholder="twelve words separated by spaces…"
              value={mnemonic}
              onChange={(e)=>setMnemonic(e.target.value)}
            />
            <Input
              type="password"
              placeholder="Set a password"
              value={password1}
              onChange={(e)=>setPassword1(e.target.value)}
            />
          </div>
          <div className="mt-4 flex gap-2">
            <Button variant="secondary" onClick={onCancel}>Cancel</Button>
            <Button
              className="ml-auto"
              disabled={busy}
              onClick={async () => {
                const m = mnemonic.trim().toLowerCase().replace(/\s+/g, " ");
                if (!validateMnemonic(m, wordlist)) { alert("Invalid mnemonic"); return; }
                if (!password1) { alert("Enter a password"); return; }
                setBusy(true);
                try {
                  await connectNetworks();
                  await createWalletFromMnemonic(m, password1);
                  setStep("done");
                } catch (e) {
                  console.error(e); alert("Failed to import wallet");
                } finally { setBusy(false); }
              }}
            >
              {busy ? "Importing…" : "Import & Connect"}
            </Button>
          </div>
        </div>
      )}

      {/* Done */}
      {step === "done" && (
        <div className="rounded-2xl border border-border/50 bg-card/60 p-6 text-center">
          <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-full bg-emerald-600 text-white">
            <Check className="h-6 w-6" />
          </div>
          <h3 className="text-xl font-semibold mb-1">All set!</h3>
          <p className="text-sm text-muted-foreground">Your Renee wallet is ready. You can close this dialog.</p>
          <Separator className="my-4" />
          <Button className="w-full" onClick={onDone}>Go to dashboard</Button>
        </div>
      )}
    </div>
  );
}
