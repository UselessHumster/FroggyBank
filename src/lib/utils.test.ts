import { describe, it, expect } from "vitest";
import { cn, formatMoney, toDateInputValue } from "./utils";

describe("cn", () => {
  it("merges class names correctly", () => {
    expect(cn("bg-red-500", "text-white")).toBe("bg-red-500 text-white");
    expect(cn("bg-red-500", "bg-blue-500")).toBe("bg-blue-500");
  });
});

describe("formatMoney", () => {
  it("formats numbers to Rubles currency", () => {
    const formatted = formatMoney(1234.56);
    // Note: different Node/OS configurations can format currencies with spaces or non-breaking spaces.
    // We normalize spaces or test for substrings to make it environment-independent.
    const normalized = formatted.replace(/\s/g, " ");
    expect(normalized).toContain("1 235");
    expect(normalized).toContain("₽");
  });
});

describe("toDateInputValue", () => {
  it("formats date to YYYY-MM-DD format", () => {
    const date = new Date("2026-06-20T12:00:00Z");
    expect(toDateInputValue(date)).toBe("2026-06-20");
  });
});
