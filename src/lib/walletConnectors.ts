import { Connection, PublicKey } from "@solana/web3.js";

const SOLANA_RPC = import.meta.env.VITE_SOLANA_RPC || "https://api.mainnet-beta.solana.com";
const TRON_FULLHOST = import.meta.env.VITE_TRON_FULLHOST || "https://api.trongrid.io";

export async function detectPhantom() {
  return Boolean(window.phantom?.solana || window.solana?.isPhantom);
}

export async function connectPhantom() {
  const injected = window.phantom?.solana ?? window.solana;
  if (!injected) throw new Error("Phantom not detected");
  await injected.connect?.();                        // prompts user
  const pubkey: PublicKey = injected.publicKey;
  if (!pubkey) throw new Error("No public key returned");
  const connection = new Connection(SOLANA_RPC, "confirmed");
  return { address: pubkey.toBase58(), pubkey, connection };
}

export async function detectTronLink() {
  return Boolean(window.tronLink);
}

export async function connectTronLink() {
  const tl = window.tronLink;
  if (!tl) throw new Error("TronLink not detected");
  const res = await tl.request?.({ method: "tron_requestAccounts" });
  if (res?.code && res.code !== 200) throw new Error(res?.message || "User rejected");
  const tw = tl.tronWeb || window.tronWeb;
  if (!tw) throw new Error("tronWeb not injected by TronLink");
  try { tw.setFullNode(TRON_FULLHOST); tw.setSolidityNode(TRON_FULLHOST); } catch {}
  const addr = tw.defaultAddress?.base58 || tw.defaultAddress?.hex;
  if (!addr) throw new Error("No TRON address returned");
  return { address: addr, tronWeb: tw };
}
