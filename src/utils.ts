import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// Combine clsx + twMerge
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
