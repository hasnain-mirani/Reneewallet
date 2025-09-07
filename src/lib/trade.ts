// src/lib/trade.ts
import { getSigner, parseEther, parseUnits } from "./ethers";
import { approveIfNeeded, erc20, tokenMeta } from "./erc20";

/** -------- SEND -------- */

/** Send native coin (ETH/MATIC/etc.) */
export async function sendNative(ethProvider: any, to: string, amountEther: string) {
  const signer = await getSigner(ethProvider);
  const tx = await signer.sendTransaction({
    to,
    value: parseEther(amountEther),
  });
  return await tx.wait();
}

/** Send ERC-20 token */
export async function sendERC20(
  ethProvider: any,
  tokenAddress: string,
  to: string,
  amount: string
) {
  const signer = await getSigner(ethProvider);
  const { decimals } = await tokenMeta(tokenAddress, signer);
  const c = erc20(tokenAddress, signer);
  const tx = await c.transfer(to, parseUnits(amount, decimals));
  return await tx.wait();
}

/** -------- SWAP (0x aggregator) -------- */
/**
 * Get a 0x quote & perform swap.
 * - sellToken/buyToken: addresses or symbols (e.g., "ETH" on mainnet)
 * - amount: string in human units (e.g., "0.01")
 * - You MUST be on a network supported by 0x (e.g., Ethereum, Polygon, BSC, etc.)
 */
export async function swapWith0x(params: {
  ethProvider: any;
  sellToken: string;   // e.g., "ETH" or "0xA0b86991c6218b36c1d19d4a2e9eb0ce3606eb48"
  buyToken: string;    // e.g., "USDC" or address
  amount: string;      // human value
  taker?: string;      // optional (will read from signer if omitted)
  apiBase?: string;    // default https://api.0x.org
  chainId?: number;    // default read from provider
}) {
  const {
    ethProvider,
    sellToken,
    buyToken,
    amount,
    taker,
    apiBase = "https://api.0x.org",
    chainId,
  } = params;

  const signer = await getSigner(ethProvider);
  const takerAddress = taker ?? (await signer.getAddress());
  const chainIdHex: string = await ethProvider.request({ method: "eth_chainId" });
  const cid = chainId ?? Number.parseInt(chainIdHex, 16);

  // Build 0x quote URL
  // 0x supports chain via ?chainId=... on the public API
  const quoteUrl = new URL(`${apiBase}/swap/v1/quote`);
  quoteUrl.searchParams.set("sellToken", sellToken);
  quoteUrl.searchParams.set("buyToken", buyToken);
  quoteUrl.searchParams.set("takerAddress", takerAddress);
  quoteUrl.searchParams.set("chainId", String(cid));

  // If selling a token (not native), 0x expects sellAmount in base units.
  // If selling native (e.g., ETH), you still pass sellAmount and also send value with tx.
  let sellAmountBase = "";
  if (sellToken.toUpperCase() === "ETH" || sellToken === "WETH" /* optional */) {
    // native ETH
    // 18 decimals for ETH
    sellAmountBase = parseUnitsSafe(amount, 18).toString();
  } else {
    const { decimals } = await tokenMeta(sellToken, signer);
    sellAmountBase = parseUnitsSafe(amount, decimals).toString();
  }
  quoteUrl.searchParams.set("sellAmount", sellAmountBase);

  // Fetch quote
  const res = await fetch(quoteUrl.toString());
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`0x quote failed: ${text}`);
  }
  const quote = await res.json();

  // If selling ERC-20, ensure allowance to 0x's allowanceTarget
  if (quote.allowanceTarget && sellToken && sellToken.toUpperCase() !== "ETH") {
    await approveIfNeeded(
      sellToken,
      takerAddress,
      quote.allowanceTarget,
      BigInt(sellAmountBase),
      signer
    );
  }

  // Send the swap tx returned by 0x
  const tx = await signer.sendTransaction({
    to: quote.to,
    data: quote.data,
    value: quote.value ? BigInt(quote.value) : undefined,
    // gas: quote.gas ? BigInt(quote.gas) : undefined, // usually not needed; node estimates
  });
  return await tx.wait();
}

function parseUnitsSafe(v: string, decimals: number) {
  return parseUnits(v === "" ? "0" : v, decimals);
}

/** -------- BUY (On-ramp) -------- */
/**
 * Opens a fiat on-ramp page in a new tab. You can replace the URL with your provider (Ramp, Transak, Coinbase Pay).
 * For MetaMask Portfolio:
 *   https://portfolio.metamask.io/buy
 */
export function openBuyPage(address?: string) {
  const url = new URL("https://portfolio.metamask.io/buy");
  if (address) url.searchParams.set("address", address);
  window.open(url.toString(), "_blank", "noopener,noreferrer");
}
