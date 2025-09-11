import { Button } from "@/components/ui/button";
import { useWalletModal } from "@/components/wallet/useWalletModal";
import { useWallet } from "@/wallet/store";

export default function ConnectWalletNav() {
  const { open } = useWalletModal();
  const { encrypted, sol, tron } = useWallet();

  const addr = sol?.address || tron?.address;
  const label = addr
    ? `${addr.slice(0,6)}…${addr.slice(-4)}`
    : encrypted
    ? "Unlock Wallet"
    : "Connect Wallet";

  return (
    <Button onClick={open} className="rounded-full">
      {label}
    </Button>
  );
}
