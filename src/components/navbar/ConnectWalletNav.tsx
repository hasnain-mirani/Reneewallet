// src/components/navbar/ConnectWalletNav.tsx
import { Button } from "@/components/ui/button";
import { useWalletModal } from "@/components/wallet/useWalletModal";
import { useWallet } from "@/wallet/store";
import { useTranslation } from "react-i18next";
import { Check } from "lucide-react";

export default function ConnectWalletNav() {
  const { t } = useTranslation();
  const { open } = useWalletModal();
  const { encrypted, sol, tron } = useWallet();

  const connected = !!(sol?.address || tron?.address);

  const label = connected
    ? t("wallet.connected", { defaultValue: "Connected" })
    : encrypted
    ? t("actions.unlockWallet", { defaultValue: "Unlock Wallet" })
    : t("actions.connectWallet", { defaultValue: "Connect Wallet" });

  return (
    <Button onClick={open} className="rounded-full" title={label}>
      {connected ? <Check className="mr-2 h-4 w-4" /> : null}
      {label}
    </Button>
  );
}
