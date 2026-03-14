import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// Combine clsx + twMerge
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function hasProperty<T extends object, K extends PropertyKey>(
  obj: T,
  prop: K,
): obj is T & Record<K, unknown> {
  return prop in obj;
}
