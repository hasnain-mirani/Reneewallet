// src/components/wallet/ConnectWalletButton.tsx
import * as React from "react";
import { Button } from "@/components/ui/button";
import { useWalletModal } from "@/components/wallet/useWalletModal";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Check } from "lucide-react";
import { useTranslation } from "react-i18next";

type ClickHandler = React.MouseEventHandler<HTMLButtonElement>;

interface ConnectWalletButtonProps
  extends Omit<React.ComponentProps<typeof Button>, "onClick" | "children"> {
  /** Label when disconnected (defaults to i18n actions.connectWallet) */
  children?: React.ReactNode;
  /** "modal" opens your wallet modal (default). "direct" connects immediately. */
  mode?: "modal" | "direct";
  /** Extra click handler; call e.preventDefault() to cancel default action */
  onClick?: ClickHandler;
}

const ConnectWalletButton: React.FC<ConnectWalletButtonProps> = ({
  children,
  onClick,
  mode = "modal",
  ...rest
}) => {
  const { t } = useTranslation();
  const { open, connect, isConnecting, address } = useWalletModal();
  const { toast } = useToast();

  const handleClick: ClickHandler = async (e) => {
    onClick?.(e);
    if (e.defaultPrevented) return;

    if (address) {
      // Connected: just open wallet modal; do NOT show/copy address
      open();
      return;
    }

    // Not connected → connect
    if (mode === "modal") {
      open();
    } else {
      try {
        await connect();
      } catch (err) {
        console.error(err);
        toast({
          title: t("wallet.connectErrorTitle", { defaultValue: "Connection failed" }),
          description: t("wallet.connectErrorDesc", { defaultValue: "Please try again." }),
          variant: "destructive",
        });
      }
    }
  };

  // Never show address. When connected, force "Connected" label.
  const labelWhenDisconnected =
    children ?? t("actions.connectWallet", { defaultValue: "Connect Wallet" });
  const label = address
    ? t("wallet.connected", { defaultValue: "Connected" })
    : labelWhenDisconnected;

  const title = address
    ? t("wallet.connectedTitle", { defaultValue: "Wallet connected" })
    : t("actions.connectWallet", { defaultValue: "Connect Wallet" });

  return (
    <Button
      {...rest}
      onClick={handleClick}
      disabled={isConnecting}
      aria-busy={isConnecting}
      className={`rounded-full px-3 ${rest.className ?? ""}`}
      title={title}
    >
      {isConnecting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {address ? <Check className="mr-2 h-4 w-4" /> : null}
      {label}
    </Button>
  );
};

export default ConnectWalletButton;
