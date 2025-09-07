// src/components/wallet/ConnectWalletButton.tsx
import * as React from "react";
import { Button } from "@/components/ui/button";
import { useWalletModal } from "@/components/wallet/useWalletModal";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Copy, Check } from "lucide-react";

type ClickHandler = React.MouseEventHandler<HTMLButtonElement>;

interface ConnectWalletButtonProps
  extends Omit<React.ComponentProps<typeof Button>, "onClick" | "children"> {
  /** Label when disconnected (defaults to "Connect Wallet") */
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
  const { open, connect, isConnecting, address } = useWalletModal();
  const { toast } = useToast();
  const [copied, setCopied] = React.useState(false);

  const handleCopy = async () => {
    if (!address) return;
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      toast({
        title: "Address copied",
        description: "Your wallet address has been copied to the clipboard.",
      });
      setTimeout(() => setCopied(false), 1200);
    } catch {
      toast({
        title: "Copy failed",
        description: "Could not copy to clipboard.",
        variant: "destructive",
      });
    }
  };

  const handleClick: ClickHandler = async (e) => {
    onClick?.(e);
    if (e.defaultPrevented) return;

    // Connected → act as a "Copy address" chip (no 0x shown)
    if (address) {
      await handleCopy();
      return;
    }

    // Not connected → connect
    if (mode === "modal") {
      open();
    } else {
      try {
        await connect();
      } catch (err) {
        // user cancelled etc.
        console.error(err);
      }
    }
  };

  const label = address ? "Copy address" : (children ?? "Connect Wallet");

  return (
    <Button
      {...rest}
      onClick={handleClick}
      disabled={isConnecting}
      aria-busy={isConnecting}
      className={`rounded-full px-3 ${rest.className ?? ""}`}
      title={address ? "Copy your wallet address" : "Connect Wallet"}
    >
      {isConnecting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {address ? (
        <>
          {copied ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
          {label}
        </>
      ) : (
        <>{label}</>
      )}
    </Button>
  );
};

export default ConnectWalletButton;
