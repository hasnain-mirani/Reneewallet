// src/components/wallet/ConnectWalletButton.tsx
import { Button } from "@/components/ui/button";
import { useWalletModal } from "@/components/wallet/walletModalContext";
import * as React from "react";

type Props = React.ComponentProps<typeof Button>;

export default function ConnectWalletButton({
  children = "Connect Wallet",
  onClick,
  ...rest
}: Props) {
  const { open } = useWalletModal();
  return (
    <Button
      {...rest}
      onClick={(e) => {
        onClick?.(e);
        open();
      }}
    >
      {children}
    </Button>
  );
}
