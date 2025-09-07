import * as React from "react";
import ConnectWalletButton from "@/components/wallet/ConnectWalletButton";
import { useWalletModal } from "@/components/wallet/useWalletModal";
import { useToast } from "@/hooks/use-toast";
import { Plus, Check } from "lucide-react";

// put the fox icon in /public/icons/metamask.svg (or change the path)
const FOX_SRC = "/icons/metamask.svg";

export default function NavWalletControl({ className = "" }: { className?: string }) {
  const { address, connect, open } = useWalletModal();
  const { toast } = useToast();
  const [copied, setCopied] = React.useState(false);
  const [imgOk, setImgOk] = React.useState(true);

  // Not connected -> show your normal Connect Wallet pill
  if (!address) {
    return (
      <ConnectWalletButton
        mode="modal"
        className={`rounded-full bg-white text-black hover:bg-white/90 border border-white/20 h-9 px-4 ${className}`}
      />
    );
  }

  // Connected -> show the small fox + plus pill
  const copyAddr = async () => {
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      toast({ title: "Address copied", description: "Wallet address copied to clipboard." });
      setTimeout(() => setCopied(false), 1200);
    } catch {
      toast({ title: "Copy failed", variant: "destructive" });
    }
  };

  return (
    <div
      role="group"
      className={[
        "inline-flex items-center h-9 rounded-full bg-foreground/10 border border-foreground/10",
        "backdrop-blur px-1",
        className,
      ].join(" ")}
    >
      {/* Fox: copy full address */}
      <button
        type="button"
        onClick={copyAddr}
        className="h-7 w-7 rounded-full grid place-items-center bg-white shadow-sm"
        title="Copy address"
        aria-label="Copy address"
      >
        {copied ? (
          <Check className="h-4 w-4 text-emerald-600" />
        ) : imgOk ? (
          <img src={FOX_SRC} alt="MetaMask" className="h-5 w-5" onError={() => setImgOk(false)} />
        ) : (
          <span className="text-[10px] font-bold text-black">MM</span>
        )}
      </button>

      {/* Plus: open your wallet modal / more options */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          open(); // or replace with your chain switcher later
        }}
        className="ml-1 h-7 w-7 rounded-full grid place-items-center hover:bg-foreground/10"
        title="More wallet options"
        aria-label="More wallet options"
      >
        <Plus className="h-4 w-4 text-foreground/80" />
      </button>
    </div>
  );
}
