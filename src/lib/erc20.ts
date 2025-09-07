// src/lib/erc20.ts
import { ethers } from "ethers";

const ERC20_ABI = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function balanceOf(address) view returns (uint256)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function approve(address spender, uint256 value) returns (bool)",
  "function transfer(address to, uint256 value) returns (bool)",
];

export function erc20(address: string, signerOrProvider: any) {
  return new ethers.Contract(address, ERC20_ABI, signerOrProvider);
}

export async function tokenMeta(address: string, signerOrProvider: any) {
  const c = erc20(address, signerOrProvider);
  const [symbol, decimals] = await Promise.all([c.symbol(), c.decimals()]);
  return { symbol, decimals: Number(decimals) };
}

export async function allowance(
  token: string,
  owner: string,
  spender: string,
  signerOrProvider: any
) {
  const c = erc20(token, signerOrProvider);
  const a: bigint = await c.allowance(owner, spender);
  return a;
}

export async function approveIfNeeded(
  token: string,
  owner: string,
  spender: string,
  minAmount: bigint,
  signer: any
) {
  const current: bigint = await allowance(token, owner, spender, signer);
  if (current >= minAmount) return null;
  const c = erc20(token, signer);
  const tx = await c.approve(spender, ethers.MaxUint256);
  return await tx.wait();
}
