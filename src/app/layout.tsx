import type { Metadata, Viewport } from "next";
import "@/app/globals.css";
import { ThemeProvider } from "@/components/app/theme-provider";
import { RegisterServiceWorker } from "@/app/register-sw";

export const metadata: Metadata = {
  title: "FroggyBank",
  description: "Личный учет финансов",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "FroggyBank",
    statusBarStyle: "black-translucent"
  }
};

export const viewport: Viewport = {
  themeColor: "#16a064",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <RegisterServiceWorker />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
