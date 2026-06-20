import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const rubFormatter = new Intl.NumberFormat("ru-RU", {
  style: "currency",
  currency: "RUB",
  maximumFractionDigits: 0
});

export function formatMoney(value: number) {
  return rubFormatter.format(value);
}

export function toDateInputValue(date = new Date()) {
  return date.toISOString().slice(0, 10);
}
