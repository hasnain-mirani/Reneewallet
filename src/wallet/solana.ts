import { Connection, Keypair, SystemProgram, Transaction, PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { derivePath } from "ed25519-hd-key";

const PATH = `m/44'/501'/0'/0'`;

export type SolanaWallet = { keypair: Keypair; address: string };

export function deriveSolana(seed: Uint8Array): SolanaWallet {
  const { key } = derivePath(PATH, Buffer.from(seed).toString("hex"));
  const kp = Keypair.fromSeed(key);
  return { keypair: kp, address: kp.publicKey.toBase58() };
}

export async function solanaGetBalance(endpoint: string, address: string) {
  const conn = new Connection(endpoint, "confirmed");
  const lamports = await conn.getBalance(new PublicKey(address));
  return lamports / LAMPORTS_PER_SOL;
}

export async function solanaTransferSOL(params: {
  endpoint: string; from: Keypair; to: string; amountSol: number;
}) {
  const conn = new Connection(params.endpoint, "confirmed");
  const tx = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: params.from.publicKey,
      toPubkey: new PublicKey(params.to),
      lamports: Math.floor(params.amountSol * LAMPORTS_PER_SOL),
    })
  );
  const { blockhash } = await conn.getLatestBlockhash();
  tx.recentBlockhash = blockhash;
  tx.feePayer = params.from.publicKey;
  tx.sign(params.from);
  const sig = await conn.sendRawTransaction(tx.serialize());
  return sig;
}