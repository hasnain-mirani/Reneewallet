import i18n from "@/i18n";

export function formatCurrency(amount: number, currency = "USD") {
  return new Intl.NumberFormat(i18n.language || "en", {
    style: "currency",
    currency,
    maximumFractionDigits: 2
  }).format(amount || 0);
}

export function formatNumber(n: number, max = 6) {
  return new Intl.NumberFormat(i18n.language || "en", {
    maximumFractionDigits: max
  }).format(n || 0);
}
