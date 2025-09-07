// src/components/wallet/WalletModalContext.tsx
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { MetaMaskSDK } from "@metamask/sdk";
import { ethers } from "ethers";

// ---- New: human names for common chains
const CHAIN_NAMES: Record<number, string> = {
  1: "Ethereum",
  137: "Polygon",
  56: "BNB Smart Chain",
  42161: "Arbitrum",
  10: "Optimism",
  8453: "Base",
  43114: "Avalanche",
  42220: "Celo",
  11155111: "Sepolia",
};
// add near top, after imports
type AddEthereumChainParameter = {
  chainId: `0x${string}`;
  chainName: string;
  nativeCurrency: { name: string; symbol: string; decimals: number };
  rpcUrls: string[];
  blockExplorerUrls?: string[];
};

// extend the Ctx type
type Ctx = {
  // ...existing
  switchChain: (targetChainIdHex: `0x${string}`, addParams?: AddEthereumChainParameter) => Promise<void>;
  // ...existing fields
};

// Format helpers
function hexToDec(hex: string | null): number | null {
  if (!hex) return null;
  try {
    return parseInt(hex, 16);
  } catch {
    return null;
  }
}

function niceEth(bi?: bigint): string | null {
  if (bi == null) return null;
  try {
    return ethers.formatEther(bi);
  } catch {
    return null;
  }
}

export type WalletModalContextValue = {
  // modal controls
  isOpen: boolean;
  open: () => void;
  close: () => void;

  // wallet state
  address: string | null;
  chainIdHex: string | null;
  isConnecting: boolean;

  // ---- New derived fields
  networkName: string | null;
  nativeBalance: string | null; // formatted string like "0.1234"
  ensName: string | null;

  // actions
  connect: () => Promise<void>;
  disconnect: () => void;
  refresh: () => Promise<void>; // refresh balances/names

  // raw provider for direct requests
  provider: any | null;
};

export const WalletModalCtx = createContext<WalletModalContextValue | undefined>(undefined);

export function WalletModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);

  const [address, setAddress] = useState<string | null>(null);
  const [chainIdHex, setChainIdHex] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [provider, setProvider] = useState<any | null>(null);

  // New: derived info
  const [networkName, setNetworkName] = useState<string | null>(null);
  const [nativeBalance, setNativeBalance] = useState<string | null>(null);
  const [ensName, setEnsName] = useState<string | null>(null);

  const sdkRef = useRef<MetaMaskSDK | null>(null);

  // EIP-6963 discovery (keep it simple; optional)
  async function discoverMetaMaskEip6963(timeoutMs = 200): Promise<any | null> {
    if (typeof window === "undefined") return null;

    let selected: any | null = null;

    const onAnnounce = (e: any) => {
      const { info, provider } = e.detail || {};
      if (info?.rdns?.toLowerCase?.().includes("metamask")) {
        selected = provider;
      }
    };

    window.addEventListener("eip6963:announceProvider", onAnnounce);
    window.dispatchEvent(new Event("eip6963:requestProvider"));
    await new Promise((r) => setTimeout(r, timeoutMs));
    window.removeEventListener("eip6963:announceProvider", onAnnounce);

    return selected;
  }

  // Init SDK + provider
  useEffect(() => {
    if (typeof window === "undefined") return;

    if (!sdkRef.current) {
      sdkRef.current = new MetaMaskSDK({
        dappMetadata: { name: "InventWallet", url: window.location.origin },
        injectProvider: true,
        checkInstallationImmediately: false,
        checkInstallationOnAllCalls: true,
      });
    }

    (async () => {
      let p: any | null = null;
      try {
        p = sdkRef.current!.getProvider?.() ?? null;
      } catch {
        p = null;
      }
      if (!p) {
        p = await discoverMetaMaskEip6963(200);
      }
      if (!p && (window as any).ethereum?.isMetaMask) {
        p = (window as any).ethereum;
      } else if (!p && (window as any).ethereum) {
        const eth = (window as any).ethereum;
        const provs: any[] = eth.providers || [];
        const mm = provs.find((x) => x?.isMetaMask);
        p = mm || eth;
      }
      setProvider(p);

      if (!p?.on) return;

      const onAccountsChanged = (accs: string[]) => {
        setAddress(accs[0] ?? null);
        // when account changes, refresh info
        refreshAccountData(p, accs[0] ?? null, chainIdHex).catch(() => {});
      };
      const onChainChanged = (cidHex: string) => {
        setChainIdHex(cidHex);
        // when network changes, refresh info
        refreshAccountData(p, address, cidHex).catch(() => {});
      };

      p.on("accountsChanged", onAccountsChanged);
      p.on("chainChanged", onChainChanged);

      // hydrate on mount
      try {
        const accs: string[] = await p.request?.({ method: "eth_accounts" });
        const cid: string = await p.request?.({ method: "eth_chainId" });
        setAddress(accs?.[0] ?? null);
        setChainIdHex(cid ?? null);
        await refreshAccountData(p, accs?.[0] ?? null, cid ?? null);
      } catch {
        /* ignore */
      }

      return () => {
        p.removeListener?.("accountsChanged", onAccountsChanged);
        p.removeListener?.("chainChanged", onChainChanged);
      };
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---- New: refresh function to populate balance / ENS / network name
  const refresh = useCallback(async () => {
    if (!provider) return;
    await refreshAccountData(provider, address, chainIdHex);
  }, [provider, address, chainIdHex]);

  const refreshAccountData = useCallback(
    async (p: any, addr: string | null, cidHex: string | null) => {
      const cid = hexToDec(cidHex);
      setNetworkName(cid ? CHAIN_NAMES[cid] ?? `Chain ${cid}` : null);

      // If no account, clear fields
      if (!addr) {
        setNativeBalance(null);
        setEnsName(null);
        return;
      }

      // Native balance
      try {
        const browser = new ethers.BrowserProvider(p);
        const bal: bigint = await browser.getBalance(addr);
        setNativeBalance(niceEth(bal));
      } catch {
        setNativeBalance(null);
      }

      // ENS name — resolve only on Ethereum mainnet (cid === 1)
      try {
        if (cid === 1) {
          const browser = new ethers.BrowserProvider(p);
          const name = await browser.lookupAddress(addr);
          setEnsName(name ?? null);
        } else {
          setEnsName(null);
        }
      } catch {
        setEnsName(null);
      }
    },
    []
  );

  const connect = useCallback(async () => {
    // Re-resolve provider in case user enabled install after load
    let p = provider;
    if (!p) {
      try {
        p = sdkRef.current?.getProvider?.() ?? null;
      } catch {
        p = null;
      }
      if (!p) p = await discoverMetaMaskEip6963(200);
      if (!p && (window as any).ethereum?.isMetaMask) p = (window as any).ethereum;
      if (p) setProvider(p);
    }

    if (!p) throw new Error("MetaMask provider not found. Install the extension or open in MetaMask Mobile.");
    if (isConnecting) return;

    try {
      setIsConnecting(true);
      const accounts: string[] = await p.request({ method: "eth_requestAccounts" });
      const cid: string = await p.request({ method: "eth_chainId" });

      const addr = accounts[0] ?? null;
      setAddress(addr);
      setChainIdHex(cid);
      setIsOpen(false);

      // Populate balance / ENS / network name now
      await refreshAccountData(p, addr, cid);
    } catch (e: any) {
      // 4001 => user cancelled — ignore silently
      if (e?.code === 4001) return;
      throw e;
    } finally {
      setIsConnecting(false);
    }
  }, [provider, isConnecting, refreshAccountData]);

  const disconnect = useCallback(() => {
    setAddress(null);
    setChainIdHex(null);
    setNativeBalance(null);
    setEnsName(null);
    setNetworkName(null);
  }, []);

  const value = useMemo<WalletModalContextValue>(
    () => ({
      isOpen,
      open,
      close,
      address,
      chainIdHex,
      isConnecting,
      networkName,
      nativeBalance,
      ensName,
      connect,
      disconnect,
      refresh,
      provider,
    }),
    [
      isOpen,
      open,
      close,
      address,
      chainIdHex,
      isConnecting,
      networkName,
      nativeBalance,
      ensName,
      connect,
      disconnect,
      refresh,
      provider,
    ]
  );

  return <WalletModalCtx.Provider value={value}>{children}</WalletModalCtx.Provider>;
}

/** Hook to access wallet/modal state */
export function useWalletModal(): WalletModalContextValue {
  const ctx = useContext(WalletModalCtx);
  if (!ctx) throw new Error("useWalletModal must be used within <WalletModalProvider>");
  return ctx;
}

export default useWalletModal;
