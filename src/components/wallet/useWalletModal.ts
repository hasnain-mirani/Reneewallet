// src/components/wallet/useWalletModal.ts
import { useContext } from "react";
import { WalletModalCtx, type WalletModalContextValue } from "./walletModalContext";

export function useWalletModal(): WalletModalContextValue {
  const ctx = useContext(WalletModalCtx);
  if (!ctx) throw new Error("useWalletModal must be used within <WalletModalProvider>");
  return ctx;
}

export default useWalletModal;
