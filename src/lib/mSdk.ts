import { MetaMaskSDK } from "@metamask/sdk";

let sdk: MetaMaskSDK | null = null;

export function getMMSDK() {
  if (typeof window === "undefined") return null; // guard SSR
  if (!sdk) {
    sdk = new MetaMaskSDK({
      dappMetadata: {
        name: "InventWallet",
        url: window.location.origin,
      },
      checkInstallationImmediately: false,
      checkInstallationOnAllCalls: true,
    });
  }
  return sdk;
}

export function getSDKProvider() {
  return getMMSDK()?.getProvider(); // EIP-1193 provider: provider.request({ method, params })
}
