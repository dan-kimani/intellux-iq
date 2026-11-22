import { workspace } from "../screens/settings/state";

export const currencyOptions = ["USD", "EUR", "GBP", "KES"] as const;
export type CurrencyCode = (typeof currencyOptions)[number];

const symbols: Record<CurrencyCode, string> = {
  USD: "$",
  EUR: "€",
  GBP: "£",
  KES: "KSh ",
};

const prefix = /^(?:\$|€|£|KSh\s*|KES\s*|USD\s*|EUR\s*|GBP\s*)/;

export function currencyCode(): CurrencyCode {
  const code = workspace().currency as CurrencyCode;
  return currencyOptions.includes(code) ? code : "USD";
}

export function currencySymbol(): string {
  return symbols[currencyCode()];
}

/** Re-labels a formatted money string without changing its numeric value. */
export function moneyText(value: string): string {
  const trimmed = value.trim();
  const match = trimmed.match(prefix);
  if (!match) return value;
  return `${currencySymbol()}${trimmed.slice(match[0].length)}`;
}

export function money(total: number): string {
  const compact =
    total >= 1_000_000
      ? `${(total / 1_000_000).toFixed(1)}M`
      : total >= 1000
        ? `${Math.round(total / 1000)}k`
        : `${Math.round(total).toLocaleString("en-US")}`;
  return `${currencySymbol()}${compact}`;
}
