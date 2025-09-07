// src/components/wallet/CopyAddressChip.tsx
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useWalletModal } from "@/components/wallet/useWalletModal";
import { useToast } from "@/hooks/use-toast";
import { Copy, Check } from "lucide-react";

type Props = {
  label?: string;           // default "Copy address"
  className?: string;
  size?: "sm" | "default" | "lg";
};

export default function CopyAddressChip({
  label = "Copy address",
  className = "",
  size = "sm",
}: Props) {
  const { address, open } = useWalletModal();
  const { toast } = useToast();
  const [ok, setOk] = useState(false);

  const handleCopy = async () => {
    if (!address) {
      // no address yet: open your wallet modal
      open();
      return;
    }
    try {
      await navigator.clipboard.writeText(address);
      setOk(true);
      toast({
        title: "Address copied",
        description: "Your wallet address has been copied to the clipboard.",
      });
      setTimeout(() => setOk(false), 1500);
    } catch {
      toast({
        title: "Copy failed",
        description: "Could not copy to clipboard.",
        variant: "destructive",
      });
    }
  };

  return (
    <Button
      type="button"
      variant="secondary"
      size={size}
      onClick={handleCopy}
      className={`rounded-full px-3 font-medium ${className}`}
      title={address ? "Copy your wallet address" : "Connect wallet"}
    >
      {ok ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
      {label}
    </Button>
  );
}
