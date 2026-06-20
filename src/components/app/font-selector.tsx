"use client";

import * as React from "react";
import { Check, Type } from "lucide-react";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "froggybank-font";

const FONTS = [
  {
    id: "onest",
    name: "Onest",
    description: "Чистый и собранный интерфейс",
    sample: "Баланс 124 500 ₽",
    className: "font-[Onest]"
  },
  {
    id: "manrope",
    name: "Manrope",
    description: "Современный финансовый SaaS",
    sample: "Расходы за месяц",
    className: "font-[Manrope]"
  },
  {
    id: "inter",
    name: "Inter",
    description: "Нейтральная системная классика",
    sample: "История операций",
    className: "font-[Inter]"
  },
  {
    id: "rubik",
    name: "Rubik",
    description: "Мягкий и дружелюбный ритм",
    sample: "Доходы и траты",
    className: "font-[Rubik]"
  },
  {
    id: "nunito",
    name: "Nunito",
    description: "Теплый мобильный характер",
    sample: "Новая операция",
    className: "font-[Nunito]"
  },
  {
    id: "montserrat",
    name: "Montserrat",
    description: "Контрастный и выразительный",
    sample: "Аналитика",
    className: "font-[Montserrat]"
  },
  {
    id: "ibm-plex-sans",
    name: "IBM Plex Sans",
    description: "Деловой и технический",
    sample: "Категории",
    className: "font-['IBM_Plex_Sans']"
  },
  {
    id: "comfortaa",
    name: "Comfortaa",
    description: "Более игривый, под стиль Жабжета",
    sample: "Жабжет",
    className: "font-[Comfortaa]"
  }
];

type FontId = (typeof FONTS)[number]["id"];

function applyFont(fontId: FontId) {
  document.documentElement.dataset.font = fontId;
}

export function FontSelector() {
  const [activeFont, setActiveFont] = React.useState<FontId>("onest");
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    const storedFont = window.localStorage.getItem(STORAGE_KEY);
    const nextFont = FONTS.some((font) => font.id === storedFont) ? (storedFont as FontId) : "onest";

    setActiveFont(nextFont);
    applyFont(nextFont);
    setMounted(true);
  }, []);

  const handleFontChange = (fontId: FontId) => {
    setActiveFont(fontId);
    applyFont(fontId);
    window.localStorage.setItem(STORAGE_KEY, fontId);
  };

  if (!mounted) {
    return (
      <div className="w-full space-y-5 rounded-3xl border border-border/50 bg-card p-6 shadow-sm animate-pulse">
        <div className="h-6 w-36 rounded-md bg-muted" />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((item) => (
            <div key={item} className="h-28 rounded-2xl bg-muted" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-5 rounded-3xl border border-border/50 bg-card p-6 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-primary/10 text-primary">
          <Type className="h-5 w-5" />
        </div>
        <div className="space-y-1">
          <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Шрифт интерфейса</h3>
          <p className="text-xs text-muted-foreground">Выберите настроение текста для всего приложения</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {FONTS.map((font) => {
          const isActive = activeFont === font.id;

          return (
            <button
              key={font.id}
              type="button"
              onClick={() => handleFontChange(font.id)}
              className={cn(
                "flex min-h-28 flex-col justify-between rounded-2xl border p-4 text-left transition-all duration-200 active:scale-[0.98]",
                isActive
                  ? "border-primary bg-primary/5 ring-1 ring-primary/30"
                  : "border-border bg-card hover:border-border/80 hover:bg-muted/40"
              )}
            >
              <span className="flex items-start justify-between gap-3">
                <span>
                  <span className={cn("block text-lg font-black", font.className)}>{font.name}</span>
                  <span className="mt-1 block text-xs text-muted-foreground">{font.description}</span>
                </span>
                <span
                  className={cn(
                    "grid h-6 w-6 shrink-0 place-items-center rounded-full border transition",
                    isActive ? "border-primary bg-primary text-primary-foreground" : "border-border text-transparent"
                  )}
                >
                  <Check className="h-3.5 w-3.5" />
                </span>
              </span>
              <span className={cn("mt-4 block truncate text-sm font-bold text-foreground", font.className)}>
                {font.sample}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
