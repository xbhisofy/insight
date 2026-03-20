import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function parseInputNumber(value: string | number): number {
  if (typeof value === "number") return value;
  const clean = value.toLowerCase().replace(/[^0-9.km]/g, "");
  if (!clean) return 0;
  
  let multiplier = 1;
  if (clean.endsWith("k")) multiplier = 1000;
  else if (clean.endsWith("m")) multiplier = 1000000;
  
  const numPart = clean.replace(/[km]/g, "");
  return Math.round(parseFloat(numPart) * multiplier) || 0;
}

