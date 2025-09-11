// src/wallet/tron.ts
import { HDKey } from "@scure/bip32";

const PATH = `m/44'/195'/0'/0/0`;
export type TronWallet = { privateKeyHex: string; address: string; tronWeb: any };

// small helper to hex-encode bytes without Buffer
function toHex(bytes: Uint8Array) {
  return Array.from(bytes).map(b => b.toString(16).padStart(2, "0")).join("");
}

/** Load TronWeb constructor from a browser global (via CDN). */
async function loadTronWebCtor(): Promise<any> {
  // already present?
  const w = (globalThis as any);
  if (typeof w.TronWeb === "function") return w.TronWeb;

  // inject CDN once
  if (!document.getElementById("tronweb-cdn")) {
    await new Promise<void>((resolve, reject) => {
      const s = document.createElement("script");
      s.id = "tronweb-cdn";
      s.async = true;
      // pin a stable 5.x; change if you prefer another version
      s.src = "https://cdn.jsdelivr.net/npm/tronweb@5.3.1/dist/TronWeb.js";
      s.onload = () => resolve();
      s.onerror = () => reject(new Error("Failed to load TronWeb CDN"));
      document.head.appendChild(s);
    });
  }

  const ctor = (globalThis as any).TronWeb;
  if (typeof ctor !== "function") throw new Error("TronWeb global not found after CDN load");
  return ctor;
}

export async function deriveTron(seed: Uint8Array, fullHost: string): Promise<TronWallet> {
  const TronWeb = await loadTronWebCtor();

  const root = HDKey.fromMasterSeed(seed);
  const child = root.derive(PATH);
  if (!child.privateKey) throw new Error("No private key at path " + PATH);

  const privateKeyHex = toHex(child.privateKey);
  const tronWeb = new TronWeb({ fullHost, privateKey: privateKeyHex });
  const address = tronWeb.address.fromPrivateKey(privateKeyHex);

  return { privateKeyHex, address, tronWeb };
}

export async function tronGetTrxBalance(tw: any, address: string) {
  const acct = await tw.trx.getAccount(address);
  return (acct?.balance || 0) / 1e6;
}

export async function tronTransferTRX(tw: any, to: string, amountTRX: number) {
  const tx = await tw.transactionBuilder.sendTrx(to, Math.floor(amountTRX * 1e6));
  const signed = await tw.trx.sign(tx);
  const receipt = await tw.trx.sendRawTransaction(signed);
  return receipt.txid || receipt.txID;
}
