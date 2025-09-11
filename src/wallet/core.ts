// ⬇️ use the subpath export with .js extension (ESM)
import { generateMnemonic, mnemonicToSeedSync } from "@scure/bip39";
import { wordlist } from "@scure/bip39/wordlists/english.js";


export type EncryptedBlob = { iv: string; salt: string; data: string; version: 1 };

export function newMnemonic(strength: 128 | 256 = 128) {
  return generateMnemonic(wordlist, strength);
}

export function mnemonicToSeed(mnemonic: string) {
  return mnemonicToSeedSync(mnemonic);
}

const b64 = (u: Uint8Array) => btoa(String.fromCharCode(...u));
const ub64 = (s: string) => Uint8Array.from(atob(s), c => c.charCodeAt(0));

export async function encryptSecret(plain: Uint8Array, password: string): Promise<EncryptedBlob> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv   = crypto.getRandomValues(new Uint8Array(12));
  const pw   = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveKey"]);
  const aes  = await crypto.subtle.deriveKey({ name: "PBKDF2", salt, iterations: 150_000, hash: "SHA-256" },
                                             pw, { name: "AES-GCM", length: 256 }, false, ["encrypt","decrypt"]);
  const ct   = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, aes, plain);
  return { version: 1, iv: b64(iv), salt: b64(salt), data: b64(new Uint8Array(ct)) };
}

export async function decryptSecret(blob: EncryptedBlob, password: string): Promise<Uint8Array> {
  const salt = ub64(blob.salt), iv = ub64(blob.iv), data = ub64(blob.data);
  const pw   = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveKey"]);
  const aes  = await crypto.subtle.deriveKey({ name: "PBKDF2", salt, iterations: 150_000, hash: "SHA-256" },
                                             pw, { name: "AES-GCM", length: 256 }, false, ["encrypt","decrypt"]);
  const pt   = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, aes, data);
  return new Uint8Array(pt);
}