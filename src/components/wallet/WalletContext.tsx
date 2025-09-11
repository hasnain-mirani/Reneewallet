import { createContext } from "react";
import { WalletModalContextValue } from "./WalletModalContext";

export const WalletModalCtx = createContext<WalletModalContextValue | null>(null);