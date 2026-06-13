import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatINR(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatLiters(liters: number): string {
  if (liters >= 1000) {
    return `${(liters / 1000).toFixed(1)}K L`;
  }
  return `${liters} L`;
}

/** Returns days since a date string (YYYY-MM-DD) */
export function daysSince(dateStr: string): number {
  const then = new Date(dateStr).getTime();
  const now = Date.now();
  return Math.floor((now - then) / 86_400_000);
}
