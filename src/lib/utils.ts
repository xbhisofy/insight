import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function parseInputNumber(value: string | number): number {
  if (typeof value === "number") return value;
  
  const lowerVal = value.toLowerCase();
  
  // Handle duration format like 12h:15m:18s
  if (lowerVal.includes("h") || (lowerVal.includes("m") && lowerVal.includes(":") ) || lowerVal.includes("s")) {
    return parseDuration(value);
  }

  const clean = lowerVal.replace(/[^0-9.km]/g, "");
  if (!clean) return 0;
  
  let multiplier = 1;
  if (clean.endsWith("m")) {
      // Check if it's likely a duration (though duration is handled above, this is safety)
      // But usually in metrics, M is millions.
      multiplier = 1000000;
  } else if (clean.endsWith("k")) {
      multiplier = 1000;
  }
  
  const numPart = clean.replace(/[km]/g, "");
  return Math.round(parseFloat(numPart) * multiplier) || 0;
}

export function parseDuration(value: string): number {
  // Handles formats like: "12h 15m 18s", "12:15:18", "15m 20s", "45s"
  const hMatch = value.match(/(\d+)\s*h/i);
  const mMatch = value.match(/(\d+)\s*m/i);
  const sMatch = value.match(/(\d+)\s*s/i);

  // Also handle colon format HH:MM:SS or MM:SS
  const parts = value.split(':').filter(p => !isNaN(parseInt(p)));
  
  let h = 0, m = 0, s = 0;

  if (hMatch) h = parseInt(hMatch[1]);
  if (mMatch) m = parseInt(mMatch[1]);
  if (sMatch) s = parseInt(sMatch[1]);

  // If no unit matches found, try colon parts
  if (h === 0 && m === 0 && s === 0 && parts.length > 0) {
      if (parts.length === 3) {
          h = parseInt(parts[0]);
          m = parseInt(parts[1]);
          s = parseInt(parts[2]);
      } else if (parts.length === 2) {
          m = parseInt(parts[0]);
          s = parseInt(parts[1]);
      } else if (parts.length === 1) {
          s = parseInt(parts[0]);
      }
  }

  return (h * 3600) + (m * 60) + s;
}

export function formatDuration(totalSeconds: number): string {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    
    let res = "";
    if (h > 0) res += `${h}h:`;
    res += `${m.toString().padStart(2, '0')}m:`;
    res += `${s.toString().padStart(2, '0')}s`;
    return res;
}



