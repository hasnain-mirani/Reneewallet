// src/lib/ethers.ts
import { ethers } from "ethers";

/** Wrap the EIP-1193 provider (from your WalletModalContext) into ethers v6 BrowserProvider */
export function getEthersProvider(eth: any) {
  if (!eth) throw new Error("Missing EIP-1193 provider");
  return new ethers.BrowserProvider(eth as any);
}

export async function getSigner(eth: any) {
  const browser = getEthersProvider(eth);
  return await browser.getSigner();
}

/** Parse/format helpers */
export const parseEther = ethers.parseEther;
export const formatEther = ethers.formatEther;

/** Parse/format with decimals */
export function parseUnits(value: string, decimals: number) {
  return ethers.parseUnits(value, decimals);
}
export function formatUnits(value: bigint, decimals: number) {
  return ethers.formatUnits(value, decimals);
}
