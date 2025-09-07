// src/lib/uniswap.ts
import { ethers } from "ethers";

// --- Uniswap v3 mainnet addresses ---
export const WETH9 = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
export const USDT  = "0xdAC17F958D2ee523a2206206994597C13D831ec7";
export const SWAP_ROUTER_V3 = "0xE592427A0AEce92De3Edee1F18E0157C05861564";
export const QUOTER_V2      = "0x61fFE014bA17989E743c5F6cB21bF9697530B21e";

// fee tier 0.3%
const FEE_3000 = 3000;

// --- Minimal ABIs ---
const ERC20_ABI = [
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function balanceOf(address) view returns (uint256)"
];

const QUOTER_ABI = [
  // QuoterV2: simple signature, returns amountOut
  "function quoteExactInputSingle(address tokenIn,address tokenOut,uint24 fee,uint256 amountIn,uint160 sqrtPriceLimitX96) external returns (uint256)"
];

const ROUTER_ABI = [
  // exactInputSingle((address,address,uint24,address,uint256,uint256,uint256,uint160)) -> uint256
  "function exactInputSingle(tuple(address tokenIn,address tokenOut,uint24 fee,address recipient,uint256 deadline,uint256 amountIn,uint256 amountOutMinimum,uint160 sqrtPriceLimitX96) params) payable returns (uint256 amountOut)"
];

function getBrowser(provider: any) {
  if (!provider) throw new Error("No EVM provider");
  return new ethers.BrowserProvider(provider);
}

async function getDecimals(provider: any, token: string) {
  const erc = new ethers.Contract(token, ERC20_ABI, provider);
  return await erc.decimals();
}

/** Quote output for a single pool swap */
export async function quoteExactInputSingle(
  ethProvider: any,
  tokenIn: string,
  tokenOut: string,
  amountInWei: bigint
): Promise<bigint> {
  const browser = getBrowser(ethProvider);
  const quoter  = new ethers.Contract(QUOTER_V2, QUOTER_ABI, await browser.getSigner());
  // Using staticCall so it doesn't send a tx
  const out: bigint = await quoter.quoteExactInputSingle.staticCall(
    tokenIn, tokenOut, FEE_3000, amountInWei, 0n
  );
  return out;
}

/** Swap: ETH -> ERC20 (eg. ETH -> USDT) */
export async function swapEthToToken(params: {
  ethProvider: any;
  tokenOut: string;          // e.g., USDT
  amountInEth: string;       // human units "0.01"
  slippageBps?: number;      // default 50 = 0.5%
  recipient?: string;        // default connected account
}) {
  const { ethProvider, tokenOut, amountInEth, slippageBps = 50, recipient } = params;
  const browser = getBrowser(ethProvider);
  const signer  = await browser.getSigner();
  const to      = recipient ?? await signer.getAddress();

  const router  = new ethers.Contract(SWAP_ROUTER_V3, ROUTER_ABI, signer);

  const amountInWei = ethers.parseEther(amountInEth);

  // Quote to set minOut
  const quotedOut = await quoteExactInputSingle(ethProvider, WETH9, tokenOut, amountInWei);
  const minOut    = quotedOut - (quotedOut * BigInt(slippageBps)) / 10000n;

  const deadline = BigInt(Math.floor(Date.now() / 1000) + 60 * 5); // 5 min

  const tx = await router.exactInputSingle(
    [
      WETH9,           // tokenIn (ETH -> WETH)
      tokenOut,        // tokenOut (ERC20)
      FEE_3000,
      to,              // recipient
      deadline,
      amountInWei,     // amountIn
      minOut,          // amountOutMinimum
      0n               // sqrtPriceLimitX96
    ],
    { value: amountInWei } // send ETH
  );

  return tx.wait();
}

/** Swap: ERC20 -> ETH (eg. USDT -> ETH). NOTE: outputs WETH to router then unwrap not included. */
export async function swapTokenToEth(params: {
  ethProvider: any;
  tokenIn: string;          // e.g., USDT
  amountIn: string;         // human units (e.g., "25.5")
  slippageBps?: number;     // default 50 = 0.5%
  recipient?: string;
}) {
  const { ethProvider, tokenIn, amountIn, slippageBps = 50, recipient } = params;
  const browser = getBrowser(ethProvider);
  const signer  = await browser.getSigner();
  const from    = await signer.getAddress();
  const to      = recipient ?? from;

  const router  = new ethers.Contract(SWAP_ROUTER_V3, ROUTER_ABI, signer);
  const erc     = new ethers.Contract(tokenIn, ERC20_ABI, signer);

  const dec     = await getDecimals(signer, tokenIn);
  const amountInWei = ethers.parseUnits(amountIn, dec);

  // Approve router if needed
  const allowance: bigint = await erc.allowance(from, SWAP_ROUTER_V3);
  if (allowance < amountInWei) {
    const txA = await erc.approve(SWAP_ROUTER_V3, amountInWei);
    await txA.wait();
  }

  // Quote to set minOut (in WETH)
  const quotedOut = await quoteExactInputSingle(ethProvider, tokenIn, WETH9, amountInWei);
  const minOut    = quotedOut - (quotedOut * BigInt(slippageBps)) / 10000n;

  const deadline = BigInt(Math.floor(Date.now() / 1000) + 60 * 5);

  // This returns WETH to the recipient (not raw ETH).
  // If you want raw ETH, unwrap WETH afterwards via WETH9.withdraw(...)
  const tx = await router.exactInputSingle(
    [
      tokenIn,
      WETH9,
      FEE_3000,
      to,
      deadline,
      amountInWei,
      minOut,
      0n
    ]
  );

  return tx.wait();
}

/** Optional: unwrap all WETH to ETH for the user (simple helper). */
export async function unwrapAllWethToEth(ethProvider: any) {
  const browser = getBrowser(ethProvider);
  const signer  = await browser.getSigner();
  const me      = await signer.getAddress();

  const WETH_ABI = [
    "function balanceOf(address) view returns (uint256)",
    "function withdraw(uint256) external"
  ];
  const weth = new ethers.Contract(WETH9, WETH_ABI, signer);
  const bal: bigint = await weth.balanceOf(me);
  if (bal > 0n) {
    const tx = await weth.withdraw(bal);
    return tx.wait();
  }
}
