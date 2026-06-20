"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, CirclePlus, History, Home, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { href: "/dashboard", label: "Главная", icon: Home },
  { href: "/history", label: "История", icon: History },
  { href: "/add", label: "Добавить", icon: CirclePlus },
  { href: "/analytics", label: "Аналитика", icon: BarChart3 },
  { href: "/settings", label: "Настройки", icon: Settings }
];

export function AppNav() {
  const pathname = usePathname();

  return (
    <>
      <aside className="fixed left-0 top-0 hidden h-screen w-72 border-r border-border/70 bg-card/70 p-5 backdrop-blur-xl lg:block">
        <Link href="/dashboard" className="mb-8 flex items-center gap-3 text-xl font-black">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-primary text-xl text-primary-foreground">₽</span>
          FroggyBank
        </Link>
        <nav className="space-y-2">
          {items.map((item) => {
            const Icon = item.icon;
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold text-muted-foreground transition hover:bg-muted",
                  active && "bg-primary text-primary-foreground shadow-glow hover:bg-primary"
                )}
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>
      <nav className="safe-bottom fixed bottom-0 left-0 right-0 z-40 grid grid-cols-5 border-t border-border/70 bg-card/90 px-2 pt-2 backdrop-blur-xl lg:hidden">
        {items.map((item) => {
          const Icon = item.icon;
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex min-w-0 flex-col items-center gap-1 rounded-2xl px-1 py-2 text-[11px] font-semibold text-muted-foreground",
                active && "bg-primary/12 text-primary"
              )}
            >
              <Icon className={cn("h-5 w-5", item.href === "/add" && "h-7 w-7", active && item.href === "/add" && "text-primary")} />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
