// src/components/wallet/AddressPill.tsx
import { CheckCircle2, Plug } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function AddressPill({
  label,
  address,
  size = 6, // kept for API compatibility (unused now)
}: { label: string; address?: string; size?: number }) {
  const { t } = useTranslation();
  const connected = !!address;

  const statusText = connected
    ? t("wallet.connected", { defaultValue: "Connected" })
    : t("labels.notConnected", { defaultValue: "— not connected —" });

  return (
    <div
      className="inline-flex items-center gap-2 rounded-full bg-foreground/10 px-3 py-1 text-xs"
      aria-label={`${label} ${statusText}`}
    >
      <span className="font-medium">{label}</span>
      <span className="opacity-90">{statusText}</span>
      {connected ? (
        <CheckCircle2 className="h-3.5 w-3.5 text-green-500" aria-hidden="true" />
      ) : (
        <Plug className="h-3.5 w-3.5 opacity-70" aria-hidden="true" />
      )}
    </div>
  );
}
