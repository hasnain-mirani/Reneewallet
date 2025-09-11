import { Copy } from "lucide-react";

export default function AddressPill({
  label,
  address,
  size = 6,
}: { label: string; address?: string; size?: number }) {
  const short = address ? `${address.slice(0, size)}…${address.slice(-4)}` : "—";
  return (
    <div className="inline-flex items-center gap-2 rounded-full bg-foreground/10 px-3 py-1 text-xs">
      <span className="font-medium">{label}</span>
      <code className="opacity-90">{short}</code>
      {address && (
        <button
          className="opacity-70 hover:opacity-100"
          onClick={() => navigator.clipboard.writeText(address)}
          title={`Copy ${label} address`}
        >
          <Copy className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}
