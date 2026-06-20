"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="moss-dark"
      enableSystem={false}
      themes={["light", "dark", "moss-light", "moss-dark", "pond-light", "pond-dark", "kingdom-light", "kingdom-dark"]}
      disableTransitionOnChange
    >
      {children}
    </NextThemesProvider>
  );
}
