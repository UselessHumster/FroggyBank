"use client";

import * as React from "react";
import { Check, CreditCard } from "lucide-react";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "froggybank-card-style";

const CARD_STYLES = [
  {
    id: "default",
    name: "Классическая",
    description: "Стандартная заливка цветом темы",
  },
  {
    id: "boombox-frogs",
    name: "Бумбокс-жабы",
    description: "Стильная иллюстрация с танцующими жабками",
    previewBg: "bg-[url('/cards/boombox-frogs.png')] bg-cover bg-center"
  },
  {
    id: "tea-frogs",
    name: "Чаепитие",
    description: "Уютные акварельные жабки с грибочками",
    previewBg: "bg-[url('/cards/tea-frogs.png')] bg-cover bg-center"
  },
  {
    id: "frog-tower",
    name: "Жабья пирамида",
    description: "Много милых жаб на пруду под сакурой",
    previewBg: "bg-[url('/cards/frog-tower.png')] bg-cover bg-center"
  }
];

type CardStyleId = (typeof CARD_STYLES)[number]["id"];

export function CardStyleSelector() {
  const [activeStyle, setActiveStyle] = React.useState<CardStyleId>("default");
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    const storedStyle = window.localStorage.getItem(STORAGE_KEY);
    const nextStyle = CARD_STYLES.some((s) => s.id === storedStyle) ? (storedStyle as CardStyleId) : "default";

    setActiveStyle(nextStyle);
    setMounted(true);
  }, []);

  const handleStyleChange = (styleId: CardStyleId) => {
    setActiveStyle(styleId);
    window.localStorage.setItem(STORAGE_KEY, styleId);
  };

  if (!mounted) {
    return (
      <div className="w-full space-y-5 rounded-3xl border border-border/50 bg-card p-6 shadow-sm animate-pulse">
        <div className="h-6 w-36 rounded-md bg-muted" />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {[1, 2].map((item) => (
            <div key={item} className="h-32 rounded-2xl bg-muted" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-5 rounded-3xl border border-border/50 bg-card p-6 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-primary/10 text-primary">
          <CreditCard className="h-5 w-5" />
        </div>
        <div className="space-y-1">
          <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Дизайн карты</h3>
          <p className="text-xs text-muted-foreground">Выберите фоновое изображение для главной карты баланса</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {CARD_STYLES.map((style) => {
          const isActive = activeStyle === style.id;

          return (
            <button
              key={style.id}
              type="button"
              onClick={() => handleStyleChange(style.id as CardStyleId)}
              className={cn(
                "group relative overflow-hidden flex min-h-32 flex-col justify-between rounded-2xl border p-4 text-left transition-all duration-200 active:scale-[0.98]",
                isActive
                  ? "border-primary bg-primary/5 ring-1 ring-primary/30"
                  : "border-border bg-card hover:border-border/80 hover:bg-muted/40"
              )}
            >
              {style.previewBg && (
                <div className={cn("absolute inset-0 opacity-20 transition-opacity group-hover:opacity-40", isActive && "opacity-40", style.previewBg)} />
              )}
              {style.previewBg && (
                <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-transparent" />
              )}
              
              <span className="relative z-10 flex items-start justify-between gap-3 w-full">
                <span>
                  <span className={cn("block text-lg font-black", style.previewBg ? "text-white" : "")}>{style.name}</span>
                  <span className={cn("mt-1 block text-xs", style.previewBg ? "text-white/80" : "text-muted-foreground")}>{style.description}</span>
                </span>
                <span
                  className={cn(
                    "grid h-6 w-6 shrink-0 place-items-center rounded-full border transition",
                    isActive ? "border-primary bg-primary text-primary-foreground" : "border-border/50 text-transparent",
                    style.previewBg && !isActive ? "border-white/50 text-transparent" : ""
                  )}
                >
                  <Check className="h-3.5 w-3.5" />
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
