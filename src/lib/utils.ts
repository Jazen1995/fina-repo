import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number | null | undefined, decimals = 2): string {
  if (price == null) return "—";
  return price.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export function formatPercent(pct: number | null | undefined): string {
  if (pct == null) return "—";
  const sign = pct >= 0 ? "+" : "";
  return `${sign}${pct.toFixed(2)}%`;
}

export function formatChange(change: number | null | undefined, decimals = 2): string {
  if (change == null) return "—";
  const sign = change >= 0 ? "+" : "";
  return `${sign}${change.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}`;
}

export function formatDate(date: Date | string): string {
  return format(new Date(date), "MM/dd");
}

export function formatDateFull(date: Date | string): string {
  return format(new Date(date), "yyyy-MM-dd");
}

export function isPositive(value: number | null | undefined): boolean {
  return value != null && value >= 0;
}

export function priceDecimals(symbol: string): number {
  // Yields and large indices use fewer decimals
  if (symbol === "^TNX") return 3;
  if (symbol.startsWith("^")) return 2;
  return 2;
}
