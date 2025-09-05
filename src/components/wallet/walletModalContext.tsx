// src/components/wallet/WalletModalContext.tsx
import { createContext, useCallback, useContext, useState, ReactNode } from "react";

type Ctx = { isOpen: boolean; open: () => void; close: () => void };
const WalletModalCtx = createContext<Ctx | null>(null);

export function WalletModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  return (
    <WalletModalCtx.Provider value={{ isOpen, open, close }}>
      {children}
    </WalletModalCtx.Provider>
  );
}

export function useWalletModal() {
  const ctx = useContext(WalletModalCtx);
  if (!ctx) throw new Error("useWalletModal must be used within WalletModalProvider");
  return ctx;
}
