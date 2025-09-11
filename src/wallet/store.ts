import { create } from "zustand";
import { EncryptedBlob, newMnemonic, mnemonicToSeed, encryptSecret, decryptSecret } from "./core";
import { deriveSolana, solanaGetBalance, solanaTransferSOL } from "./solana";

const BACKEND = (import.meta.env.VITE_BACKEND_BASE || "http://localhost:5000").trim();

type State = {
  encrypted?: EncryptedBlob;
  sol?: { address: string };
  tron?: { address: string };
};

type Actions = {
  // old
  createWallet: (password: string) => Promise<{ mnemonic: string }>;
  // new
  createWalletFromMnemonic: (mnemonic: string, password: string) => Promise<void>;
  unlock: (password: string) => Promise<void>;
  lock: () => void;
  getBalances: () => Promise<{ sol: number; trx: number }>;
  sendSOL: (to: string, amountSol: number, password: string) => Promise<string>;
  sendTRX: (to: string, amountTRX: number, password: string) => Promise<string>;
};

const KEY = "dualchain_encrypted";
const save = (enc?: EncryptedBlob) => localStorage.setItem(KEY, enc ? JSON.stringify(enc) : "");
const load = (): EncryptedBlob | undefined => { try { const raw = localStorage.getItem(KEY); return raw ? JSON.parse(raw) : undefined; } catch { return undefined; } };

export const useWallet = create<State & Actions>((set, get) => ({
  encrypted: load(),

  async createWallet(password) {
    const mnemonic = newMnemonic(128);
    await get().createWalletFromMnemonic(mnemonic, password);
    return { mnemonic };
  },

  async createWalletFromMnemonic(mnemonic, password) {
    try {
      const seed = mnemonicToSeed(mnemonic);
      const enc = await encryptSecret(seed, password);
      save(enc);

      const sol = deriveSolana(seed);

      let tronAddr: string | undefined;
      try {
        const { deriveTron } = await import("./tron");
        const tron = await deriveTron(seed, `${BACKEND}/rpc/tron`);
        tronAddr = tron.address;
      } catch (e) {
        console.warn("[createWalletFromMnemonic] TRON derive failed; continuing with Solana:", e);
      }

      set({ encrypted: enc, sol: { address: sol.address }, tron: tronAddr ? { address: tronAddr } : undefined });
    } catch (e) {
      console.error("[createWalletFromMnemonic] error:", e);
      throw e;
    }
  },

  async unlock(password) {
    const enc = get().encrypted || load();
    if (!enc) throw new Error("No vault found.");
    const seed = await decryptSecret(enc, password);
    const sol = deriveSolana(seed);
    let tronAddr: string | undefined;
    try {
      const { deriveTron } = await import("./tron");
      const tron = await deriveTron(seed, `${BACKEND}/rpc/tron`);
      tronAddr = tron.address;
    } catch (e) {
      console.warn("[unlock] TRON derive failed; continuing with Solana:", e);
    }
    set({ encrypted: enc, sol: { address: sol.address }, tron: tronAddr ? { address: tronAddr } : undefined });
  },

  lock() { set({}); },

  async getBalances() {
    const st = get();
    if (!st.sol?.address || !st.tron?.address) throw new Error("Unlock wallet first");

    const sol = await solanaGetBalance(`${BACKEND}/rpc/solana`, st.sol.address);

    const r = await fetch(`${BACKEND}/rpc/tron/wallet/getaccount`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ address: st.tron.address }),
    });
    const account = await r.json();
    const trx = (account?.balance || 0) / 1e6;

    return { sol, trx };
  },

  async sendSOL(to, amountSol, password) {
    const enc = get().encrypted; if (!enc) throw new Error("No vault");
    const seed = await decryptSecret(enc, password);
    const { keypair } = deriveSolana(seed);
    return solanaTransferSOL({ endpoint: `${BACKEND}/rpc/solana`, from: keypair, to, amountSol });
  },

  async sendTRX(to, amountTRX, password) {
    const enc = get().encrypted; if (!enc) throw new Error("No vault");
    const seed = await decryptSecret(enc, password);
    const { deriveTron, tronTransferTRX } = await import("./tron");
    const { tronWeb } = await deriveTron(seed, `${BACKEND}/rpc/tron`);
    return tronTransferTRX(tronWeb, to, amountTRX);
  },
}));
