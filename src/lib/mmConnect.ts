import { getSDKProvider } from "./mmSdk";

export async function connectMetaMaskSDK() {
  const provider = getSDKProvider();
  if (!provider) throw new Error("MetaMask SDK not ready in browser");

  const accounts: string[] = await provider.request({ method: "eth_requestAccounts" });
  const chainIdHex: string = await provider.request({ method: "eth_chainId" });
  return { provider, address: accounts[0], chainIdHex };
}

export function attachProviderListeners(
  onAccounts?: (a: string[]) => void,
  onChain?: (cidHex: string) => void
) {
  const provider: any = getSDKProvider();
  if (!provider?.on) return;
  provider.on("accountsChanged", (a: string[]) => onAccounts?.(a));
  provider.on("chainChanged", (cid: string) => onChain?.(cid));
}
