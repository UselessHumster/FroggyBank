"use client";

import * as React from "react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { formatMoney } from "@/lib/utils";
import { cn } from "@/lib/utils";

type Summary = {
  income: number;
  expense: number;
  balance: number;
  cardBalance: number;
  cashBalance: number;
};

const CARD_STYLES = {
  default: "bg-primary text-primary-foreground",
  "boombox-frogs": "bg-[url('/cards/boombox-frogs.png')] bg-cover bg-center text-white",
  "tea-frogs": "bg-[url('/cards/tea-frogs.png')] bg-cover bg-center text-primary-foreground",
  "frog-tower": "bg-[url('/cards/frog-tower.png')] bg-cover bg-center text-primary-foreground",
} as const;

export function MainBalanceCard({ allTime }: { allTime: Summary }) {
  const [activeStyle, setActiveStyle] = React.useState<keyof typeof CARD_STYLES>("default");
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    const storedStyle = window.localStorage.getItem("froggybank-card-style");
    if (storedStyle && storedStyle in CARD_STYLES) {
      setActiveStyle(storedStyle as keyof typeof CARD_STYLES);
    }
    setMounted(true);
  }, []);

  const styleClass = mounted ? CARD_STYLES[activeStyle] : CARD_STYLES.default;
  const isCustomBg = activeStyle !== "default";

  return (
    <Card className={cn(
      "relative overflow-hidden border-0 p-6 shadow-glow transition-all duration-500",
      "aspect-[16/10] sm:aspect-[16/10] md:aspect-[16/10] w-full max-w-2xl flex flex-col justify-between mx-auto",
      styleClass
    )}>
      {isCustomBg && (
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent pointer-events-none" />
      )}
      
      <div className="relative z-10 flex-1">
        <p className={cn("text-sm font-semibold", isCustomBg ? "text-white/80" : "text-primary-foreground/70")}>Текущий баланс</p>
        <p className="mt-3 break-words text-5xl font-black tracking-normal">{formatMoney(allTime.balance)}</p>
        <p className={cn("mt-2 text-sm font-semibold", isCustomBg ? "text-white/80" : "text-primary-foreground/75")}>
          Карта: {formatMoney(allTime.cardBalance)} · Наличные: {formatMoney(allTime.cashBalance)}
        </p>
      </div>

      <div className="relative z-10 mt-auto flex flex-col gap-5 w-fit">
        <div>
          <ArrowUpRight className={cn("mb-2 h-5 w-5", isCustomBg ? "text-white/80" : "text-primary-foreground/70")} />
          <p className={cn("text-xs", isCustomBg ? "text-white/80" : "text-primary-foreground/70")}>Доходы</p>
          <p className="text-xl font-black">{formatMoney(allTime.income)}</p>
        </div>
        <div>
          <ArrowDownRight className={cn("mb-2 h-5 w-5", isCustomBg ? "text-white/80" : "text-primary-foreground/70")} />
          <p className={cn("text-xs", isCustomBg ? "text-white/80" : "text-primary-foreground/70")}>Расходы</p>
          <p className="text-xl font-black">{formatMoney(allTime.expense)}</p>
        </div>
      </div>
    </Card>
  );
}
